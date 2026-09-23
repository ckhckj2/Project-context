'use strict';
const http = require('node:http'),
  fs = require('node:fs'),
  path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..'),
  out = path.join(root, 'docs/redesign/screenshots/stage-6');
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
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } }),
      errors = [],
      external = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (!request.url().startsWith(origin + '/')) external.push(request.url());
    });
    const { assessmentObjectives: bank } = await import('../src/content/assessment-bank.mjs');
    const go = async (hash) => {
      await page.evaluate((value) => {
        location.hash = value;
      }, hash);
      await page.waitForTimeout(80);
    };
    const click = async (name) => page.getByRole('button', { name, exact: true }).click();
    fs.mkdirSync(out, { recursive: true });
    const capture = async (name) => {
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(out, name + '.png'), fullPage: true });
    };
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw new Error('Storage blocked');
      };
      Storage.prototype.getItem = () => {
        throw new Error('Storage blocked');
      };
    });
    await page.goto(origin + '/app/index.html#/learn');
    assert.equal(await page.locator('.learning-tracks a').count(), 3);
    await capture('mobile-fields');
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
    }
    await capture('desktop-fields');
    await page.setViewportSize({ width: 390, height: 844 });
    await go('#/learn/design');
    await click('승급 도전하기');
    assert.equal(await page.getByRole('radio').count(), 5);
    await click('답 확인');
    assert.match(await page.locator('.learning-error').innerText(), /선택/);
    await page.getByRole('radio').first().check();
    const draft = await page.locator('input:checked').inputValue();
    await go('#/learn');
    await go('#/learn/design');
    assert.equal(await page.locator('input:checked').inputValue(), draft);
    await capture('mobile-question');
    async function solve(review = false) {
      const prompt = await page.locator('#quiz-prompt').innerText(),
        q = bank.find((q) => q.cases.includes(prompt));
      assert.ok(q);
      if (q.type === 'choice') await page.locator(`input[value="${q.answer}"]`).check();
      else if (q.type === 'short') await page.locator('.quiz-short').fill(q.aliases[0]);
      else for (const id of q.answer) await page.locator(`[data-option="${id}"]`).click();
      await click('답 확인');
      assert.match(await page.locator('.quiz-feedback').innerText(), /맞았어요/);
      if (review) {
        await capture('mobile-feedback');
        await page.getByRole('link', { name: '관련 업무 설명 읽기', exact: true }).click();
        await page.locator('.work-node').first().click();
        await page.keyboard.press('Escape');
        await page.getByRole('link', { name: '문제로 돌아가기 →', exact: true }).click();
        assert.match(await page.locator('.quiz-feedback').innerText(), /맞았어요/);
      }
      const last = await page.getByRole('button', { name: '결과 확인', exact: true }).count();
      await click(last ? '결과 확인' : '다음 문제');
      return q.type;
    }
    for (let i = 0; i < 5; i++) await solve(i === 0);
    assert.match(await page.locator('.learning-intro').innerText(), /LV2/);
    await capture('mobile-result');
    await click('다른 도전 고르기');
    await click('승급 도전하기');
    const types = new Set();
    for (let i = 0; i < 5; i++) types.add(await solve());
    assert.deepEqual([...types].sort(), ['choice', 'order', 'short']);
    assert.match(await page.locator('.learning-intro').innerText(), /LV3/);
    await click('다른 도전 고르기');
    await click('3문제 연습하기 · 승급 반영 없음');
    for (let i = 0; i < 3; i++) await solve();
    await click('다른 도전 고르기');
    assert.match(await page.locator('.learning-intro').innerText(), /현재 LV3/);
    await go('#/learn/permit');
    await click('승급 도전하기');
    await page.getByText('풀이 관리', { exact: true }).click();
    await click('이번 풀이 그만두기');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#quiz-prompt').count(), 1);
    await click('이번 풀이 그만두기');
    await click('풀이 그만두기');
    assert.match(await page.locator('.learning-intro').innerText(), /현재 LV1/);
    await click('승급 도전하기');
    for (let i = 0; i < 5; i++) {
      await click('모르겠어요 · 건너뛰기');
      await click(i === 4 ? '결과 확인' : '다음 문제');
    }
    assert.match(await page.locator('.learning-intro').innerText(), /レベル|레벨은 그대로/);
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    console.log(
      'Learning browser: PASS (three formats, resume, review return, promotion, practice, abandon, failure, responsive layouts)',
    );
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
