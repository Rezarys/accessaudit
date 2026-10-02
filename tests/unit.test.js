'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseColor, contrastRatio, nearestPassingColor, toHex } = require('../src/color');
const { proposeFix, checkPreserved, startTag, humanize, guessLang, PLACEHOLDER } = require('../src/fixes');
const { validateUrl, sameSiteLinks, pickVariedLinks } = require('../src/scan');
const { score, rank } = require('../src/score');
const { parseRobots, allowed } = require('../src/robots');
const { explain } = require('../src/rules');
const { toMarkdown, toHtml, mdText } = require('../src/report');

test('contrast ratio matches the WCAG reference values', () => {
  assert.equal(contrastRatio([0, 0, 0], [255, 255, 255]).toFixed(2), '21.00');
  assert.equal(contrastRatio(parseColor('#777777'), parseColor('#ffffff')).toFixed(2), '4.48');
  assert.deepEqual(parseColor('rgb(170, 170, 170)'), [170, 170, 170]);
  assert.deepEqual(parseColor('#abc'), [170, 187, 204]);
});

test('nearest passing colour reaches the target and stays close', () => {
  const fixed = nearestPassingColor([170, 170, 170], [255, 255, 255], 4.55);
  assert.ok(contrastRatio(fixed, [255, 255, 255]) >= 4.55);
  assert.ok(fixed[0] > 90, `too dark: ${toHex(fixed)}`);
  const onDark = nearestPassingColor([80, 80, 80], [0, 0, 0], 4.55);
  assert.ok(contrastRatio(onDark, [0, 0, 0]) >= 4.55);
  assert.ok(onDark[0] > 80, 'moves toward white on a dark background');
});

test('start tag parsing keeps attributes and values', () => {
  const st = startTag('<img src="/a b.png" data-x=\'1\' hidden width=10>');
  assert.equal(st.tag, 'img');
  assert.deepEqual(st.attrs, { src: '/a b.png', 'data-x': '1', hidden: '', width: '10' });
  assert.equal(startTag('not html'), null);
});

test('humanize turns file names into labels and refuses hashes', () => {
  assert.equal(humanize('/img/red-running-shoes_800x600.jpg'), 'Red running shoes');
  assert.equal(humanize('/cdn/3f9a8b7c6d5e4f3a2b1c.png'), '');
  assert.equal(humanize('newsletterEmail'), 'Newsletter email');
});

test('language guess', () => {
  assert.equal(guessLang('Livraison gratuite pour vous et votre jardin avec nos outils'), 'fr');
  assert.equal(guessLang('Free delivery for your garden with our tools'), 'en');
  assert.equal(guessLang('Kostenloser Versand für Sie und Ihr Garten mit der Schaufel'), 'de');
});

test('image fix adds alt from the file name and keeps every attribute', () => {
  const fix = proposeFix('image-alt', { html: '<img src="/img/blue-gloves.jpg" class="p">' }, {});
  assert.equal(fix.after, '<img src="/img/blue-gloves.jpg" class="p" alt="Blue gloves">');
  assert.ok(checkPreserved(fix));
  assert.equal(fix.needsEdit, false);
});

test('empty alt is replaced, not duplicated', () => {
  const fix = proposeFix('input-image-alt', { html: '<input type="image" src="/go.png" alt="">' }, {});
  assert.equal(fix.after, '<input type="image" src="/go.png" alt="Go">');
  assert.ok(checkPreserved(fix));
});

test('link fix names social and home links', () => {
  const page = { url: 'https://shop.example/' };
  assert.match(proposeFix('link-name', { html: '<a href="https://www.instagram.com/shop"><svg></svg></a>' }, page).after, /aria-label="Instagram"/);
  assert.match(proposeFix('link-name', { html: '<a href="/"><img src="x.png"></a>' }, page).after, /aria-label="Home"/);
  assert.match(proposeFix('link-name', { html: '<a href="/cart"><svg></svg></a>' }, page).after, /aria-label="Cart"/);
});

test('button fix uses class hints, else a placeholder that is flagged', () => {
  assert.match(proposeFix('button-name', { html: '<button class="menu-toggle">' }, {}).after, /aria-label="Open menu"/);
  const unknown = proposeFix('button-name', { html: '<button class="x1">' }, {});
  assert.ok(unknown.after.includes(PLACEHOLDER));
  assert.equal(unknown.needsEdit, true);
});

test('label fix prefers the placeholder text', () => {
  const fix = proposeFix('label', { html: '<input type="email" name="newsletter_email" placeholder="Your email">' }, {});
  assert.match(fix.after, /aria-label="Your email"/);
});

test('viewport fix removes only the zoom blockers', () => {
  const fix = proposeFix('meta-viewport', { html: '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">' }, {});
  assert.equal(fix.after, '<meta name="viewport" content="width=device-width, initial-scale=1">');
  assert.ok(checkPreserved(fix));
});

test('lang fix guesses the language and title fix uses the site name', () => {
  const lang = proposeFix('html-has-lang', {}, { htmlTag: '<html class="no-js">', text: 'le panier et les outils pour vous' });
  assert.equal(lang.after, '<html class="no-js" lang="fr">');
  assert.ok(checkPreserved(lang));
  const title = proposeFix('document-title', {}, { siteName: 'Fern & Field' });
  assert.equal(title.after, '<head>\n  <title>Fern &amp; Field</title>');
});

