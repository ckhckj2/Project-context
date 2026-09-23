'use strict';
const http = require('node:http'),
  fs = require('node:fs'),
  path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..'),
  out = path.join(root, 'docs/redesign/screenshots/stage-8');
const releaseRoot = path.join(root, 'dist-release');
const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith('/Project-context/')) throw new Error('Wrong deployment prefix');
    const filename = decodeURIComponent(url.pathname.slice('/Project-context'.length)).replace(
      /\/$/,
      '/index.html',
    );
    const target = path.resolve(releaseRoot, '.' + filename);
    if (!target.startsWith(releaseRoot + path.sep)) throw new Error('Invalid path');
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
    require('node:child_process').execFileSync(
      process.execPath,
      ['tools/build-site.cjs', '--redesign'],
      { cwd: root },
    );
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`,
      base = origin + '/Project-context/';
    browser = await chromium.launch({
      headless: true,
      ...(process.env.CC_CHROMIUM_EXECUTABLE
        ? { executablePath: process.env.CC_CHROMIUM_EXECUTABLE }
        : {}),
    });
    const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
        reducedMotion: 'reduce',
      }),
      errors = [],
      failures = [],
      external = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400) failures.push(response.url());
    });
    page.on('request', (request) => {
      if (!request.url().startsWith(base)) external.push(request.url());
    });
    const click = async (name) => page.getByRole('button', { name, exact: true }).click();
    const go = async (hash) => {
      await page.evaluate((hash) => {
        location.hash = hash;
      }, hash);
      await page.waitForTimeout(80);
    };
    const saved = async () =>
      page.waitForFunction(
        () => document.querySelector('#saveStatus span')?.textContent === '이 브라우저에 저장됨',
      );
    fs.mkdirSync(out, { recursive: true });
    const capture = async (name) => {
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(out, name + '.png'), fullPage: true });
    };
    await page.goto(base);
    await page.waitForURL(base + 'app/');
    await page.locator('main h1').waitFor();
    assert.equal(await page.locator('main h1').count(), 1);
    await capture('home-desktop');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.className), 'skip-link');
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'main');
    await page.getByRole('link', { name: '업무 선택하기 ↗', exact: true }).click();
    await go('#/flow/drawing-revision');
    await page.locator('.work-side .work-detail > .work-steps input').click();
    await click('저장하고 나중에 이어보기');
    await page.locator('#workBody input').fill('통합 검수 업무');
    await click('저장하기');
    await saved();
    await go('#/learn/design');
    await click('승급 도전하기');
    const { assessmentObjectives: bank } = await import('../src/content/assessment-bank.mjs');
    for (let i = 0; i < 5; i++) {
      const prompt = await page.locator('#quiz-prompt').innerText(),
        q = bank.find((value) => value.cases.includes(prompt));
      await page.locator(`input[value="${q.answer}"]`).check();
      await click('답 확인');
      await click(i === 4 ? '결과 확인' : '다음 문제');
    }
    await saved();
    assert.match(await page.locator('.learning-intro').innerText(), /LV2/);
    await go('#/work/work-1');
    await page.locator('.work-side [data-reading="drawing-revision"]').click();
    assert.equal(await page.locator('#reading-depth option').count(), 2);
    await page.selectOption('#reading-depth', '2');
    await click('이 깊이로 보기');
    await saved();
    await page.reload();
    assert.match(
      await page.locator('.work-side [data-reading="drawing-revision"]').innerText(),
      /LV2/,
    );
    assert.equal(
      await page.locator('.work-side .work-detail > .work-steps input:checked').count(),
      1,
    );
    await page.locator('.work-side [data-reading="drawing-revision"]').click();
    await page.selectOption('#reading-depth', '1');
    await click('이 깊이로 보기');
    await saved();
    await capture('workflow-desktop');
    await page.setViewportSize({ width: 390, height: 844 });
    await go('#/saved');
    await capture('saved-mobile');
    await page.getByRole('link', { name: '기존 프로젝트 보기', exact: true }).click();
    await page.waitForURL(/legacy\.html\?entry=projects/);
    await page.waitForFunction(() => window.CC_BOOT?.diagnostics().state === 'ready');
    assert.equal(
      await page.locator('#view-projects').evaluate((node) => node.classList.contains('active')),
      true,
    );
    for (const suffix of ['?entry=quiz', '?entry=task&task=drawing-revision']) {
      await page.goto(base + suffix);
      await page.waitForURL(/legacy\.html/);
      await page.waitForFunction(() => window.CC_BOOT?.diagnostics().state === 'ready');
      assert.equal(
        await page
          .locator(suffix.startsWith('?entry=quiz') ? '#view-quiz' : '#view-search')
          .evaluate((node) => node.classList.contains('active')),
        true,
      );
    }
    await page.goto(base + '?entry=https://example.com/#/learn');
    await page.waitForURL(base + 'app/#/learn');
    await page.locator('.learning-tracks').waitFor();
    assert.match(await page.locator('.learning-tracks').innerText(), /LV2/);
    await go('#/');
    await capture('home-mobile');
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, []);
    assert.deepEqual(external, []);
    console.log(
      'PASS release artifact: subpath landing, home/work/save/quiz/promotion/depth/reload integration, legacy links, hostile entry handling, keyboard skip, responsive layouts, no broken assets or external requests',
    );
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
