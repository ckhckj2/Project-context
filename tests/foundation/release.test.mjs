import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { inspect } = require('../../tools/check-entrypoints.cjs');
const root = path.resolve(import.meta.dirname, '../..');

test('weaker CSP and executable inline entrypoints fail closed', () => {
  const html = fs.readFileSync(path.join(root, 'docs/redesign/preview/index.html'), 'utf8');
  for (const changed of [
    html.replace("script-src 'self'", "script-src 'self' 'unsafe-eval'"),
    html.replace("connect-src 'none'", 'connect-src *'),
    html.replace('</head>', '<script>alert(1)</script></head>'),
    html.replace('<body>', '<body onload="alert(1)">'),
    html.replace('href="preview.css"', 'href="https://example.com/style.css"'),
  ])
    assert.throws(() => inspect(changed, 'docs/redesign/preview/index.html'));
});

test('release requires validation and packages production assets only', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/pages.yml'), 'utf8');
  assert.match(workflow, /needs: validate/);
  assert.match(workflow, /needs: package/);
  assert.match(workflow, /uses: \.\/\.github\/workflows\/validate.yml/);
  assert.match(workflow, /push:\s+branches: \[main\]/);
  assert.match(workflow, /if: github.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /continue-on-error|always\(\)|pull_request_target/);
  const validation = fs.readFileSync(path.join(root, '.github/workflows/validate.yml'), 'utf8');
  for (const command of ['npm ci --ignore-scripts', 'npm run check', 'npm run check:browser'])
    assert.ok(validation.includes(command));
  for (const action of [...(workflow + validation).matchAll(/uses: (actions\/[^\s]+)/g)])
    assert.match(action[1], /@[a-f0-9]{40}$/);
  execFileSync(process.execPath, ['tools/build-site.cjs'], { cwd: root });
  const assets = fs.readdirSync(path.join(root, 'dist'));
  assert.ok(assets.includes('index.html'));
  assert.ok(
    !assets.some((file) =>
      /^(docs|tests|tools|node_modules|project_context)|\.map$|package/.test(file),
    ),
  );
  assert.equal(
    fs.existsSync(path.join(root, 'dist/app/index.html')),
    true,
    'the preserved development entry is reachable from the navigation command',
  );
  assert.equal(
    fs.existsSync(path.join(root, 'dist/src/ui')),
    true,
    'development assets are packaged separately; browser checks verify loading isolation',
  );
  assert.equal(fs.existsSync(path.join(root, 'dist/src/application/task-navigation.mjs')), true);
  assert.equal(
    fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8'),
    fs.readFileSync(path.join(root, 'index.html'), 'utf8'),
  );
});

test('redesign release includes both verified apps and a safe default landing page', () => {
  execFileSync(process.execPath, ['tools/build-site.cjs', '--redesign'], { cwd: root });
  const release = path.join(root, 'dist-release');
  const landing = fs.readFileSync(path.join(release, 'index.html'), 'utf8');
  assert.match(landing, /app\/release-entry\.mjs/);
  assert.match(landing, /script-src 'self'/);
  assert.equal(
    fs.readFileSync(path.join(release, 'legacy.html'), 'utf8'),
    fs.readFileSync(path.join(root, 'index.html'), 'utf8'),
  );
  for (const file of [
    'app/index.html',
    'app/main.mjs',
    'src/ui/progress-view.mjs',
    'src/content/assessment-bank.mjs',
    'src/styles/progress.css',
  ])
    assert.ok(fs.existsSync(path.join(release, file)), file);
  for (const file of [
    'docs',
    'tests',
    'tools',
    'node_modules',
    'AGENTS.md',
    'package.json',
    '.git',
    '.env',
  ])
    assert.equal(fs.existsSync(path.join(release, file)), false, file);
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/pages.yml'), 'utf8');
  assert.match(workflow, /npm run build:release/);
  assert.match(workflow, /path: dist-release/);
});
