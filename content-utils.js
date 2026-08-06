const ALLOWED_TAGS = new Set([
  'a',
  'article',
  'blockquote',
  'br',
  'code',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'iframe',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'u',
  'ul'
]);

const GLOBAL_ATTRS = new Set(['aria-label', 'aria-hidden', 'align', 'id']);
const TAG_ATTRS = {
  a: new Set(['href', 'target', 'rel', 'title', 'class']),
  iframe: new Set(['src', 'title', 'allow', 'allowfullscreen', 'loading']),
  img: new Set(['src', 'alt', 'title', 'loading']),
  code: new Set(['class']),
  pre: new Set(['class'])
};

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
const SAFE_IFRAME_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'player.vimeo.com'
]);
const DROP_TAGS = new Set(['script', 'style', 'object', 'embed']);

function isSafeUrl(value, tagName) {
  if (!value) return false;

  if (value.startsWith('#') || value.startsWith('/')) {
    return tagName !== 'iframe';
  }

  try {
    const url = new URL(value, window.location.origin);

    if (tagName === 'iframe') {
      return url.protocol === 'https:' && SAFE_IFRAME_HOSTS.has(url.hostname);
    }

    return SAFE_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

function unwrapNode(node) {
  const parent = node.parentNode;
  if (!parent) return;

  while (node.firstChild) {
    parent.insertBefore(node.firstChild, node);
  }

  parent.removeChild(node);
}

function sanitizeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) return;

  if (node.nodeType !== Node.ELEMENT_NODE) {
    node.parentNode?.removeChild(node);
    return;
  }

  const tagName = node.tagName.toLowerCase();

  if (!ALLOWED_TAGS.has(tagName)) {
    if (DROP_TAGS.has(tagName)) {
      node.parentNode?.removeChild(node);
      return;
    }

    [...node.childNodes].forEach((child) => sanitizeNode(child));
    unwrapNode(node);
    return;
  }

  [...node.attributes].forEach((attr) => {
    const name = attr.name.toLowerCase();
    const value = attr.value.trim();
    const allowedAttrs = TAG_ATTRS[tagName] || new Set();
    const isAllowed = GLOBAL_ATTRS.has(name) || allowedAttrs.has(name);

    if (!isAllowed || name.startsWith('on')) {
      node.removeAttribute(attr.name);
      return;
    }

    if (name === 'id' && !/^[A-Za-z0-9_-]+$/.test(value)) {
      node.removeAttribute(attr.name);
      return;
    }

    if ((name === 'href' || name === 'src') && !isSafeUrl(value, tagName)) {
      node.removeAttribute(attr.name);
      return;
    }

    if (tagName === 'a' && name === 'target' && value === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });

  if (tagName === 'img') {
    node.setAttribute('loading', 'lazy');
  }

  if (tagName === 'iframe' && !node.getAttribute('src')) {
    node.parentNode?.removeChild(node);
  }

  [...node.childNodes].forEach((child) => sanitizeNode(child));
}

export function sanitizeHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = html || '';
  [...template.content.childNodes].forEach((node) => sanitizeNode(node));
  return template.innerHTML;
}

export function htmlToText(html) {
  const template = document.createElement('template');
  template.innerHTML = sanitizeHtml(html);
  return (template.content.textContent || '').replace(/\s+/g, ' ').trim();
}

export function setSanitizedContent(element, html, fallbackHtml = '') {
  if (!element) return;

  const safeHtml = sanitizeHtml(html);
  element.innerHTML = safeHtml || fallbackHtml;
}
