'use strict';
const http = require('node:http'),
  fs = require('node:fs'),
  path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..'),
  out = path.join(root, 'docs/redesign/screenshots/stage-4');
const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const filename = decodeURIComponent(url.pathname).replace(/\/$/, '/index.html');
    const target = path.resolve(root, '.' + filename);
    if (!target.startsWith(root + path.sep)) throw new Error('Invalid path');
    const mime = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.mjs': 'text/javascript',
      '.css': 'text/css',
      '.svg': 'image/svg+xml',
    }[path.extname(target)];
    if (!mime) throw new Error('Invalid asset');
    const body = fs.readFileSync(target);
    res.writeHead(200, { 'Content-Type': mime + '; charset=utf-8' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

(async () => {
  let browser;
  try {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({
      headless: true,
      ...(process.env.CC_CHROMIUM_EXECUTABLE
        ? { executablePath: process.env.CC_CHROMIUM_EXECUTABLE }
        : {}),
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: 'reduce',
    });
    const legacy = {
      cc_projects_v1: '[{"id":"existing","future":{"keep":true}}]',
      pc_progress_level: '2',
    };
    await context.addInitScript((seed) => {
      if (!localStorage.getItem('stage4-seeded')) {
        for (const [key, value] of Object.entries(seed)) localStorage.setItem(key, value);
        localStorage.setItem('stage4-seeded', '1');
      }
    }, legacy);
    const page = await context.newPage(),
      errors = [],
      external = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('request', (r) => {
      if (!r.url().startsWith(origin + '/')) external.push(r.url());
    });
    fs.mkdirSync(out, { recursive: true });
    const capture = async (name) => {
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: path.join(out, name + '.png'),
        fullPage: !(await page.locator('#workDialog').evaluate((node) => node.open)),
      });
    };
    const go = async (id) => {
      await page.goto(origin + '/app/#/flow/' + id);
      await page.reload();
      await page.locator('.work-page').waitFor();
    };
    const fits = async () =>
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    const checkTask = async (id, mobile = false) => {
      await page.locator(`[data-node="${id}"]`).click();
      const prefix = mobile ? '#workBody ' : '.work-side ';
      for (let i = 0; i < 3; i++) {
        const next = page.locator(prefix + '.work-detail > .work-steps input:not(:checked)');
        if (!(await next.count())) break;
        await next.first().click();
      }
      assert.equal(await page.locator(prefix + 'input:not(:checked)').count(), 0);
      if (mobile) await page.keyboard.press('Escape');
    };
    const { tasks } = await import('../src/content/catalog.mjs');
    for (const task of tasks) {
      await go(task.id);
      assert.equal(await page.locator('.work-side h2').innerText(), task.title);
      assert.equal(await page.locator('.work-side .work-step').count(), 3);
      assert.ok((await page.locator('.work-done').innerText()).length > 10);
    }
    await go('drawing-revision');
    assert.equal(await page.locator('.work-optional').getAttribute('open'), null);
    assert.ok(await page.locator('.work-current-hint').isVisible());
    assert.notEqual(
      await page
        .locator('.work-node')
        .first()
        .evaluate((node) => getComputedStyle(node).backgroundColor),
      await page
        .locator('.work-open-detail')
        .evaluate((node) => getComputedStyle(node).backgroundColor),
    );
    await page.locator('.work-tree-jump').click();
    assert.equal(await page.evaluate(() => document.activeElement.textContent), '전체 업무 흐름');
    await capture('flow-desktop');
    if (!(await page.locator('[data-branch="report"]').isVisible()))
      await page.locator('.work-optional > summary').click();
    await page.locator('[data-branch="report"]').click();
    if (!(await page.locator('[data-branch="send"]').isVisible()))
      await page.locator('.work-optional > summary').click();
    await page.locator('[data-branch="send"]').click();
    assert.equal(await page.locator('.work-node').count(), 4);
    await page.locator('[data-node="report-update"]').click();
    assert.equal(await page.locator('.work-side input:disabled').count(), 3);
    await checkTask('drawing-revision');
    await checkTask('report-update');
    await checkTask('consultant-send');
    await checkTask('document-match');
    await capture('branches-desktop');
    await page.getByRole('button', { name: '이번 흐름 완료', exact: true }).click();
    assert.match(await page.locator('.work-current').innerText(), /이번 흐름 완료/);
    await page.getByRole('button', { name: '다시 진행하기', exact: true }).click();
    await page.locator('[data-node="report-update"]').click();
    await page.locator('.work-side .reading-other-steps > summary').click();
    await page.locator('.work-side [data-step="report-update:pages"]').click();
    await page.keyboard.press('Escape');
    assert.equal(
      await page.locator('.work-side [data-step="report-update:pages"]').isChecked(),
      true,
    );
    await page.locator('.work-side [data-step="report-update:pages"]').click();
    await page
      .locator('#workBody')
      .getByRole('button', { name: '다시 진행하기', exact: true })
      .click();
    assert.match(await page.locator('[data-node="consultant-send"]').innerText(), /확인됨/);
    assert.doesNotMatch(await page.locator('[data-node="document-match"]').innerText(), /확인됨/);
    await checkTask('report-update');
    await checkTask('document-match');
    await page.locator('.work-memo > summary').click();
    await page.locator('#workflow-memo').fill('<img src=x onerror=alert(1)> 업무 메모');
    assert.equal(await page.locator('main img').count(), 0);
    await page.getByRole('button', { name: '흐름 편집', exact: true }).click();
    await page.getByRole('button', { name: '보고서에도 반영하기 제거' }).click();
    assert.match(await page.locator('#workBody').innerText(), /2개 업무/);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.work-node').count(), 4);
    await page.getByRole('button', { name: '흐름 편집', exact: true }).click();
    await page.getByRole('button', { name: '보고서에도 반영하기 제거' }).click();
    await page.getByRole('button', { name: '이 가지 제거하기' }).click();
    assert.equal(await page.locator('.work-node').count(), 2);
    assert.match(await page.locator('[data-node="consultant-send"]').innerText(), /확인됨/);
    await page.getByRole('button', { name: '내 상황에 맞추기', exact: true }).click();
    await page.selectOption('#context-phase', '실시설계');
    await page.keyboard.press('Escape');
    assert.match(
      await page.locator('.work-context-summary').innerText(),
      /잘 모르겠어요|아직 조건/,
    );
    await page.getByRole('button', { name: '내 상황에 맞추기', exact: true }).click();
    await page.selectOption('#context-facility', '공항시설');
    await page.selectOption('#context-phase', '실시설계');
    await page.getByRole('button', { name: '적용하기', exact: true }).click();
    assert.match(await page.locator('#workBody').innerText(), /6개 체크/);
    await page.getByRole('button', { name: '조건 적용하고 다시 확인' }).click();
    assert.match(await page.locator('.work-context-summary').innerText(), /공항시설 · 실시설계/);
    assert.equal(await page.locator('.work-side input:checked').count(), 0);
    assert.equal(
      await page.locator('#workflow-memo').inputValue(),
      '<img src=x onerror=alert(1)> 업무 메모',
    );
    await page.locator('.work-side').getByText('이유와 자세한 안내', { exact: true }).click();
    assert.doesNotMatch(
      await page.locator('.work-explanation').innerText(),
      /실시설계에서 판단하기/,
    );
    assert.match(await page.locator('.work-side .work-notice').first().innerText(), /도서 간 버전/);
    await page.locator('.brand').click();
    await page.goto(origin + '/app/#/flow/drawing-revision');
    await page.reload();
    await page.locator('.work-page').waitFor();
    assert.match(
      await page.locator('.work-context-summary').innerText(),
      /잘 모르겠어요|아직 조건/,
    );
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await go('drawing-revision');
      await fits();
      if (!(await page.locator('[data-branch="report"]').isVisible()))
        await page.locator('.work-optional > summary').click();
      await page.locator('[data-branch="report"]').click();
      await fits();
      await page.locator('[data-node="report-update"]').click();
      if (width <= 800) {
        assert.equal(await page.locator('#workDialog').evaluate((n) => n.open), true);
        await page.keyboard.press('Escape');
      }
      await fits();
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await go('drawing-revision');
    await capture('flow-mobile');
    await page.locator('.work-open-detail').click();
    await capture('detail-mobile');
    await page.keyboard.press('Tab');
    assert.equal(
      await page.evaluate(() =>
        document.querySelector('#workDialog').contains(document.activeElement),
      ),
      true,
    );
    await page.locator('#workBody input').first().click();
    assert.equal(
      await page.evaluate(() => document.activeElement.dataset.step),
      'drawing-revision:coordinate',
    );
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#workDialog').evaluate((n) => n.open), false);
    await page.getByRole('button', { name: '내 상황에 맞추기', exact: true }).click();
    await capture('conditions-mobile');
    await page.keyboard.press('Escape');
    // Hash-only navigation preserves session; a fresh browser navigation resets it.
    await page.locator('.brand').click();
    await page.locator('.hero-copy > .primary').click();
    await page.locator('.task-shortcut[href="#/task/drawing-revision"]').click();
    await page.getByRole('link', { name: '전체 흐름과 실행 항목 보기 →' }).click();
    await page.locator('.work-open-detail').click();
    assert.equal(await page.locator('#workBody input:checked').count(), 1);
    await page.keyboard.press('Escape');
    assert.deepEqual(
      await page.evaluate(
        (keys) => Object.fromEntries(keys.map((key) => [key, localStorage.getItem(key)])),
        Object.keys(legacy),
      ),
      legacy,
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    await context.close();
    const blocked = await browser.newContext();
    await blocked.addInitScript(() => {
      for (const method of ['getItem', 'setItem', 'removeItem'])
        Object.defineProperty(Storage.prototype, method, {
          value() {
            throw new Error('storage blocked');
          },
        });
    });
    const isolated = await blocked.newPage();
    await isolated.goto(origin + '/app/#/flow/drawing-revision');
    if (!(await isolated.locator('[data-branch="report"]').isVisible()))
      await isolated.locator('.work-optional > summary').click();
    await isolated.locator('[data-branch="report"]').click();
    assert.equal(await isolated.locator('.work-node').count(), 3);
    await blocked.close();
    console.log(
      'PASS stage 4: 13 guides, prerequisites/join/branches, explicit completion, safe memo, context confirm/cancel, responsive dialogs/focus, history, unchanged legacy storage, blocked storage',
    );
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
