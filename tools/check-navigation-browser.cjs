'use strict';
const http = require('node:http'),
  fs = require('node:fs'),
  path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..'),
  out = path.join(root, 'docs/redesign/screenshots/stage-3'),
  guideOut = path.join(root, 'docs/redesign/screenshots/recovery-1');
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
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [],
      external = [],
      failed = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (!request.url().startsWith(origin + '/')) external.push(request.url());
    });
    page.on('response', (response) => {
      if (response.status() >= 400) failed.push(response.url());
    });
    fs.mkdirSync(out, { recursive: true });
    fs.mkdirSync(guideOut, { recursive: true });
    const capture = async (name) => {
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(out, name + '.png'), fullPage: true });
    };
    const go = async (hash) => {
      await page.goto(origin + '/app/index.html' + hash);
      await page.locator('main h1').waitFor();
    };
    const fits = async (label) =>
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        label + ' overflows',
      );
    const { tasks } = await import('../src/content/catalog.mjs');
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const hash of [
        '#/',
        '#/tasks',
        '#/category/design',
        '#/task/drawing-revision',
        '#/search',
        '#/help/terms',
      ]) {
        await go(hash);
        await fits(width + ' ' + hash);
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await go('#/');
    await capture('home-desktop');
    assert.equal(await page.locator('.examples').getAttribute('open'), null);
    await page.locator('.scroll-cue').click();
    assert.equal(
      await page.evaluate(() => document.activeElement.textContent),
      '필요한 곳에서 시작하세요.',
    );
    await page.locator('.brand').click();
    await page.locator('.hero-copy > .primary').click();
    await page.locator('.task-group').first().waitFor();
    assert.equal(await page.locator('.task-group').count(), 4);
    await capture('categories-desktop');
    assert.ok((await page.locator('.task-shortcut').count()) >= tasks.length);
    // First guidance is two clicks from home, with no mandatory category screen.

    await page.locator('a[href="#/task/drawing-revision"]').click();
    assert.match(await page.locator('.first-action').innerText(), /수정 요청/);
    assert.ok(await page.locator('.purpose p').isVisible());
    assert.match(await page.locator('.task-trail').innerText(), /도면·설계/);
    assert.equal(await page.locator('main .primary').count(), 1);
    await page.screenshot({ path: path.join(guideOut, 'guide-desktop.png'), fullPage: true });

    await page.goBack();
    await page.locator('.task-shortcut').first().waitFor();
    assert.match(await page.locator('main h1').innerText(), /어떤 일을 맡았나요/);
    await page.goForward();
    await page.reload();
    assert.match(await page.locator('main h1').innerText(), /도면 수정/);
    for (const item of tasks) {
      await go('#/task/' + item.id);
      assert.equal(await page.locator('main h1').innerText(), item.title);
      assert.ok((await page.locator('.first-action h2').innerText()).length > 0);
      const { executionGuides } = await import('../src/content/execution-guides.mjs');
      const expected = executionGuides[item.id];
      assert.ok(await page.getByText(expected.material, { exact: true }).isVisible());
      assert.ok(await page.getByText(expected.owner, { exact: true }).isVisible());
      assert.ok(await page.getByText(expected.done, { exact: true }).isVisible());
      assert.equal(
        await page.locator('.purpose summary').count(),
        0,
        'purpose is reading, not a control',
      );
      assert.equal(await page.locator('.task-guide input').count(), 0, 'guide is read-only');
      await page.getByText('수행 순서 살펴보기', { exact: true }).click();
      assert.equal(await page.locator('.guide-steps li').count(), expected.steps.length);
      for (const step of expected.steps)
        assert.ok(
          await page.locator('.guide-steps').getByText(step.text, { exact: true }).isVisible(),
        );
      assert.equal(await page.locator('main .primary').count(), 1);
      await page.locator('.guide-legacy > summary').click();
      await page.getByRole('link', { name: '기존 상세 안내 보기' }).click();
      await page.waitForFunction(() => window.CC_BOOT?.diagnostics().state === 'ready');
      assert.ok(
        await page.locator('#view-search').evaluate((node) => node.classList.contains('active')),
      );
      assert.equal(await page.locator('#searchInput').inputValue(), item.title);
      assert.ok((await page.locator('#searchResult').innerText()).trim().length > 0);
    }
    await go('#/search');
    await page.locator('#task-query').fill('스케치업');
    assert.equal(await page.locator('#task-results .task-card').count(), 1);
    await page.locator('#task-query').fill('<img src=x onerror=alert(1)>');
    assert.equal(await page.locator('#task-results img').count(), 0);
    assert.match(await page.locator('.search-status').innerText(), /일치하는 업무가 없어요/);
    await go('#/task/unknown');
    assert.match(await page.locator('main h1').innerText(), /찾을 수 없어요/);
    await go('#/');
    await page.locator('#menu').click();
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'menu');
    await page.locator('#menu').click();
    await page.locator('#menuBody a[href="#/tasks"]').click();
    assert.equal(await page.locator('#menuDialog').evaluate((node) => node.open), false);
    assert.equal(await page.evaluate(() => document.activeElement.tagName), 'H1');
    await go('#/');
    await page.locator('.examples summary').click();
    assert.equal(await page.locator('.example-list a').count(), 3);
    await page.locator('.example-list a').first().click();
    await page.locator('.first-action').waitFor();
    assert.match(await page.locator('main h1').innerText(), /도면 수정/);
    for (const view of ['projects', 'quiz']) {
      await go('#/');
      if (view === 'quiz') {
        await page.locator('.entry-card[href="#/learn"]').click();
        await page.getByRole('link', { name: '기존 퀴즈와 성적 보기' }).click();
      } else {
        await page.locator('.entry-card[href="#/saved"]').click();
        await page.getByRole('link', { name: '기존 프로젝트 보기', exact: true }).click();
      }
      await page.waitForFunction(() => window.CC_BOOT?.diagnostics().state === 'ready');
      assert.equal(
        await page.locator('#view-' + view).evaluate((node) => node.classList.contains('active')),
        true,
      );
    }
    for (const suffix of ['', '?entry=task&task=unknown']) {
      await page.goto(origin + '/index.html' + suffix);
      await page.waitForFunction(() => window.CC_BOOT?.diagnostics().state === 'ready');
      assert.equal(
        await page.locator('#view-home').evaluate((node) => node.classList.contains('active')),
        true,
      );
    }
    require('node:child_process').execFileSync(process.execPath, ['tools/build-site.cjs'], {
      cwd: root,
    });
    await page.goto(origin + '/dist/index.html?entry=quiz');
    await page.waitForFunction(() => window.CC_BOOT?.diagnostics().state === 'ready');
    assert.equal(
      await page.locator('#view-quiz').evaluate((node) => node.classList.contains('active')),
      true,
      'packaged module dependencies resolve',
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await go('#/');
    await capture('home-mobile');
    await go('#/tasks');
    await capture('categories-mobile');
    await go('#/category/design');
    await capture('tasks-mobile');
    await go('#/task/drawing-revision');
    await capture('first-action-mobile');
    await page.getByText('수행 순서 살펴보기', { exact: true }).click();
    await page.screenshot({ path: path.join(guideOut, 'guide-mobile.png'), fullPage: true });
    await page.locator('.guide-sequence > summary').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.guide-sequence').getAttribute('open'), null);
    // CSS-pixel equivalent of a 200% zoomed 640px-wide window.
    await page.setViewportSize({ width: 320, height: 600 });
    for (const hash of ['#/', '#/tasks', '#/task/consultant-coordination', '#/search']) {
      await go(hash);
      await fits('320px ' + hash);
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    assert.deepEqual(failed, []);
    await context.close();
    // Separate fresh context: new navigation must not read, write or clear old records.
    const isolated = await browser.newContext();
    await isolated.addInitScript(() => {
      for (const method of ['getItem', 'setItem', 'removeItem', 'clear'])
        Storage.prototype[method] = () => {
          throw new Error('Navigation must not access storage');
        };
    });
    const fresh = await isolated.newPage();
    const storageErrors = [];
    fresh.on('pageerror', (error) => storageErrors.push(error.message));
    await fresh.goto(origin + '/app/index.html#/task/report-writing');
    await fresh.locator('.first-action').waitFor();
    assert.deepEqual(storageErrors, []);
    await isolated.close();
    console.log(
      'PASS: stage 3, 13 task handoffs, category/search/help/history, project/quiz links, focus, 320/390/768/1440px, no external network, blocked storage fallback, 6 captures',
    );
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
