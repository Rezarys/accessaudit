'use strict';
// End to end: a small local shop site with known defects, scanned by the real engine in headless Chrome.
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { audit } = require('../src/audit');
const { scanSite } = require('../src/scan');
const { toMarkdown, toHtml } = require('../src/report');

const FIX = path.join(__dirname, 'fixtures', 'shop');
const ROUTES = { '/': 'index.html', '/about': 'about.html', '/clean': 'clean.html' };

function serve({ robots } = {}) {
  const server = http.createServer((req, res) => {
    const p = new URL(req.url, 'http://x').pathname;
    if (p === '/robots.txt' && robots) {
      res.writeHead(200, { 'content-type': 'text/plain' });
      return res.end(robots);
    }
    const file = ROUTES[p] || (p.startsWith('/products/') ? 'about.html' : null);
    if (file) {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(path.join(FIX, file)));
    } else if (p.startsWith('/img/')) {
      res.writeHead(200, { 'content-type': 'image/gif' });
      res.end(Buffer.from('R0lGODlhAQABAAAAACw=', 'base64'));
    } else {
      res.writeHead(404, { 'content-type': 'text/html' });
      res.end('<!doctype html><html lang="en"><head><title>Not found</title></head><body><main><p>Not found</p></main></body></html>');
    }
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

test('scans several pages, explains, and proposes verified fixes', { timeout: 120000 }, async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const a = await audit(`${base}/`, { maxPages: 4, budgetMs: 60000, detailed: 20 });
    const ids = a.defects.map((d) => d.id);
    for (const id of ['image-alt', 'link-name', 'button-name', 'label', 'html-has-lang', 'document-title', 'meta-viewport', 'color-contrast']) {
      assert.ok(ids.includes(id), `expected ${id} in ${ids.join(', ')}`);
    }
    assert.ok(a.pages.length >= 3, `crawled ${a.pages.length} pages`);
    assert.ok(a.score < 100 && a.score >= 0);

    const byId = Object.fromEntries(a.defects.map((d) => [d.id, d]));
    for (const id of ['image-alt', 'link-name', 'button-name', 'label', 'html-has-lang', 'document-title', 'meta-viewport', 'color-contrast']) {
      assert.ok(byId[id].fix && byId[id].fix.verified, `no verified fix for ${id}`);
    }
    assert.match(byId['button-name'].fix.after, /aria-label="Open menu"/);
    assert.match(byId['label'].fix.after, /aria-label="Newsletter email"/);
    assert.match(byId['meta-viewport'].fix.after, /content="width=device-width, initial-scale=1"/);
    assert.match(byId['document-title'].fix.after, /<title>Fern and Field<\/title>/);
    assert.match(byId['html-has-lang'].fix.after, /lang="en"/);
    // image-alt is found on two pages: the image on the about page has a descriptive file name.
    assert.equal(byId['image-alt'].pages.length >= 2, true);
    assert.ok(a.defects.find((d) => d.id === 'frame-title'), 'iframe without title on the about page');

    const md = toMarkdown(a, { reportUrl: 'https://rezarys.github.io/accessaudit/r/0.html' });
    assert.match(md, /Score: \d+ \/ 100/);
    assert.match(md, /to be confirmed by a human audit/);
    assert.match(toHtml(a), /<html lang="en">/);
  } finally {
    server.close();
  }
});

test('a clean page has no automated violations', { timeout: 60000 }, async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const s = await scanSite(`${base}/clean`, { maxPages: 1 });
    assert.equal(s.pages.length, 1);
    assert.deepEqual(s.aggregate.map((r) => r.id), []);
  } finally {
    server.close();
  }
});

test('the public pages pass the rules they explain', { timeout: 120000 }, async () => {
  const docs = path.join(__dirname, '..', 'docs');
  const files = ['index.html', ...fs.readdirSync(path.join(docs, 'fix')).map((f) => `fix/${f}`)];
  assert.equal(files.length, 11);
  const { Browser } = require('../src/cdp');
  const browser = await Browser.launch();
  try {
    for (const f of files) {
      const s = await scanSite(`file://${path.join(docs, f)}`, { maxPages: 1, browser });
      assert.deepEqual(s.aggregate.map((r) => r.id), [], f);
    }
  } finally {
    await browser.close();
  }
});

test('robots.txt is honoured: disallowed links are not followed, a disallowed start is refused', { timeout: 60000 }, async () => {
  const server = await serve({ robots: 'User-agent: *\nDisallow: /about\nDisallow: /clean\n' });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const s = await scanSite(`${base}/`, { maxPages: 5 });
    assert.ok(s.pages.length >= 2);
    assert.ok(s.pages.every((p) => !p.url.includes('/about')), s.pages.map((p) => p.url).join(', '));
    await assert.rejects(scanSite(`${base}/clean`, { maxPages: 1 }), /robots\.txt/);
  } finally {
    server.close();
  }
});

test('the user agent keeps HeadlessChrome and names the scanner', { timeout: 60000 }, async () => {
  let ua = '';
  const server = http.createServer((req, res) => {
    if (req.url === '/') ua = req.headers['user-agent'];
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<!doctype html><html lang="en"><head><title>t</title></head><body><main><p>x</p></main></body></html>');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try {
    await scanSite(`http://127.0.0.1:${server.address().port}/`, { maxPages: 1 });
    assert.match(ua, /HeadlessChrome/);
    assert.match(ua, /accessaudit\/0\.1 \(\+https:\/\/rezarys\.github\.io\/accessaudit\/\)/);
  } finally {
    server.close();
  }
});

test('an error status is reported, not scanned', { timeout: 60000 }, async () => {
  const server = await serve();
  try {
    await assert.rejects(scanSite(`http://127.0.0.1:${server.address().port}/missing`, { maxPages: 1 }), /HTTP 404/);
  } finally {
    server.close();
  }
});

test('the result page passes the same rules it applies', { timeout: 60000 }, async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const out = path.join(require('node:os').tmpdir(), 'accessaudit-report-test.html');
  try {
    const a = await audit(`${base}/`, { maxPages: 1 });
    fs.writeFileSync(out, toHtml(a));
    const s = await scanSite(`file://${out}`, { maxPages: 1 });
    assert.deepEqual(s.aggregate.map((r) => r.id), []);
  } finally {
    server.close();
  }
});
