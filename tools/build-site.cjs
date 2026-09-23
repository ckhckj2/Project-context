'use strict';
// Publish an explicit production allowlist. Never package the repository, tests,
// node_modules, old HTML snapshots, credentials or unfinished redesign previews.
const fs = require('node:fs'),
  path = require('node:path');
const acorn = require('acorn');
const root = path.resolve(__dirname, '..'),
  destination = path.join(root, process.argv.includes('--redesign') ? 'dist-release' : 'dist');
const redesign = process.argv.includes('--redesign');
if (process.argv.slice(2).some((value) => value !== '--redesign'))
  throw new Error('Unknown build option');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const assets = new Set([
  'index.html',
  'mascot_v2112.svg',
  ...[...html.matchAll(/(?:src|href)="\.\/([^?"#]+)[^"]*"/g)].map((match) => match[1]),
]);
if (redesign) {
  assets.add('app/index.html');
  assets.add('app/release-entry.mjs');
}
fs.rmSync(destination, { recursive: true, force: true });
fs.mkdirSync(destination);
for (const file of assets) {
  if (
    !/^(?:(?:app|src)\/[a-zA-Z0-9_/-]+\/?)?[a-zA-Z0-9_.-]+\.(html|js|mjs|css|svg)$/.test(file) ||
    file.includes('..')
  )
    throw new Error('Unreviewed asset: ' + file);
  if (file === 'app/index.html') {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of source.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g)) {
      if (/^(?:[a-z]+:|\/)/i.test(match[1])) throw new Error('Nonlocal entry asset');
      assets.add(path.posix.normalize(path.posix.join(path.posix.dirname(file), match[1])));
    }
  }
  if (file.endsWith('.mjs')) {
    const tree = acorn.parse(fs.readFileSync(path.join(root, file), 'utf8'), {
      sourceType: 'module',
      ecmaVersion: 'latest',
    });
    for (const node of tree.body) {
      if (!node.source) continue;
      if (!node.source.value.startsWith('.')) throw new Error('Nonlocal module');
      assets.add(
        path.posix.normalize(path.posix.join(path.posix.dirname(file), node.source.value)),
      );
    }
  }
  fs.mkdirSync(path.dirname(path.join(destination, file)), { recursive: true });
  fs.copyFileSync(
    path.join(root, file),
    path.join(destination, redesign && file === 'index.html' ? 'legacy.html' : file),
  );
}
fs.writeFileSync(path.join(destination, '.nojekyll'), '');
if (redesign) {
  const landing = fs
    .readFileSync(path.join(root, 'app/release.html'), 'utf8')
    .replace('src="release-entry.mjs"', 'src="./app/release-entry.mjs"');
  fs.writeFileSync(path.join(destination, 'index.html'), landing);
}
console.log(
  `Built ${assets.size + (redesign ? 1 : 0)} files in ${path.basename(destination)} (${redesign ? 'new app with legacy compatibility' : 'legacy release'}).`,
);
