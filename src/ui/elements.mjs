// Dynamic text has one safe rendering route. No HTML parsing or URL interpolation.
const tags = new Set([
  'div',
  'section',
  'article',
  'p',
  'span',
  'strong',
  'small',
  'h2',
  'h3',
  'h1',
  'ul',
  'li',
  'nav',
  'button',
  'label',
  'input',
  'textarea',
  'select',
  'option',
  'details',
  'summary',
]);
export function element(tag, value, className) {
  if (!tags.has(tag)) throw new TypeError('Unsupported UI element');
  const node = document.createElement(tag);
  if (value !== undefined) node.textContent = String(value);
  if (className) node.className = className;
  return node;
}

export function sourceLink(label, address) {
  const url = new URL(address);
  if (url.protocol !== 'https:' || url.username || url.password)
    throw new TypeError('Invalid source URL');
  const anchor = document.createElement('a');
  anchor.textContent = label;
  anchor.href = url.href;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.referrerPolicy = 'no-referrer';
  return anchor;
}

export function navigationLink(label, destination, className = '') {
  if (
    typeof destination !== 'string' ||
    !/^(?:#\/(?:[a-z-]+(?:\/[a-z0-9-]+)?)?|\.\.\/index\.html\?entry=(?:projects|quiz|task)(?:&task=[a-z0-9-]+)?)$/.test(
      destination,
    )
  ) {
    throw new TypeError('Unsupported navigation destination');
  }
  const anchor = document.createElement('a');
  anchor.textContent = label;
  anchor.href = destination;
  anchor.className = className;
  return anchor;
}
