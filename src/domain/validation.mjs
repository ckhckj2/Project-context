// Shared value checks. This layer has no browser, storage or UI dependencies.
export function assert(condition, message) {
  if (!condition) throw new TypeError(message);
}

export function record(value, allowedKeys) {
  assert(value !== null && typeof value === 'object' && !Array.isArray(value), 'Expected a record');
  assert([Object.prototype, null].includes(Object.getPrototypeOf(value)), 'Unexpected prototype');
  assert(
    Object.keys(value).every((key) => allowedKeys.includes(key)),
    'Unknown record field',
  );
}

export function identifier(value) {
  assert(typeof value === 'string' && /^[a-z][a-z0-9-]{0,63}$/.test(value), 'Invalid stable ID');
  assert(!['constructor', 'prototype', '__proto__'].includes(value), 'Reserved ID');
  return value;
}

export function text(value, max = 500) {
  assert(typeof value === 'string' && value.length <= max, 'Invalid text length');
  assert(
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value),
    'Control characters are not supported',
  );
  return value;
}
