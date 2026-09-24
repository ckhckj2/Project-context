'use strict';
const http = require('node:http'),
  fs = require('node:fs'),
  path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..'),
  out = path.join(root, 'docs/redesign/screenshots/stage-7');
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
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } }),
      page = await context.newPage(),
      errors = [];
    context.on('page', (p) => p.on('pageerror', (error) => errors.push(error.message)));
    page.on('pageerror', (error) => errors.push(error.message));
    const key = 'cc_redesign_progress_v1';
    const go = async (p, hash) => {
      await p.evaluate((hash) => {
        location.hash = hash;
      }, hash);
      await p.waitForTimeout(80);
    };
    const click = async (p, name) => p.getByRole('button', { name, exact: true }).click();
    const saved = async (p) => {
      await p.waitForFunction(
        () => document.querySelector('#saveStatus span')?.textContent === '이 브라우저에 저장됨',
      );
    };
    const memo = async (p, value) => {
      const input = p.locator('#workflow-memo');
      if (!(await input.isVisible())) await p.locator('.work-memo > summary').click();
      await input.fill(value);
    };
    fs.mkdirSync(out, { recursive: true });
    const capture = async (name) => {
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(out, name + '.png'), fullPage: true });
    };
    await page.goto(origin + '/app/index.html#/flow/drawing-revision');
    await page.evaluate(() => localStorage.setItem('cc_stage7_legacy', 'unchanged'));
    await memo(page, '아직 저장 전');
    await page.reload();
    assert.equal(await page.locator('#workflow-memo').inputValue(), '');
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), key), null);
    if (!(await page.locator('[data-branch="report"]').isVisible()))
      await page.locator('.work-optional > summary').click();
    await page.locator('[data-branch="report"]').click();
    await click(page, '단계·시설 설정');
    await page.selectOption('#context-phase', '중간설계');
    await click(page, '적용하기');
    await page.locator('.work-side .work-detail > .work-steps input').click();
    await memo(page, '복원할 메모');
    await click(page, '저장하고 나중에 이어보기');
    await page.locator('#workBody input').fill('첫 도면 작업');
    await click(page, '저장하기');
    await saved(page);
    assert.match(page.url(), /#\/work\/work-1$/);
    await page.reload();
    assert.equal(await page.locator('#workflow-memo').inputValue(), '복원할 메모');
    assert.equal(await page.locator('.work-node').count(), 3);
    assert.equal(await page.locator('.work-phases [aria-current="step"]').innerText(), '중간설계');
    const original = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)).data.works[0].execution,
      key,
    );
    assert.equal(original.checks.length, 1);
    const savedUrl = page.url();
    await click(page, '업무 안내 다시 읽기');
    assert.ok(
      await page
        .locator('#workBody')
        .getByText('어떤 자료를 준비하나요?', { exact: true })
        .isVisible(),
    );
    await page.locator('#workBody .guide-sequence > summary').click();
    assert.equal(await page.locator('#workBody .guide-steps li').count(), 3);
    await page.keyboard.press('Escape');
    assert.equal(page.url(), savedUrl, 'reading guidance must stay in the saved work');
    assert.deepEqual(
      await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)).data.works[0].execution,
        key,
      ),
      original,
    );
    await memo(page, '자동 저장된 메모');
    await page.waitForFunction(
      (key) =>
        JSON.parse(localStorage.getItem(key)).data.works[0].execution.memo === '자동 저장된 메모',
      key,
    );
    await go(page, '#/saved');
    await capture('desktop-saved');
    await page.locator('.saved-card summary').click();
    await click(page, '휴지통으로');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.saved-card').count(), 1);
    await click(page, '휴지통으로');
    await click(page, '휴지통으로 옮기기');
    await saved(page);
    await page.reload();
    await page.selectOption('.saved-page select', 'trash');
    assert.equal(await page.locator('.saved-card').count(), 1);
    await click(page, '되살리기');
    await saved(page);
    await page.selectOption('.saved-page select', 'active');
    await page.getByRole('link', { name: '이어서 보기 →', exact: true }).click();
    assert.equal(await page.locator('#workflow-memo').inputValue(), '자동 저장된 메모');
    await go(page, '#/learn/design');
    await click(page, '승급 도전하기');
    await page.getByRole('radio').first().check();
    const selected = await page.locator('input:checked').inputValue(),
      prompt = await page.locator('#quiz-prompt').innerText();
    await saved(page);
    await page.reload();
    assert.equal(await page.locator('#quiz-prompt').innerText(), prompt);
    assert.equal(await page.locator('input:checked').inputValue(), selected);
    await click(page, '답 확인');
    await saved(page);
    const feedback = await page.locator('.quiz-feedback').innerText();
    await page.reload();
    assert.equal(await page.locator('.quiz-feedback').innerText(), feedback);
    await page.getByRole('link', { name: '관련 업무 설명 읽기', exact: true }).click();
    await saved(page);
    await page.reload();
    await page.getByRole('link', { name: '문제로 돌아가기 →', exact: true }).click();
    assert.equal(await page.locator('.quiz-feedback').innerText(), feedback);
    await go(page, '#/work/work-1');
    const second = await context.newPage();
    await second.goto(origin + '/app/index.html#/work/work-1');
    await memo(page, '탭 A 변경');
    await page.waitForFunction(
      (key) => JSON.parse(localStorage.getItem(key)).data.works[0].execution.memo === '탭 A 변경',
      key,
    );
    await second.getByText('다른 탭에서 기록이 바뀌었어요.', { exact: false }).waitFor();
    await memo(second, '탭 B 미저장');
    await second.waitForTimeout(100);
    assert.equal(
      await second.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)).data.works[0].execution.memo,
        key,
      ),
      '탭 A 변경',
    );
    await click(second, '저장 기록 다시 불러오기');
    await click(second, '다시 불러오기');
    await second.waitForLoadState();
    await second.waitForTimeout(100);
    assert.equal(await second.locator('#workflow-memo').inputValue(), '탭 A 변경');
    await second.close();
    await page.evaluate(() => {
      window.stage7SetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function () {
        throw new Error('quota');
      };
    });
    await memo(page, '용량 실패 후 메모');
    await page.getByText('저장하지 못했어요.', { exact: false }).waitFor();
    await capture('desktop-storage-failure');
    await page.evaluate(() => {
      Storage.prototype.setItem = window.stage7SetItem;
    });
    await click(page, '저장 다시 시도');
    await saved(page);
    await page.reload();
    assert.equal(await page.locator('#workflow-memo').inputValue(), '용량 실패 후 메모');
    assert.equal(await page.evaluate(() => localStorage.getItem('cc_stage7_legacy')), 'unchanged');
    await page.setViewportSize({ width: 390, height: 844 });
    await go(page, '#/saved');
    await capture('mobile-saved');
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
    }
    const validRaw = await page.evaluate((key) => localStorage.getItem(key), key);
    for (const raw of ['broken', JSON.stringify({ ...JSON.parse(validRaw), schemaVersion: 99 })]) {
      await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key, raw });
      await page.reload();
      assert.match(await page.locator('#saveStatus').innerText(), /읽지 못/);
      await go(page, '#/learn/permit');
      await click(page, '승급 도전하기');
      await page.waitForTimeout(100);
      assert.equal(await page.evaluate((key) => localStorage.getItem(key), key), raw);
      page.once('dialog', (dialog) => dialog.accept());
    }
    assert.deepEqual(errors, []);
    console.log(
      'PASS stage 7: explicit save, automatic updates, reload, quiz draft/feedback/review, trash restore, quota retry, cross-tab conflict, corrupt/newer records, legacy preservation, responsive layouts',
    );
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
