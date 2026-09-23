'use strict';
const http = require('node:http'),
  fs = require('node:fs'),
  path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const target = path.resolve(root, '.' + pathname);
    if (!target.startsWith(root + path.sep)) throw Error('Invalid path');
    const mime = {
      '.html': 'text/html',
      '.mjs': 'text/javascript',
      '.js': 'text/javascript',
      '.css': 'text/css',
    }[path.extname(target)];
    if (!mime) throw Error('Invalid asset');
    res.writeHead(200, { 'Content-Type': mime + '; charset=utf-8' });
    res.end(fs.readFileSync(target));
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});
(async () => {
  let browser;
  try {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    browser = await chromium.launch({
      headless: true,
      ...(process.env.CC_CHROMIUM_EXECUTABLE
        ? { executablePath: process.env.CC_CHROMIUM_EXECUTABLE }
        : {}),
    });
    const page = await browser.newPage();
    const origin = `http://127.0.0.1:${server.address().port}`;
    const errors = [],
      external = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (!request.url().startsWith(origin + '/')) external.push(request.url());
    });
    await page.goto(origin + '/tests/foundation/ui.html');
    assert.equal(await page.locator('#output img').count(), 0);
    assert.equal(await page.locator('#output').getAttribute('data-unsafe'), null);
    assert.equal(await page.locator('#output a').getAttribute('rel'), 'noopener noreferrer');
    await page.locator('#open').click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'close');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'next');
    await page.keyboard.press('Tab');
    // Native dialog may focus its container on wrap, but never the inert opener.
    assert.notEqual(await page.evaluate(() => document.activeElement.id), 'open');
    await page.locator('#next').click();
    assert.equal(await page.locator('#title').innerText(), '두 번째 안내');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'open');
    await page.locator('#open').click();
    await page.locator('#close').click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'open');
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    console.log(
      'PASS: safe dynamic text/links, modal keyboard containment, Escape and opener focus restore',
    );
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
