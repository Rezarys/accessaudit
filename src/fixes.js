// Proposed code fixes for the most frequent defects. A fix only ever ADDS to the element's opening tag
// (or changes one named attribute where the defect is that attribute's value); it never removes markup.
// Every proposal is then checked twice: structurally here (checkPreserved) and by re-running the same
// axe-core rule on the fixed markup in the browser (verify.js). A proposal that fails either check is dropped.
'use strict';
const { parseColor, toHex, contrastRatio, nearestPassingColor } = require('./color');

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

function startTag(html) {
  const m = String(html || '').match(/^<([a-zA-Z][\w-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/);
  if (!m) return null;
  return { text: m[0], tag: m[1].toLowerCase(), attrs: parseAttrs(m[2]) };
}

function parseAttrs(s) {
  const out = {};
  const re = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = re.exec(s || ''))) {
    const name = m[1].toLowerCase();
    if (!(name in out)) out[name] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return out;
}

function escAttr(v) {
  return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function addAttr(tagText, name, value) {
  const end = tagText.endsWith('/>') ? tagText.length - 2 : tagText.length - 1;
  const head = tagText.slice(0, end).replace(/\s+$/, '');
  return `${head} ${name}="${escAttr(value)}"${tagText.slice(end)}`;
}

function setAttr(tagText, name, value) {
  const re = new RegExp(`(\\s${name}\\s*=\\s*)("[^"]*"|'[^']*'|[^\\s"'=<>\`]+)`, 'i');
  if (re.test(tagText)) return tagText.replace(re, `$1"${escAttr(value)}"`);
  return addAttr(tagText, name, value);
}

// Turns a file name, a path segment, an id or a class into a short human label.
function humanize(raw) {
  if (!raw) return '';
  let s = String(raw).split(/[?#]/)[0];
  s = s.split('/').filter(Boolean).pop() || '';
  s = s.replace(/\.[a-z0-9]{2,5}$/i, '');
  s = s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_.+]+/g, ' ');
  s = s.replace(/\b\d+(x\d+)?\b/g, ' ').replace(/\b(img|image|icon|ico|btn|svg|thumb|thumbnail|large|small|medium|copy|final|v\d*)\b/gi, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  const digits = (s.match(/\d/g) || []).length;
  if (!s || s.length > 60 || /^[a-f0-9 ]{8,}$/i.test(s) || !/[a-z]/i.test(s) || digits > s.length * 0.3) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const KNOWN_SITES = {
  'apps.apple.com': 'Download on the App Store', 'play.google.com': 'Get it on Google Play',
  'maps.google.com': 'Map', 'facebook.com': 'Facebook', 'instagram.com': 'Instagram', 'twitter.com': 'X (Twitter)', 'x.com': 'X (Twitter)',
  'linkedin.com': 'LinkedIn', 'youtube.com': 'YouTube', 'youtu.be': 'YouTube', 'tiktok.com': 'TikTok',
  'pinterest.com': 'Pinterest', 'wa.me': 'WhatsApp', 'whatsapp.com': 'WhatsApp', 'github.com': 'GitHub',
  'vimeo.com': 'Vimeo', 'google.com': 'Google', 'threads.net': 'Threads', 'bsky.app': 'Bluesky',
};

const BUTTON_WORDS = {
  close: 'Close', menu: 'Open menu', hamburger: 'Open menu', burger: 'Open menu', nav: 'Open menu', search: 'Search',
  cart: 'Cart', basket: 'Basket', bag: 'Shopping bag', account: 'Account', user: 'Account', login: 'Log in',
  next: 'Next', prev: 'Previous', previous: 'Previous', play: 'Play', pause: 'Pause', share: 'Share',
  wishlist: 'Wishlist', favorite: 'Add to favourites', favourite: 'Add to favourites', submit: 'Submit',
  plus: 'Increase quantity', minus: 'Decrease quantity', increase: 'Increase quantity', decrease: 'Decrease quantity',
  filter: 'Filter', sort: 'Sort', zoom: 'Zoom', back: 'Back', top: 'Back to top', dismiss: 'Dismiss', toggle: 'Toggle',
};

function siteName(href) {
  try {
    const host = new URL(href).hostname.replace(/^www\./, '');
    if (KNOWN_SITES[host]) return KNOWN_SITES[host];
    for (const [k, v] of Object.entries(KNOWN_SITES)) if (host.endsWith('.' + k)) return v;
    return '';
  } catch { return ''; }
}

function wordsFrom(attrs) {
  const pool = `${attrs.class || ''} ${attrs.id || ''} ${attrs['data-action'] || ''} ${attrs.name || ''}`.toLowerCase();
  for (const token of pool.split(/[^a-z]+/)) if (BUTTON_WORDS[token]) return BUTTON_WORDS[token];
  return '';
}

const PLACEHOLDER = 'EDIT ME: describe it';

function labelFor(rule, st, node, page) {
  const a = st.attrs;
  if (a.title) return { text: a.title, guessed: false };
  if (rule === 'image-alt' || rule === 'input-image-alt') {
    const h = humanize(a.src || a['data-src']);
    return h ? { text: h, guessed: true } : { text: PLACEHOLDER, guessed: true };
  }
  if (rule === 'label' || rule === 'select-name') {
    if (a.placeholder) return { text: a.placeholder, guessed: true };
    if (a.type === 'search') return { text: 'Search', guessed: true };
    const h = humanize(a.name || a.id || a.autocomplete);
    return h ? { text: h, guessed: true } : { text: PLACEHOLDER, guessed: true };
  }
  if (rule === 'link-name') {
    const href = a.href || '';
    let abs = href;
    try { abs = new URL(href, page.url).href; } catch { /* keep raw */ }
    const known = siteName(abs);
    if (known) return { text: known, guessed: true };
    try {
      const u = new URL(abs);
      const own = page.url ? new URL(page.url).origin : u.origin;
      if (u.origin === own && (u.pathname === '/' || u.pathname === '')) return { text: 'Home', guessed: true };
      if (/^https?:$/.test(u.protocol) && u.origin !== own) {
        return { text: `Visit ${u.hostname.replace(/^www\./, '')}`, guessed: true };
      }
    } catch { /* ignore */ }
    if (/^mailto:/i.test(href)) return { text: 'Send an email', guessed: true };
    if (/^tel:/i.test(href)) return { text: 'Call us', guessed: true };
    const h = humanize(href) || wordsFrom(a);
    return h ? { text: h, guessed: true } : { text: PLACEHOLDER, guessed: true };
  }
  if (rule === 'button-name' || rule === 'input-button-name') {
    const w = wordsFrom(a);
    return w ? { text: w, guessed: true } : { text: PLACEHOLDER, guessed: true };
  }
  if (rule === 'frame-title') {
    const src = a.src || '';
    if (/youtube|youtu\.be/.test(src)) return { text: 'YouTube video', guessed: true };
    if (/vimeo/.test(src)) return { text: 'Vimeo video', guessed: true };
    if (/google\.[a-z.]+\/maps|maps\.google/.test(src)) return { text: 'Map', guessed: true };
    try { return { text: `Embedded content from ${new URL(src, page.url).hostname.replace(/^www\./, '')}`, guessed: true }; }
    catch { return { text: PLACEHOLDER, guessed: true }; }
  }
  return { text: PLACEHOLDER, guessed: true };
}

// Very small language guess from the visible text, used only to propose a lang value.
const STOPWORDS = {
  en: ['the', 'and', 'you', 'with', 'for', 'your', 'our', 'this', 'shop', 'cart'],
  fr: ['le', 'la', 'les', 'et', 'des', 'vous', 'pour', 'avec', 'votre', 'nos'],
  de: ['der', 'die', 'und', 'das', 'mit', 'für', 'sie', 'ihr', 'nicht', 'warenkorb'],
  es: ['el', 'los', 'las', 'y', 'con', 'para', 'su', 'tu', 'del', 'carrito'],
  it: ['il', 'gli', 'e', 'con', 'per', 'della', 'tuo', 'nostro', 'sono', 'carrello'],
  nl: ['de', 'het', 'een', 'en', 'met', 'voor', 'uw', 'jouw', 'winkelwagen', 'niet'],
  pt: ['o', 'os', 'as', 'e', 'com', 'para', 'seu', 'sua', 'carrinho', 'não'],
};

function guessLang(text) {
  const words = String(text || '').toLowerCase().split(/[^\p{L}]+/u);
  let best = 'en';
  let bestScore = 0;
  for (const [lang, list] of Object.entries(STOPWORDS)) {
    const set = new Set(list);
    let score = 0;
    for (const w of words) if (set.has(w)) score++;
    if (score > bestScore) { best = lang; bestScore = score; }
  }
  return best;
}

function closeFor(st, html) {
  if (VOID.has(st.tag)) return '';
  return `</${st.tag}>`;
}

// Returns { rule, kind, before, after, test, note, needsEdit } or null when no safe fix can be proposed.
function proposeFix(rule, node, page = {}) {
  if (rule === 'color-contrast') return contrastFix(node);
  if (rule === 'html-has-lang' || rule === 'html-lang-valid') {
    const st = startTag(page.htmlTag || '<html>');
    if (!st) return null;
    const lang = guessLang(page.text);
    const after = setAttr(st.text, 'lang', lang);
    return {
      rule, kind: 'html', before: st.text, after,
      test: `<!doctype html>${after}<head><title>t</title></head><body><p>text</p></body></html>`,
      changed: ['lang'],
      note: `Language guessed from the page text: "${lang}". Use the code of the language the page is written in.`,
      needsEdit: false,
    };
  }
  if (rule === 'document-title') {
    const name = (page.siteName || page.h1 || page.host || 'Page name').replace(/\s+/g, ' ').trim().slice(0, 70);
    const titleText = name.replace(/[<&]/g, (c) => (c === '<' ? '&lt;' : '&amp;'));
    return {
      rule, kind: 'html', before: '<head>', after: `<head>\n  <title>${titleText}</title>`,
      test: `<!doctype html><html lang="en"><head><title>${titleText}</title></head><body><p>text</p></body></html>`,
      changed: [],
      note: 'Give every page its own title, for example "Product name | Shop name".',
      needsEdit: false,
    };
  }
  if (rule === 'meta-viewport') {
    const st = startTag(node.html);
    if (!st || st.tag !== 'meta' || !('content' in st.attrs)) return null;
    const content = st.attrs.content.split(',').map((p) => p.trim())
      .filter((p) => p && !/^user-scalable\s*=/i.test(p) && !/^maximum-scale\s*=/i.test(p)).join(', ');
    const after = setAttr(st.text, 'content', content || 'width=device-width, initial-scale=1');
    return {
      rule, kind: 'html', before: st.text, after,
      test: `<!doctype html><html lang="en"><head><title>t</title>${after}</head><body><p>text</p></body></html>`,
      changed: ['content'],
      note: 'Removes the parts that block zoom; the rest of the tag is unchanged.',
      needsEdit: false,
    };
  }
  const attrRules = {
    'image-alt': 'alt', 'input-image-alt': 'alt', 'label': 'aria-label', 'select-name': 'aria-label',
    'link-name': 'aria-label', 'button-name': 'aria-label', 'frame-title': 'title', 'input-button-name': 'value',
  };
  const attr = attrRules[rule];
  if (!attr) return null;
  const st = startTag(node.html);
  if (!st) return null;
  if (rule === 'input-button-name' && st.tag !== 'input') return null;
  const label = labelFor(rule, st, node, page);
  // An existing but empty attribute (alt="", aria-label="") is replaced rather than duplicated.
  const after = setAttr(st.text, attr, label.text);
  const inner = rule === 'select-name' ? '<option>One</option>' : '';
  const notes = {
    'image-alt': 'Describe what the image shows in a few words. If it is purely decorative, use alt="" instead.',
    'input-image-alt': 'Say what the button does, for example "Search".',
    'label': 'A visible <label for="..."> next to the field is even better; aria-label is the smallest change.',
    'select-name': 'A visible <label for="..."> is even better; aria-label is the smallest change.',
    'link-name': 'Say where the link goes.',
    'button-name': 'Say what the button does.',
    'frame-title': 'Say what the frame contains.',
    'input-button-name': 'Say what the button does.',
  };
  return {
    rule, kind: 'html', before: st.text, after,
    test: `<!doctype html><html lang="en"><head><title>t</title></head><body><main>${after}${inner}${closeFor(st)}</main></body></html>`,
    changed: attr in st.attrs ? [attr] : [],
    note: label.text === PLACEHOLDER ? `${notes[rule]} Replace the EDIT ME text with your own words.`
      : label.guessed ? `${notes[rule]} The text above is a guess: check it.` : notes[rule],
    needsEdit: label.text === PLACEHOLDER,
  };
}

function contrastFix(node) {
  const d = node.data || {};
  const fg = parseColor(d.fgColor);
  const bg = parseColor(d.bgColor);
  const target = Number(d.expectedContrastRatio && String(d.expectedContrastRatio).replace(/:1$/, '')) || 4.5;
  if (!fg || !bg) return null;
  const goal = target + 0.05;
  const fixed = nearestPassingColor(fg, bg, goal);
  if (!fixed) return null;
  const selector = Array.isArray(node.target) ? node.target.join(' ') : String(node.target || '');
  const fontSize = d.fontSize || '16px';
  const fontWeight = d.fontWeight || 'normal';
  return {
    rule: 'color-contrast', kind: 'css',
    before: `${selector} { color: ${toHex(fg)}; } /* on ${toHex(bg)}, ratio ${contrastRatio(fg, bg).toFixed(2)}:1 */`,
    after: `${selector} { color: ${toHex(fixed)}; } /* on ${toHex(bg)}, ratio ${contrastRatio(fixed, bg).toFixed(2)}:1 */`,
    test: `<!doctype html><html lang="en"><head><title>t</title></head><body style="margin:0;background:${toHex(bg)}"><main><p style="color:${toHex(fixed)};background:${toHex(bg)};font-size:${fontSize};font-weight:${fontWeight}">Sample text for contrast</p></main></body></html>`,
    changed: [],
    ratio: contrastRatio(fixed, bg),
    target,
    note: `Needs ${target}:1. The new colour stays as close as possible to the current one. If the background is an image or a gradient, check the result on the page.`,
    needsEdit: false,
  };
}

// Structural rule check: the fixed opening tag keeps every attribute of the original with the same
// value, except the attributes the fix is meant to change. Text content is never touched.
function checkPreserved(fix) {
  if (fix.kind !== 'html') return true;
  if (fix.rule === 'document-title') return fix.after.startsWith('<head>');
  const b = startTag(fix.before);
  const a = startTag(fix.after);
  if (!a || !b || a.tag !== b.tag) return false;
  for (const [k, v] of Object.entries(b.attrs)) {
    if ((fix.changed || []).includes(k)) continue;
    if (!(k in a.attrs) || a.attrs[k] !== v) return false;
  }
  return true;
}

module.exports = { proposeFix, checkPreserved, startTag, parseAttrs, addAttr, setAttr, humanize, guessLang, PLACEHOLDER };
