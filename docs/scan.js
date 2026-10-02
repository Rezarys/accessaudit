/*! accessaudit in-browser scan, MIT licence, https://github.com/Rezarys/accessaudit (built by src/bundle.js, do not edit) */
(function () {
  'use strict';
  if (window.__accessauditRunning) return;
  window.__accessauditRunning = true;
  var BASE = document.currentScript && document.currentScript.src ? new URL('.', document.currentScript.src).href : 'https://rezarys.github.io/accessaudit/';
  var defs = {}, cache = {};
  function req(name) { name = name.replace(/^\.\//, ''); if (cache[name]) return cache[name].exports; var m = { exports: {} }; cache[name] = m; defs[name](m, m.exports, req); return m.exports; }
  defs["rules"] = function (module, exports, require) {
// Plain-language explanations for the axe-core rules that fail most often on shop and booking sites.
// Each entry: a short title, what is wrong in everyday words, who it blocks, and the WCAG 2.1 criterion.
// Rules not listed here fall back to the description that axe-core itself provides.
'use strict';

const RULES = {
  'image-alt': {
    title: 'Images without a text alternative',
    plain: 'Some images have no alt text. A screen reader announces them as "image" or reads out the file name, so a blind visitor does not know what the picture shows, for example which product it is.',
    who: 'Blind and low-vision visitors using a screen reader.',
    wcag: '1.1.1 Non-text Content (Level A)',
  },
  'input-image-alt': {
    title: 'Image buttons without a text alternative',
    plain: 'A button made of an image has no alt text, so a screen reader cannot say what the button does.',
    who: 'Screen reader users.',
    wcag: '1.1.1 Non-text Content (Level A)',
  },
  'role-img-alt': {
    title: 'Elements marked as images without a name',
    plain: 'An element is marked as an image (role="img") but has no accessible name, so assistive technology announces nothing useful.',
    who: 'Screen reader users.',
    wcag: '1.1.1 Non-text Content (Level A)',
  },
  'svg-img-alt': {
    title: 'SVG images without a text alternative',
    plain: 'An SVG marked as an image has no title or label, so its meaning is lost for screen reader users.',
    who: 'Screen reader users.',
    wcag: '1.1.1 Non-text Content (Level A)',
  },
  'area-alt': {
    title: 'Image map areas without a text alternative',
    plain: 'Clickable areas of an image map have no alt text, so their destination cannot be announced.',
    who: 'Screen reader users.',
    wcag: '1.1.1 Non-text Content (Level A)',
  },
  'label': {
    title: 'Form fields without a label',
    plain: 'Some form fields have no label that assistive technology can read. A visitor hears "edit text" with no idea whether to type a name, an email or a card number. A placeholder alone is not a label: it disappears when typing starts.',
    who: 'Screen reader users, voice control users, and people with memory or attention difficulties.',
    wcag: '1.3.1 Info and Relationships and 4.1.2 Name, Role, Value (Level A)',
  },
  'select-name': {
    title: 'Drop-down lists without a label',
    plain: 'A drop-down list (for example size or country) has no label, so a screen reader cannot say what it is for.',
    who: 'Screen reader and voice control users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'button-name': {
    title: 'Buttons without a name',
    plain: 'Some buttons have no text that assistive technology can read, often icon buttons such as a cart, a menu or a close cross. A screen reader just says "button".',
    who: 'Screen reader users and voice control users, who cannot say the name of a button that has none.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'input-button-name': {
    title: 'Input buttons without a name',
    plain: 'An input of type button, submit or reset has no value or label, so its action is not announced.',
    who: 'Screen reader and voice control users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'link-name': {
    title: 'Links without a name',
    plain: 'Some links have no text that assistive technology can read, usually links that contain only an icon or an image. A screen reader announces "link" and nothing else, so the visitor cannot tell where it goes.',
    who: 'Screen reader users and voice control users.',
    wcag: '2.4.4 Link Purpose (In Context) and 4.1.2 Name, Role, Value (Level A)',
  },
  'color-contrast': {
    title: 'Text with too little contrast',
    plain: 'Some text is too light against its background. WCAG asks for a contrast ratio of at least 4.5 to 1 for normal text and 3 to 1 for large text. Below that, many people cannot read it, especially on a phone outdoors.',
    who: 'Low-vision visitors, older visitors, and anyone reading in bright light.',
    wcag: '1.4.3 Contrast (Minimum) (Level AA)',
  },
  'html-has-lang': {
    title: 'Page language not declared',
    plain: 'The page does not say which language it is written in. Screen readers then guess, and may read English text with a French or German voice, which is hard to understand.',
    who: 'Screen reader users.',
    wcag: '3.1.1 Language of Page (Level A)',
  },
  'html-lang-valid': {
    title: 'Page language code is not valid',
    plain: 'The page declares a language code that is not a valid code, so screen readers cannot use it.',
    who: 'Screen reader users.',
    wcag: '3.1.1 Language of Page (Level A)',
  },
  'valid-lang': {
    title: 'Invalid language code on part of the page',
    plain: 'A part of the page declares a language with a code that is not valid.',
    who: 'Screen reader users.',
    wcag: '3.1.2 Language of Parts (Level AA)',
  },
  'document-title': {
    title: 'Page without a title',
    plain: 'The page has no title. The title is the first thing a screen reader announces and the name shown in browser tabs and history.',
    who: 'Screen reader users and anyone with many tabs open.',
    wcag: '2.4.2 Page Titled (Level A)',
  },
  'meta-viewport': {
    title: 'Zoom is blocked on mobile',
    plain: 'The page tells phones not to let visitors zoom in (user-scalable=no or a low maximum-scale). People who need larger text cannot enlarge it.',
    who: 'Low-vision visitors on phones and tablets.',
    wcag: '1.4.4 Resize Text (Level AA)',
  },
  'meta-refresh': {
    title: 'Page refreshes or redirects on a timer',
    plain: 'The page reloads or moves to another address after a delay, which can interrupt someone who reads slowly or uses a screen reader.',
    who: 'Screen reader users and people who need more time to read.',
    wcag: '2.2.1 Timing Adjustable (Level A)',
  },
  'frame-title': {
    title: 'Embedded frames without a title',
    plain: 'An embedded frame (a video, a map, a payment or chat widget) has no title, so a screen reader cannot say what it contains before entering it.',
    who: 'Screen reader users.',
    wcag: '2.4.1 Bypass Blocks and 4.1.2 Name, Role, Value (Level A)',
  },
  'aria-required-attr': {
    title: 'ARIA roles missing a required attribute',
    plain: 'An element uses an ARIA role but lacks an attribute that role needs (for example a checkbox role without aria-checked), so its state is not announced.',
    who: 'Screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-valid-attr-value': {
    title: 'ARIA attributes with invalid values',
    plain: 'An ARIA attribute has a value that is not allowed, or points to an element that does not exist, so assistive technology ignores it or reports something wrong.',
    who: 'Screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-valid-attr': {
    title: 'Misspelled or unknown ARIA attributes',
    plain: 'An attribute starting with aria- does not exist (often a typo), so it has no effect.',
    who: 'Screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-allowed-attr': {
    title: 'ARIA attributes not allowed on this element',
    plain: 'An element carries an ARIA attribute that its role does not support, which can confuse assistive technology.',
    who: 'Screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-prohibited-attr': {
    title: 'ARIA attributes that are not allowed here',
    plain: 'An element uses an ARIA attribute (often aria-label on a plain div or span) that is prohibited for its role, so many screen readers ignore it.',
    who: 'Screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-hidden-focus': {
    title: 'Hidden content that can still receive focus',
    plain: 'Content is hidden from assistive technology (aria-hidden="true") but still contains links or buttons reachable with the Tab key. Keyboard users land on something a screen reader says nothing about.',
    who: 'Keyboard and screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-input-field-name': {
    title: 'Custom input fields without a name',
    plain: 'A custom input built with ARIA (for example a combobox or a slider) has no accessible name.',
    who: 'Screen reader and voice control users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-command-name': {
    title: 'Custom buttons or links without a name',
    plain: 'An element with a button, link or menu item role has no accessible name.',
    who: 'Screen reader and voice control users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-roles': {
    title: 'Invalid ARIA roles',
    plain: 'An element uses a role value that does not exist, so assistive technology cannot tell what it is.',
    who: 'Screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-required-children': {
    title: 'ARIA containers missing their required children',
    plain: 'A container role such as a list, menu or tab list does not contain the child roles it needs, so its structure is not announced.',
    who: 'Screen reader users.',
    wcag: '1.3.1 Info and Relationships (Level A)',
  },
  'aria-required-parent': {
    title: 'ARIA items outside their required container',
    plain: 'An item role such as a list item, menu item or tab is not inside the container it belongs to.',
    who: 'Screen reader users.',
    wcag: '1.3.1 Info and Relationships (Level A)',
  },
  'list': {
    title: 'Lists that contain other elements',
    plain: 'A list (ul or ol) directly contains elements that are not list items, so screen readers may count or announce it wrongly.',
    who: 'Screen reader users.',
    wcag: '1.3.1 Info and Relationships (Level A)',
  },
  'listitem': {
    title: 'List items outside a list',
    plain: 'A list item (li) is not inside a ul or ol, so it is not announced as part of a list.',
    who: 'Screen reader users.',
    wcag: '1.3.1 Info and Relationships (Level A)',
  },
  'definition-list': {
    title: 'Badly built definition lists',
    plain: 'A definition list (dl) contains elements other than dt and dd groups.',
    who: 'Screen reader users.',
    wcag: '1.3.1 Info and Relationships (Level A)',
  },
  'dlitem': {
    title: 'Definition terms outside a definition list',
    plain: 'A dt or dd element is not inside a dl.',
    who: 'Screen reader users.',
    wcag: '1.3.1 Info and Relationships (Level A)',
  },
  'nested-interactive': {
    title: 'Interactive elements inside other interactive elements',
    plain: 'A button or link contains another button or link. Screen readers may not announce the inner one, and keyboard focus behaves unpredictably.',
    who: 'Keyboard and screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'link-in-text-block': {
    title: 'Links that only differ by colour',
    plain: 'A link inside a paragraph is distinguished from the text around it by colour alone, without underline or enough contrast with the text.',
    who: 'Visitors with colour vision deficiency or low vision.',
    wcag: '1.4.1 Use of Color (Level A)',
  },
  'autocomplete-valid': {
    title: 'Wrong autocomplete values',
    plain: 'A form field uses an autocomplete value that does not exist, so browsers and assistive tools cannot fill it in or identify its purpose.',
    who: 'People with motor or cognitive disabilities who rely on autofill.',
    wcag: '1.3.5 Identify Input Purpose (Level AA)',
  },
  'td-headers-attr': {
    title: 'Table cells pointing to missing headers',
    plain: 'Table cells refer to header cells that are not in the same table.',
    who: 'Screen reader users.',
    wcag: '1.3.1 Info and Relationships (Level A)',
  },
  'th-has-data-cells': {
    title: 'Table headers that describe nothing',
    plain: 'A table header cell does not describe any data cell.',
    who: 'Screen reader users.',
    wcag: '1.3.1 Info and Relationships (Level A)',
  },
  'duplicate-id-aria': {
    title: 'Duplicate IDs used by labels or ARIA',
    plain: 'Two elements share an ID that a label or ARIA attribute points to, so the wrong element may be announced.',
    who: 'Screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'scrollable-region-focusable': {
    title: 'Scrollable areas the keyboard cannot reach',
    plain: 'A scrollable area cannot receive keyboard focus, so people who do not use a mouse cannot scroll it.',
    who: 'Keyboard users.',
    wcag: '2.1.1 Keyboard (Level A)',
  },
  'frame-focusable-content': {
    title: 'Frames with focusable content removed from the tab order',
    plain: 'A frame has tabindex="-1" but contains links or buttons, so keyboard users cannot reach them.',
    who: 'Keyboard users.',
    wcag: '2.1.1 Keyboard (Level A)',
  },
  'video-caption': {
    title: 'Videos without captions',
    plain: 'A video has no captions track, so deaf and hard-of-hearing visitors miss what is said.',
    who: 'Deaf and hard-of-hearing visitors.',
    wcag: '1.2.2 Captions (Prerecorded) (Level A)',
  },
  'bypass': {
    title: 'No way to skip repeated content',
    plain: 'There is no skip link, heading or landmark that lets keyboard users jump past the navigation to the main content.',
    who: 'Keyboard and screen reader users.',
    wcag: '2.4.1 Bypass Blocks (Level A)',
  },
  'server-side-image-map': {
    title: 'Server-side image maps',
    plain: 'A server-side image map can only be used with a mouse.',
    who: 'Keyboard users.',
    wcag: '2.1.1 Keyboard (Level A)',
  },
  'avoid-inline-spacing': {
    title: 'Text spacing locked by inline styles',
    plain: 'Inline styles with !important prevent visitors from increasing letter, word or line spacing.',
    who: 'Visitors with dyslexia or low vision who adjust text spacing.',
    wcag: '1.4.12 Text Spacing (Level AA)',
  },
};

const IMPACT_ORDER = { critical: 4, serious: 3, moderate: 2, minor: 1 };

function explain(violation) {
  const known = RULES[violation.id];
  if (known) return { id: violation.id, ...known };
  return {
    id: violation.id,
    title: violation.help || violation.id,
    plain: violation.description || '',
    who: 'People using assistive technology.',
    wcag: (violation.tags || []).filter((t) => /^wcag\d{3,4}$/.test(t)).map((t) => { const d = t.slice(4); return `${d[0]}.${d[1]}.${d.slice(2)}`; }).join(', ') || 'WCAG 2.1',
  };
}

module.exports = { RULES, IMPACT_ORDER, explain };

  };
  defs["color"] = function (module, exports, require) {
// WCAG contrast arithmetic, and the nearest text colour that reaches a required ratio.
'use strict';

function parseColor(str) {
  if (!str) return null;
  const s = String(str).trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3})$/);
  if (m) return m[1].split('').map((c) => parseInt(c + c, 16));
  m = s.match(/^#([0-9a-f]{6})(?:[0-9a-f]{2})?$/);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  m = s.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (m) return [m[1], m[2], m[3]].map((v) => Math.round(Number(v)));
  return null;
}

function toHex(rgb) {
  return '#' + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// Moves the text colour toward black or white (whichever direction can reach the target)
// in small steps, and returns the first colour that meets the ratio. Hue is kept as long as possible.
function nearestPassingColor(fg, bg, target) {
  const towardBlack = contrastRatio([0, 0, 0], bg) >= target;
  const towardWhite = contrastRatio([255, 255, 255], bg) >= target;
  const dirs = [];
  // Prefer the direction that already increases contrast.
  if (luminance(fg) <= luminance(bg)) { if (towardBlack) dirs.push([0, 0, 0]); if (towardWhite) dirs.push([255, 255, 255]); }
  else { if (towardWhite) dirs.push([255, 255, 255]); if (towardBlack) dirs.push([0, 0, 0]); }
  for (const end of dirs) {
    for (let t = 0.01; t <= 1.0001; t += 0.01) {
      const c = fg.map((v, i) => Math.round(v + (end[i] - v) * t));
      if (contrastRatio(c, bg) >= target) return c;
    }
  }
  return null;
}

module.exports = { parseColor, toHex, luminance, contrastRatio, nearestPassingColor };

  };
  defs["fixes"] = function (module, exports, require) {
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

  };
  defs["score"] = function (module, exports, require) {
// Aggregation, ranking and score. Pure functions: used by the Node engine and by the in-browser scan.
'use strict';
const { IMPACT_ORDER } = require('./rules');

const WEIGHT = { critical: 12, serious: 8, moderate: 4, minor: 2 };
const MAX_EXAMPLES = 5;

// Score out of 100: each failing rule costs a weight by impact, raised by up to x2 with the number
// of failing elements (1 element: x1, 10: x1.5, 100 or more: x2). It is a rough indicator for
// comparing a site with itself over time, not a measure of conformance.
function score(rules) {
  let penalty = 0;
  for (const r of rules) {
    const w = WEIGHT[r.impact] || WEIGHT.moderate;
    penalty += w * (1 + 0.5 * Math.min(2, Math.log10(Math.max(1, r.count))));
  }
  return Math.max(0, Math.round(100 - penalty));
}

function rank(rules) {
  return [...rules].sort((a, b) =>
    (IMPACT_ORDER[b.impact] || 0) - (IMPACT_ORDER[a.impact] || 0)
    || b.pages.length - a.pages.length
    || b.count - a.count
    || a.id.localeCompare(b.id));
}

// Groups the violations of several pages by rule.
function aggregate(pages) {
  const byRule = new Map();
  for (const p of pages) {
    for (const v of p.violations) {
      if (!byRule.has(v.id)) {
        byRule.set(v.id, { id: v.id, impact: v.impact, help: v.help, description: v.description, helpUrl: v.helpUrl, tags: v.tags, pages: [], count: 0, examples: [] });
      }
      const r = byRule.get(v.id);
      r.pages.push(p.url);
      r.count += v.count;
      for (const n of v.nodes) if (r.examples.length < MAX_EXAMPLES) r.examples.push({ ...n, page: p.url });
    }
  }
  return [...byRule.values()];
}

// Shapes axe-core results the same way in Node and in the browser.
function fromAxe(res) {
  return res.violations.map((v) => ({
    id: v.id, impact: v.impact, help: v.help, description: v.description, helpUrl: v.helpUrl, tags: v.tags,
    count: v.nodes.length,
    nodes: v.nodes.slice(0, MAX_EXAMPLES).map((n) => ({
      target: n.target, html: n.html, failureSummary: n.failureSummary,
      data: ((n.any || []).find((c) => c.data && c.data.fgColor) || {}).data || null,
    })),
  }));
}

module.exports = { score, rank, aggregate, fromAxe, WEIGHT, MAX_EXAMPLES };

  };
  defs["report"] = function (module, exports, require) {
// Renders a free scan as a GitHub comment (Markdown) and as a static HTML page.
// Everything that comes from the scanned site is escaped: it is untrusted text.
'use strict';

const SITE = 'https://rezarys.github.io/accessaudit/';
const PREORDER = 'https://github.com/Rezarys/accessaudit/issues/1';
const DISCLAIMER = 'Defects detected automatically, to be confirmed by a human audit. Automated tools find only part of the accessibility problems a site can have, so a short list does not mean a site meets WCAG or any law.';

function mdText(s) {
  return String(s ?? '').replace(/[\\`*_{}[\]()<>#|!~]/g, '\\$&').replace(/@/g, '@\u200b').replace(/\s+/g, ' ').trim();
}

function mdCode(s, max = 400) {
  let t = String(s ?? '').replace(/~{3,}/g, '~~').replace(/\r/g, '');
  if (t.length > max) t = t.slice(0, max) + ' ...';
  return t;
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function hostOf(u) {
  try { return new URL(u).hostname; } catch { return String(u); }
}

function impactLabel(i) {
  return { critical: 'Critical', serious: 'Serious', moderate: 'Moderate', minor: 'Minor' }[i] || 'Unrated';
}

function checkedSentence(fix) {
  if (fix.kind === 'css') return 'Checked: the new colour reaches the required ratio, and the same automated rule passes on a sample with these colours.';
  if (fix.changed && fix.changed.length) return `Checked: the same automated rule passes on the fixed markup, and only the ${fix.changed.join(', ')} attribute is changed.`;
  return 'Checked: the same automated rule passes on the fixed markup, and no existing attribute is changed or removed.';
}

function summaryLine(a) {
  const n = a.defects.length;
  const refused = a.refused || 0;
  const tail = refused ? ` ${refused} other page${refused === 1 ? '' : 's'} could not be scanned (the site refused or did not answer), so this result covers less of the site.` : '';
  return `${a.pages.length} page${a.pages.length === 1 ? '' : 's'} scanned, ${n} type${n === 1 ? '' : 's'} of defect on ${a.totalElements} element${a.totalElements === 1 ? '' : 's'}.${tail}`;
}

function toMarkdown(a, { reportUrl, top = 3 } = {}) {
  const out = [];
  out.push(`## Accessibility scan of ${mdText(hostOf(a.finalUrl))}`);
  out.push('');
  out.push(`**Score: ${a.score} / 100.** ${summaryLine(a)}`);
  out.push('');
  out.push(`> ${DISCLAIMER}`);
  out.push('');
  if (a.defects.length === 0) {
    out.push('No defect was detected automatically on the pages scanned. A human check is still needed: keyboard use, reading order, error messages and the meaning of alt texts cannot be tested by a machine.');
  }
  for (const [i, d] of a.defects.slice(0, top).entries()) {
    const e = d.explanation;
    out.push(`### ${i + 1}. ${mdText(e.title)} (${impactLabel(d.impact)})`);
    out.push('');
    out.push(`${mdText(e.plain)}`);
    out.push('');
    out.push(`- **Affects:** ${mdText(e.who)}`);
    out.push(`- **WCAG:** ${mdText(e.wcag)}`);
    out.push(`- **Found:** ${d.count} element${d.count === 1 ? '' : 's'} on ${d.pages.length} of ${a.pages.length} page${a.pages.length === 1 ? '' : 's'}`);
    out.push('');
    if (d.fix) {
      out.push(`Proposed fix, for \`${mdCode(d.fix.selector, 120).replace(/`/g, "'")}\`:`);
      out.push('');
      out.push(`~~~${d.fix.kind === 'css' ? 'css' : 'html'}`);
      out.push(`${d.fix.kind === 'css' ? '/* before */' : '<!-- before -->'}`);
      out.push(mdCode(d.fix.before));
      out.push(`${d.fix.kind === 'css' ? '/* after */' : '<!-- after -->'}`);
      out.push(mdCode(d.fix.after));
      out.push('~~~');
      out.push('');
      out.push(`${mdText(d.fix.note)} ${checkedSentence(d.fix)}`);
    } else if (d.examples[0]) {
      out.push('Example, with what the automated check found:');
      out.push('');
      out.push('~~~html');
      out.push(mdCode(d.examples[0].html));
      out.push('~~~');
      if (d.examples[0].failureSummary) {
        out.push('~~~text');
        out.push(mdCode(d.examples[0].failureSummary, 600));
        out.push('~~~');
      }
      out.push('');
      out.push('No automatic fix is proposed for this type of defect.');
    }
    out.push('');
  }
  const rest = a.defects.slice(top);
  if (rest.length) {
    const elems = rest.reduce((s, d) => s + d.count, 0);
    out.push(`**${rest.length} more type${rest.length === 1 ? '' : 's'} of defect (${elems} element${elems === 1 ? '' : 's'})** are listed in the full report, each with its explanation and proposed fix.`);
    out.push('');
  }
  out.push(`Full report for the whole site: 49 EUR once. Monitoring after every change: 19 EUR per month, not built yet. Neither is open for payment yet; if you want one, say so in a comment on ${PREORDER} (nothing is charged).`);
  out.push('');
  if (reportUrl) out.push(`This result as a page: ${reportUrl} (online about a minute after this comment).`);
  out.push('');
  out.push(`Pages scanned: ${a.pages.map((p) => mdText(p.url)).join(', ')}. Rules: axe-core, WCAG 2.0 and 2.1, levels A and AA. Scan time ${Math.round(a.ms / 1000)} s.`);
  return out.join('\n');
}

function toHtml(a, { top = 3, issueUrl } = {}) {
  const host = esc(hostOf(a.finalUrl));
  const items = a.defects.slice(0, top).map((d, i) => {
    const e = d.explanation;
    const fix = d.fix
      ? `<p>Proposed fix, for <code>${esc(d.fix.selector)}</code>:</p>
<pre><code>${esc(d.fix.kind === 'css' ? '/* before */' : '<!-- before -->')}
${esc(mdCode(d.fix.before))}
${esc(d.fix.kind === 'css' ? '/* after */' : '<!-- after -->')}
${esc(mdCode(d.fix.after))}</code></pre>
<p>${esc(d.fix.note)} ${esc(checkedSentence(d.fix))}</p>`
      : d.examples[0] ? `<p>Example, with what the automated check found:</p><pre><code>${esc(mdCode(d.examples[0].html))}</code></pre>
${d.examples[0].failureSummary ? `<pre><code>${esc(mdCode(d.examples[0].failureSummary, 600))}</code></pre>` : ''}
<p>No automatic fix is proposed for this type of defect.</p>` : '';
    return `<section>
<h2>${i + 1}. ${esc(e.title)} <span class="impact">${impactLabel(d.impact)}</span></h2>
<p>${esc(e.plain)}</p>
<ul><li><strong>Affects:</strong> ${esc(e.who)}</li><li><strong>WCAG:</strong> ${esc(e.wcag)}</li>
<li><strong>Found:</strong> ${d.count} element${d.count === 1 ? '' : 's'} on ${d.pages.length} of ${a.pages.length} page${a.pages.length === 1 ? '' : 's'}</li></ul>
${fix}
</section>`;
  }).join('\n');
  const rest = a.defects.slice(top);
  const restElems = rest.reduce((s, d) => s + d.count, 0);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Accessibility scan of ${host} | accessaudit</title>
<link rel="stylesheet" href="../style.css">
</head>
<body>
<main>
<p><a href="../">accessaudit</a></p>
<h1>Accessibility scan of ${host}</h1>
<p class="score">Score: <strong>${a.score} / 100</strong></p>
<p>${esc(summaryLine(a))} Scanned on ${esc(a.scannedAt.slice(0, 10))}.</p>
<p class="note">${esc(DISCLAIMER)}</p>
${a.defects.length === 0 ? '<p>No defect was detected automatically on the pages scanned. A human check is still needed: keyboard use, reading order, error messages and the meaning of alt texts cannot be tested by a machine.</p>' : ''}
${items}
${rest.length ? `<p><strong>${rest.length} more type${rest.length === 1 ? '' : 's'} of defect (${restElems} element${restElems === 1 ? '' : 's'})</strong> are listed in the full report, each with its explanation and proposed fix.</p>` : ''}
<section class="price">
<h2>Full report and monitoring</h2>
<p>Full report for the whole site, every defect explained with its proposed fix: <strong>49 EUR once</strong>. Monitoring, a new scan after every change with an alert: <strong>19 EUR per month</strong>, not built yet.</p>
<p>Neither is open for payment yet. If you want one, <a href="${PREORDER}">say so in this public request</a>; nothing is charged.</p>
</section>
<p class="small">Pages scanned: ${a.pages.map((p) => esc(p.url)).join(', ')}. Rules: axe-core, WCAG 2.0 and 2.1, levels A and AA.${issueUrl ? ` Requested in <a href="${esc(issueUrl)}">this issue</a>.` : ''}</p>
</main>
</body>
</html>
`;
}

module.exports = { toMarkdown, toHtml, mdText, mdCode, esc, DISCLAIMER, SITE, PREORDER };

  };
  defs["browser"] = function (module, exports, require) {
// In-browser scan, started from a bookmark on any page the visitor has open. Everything runs in the
// visitor's own browser: axe-core checks the page, the same ranking, explanations and fixes as the Node
// engine are applied, each fix is reviewed by re-running its rule on the fixed markup in a hidden frame,
// and the result is shown in a panel. No content of the page is sent anywhere.
'use strict';
const { explain } = require('./rules');
const { proposeFix, checkPreserved } = require('./fixes');
const { score, rank, aggregate, fromAxe } = require('./score');
const { DISCLAIMER, PREORDER, SITE } = require('./report');

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const HOST_ID = 'accessaudit-panel-host';
const DOC_RULES = ['html-has-lang', 'html-lang-valid', 'document-title'];

function loadScript(src, doc = document) {
  return new Promise((resolve, reject) => {
    const s = doc.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('blocked'));
    (doc.head || doc.documentElement).appendChild(s);
  });
}

function pageContext() {
  const og = document.querySelector('meta[property="og:site_name"]');
  const h1 = document.querySelector('h1');
  const html = document.documentElement.outerHTML;
  return {
    url: location.href,
    htmlTag: (html.match(/^<html[^>]*>/i) || ['<html>'])[0],
    text: (document.body ? document.body.innerText : '').slice(0, 4000),
    siteName: og ? og.content : '',
    h1: h1 ? h1.innerText.trim().slice(0, 80) : '',
    host: location.hostname,
  };
}

// Loads the fixed markup into a hidden same-origin frame with axe-core, and runs the one rule.
async function verifyInFrame(fix, axeUrl) {
  if (!checkPreserved(fix)) return false;
  if (fix.kind === 'css' && !(fix.ratio >= fix.target)) return false;
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.setAttribute('tabindex', '-1');
  frame.style.cssText = 'position:fixed;top:0;left:0;width:800px;height:600px;opacity:0;pointer-events:none;z-index:-1;border:0';
  frame.srcdoc = fix.test;
  const loaded = new Promise((r) => { frame.onload = r; });
  document.body.appendChild(frame);
  try {
    await loaded;
    await loadScript(axeUrl, frame.contentDocument);
    const res = await frame.contentWindow.axe.run(frame.contentDocument, { runOnly: { type: 'rule', values: [fix.rule] } });
    return res.violations.length === 0 && res.passes.length > 0;
  } catch {
    return false;
  } finally {
    frame.remove();
  }
}

async function runAudit(base) {
  const axeUrl = `${base}vendor/axe.min.js`;
  if (!window.axe) await loadScript(axeUrl);
  const t0 = Date.now();
  const res = await window.axe.run({ exclude: [[`#${HOST_ID}`]] }, { runOnly: { type: 'tag', values: TAGS }, resultTypes: ['violations'] });
  const page = { url: location.href, violations: fromAxe(res) };
  const rules = aggregate([page]);
  const ctx = pageContext();
  const defects = [];
  for (const [i, r] of rank(rules).entries()) {
    const d = { ...r, explanation: explain(r), fix: null };
    if (i < 3) {
      for (const ex of r.examples) {
        const fix = proposeFix(r.id, ex, ctx);
        if (fix && await verifyInFrame(fix, axeUrl)) { d.fix = { ...fix, selector: (ex.target || []).join(' ') }; break; }
        if (DOC_RULES.includes(r.id)) break;
      }
    }
    defects.push(d);
  }
  return {
    url: location.href, finalUrl: location.href, scannedAt: new Date().toISOString(), ms: Date.now() - t0,
    score: score(rules), totalElements: rules.reduce((s, r) => s + r.count, 0), pages: [{ url: location.href }], defects,
  };
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function clip(s, max = 400) {
  const t = String(s ?? '');
  return t.length > max ? `${t.slice(0, max)} ...` : t;
}

const CSS = `
:host { all: initial; }
.panel { position: fixed; top: 12px; right: 12px; bottom: 12px; width: min(440px, calc(100vw - 24px)); overflow-y: auto;
  background: #ffffff; color: #1b1b1b; border: 2px solid #0b5cad; border-radius: 10px; box-shadow: 0 6px 30px rgba(0,0,0,.35);
  font: 15px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; padding: 14px 16px; z-index: 2147483647; }
h2 { font-size: 18px; margin: 0 40px 6px 0; } h3 { font-size: 15px; margin: 16px 0 4px; }
p, ul { margin: 6px 0; } ul { padding-left: 18px; }
.score { font-size: 26px; font-weight: 700; }
.note { color: #4a4a4a; font-size: 13px; border-left: 3px solid #d0d5dc; padding-left: 8px; }
pre { background: #f3f5f8; border: 1px solid #d0d5dc; border-radius: 6px; padding: 8px; white-space: pre-wrap; overflow-wrap: anywhere; font: 12px/1.4 ui-monospace, Menlo, Consolas, monospace; }
a { color: #0b5cad; }
button.close { position: absolute; top: 10px; right: 10px; font: inherit; font-size: 14px; padding: 4px 10px; border: 1px solid #6b7480; border-radius: 6px; background: #ffffff; color: #1b1b1b; cursor: pointer; }
button:focus-visible, a:focus-visible { outline: 3px solid #f2a900; outline-offset: 2px; }
`;

function fixBlock(fix) {
  const label = fix.kind === 'css' ? ['/* before */', '/* after */'] : ['<!-- before -->', '<!-- after -->'];
  const checked = fix.kind === 'css'
    ? 'Checked: the new colour reaches the required ratio, and the same automated rule passes on a sample with these colours.'
    : fix.changed && fix.changed.length ? `Checked: the same automated rule passes on the fixed markup, and only the ${fix.changed.join(', ')} attribute is changed.`
      : 'Checked: the same automated rule passes on the fixed markup, and no existing attribute is changed or removed.';
  return `<p>Proposed fix, for <code>${esc(clip(fix.selector, 120))}</code>:</p>
<pre>${esc(label[0])}\n${esc(clip(fix.before))}\n${esc(label[1])}\n${esc(clip(fix.after))}</pre>
<p>${esc(fix.note)} ${esc(checked)}</p>`;
}

function panelHtml(a) {
  const top = a.defects.slice(0, 3).map((d, i) => `<h3>${i + 1}. ${esc(d.explanation.title)} (${esc(d.impact || 'unrated')})</h3>
<p>${esc(d.explanation.plain)}</p>
<ul><li>Affects: ${esc(d.explanation.who)}</li><li>WCAG: ${esc(d.explanation.wcag)}</li><li>Found: ${d.count} element${d.count === 1 ? '' : 's'} on this page</li></ul>
${d.fix ? fixBlock(d.fix) : d.examples[0] ? `<p>Example:</p><pre>${esc(clip(d.examples[0].html))}</pre><p>No automatic fix is proposed for this type of defect.</p>` : ''}`).join('');
  const rest = a.defects.slice(3);
  const restElems = rest.reduce((s, d) => s + d.count, 0);
  return `<div class="panel" role="dialog" aria-modal="false" aria-labelledby="aa-title">
<button class="close" type="button">Close</button>
<h2 id="aa-title">Accessibility scan of this page</h2>
<p class="score">${a.score} / 100</p>
<p>${a.defects.length} type${a.defects.length === 1 ? '' : 's'} of defect on ${a.totalElements} element${a.totalElements === 1 ? '' : 's'}, found in ${Math.max(1, Math.round(a.ms / 1000))} s.</p>
<p class="note">${esc(DISCLAIMER)} Only this page was checked.</p>
${a.defects.length === 0 ? '<p>No defect was detected automatically on this page. A human check is still needed: keyboard use, reading order, error messages and the meaning of alt texts cannot be tested by a machine.</p>' : ''}
${top}
${rest.length ? `<p><strong>${rest.length} more type${rest.length === 1 ? '' : 's'} of defect (${restElems} element${restElems === 1 ? '' : 's'})</strong> on this page are in the full report.</p>` : ''}
<h3>Full report and monitoring</h3>
<p>Full report for the whole site, every defect explained with its proposed fix: 49 EUR once. Monitoring after every change: 19 EUR per month, not built yet. Neither is open for payment yet. If you want one, <a href="${PREORDER}" target="_blank" rel="noopener">say so in this public request</a>; nothing is charged.</p>
<p class="note">Run in your browser by <a href="${SITE}" target="_blank" rel="noopener">accessaudit</a>. No content of this page was sent anywhere.</p>
</div>`;
}

function show(html) {
  let host = document.getElementById(HOST_ID);
  if (host) host.remove();
  host = document.createElement('div');
  host.id = HOST_ID;
  const root = host.attachShadow({ mode: 'open' });
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(CSS);
    root.adoptedStyleSheets = [sheet];
  } catch {
    const style = document.createElement('style');
    style.textContent = CSS;
    root.appendChild(style);
  }
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  root.appendChild(wrap);
  document.body.appendChild(host);
  const close = root.querySelector('button.close');
  if (close) {
    close.addEventListener('click', () => host.remove());
    close.focus();
  }
  root.addEventListener('keydown', (e) => { if (e.key === 'Escape') host.remove(); });
  return host;
}

async function start(base) {
  show('<div class="panel" role="status"><h2>Scanning this page...</h2><p>This takes a few seconds.</p></div>');
  try {
    const a = await runAudit(base);
    window.__accessauditResult = a;
    show(panelHtml(a));
  } catch (e) {
    const why = e && e.message === 'blocked'
      ? 'The scanner could not be loaded. Most often the site\'s security policy does not allow scripts from other addresses; the network may also be down.'
      : `The scan stopped: ${esc(clip(e && e.message, 160))}.`;
    show(`<div class="panel" role="dialog" aria-labelledby="aa-title"><button class="close" type="button">Close</button><h2 id="aa-title">accessaudit</h2><p>${why}</p></div>`);
  }
}

module.exports = { start, runAudit, panelHtml, pageContext, verifyInFrame };

  };
  req('browser').start(BASE).finally(function () { window.__accessauditRunning = false; });
})();
