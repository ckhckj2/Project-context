'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const acorn = require('acorn');
const root = path.resolve(__dirname, '..');
const layers = {
  content: [],
  domain: ['domain', 'content'],
  application: ['application', 'domain', 'content'],
  infrastructure: ['infrastructure', 'domain', 'content'],
  ui: ['ui', 'application', 'content'],
};
const forbidden = new Set([
  'window',
  'globalThis',
  'self',
  'parent',
  'top',
  'frames',
  'eval',
  'Function',
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'EventSource',
  'navigator',
  'location',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'caches',
  'Worker',
  'SharedWorker',
  'WebAssembly',
  'importScripts',
  'setTimeout',
  'setInterval',
  'MutationObserver',
  'postMessage',
  'constructor',
  '__proto__',
  'innerHTML',
  'outerHTML',
  'insertAdjacentHTML',
  'srcdoc',
  'cookie',
  'require',
  'process',
  'Reflect',
]);
const storageMethods = new Set(['getItem', 'setItem', 'removeItem']);
const domMethods = new Set([
  'querySelector',
  'querySelectorAll',
  'getElementById',
  'createElement',
  'createElementNS',
  'addEventListener',
  'removeEventListener',
  'getBoundingClientRect',
]);

function constantString(node) {
  if (node?.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0)
    return node.quasis[0].value.cooked;
  if (node?.type === 'BinaryExpression' && node.operator === '+') {
    const left = constantString(node.left),
      right = constantString(node.right);
    if (left !== undefined && right !== undefined) return left + right;
  }
}

function walk(node, visit, parent = null) {
  if (!node || typeof node !== 'object') return;
  if (node.type) visit(node, parent);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((item) => walk(item, visit, node));
    else if (value && typeof value === 'object') walk(value, visit, node);
  }
}

function inspect(file, source, exists = (target) => fs.existsSync(path.join(root, target))) {
  const entry = ['app/main.mjs', 'app/legacy-entry.mjs', 'app/release-entry.mjs'].includes(file);
  const errors = [],
    layer = entry ? 'entry' : file.split('/')[1];
  const fail = (message) => errors.push(`${file}: ${message}`);
  const forbiddenHere = (name) =>
    (forbidden.has(name) &&
      !(entry && ['window', 'location'].includes(name)) &&
      !(file === 'app/main.mjs' && ['localStorage', 'navigator'].includes(name))) ||
    (layer !== 'infrastructure' && storageMethods.has(name)) ||
    (!entry && layer !== 'ui' && domMethods.has(name));
  if (!entry && !Object.hasOwn(layers, layer)) return [`${file}: unknown source layer`];
  let tree;
  try {
    tree = acorn.parse(source, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  } catch (error) {
    return [`${file}: ${error.message}`];
  }
  function dependency(value) {
    if (typeof value !== 'string' || !value.startsWith('.') || !value.endsWith('.mjs'))
      return fail('only explicit relative .mjs imports');
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), value));
    const allowedLayers = entry ? ['application', 'ui', 'infrastructure'] : layers[layer];
    if (!target.startsWith('src/') || !allowedLayers.includes(target.split('/')[1]))
      fail(`forbidden dependency ${target}`);
    if (!exists(target)) fail(`missing dependency ${target}`);
  }
  walk(tree, (node, parent) => {
    if (node.type === 'ImportDeclaration' || node.type.startsWith('Export')) {
      if (node.source) dependency(node.source.value);
    }
    if (node.type === 'ImportExpression') fail('dynamic imports are not allowed');
    if (
      file === 'app/main.mjs' &&
      node.type === 'MemberExpression' &&
      node.object.type === 'Identifier' &&
      node.object.name === 'navigator'
    ) {
      const capability = node.computed ? constantString(node.property) : node.property.name;
      if (capability !== 'locks') fail('only exclusive storage locks are allowed on navigator');
    }
    if (
      node.type === 'Identifier' &&
      !(
        node.name === 'top' &&
        parent?.type === 'Property' &&
        parent.key === node &&
        !parent.shorthand
      ) &&
      (forbiddenHere(node.name) ||
        (!entry &&
          layer !== 'ui' &&
          ['document', 'HTMLElement', 'getComputedStyle', 'matchMedia'].includes(node.name)))
    )
      fail(`forbidden capability ${node.name} at line ${node.loc.start.line}`);
    if (
      node.type === 'MemberExpression' &&
      node.computed &&
      forbiddenHere(constantString(node.property))
    )
      fail(`forbidden property ${constantString(node.property)}`);
    if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
      const name = node.callee.computed
        ? constantString(node.callee.property)
        : node.callee.property.name;
      if (name === 'createElement') {
        const tag = node.arguments[0];
        if (
          tag?.type === 'Literal' &&
          ['script', 'style', 'iframe', 'object', 'embed'].includes(tag.value)
        )
          fail('active element creation');
        if (tag?.type !== 'Literal' && file !== 'src/ui/elements.mjs')
          fail('dynamic tags must use the shared allowlist');
      }
      if (name === 'setAttribute') {
        const attribute = node.arguments[0];
        if (attribute?.type !== 'Literal' || /^(on|style$|srcdoc$)/i.test(attribute.value))
          fail('unsafe or dynamic attribute');
      }
    }
  });
  return errors;
}

function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Source symlinks are not allowed');
    return entry.isDirectory() ? files(target) : [target];
  });
}

function run() {
  const errors = [];
  for (const file of files(path.join(root, 'app')).map((absolute) =>
    path.relative(root, absolute).split(path.sep).join('/'),
  )) {
    if (['app/index.html', 'app/release.html'].includes(file)) continue;
    if (!['app/main.mjs', 'app/legacy-entry.mjs', 'app/release-entry.mjs'].includes(file))
      errors.push(`${file}: unregistered composition entry`);
    else errors.push(...inspect(file, fs.readFileSync(path.join(root, file), 'utf8')));
  }
  for (const absolute of files(path.join(root, 'src'))) {
    const file = path.relative(root, absolute).split(path.sep).join('/');
    const source = fs.readFileSync(absolute, 'utf8');
    if (file.endsWith('.mjs')) errors.push(...inspect(file, source));
    else if (file.startsWith('src/styles/') && file.endsWith('.css')) {
      if (/@import|url\s*\(|!important/i.test(source))
        errors.push(`${file}: styles must be static, local and without !important`);
    } else errors.push(`${file}: unsupported source file`);
  }
  // Exact legacy exception inventory, with an explicit retirement milestone. No new
  // versioned override files or unreviewed edits can silently join the old runtime.
  const baseline = JSON.parse(fs.readFileSync(path.join(root, 'tools/legacy-boundary.json')));
  for (const item of baseline.files) {
    const bytes = fs.readFileSync(path.join(root, item.file));
    if (crypto.createHash('sha256').update(bytes).digest('hex') !== item.sha256)
      errors.push(
        `${item.file}: frozen legacy file changed; migrate or explicitly review exception`,
      );
    if (!item.owner || !item.retireBy)
      errors.push(`${item.file}: missing exception owner/milestone`);
  }
  const allowed = new Set(baseline.files.map((item) => item.file));
  for (const file of fs.readdirSync(root).filter((file) => /\.(js|css|html)$/.test(file))) {
    if (!allowed.has(file))
      errors.push(`${file}: new root runtime file; use src responsibility layers`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('PASS: AST dependency/capability checks, static styles, bounded legacy exceptions');
}
module.exports = { inspect, run };
if (require.main === module) run();
