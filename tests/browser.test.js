'use strict';
// The in-browser scan: bundle freshness, then real runs in headless Chrome, on the demo page and, like a
// bookmark would, on a page served from another origin.
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { buildBundle, OUT } = require('../src/bundle');
const { axeSource, AXE_VERSION } = require('../src/axe-source');
const { Browser } = require('../src/cdp');

const DOCS = path.join(__dirname, '..', 'docs');
const SHOP = path.join(__dirname, 'fixtures', 'shop');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

function serveDir(dir) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(dir, p);
    if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { 'content-type': 'text/html' });
      return res.end('<!doctype html><html lang="en"><head><title>Not found</title></head><body><main><p>Not found</p></main></body></html>');
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function waitResult(page, timeoutMs = 40000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const r = await page.evaluate('window.__accessauditResult ? JSON.stringify(window.__accessauditResult) : null');
    if (r) return JSON.parse(r);
    await new Promise((res) => setTimeout(res, 250));
  }
  throw new Error('no result');
}

test('docs/scan.js is built from the current sources', () => {
  const fresh = buildBundle();
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (current !== fresh) {
    fs.writeFileSync(OUT, fresh);
    assert.fail('docs/scan.js was stale and has been rebuilt: run the tests again');
  }
  new Function(fresh); // parses
});

test('docs/vendor holds the pinned axe-core build', async () => {
  const dest = path.join(DOCS, 'vendor', 'axe.min.js');
  const src = await axeSource();
  if (!fs.existsSync(dest) || fs.readFileSync(dest, 'utf8') !== src) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, src);
  }
  assert.match(fs.readFileSync(dest, 'utf8').slice(0, 200), new RegExp(`axe v${AXE_VERSION.replace(/\./g, '\\.')}`));
});

test('the demo page scans itself in the browser with verified fixes', { timeout: 120000 }, async () => {
  const server = await serveDir(DOCS);
  const browser = await Browser.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/demo/`);
    await page.evaluate("document.getElementById('run').click()");
    const a = await waitResult(page);
    const ids = a.defects.map((d) => d.id);
    for (const id of ['image-alt', 'link-name', 'button-name', 'label', 'html-has-lang', 'document-title', 'meta-viewport', 'color-contrast']) {
      assert.ok(ids.includes(id), `expected ${id} in ${ids.join(', ')}`);
    }
    assert.ok(a.score < 100);
    const top = a.defects.slice(0, 3);
    assert.ok(top.every((d) => d.fix), `top three without a verified fix: ${top.filter((d) => !d.fix).map((d) => d.id)}`);
    const panel = await page.evaluate("document.getElementById('accessaudit-panel-host').shadowRoot.textContent");
    assert.match(panel, /\d+ \/ 100/);
    assert.match(panel, /to be confirmed by a human audit/);
    assert.match(panel, /No content of this page was sent anywhere/);
  } finally {
    await browser.close();
    server.close();
  }
});

test('a bookmark-style run works from another origin, and every fix it shows is verified', { timeout: 120000 }, async () => {
  const docs = await serveDir(DOCS);
  const shop = await serveDir(SHOP);
  const browser = await Browser.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${shop.address().port}/`);
    await page.evaluate(`(function(){var s=document.createElement('script');s.src='http://127.0.0.1:${docs.address().port}/scan.js';document.body.appendChild(s);})()`);
    const a = await waitResult(page);
    assert.ok(a.defects.length >= 5);
    const withFix = a.defects.filter((d) => d.fix);
    assert.ok(withFix.length >= 1);
    for (const d of withFix) assert.ok(d.fix.after && d.fix.before);
  } finally {
    await browser.close();
    docs.close();
    shop.close();
  }
});

test('a broken fix is rejected by the in-frame review', { timeout: 60000 }, async () => {
  const server = await serveDir(DOCS);
  const browser = await Browser.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/fix/image-alt.html`);
    // Load the bundle's modules without starting the panel, then review a fix whose markup still fails.
    const src = buildBundle().replace("req('browser').start(BASE)", "window.__aaReq = req; Promise.resolve()");
    await page.evaluate(src);
    const ok = await page.evaluate(`(async () => {
      const { verifyInFrame } = window.__aaReq('browser');
      const good = { rule: 'image-alt', kind: 'html', before: '<img src="a.png">', after: '<img src="a.png" alt="A">', changed: [], test: '<!doctype html><html lang="en"><head><title>t</title></head><body><main><img src="a.png" alt="A"></main></body></html>' };
      const bad = { ...good, after: '<img src="a.png" alt="A">', test: '<!doctype html><html lang="en"><head><title>t</title></head><body><main><img src="a.png"></main></body></html>' };
      const dropped = { ...good, before: '<img src="a.png" class="x">' };
      const base = location.origin + '/vendor/axe.min.js';
      return [await verifyInFrame(good, base), await verifyInFrame(bad, base), await verifyInFrame(dropped, base)];
    })()`, { awaitPromise: true });
    assert.deepEqual(ok, [true, false, false]);
  } finally {
    await browser.close();
    server.close();
  }
});
