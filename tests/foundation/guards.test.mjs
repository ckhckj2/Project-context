import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { inspect } = require('../../tools/check-boundaries.cjs');

test('guard rejects wrong-layer imports, re-exports, computed capabilities and HTML sinks', () => {
  const cases = [
    ['app/main.mjs', 'navigator.geolocation.getCurrentPosition(callback);'],
    ['app/main.mjs', 'navigator[capability]();'],
    ['app/legacy-entry.mjs', 'const store = window.localStorage;'],
    ['src/domain/bad.mjs', 'export { element } from "../ui/elements.mjs";'],
    [
      'src/ui/bad.mjs',
      'import { createValidatedStore } from "../infrastructure/validated-store.mjs";',
    ],
    ['src/domain/bad.mjs', 'document.querySelector("p");'],
    ['src/ui/bad.mjs', 'const storage = window["localStorage"];'],
    ['src/ui/bad.mjs', 'injectedStorage.setItem("key", input);'],
    ['src/domain/bad.mjs', 'injectedRoot.querySelector("p");'],
    ['src/ui/bad.mjs', 'node["innerHTML"] = input;'],
    ['src/ui/bad.mjs', 'node["inner" + "HTML"] = input;'],
    ['src/ui/bad.mjs', 'node[`innerHTML`] = input;'],
    ['src/ui/bad.mjs', 'import("../domain/learning.mjs");'],
    ['src/ui/bad.mjs', 'const run = eval; run("x");'],
    ['src/ui/bad.mjs', 'document.createElement("script");'],
    ['src/ui/bad.mjs', 'node.setAttribute("onclick", input);'],
    ['src/ui/bad.mjs', 'node.setAttribute(attribute, input);'],
    ['src/ui/bad.mjs', 'import x from "https://example.com/x.mjs";'],
  ];
  for (const [file, source] of cases)
    assert.ok(inspect(file, source, () => true).length > 0, source);
  assert.deepEqual(inspect('src/domain/valid.mjs', 'export const twice = n => n * 2;'), []);
});
