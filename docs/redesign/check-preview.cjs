// Starts a loopback-only server. Set CHEOKCHEOK_BROWSER to a Chromium executable.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const base = 'http://127.0.0.1:8765/docs/redesign/preview/';
const out = path.join(__dirname, 'screenshots');
async function main() {
  const server = spawn('python', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], { cwd: path.resolve(__dirname, '../..'), stdio: 'ignore' });
  await new Promise(resolve => setTimeout(resolve, 700));
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHEOKCHEOK_BROWSER, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [], external = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1:8765/')) external.push(r.url()); });
  const click = action => page.locator(`[data-action="${action}"]:visible`).click();
  const capture = async name => { await page.evaluate(async () => { await document.fonts.ready; document.querySelector('#notice').hidden = true; }); await page.screenshot({ path: path.join(out, name + '.png'), fullPage: !(await page.locator('#sheet').evaluate(n => n.open)) }); };
  try {
    await page.goto(base);
    await capture('home-desktop');
    await page.locator('[data-go="choose"]').first().click();
    await page.locator('[data-group="0"]').click();
    await page.locator('[data-task="도면 수정"]').click();
    await page.locator('[data-node="report"]').click();
    await click('depth'); await page.locator('[data-depth="2"]').click();
    assert.equal(await page.locator('.flow-title h1').evaluate(n => getComputedStyle(n).fontWeight), '800');
    assert.equal(await page.locator('.action h3').first().evaluate(n => getComputedStyle(n).fontWeight), '800');
    await capture('flow-desktop');
    await click('context');
    assert.equal(await page.locator('#sheet').evaluate(n => n.open), false);
    await capture('conditions-desktop');
    await page.locator('#facility').selectOption({ label: '업무시설' });
    await click('applyContext');
    await click('save'); await click('progress');
    await click('complete');
    assert.equal(await page.locator('#sheet').evaluate(n => n.open), true, 'incomplete work must stay open');
    for (const box of await page.locator('[data-check]').all()) await box.check();
    await click('complete');
    await page.locator('.finished-list summary').click();
    assert.equal(await page.locator('.status-pill').innerText(), '완료');
    await click('reopen');
    assert.equal(await page.locator('.status-pill').innerText(), '진행 중');
    await click('delete'); await click('confirmDelete'); await click('trash'); await click('restore');
    assert.equal(await page.locator('.workflow-card').count(), 1);
    await page.locator('.workflow-card [data-go="flow"]').click();
    await click('depth'); await page.locator('[data-depth="1"]').click();
    await click('progress');
    assert.equal(await page.locator('[data-check]:checked').count(), 8, 'changing depth preserves progress');
    await page.locator('#sheetClose').click();
    await page.locator('.brand').click(); await click('search');
    await page.locator('#taskSearch').fill('<img src=x onerror=alert(1)>');
    assert.equal(await page.locator('#results img').count(), 0);
    assert.match(await page.locator('#results').innerText(), /일치하는 업무가 없어요/);
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      for (const screen of ['', '?screen=flow', '?screen=learn']) {
        await page.goto(base + screen);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow ${width} ${screen}`);
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base); await capture('home-mobile');
    await page.goto(base + '?screen=flow'); await capture('flow-mobile');
    await click('detail'); await capture('detail-mobile');
    await click('context'); await capture('conditions-mobile');
    await click('applyContext');
    await page.goto(base + '?screen=learn'); await click('quiz');
    await page.locator('[data-answer="0"]').click(); await click('quizSubmit');
    assert.match(await page.locator('#feedback').innerText(), /맞아요/);
    assert.deepEqual(errors, []); assert.deepEqual(external, []);
    console.log('PASS: navigation, branching, context, completion, restore, depth preservation, safe search, no storage/network, 3 viewport widths, 7 screenshots.');
  } finally { await browser.close(); server.kill(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
