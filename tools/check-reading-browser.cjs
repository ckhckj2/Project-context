'use strict';
const http = require('node:http'),
  fs = require('node:fs'),
  path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..'),
  out = path.join(root, 'docs/redesign/screenshots/stage-5');
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
    const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
        reducedMotion: 'reduce',
      }),
      errors = [],
      external = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (!request.url().startsWith(origin + '/')) external.push(request.url());
    });
    fs.mkdirSync(out, { recursive: true });
    const capture = async (name) => {
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: path.join(out, name + '.png'),
        fullPage: !(await page.locator('#workDialog').evaluate((node) => node.open)),
      });
    };
    await page.goto(origin + '/docs/redesign/level-preview.html');
    const depth = async (level, mobile = false) => {
      const scope = mobile ? '#workBody' : '.work-side';
      if (mobile) await page.locator('[data-node="drawing-revision"]').click();
      await page.locator(scope + ' [data-reading="drawing-revision"]').click();
      await page.selectOption('#reading-depth', String(level));
      await page.getByRole('button', { name: '이 깊이로 보기', exact: true }).click();
      if (mobile) await page.locator('[data-node="drawing-revision"]').click();
    };
    if (!(await page.locator('[data-branch="report"]').isVisible()))
      await page.locator('.work-optional > summary').click();
    await page.locator('[data-branch="report"]').click();
    await page.locator('.work-side .work-detail > .work-steps input').click();
    await page.locator('.work-memo > summary').click();
    await page.fill('#workflow-memo', '레벨 변경에도 유지');
    await page.getByRole('button', { name: '단계·시설 설정', exact: true }).click();
    await page.selectOption('#context-phase', '실시설계');
    await page.getByRole('button', { name: '적용하기', exact: true }).click();
    await page.getByRole('button', { name: '조건 적용하고 다시 확인' }).click();
    await page.locator('.work-side .work-detail > .work-steps input').click();
    for (const level of [1, 2, 3, 4, 5, 1]) {
      await depth(level);
      assert.equal(await page.locator('.work-node').count(), 3);
      assert.equal(await page.locator('.work-side input:checked').count(), 1);
      assert.equal(await page.locator('#workflow-memo').inputValue(), '레벨 변경에도 유지');
      assert.equal(
        await page.locator('.work-side .work-detail > .work-steps input').count(),
        level === 1 ? 1 : 3,
      );
      await page.locator('.work-side .work-fold > summary').last().click();
      const explanation = (
        await page.locator('.work-side .reading-topic option').allTextContents()
      ).join(' ');
      assert.equal(await page.locator('.work-side .work-explanation .reading-section').count(), 1);
      assert.equal(explanation.includes('준비할 자료'), level >= 2);
      assert.equal(explanation.includes('확인할 사람'), level >= 3);
      assert.equal(explanation.includes('실시설계에서 판단하기'), level >= 4);
      assert.equal(
        await page.getByRole('button', { name: '전체 조율 살펴보기' }).count(),
        level === 5 ? 1 : 0,
      );
      assert.match(await page.locator('.work-side').innerText(), /승인·법적 적합성을 뜻하지/);
      assert.match(await page.locator('.work-side').innerText(), /도서 간 버전/);
      if (level === 5) {
        await page.getByRole('button', { name: '전체 조율 살펴보기' }).click();
        assert.match(await page.locator('#workBody').innerText(), /선행 업무 대기/);
        await capture('overview-desktop');
        await page.keyboard.press('Escape');
      }
      if (level === 4) {
        await page.selectOption('.work-side .reading-topic', { label: '실시설계에서 판단하기' });
        assert.match(await page.locator('.work-side .reading-section').innerText(), /납품도서/);
      }
      if (level === 1 || level === 4) await capture('level-' + level + '-desktop');
    }
    await depth(5);
    await page.locator('[data-node="report-update"]').click();
    assert.match(await page.locator('.work-side .reading-button').innerText(), /협업·전달 · LV1/);
    // Returning to a different task in the same track keeps its chosen depth.
    await page.selectOption('#review-task', 'modeling');
    assert.match(await page.locator('.work-side .reading-button').innerText(), /LV5/);
    await page.selectOption('#review-task', 'drawing-revision');
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await depth(1, true);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.equal(await page.locator('#workBody .work-detail > .work-steps input').count(), 1);
      if (width === 390) await capture('level-1-mobile');
      await page.keyboard.press('Escape');
      await depth(4, true);
      assert.equal(await page.locator('#workBody .work-detail > .work-steps input').count(), 3);
      await page.keyboard.press('Escape');
    }
    // Normal app has no URL switch or UI control that grants the review profile's grades.
    await page.goto(origin + '/app/#/flow/drawing-revision');
    await page.locator('[data-node="drawing-revision"]').click();
    await page.locator('#workBody [data-reading]').click();
    assert.equal(await page.locator('#reading-depth option').count(), 1);
    assert.match(await page.locator('#workBody').innerText(), /획득 LV1/);
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    console.log(
      'PASS stage 5: five depth tiers, independent tracks, lower-depth return, preserved execution/context/memo, essential notices, overview isolation, mobile reflow, default app gate',
    );
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
