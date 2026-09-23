'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
function inspect(html, file) {
  assert.doesNotMatch(
    html,
    /\son\w+\s*=|javascript:|<iframe|<object|<embed|<style\b/i,
    `${file}: active/inline content`,
  );
  if (file !== 'index.html') assert.doesNotMatch(html, /\sstyle\s*=/i, `${file}: inline style`);
  const policy = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i)?.[1];
  assert(policy, `${file}: missing CSP`);
  const directives = Object.fromEntries(
    policy
      .split(';')
      .map((item) => item.trim().split(/\s+/))
      .filter((item) => item[0])
      .map(([key, ...value]) => [key, value.join(' ')]),
  );
  for (const [name, value] of Object.entries({
    'script-src': "'self'",
    'connect-src': "'none'",
    'object-src': "'none'",
    'base-uri': "'none'",
    'form-action': "'none'",
  }))
    assert.equal(directives[name], value, `${file}: ${name}`);
  if (file !== 'index.html')
    assert.equal(directives['style-src'], "'self'", 'new pages must not allow inline style');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    assert(/\bsrc="/.test(match[1]) && !match[2].trim(), `${file}: only external local scripts`);
  }
  for (const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/gi)) {
    const value = match[1].split('?')[0];
    assert(!/^(?:[a-z]+:|\/)/i.test(value), `${file}: nonlocal asset`);
    const target = path.resolve(root, path.dirname(file), value);
    assert(
      target.startsWith(root + path.sep) && fs.statSync(target).isFile(),
      `${file}: missing/escaping asset`,
    );
  }
}
module.exports = { inspect };
if (require.main === module) {
  for (const file of [
    'index.html',
    'app/index.html',
    'app/release.html',
    'docs/redesign/preview/index.html',
    'docs/redesign/level-preview.html',
  ])
    inspect(fs.readFileSync(path.join(root, file), 'utf8'), file);
  console.log('PASS: entrypoint CSP, local assets and inline-code restrictions');
}