test('structural check rejects a fix that drops or changes an attribute', () => {
  assert.equal(checkPreserved({ kind: 'html', rule: 'image-alt', before: '<img src="a.png" class="x">', after: '<img src="a.png" alt="A">', changed: [] }), false);
  assert.equal(checkPreserved({ kind: 'html', rule: 'image-alt', before: '<img src="a.png">', after: '<img src="b.png" alt="A">', changed: [] }), false);
  assert.equal(checkPreserved({ kind: 'html', rule: 'image-alt', before: '<img src="a.png">', after: '<div src="a.png">', changed: [] }), false);
});

test('contrast fix proposes a passing CSS colour', () => {
  const fix = proposeFix('color-contrast', { target: ['main > p'], data: { fgColor: '#aaaaaa', bgColor: '#ffffff', expectedContrastRatio: '4.5:1', fontSize: '12.0pt (16px)', fontWeight: 'normal' } });
  assert.equal(fix.kind, 'css');
  assert.ok(fix.ratio >= 4.5);
  assert.match(fix.after, /^main > p \{ color: #[0-9a-f]{6}; \}/);
});

test('url validation refuses private and local addresses', () => {
  assert.equal(validateUrl('https://shop.example.com/a#b').url, 'https://shop.example.com/a');
  for (const bad of ['http://localhost:3000', 'http://192.168.1.4', 'http://169.254.169.254/latest', 'ftp://x.com', 'http://intranet', 'http://10.0.0.1', 'https://u:p@x.com', 'nope']) {
    assert.equal(validateUrl(bad).ok, false, bad);
  }
});

test('crawler keeps same-origin pages and varies sections', () => {
  const seen = new Set(['https://s.example/']);
  const links = sameSiteLinks(['https://s.example/', 'https://s.example/a#x', 'https://other.example/', 'https://s.example/file.pdf', 'https://s.example/logout', 'https://s.example/products/1', 'https://s.example/products/2', 'https://s.example/about'], 'https://s.example', seen);
  assert.deepEqual(links, ['https://s.example/a', 'https://s.example/products/1', 'https://s.example/products/2', 'https://s.example/about']);
  assert.deepEqual(pickVariedLinks(links, 3), ['https://s.example/a', 'https://s.example/products/1', 'https://s.example/about']);
});

test('score falls with impact and count, ranking puts critical first', () => {
  assert.equal(score([]), 100);
  const rules = [
    { id: 'b', impact: 'minor', count: 1, pages: ['x'] },
    { id: 'a', impact: 'critical', count: 100, pages: ['x'] },
  ];
  assert.equal(score(rules), 100 - 24 - 2);
  assert.equal(rank(rules)[0].id, 'a');
  assert.equal(score(Array.from({ length: 20 }, (_, i) => ({ id: String(i), impact: 'critical', count: 50 }))), 0);
});

test('robots.txt: own group first, longest match wins, wildcards', () => {
  const generic = parseRobots('User-agent: *\nDisallow: /checkout\nDisallow: /*.pdf$\nAllow: /checkout/help\n');
  assert.equal(allowed(generic, 'https://s.example/'), true);
  assert.equal(allowed(generic, 'https://s.example/checkout/pay'), false);
  assert.equal(allowed(generic, 'https://s.example/checkout/help'), true);
  assert.equal(allowed(generic, 'https://s.example/a/file.pdf'), false);
  assert.equal(allowed(generic, 'https://s.example/a/file.pdf?x=1'), true);
  const own = parseRobots('User-agent: *\nDisallow: /\n\nUser-agent: accessaudit\nDisallow: /private\n');
  assert.equal(allowed(own, 'https://s.example/products'), true);
  assert.equal(allowed(own, 'https://s.example/private/x'), false);
  const all = parseRobots('User-agent: *\nDisallow: /\n');
  assert.equal(allowed(all, 'https://s.example/'), false);
  assert.equal(allowed(parseRobots('User-agent: *\nDisallow:\n'), 'https://s.example/x'), true);
  assert.equal(allowed([], 'https://s.example/x'), true);
});

test('explanations exist for known rules and fall back for others', () => {
  assert.match(explain({ id: 'color-contrast' }).wcag, /1\.4\.3/);
  const fb = explain({ id: 'new-rule', help: 'Help text', description: 'Desc', tags: ['wcag2a', 'wcag1410'] });
  assert.equal(fb.title, 'Help text');
  assert.equal(fb.wcag, '1.4.10');
});

test('reports escape untrusted text and never claim conformance', () => {
  const a = {
    finalUrl: 'https://evil.example/', url: 'https://evil.example/', scannedAt: '2026-10-02T10:00:00Z', ms: 1000, score: 50, totalElements: 2,
    pages: [{ url: 'https://evil.example/<script>', title: '@everyone' }],
    defects: [{ id: 'image-alt', impact: 'critical', count: 2, pages: ['p'], examples: [{ html: '<img src="x"> ~~~ `' }], explanation: explain({ id: 'image-alt' }), fix: null }],
  };
  const md = toMarkdown(a, { reportUrl: 'https://rezarys.github.io/accessaudit/r/1.html' });
  const html = toHtml(a);
  assert.ok(!html.includes('<script>'));
  assert.ok(!md.includes('~~~ `'));
  assert.equal(mdText('@everyone'), '@​everyone');
  for (const text of [md, html]) {
    assert.ok(!/\bis (fully )?(compliant|conformant|accessible)\b/i.test(text));
    assert.ok(text.includes('to be confirmed by a human audit'));
    assert.ok(!text.includes(String.fromCharCode(0x2014)));
  }
});
