// Crawls a few pages of one site in headless Chrome, runs axe-core (WCAG 2.0 and 2.1, levels A and AA)
// on each, and aggregates the violations by rule across pages.
'use strict';
const { Browser } = require('./cdp');
const { axeSource } = require('./axe-source');
const { aggregate, MAX_EXAMPLES } = require('./score');
const { fetchRobots, allowed } = require('./robots');

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const SKIP_EXT = /\.(pdf|jpe?g|png|gif|webp|svg|zip|mp4|mp3|webm|docx?|xlsx?|pptx?|csv|xml|json|txt|ics)$/i;
const SKIP_PATH = /\/(logout|log-out|signout|sign-out|cart\/(add|clear|change)|wp-admin|wp-login)/i;

const PAGE_SCRIPT = `(async () => {
  const res = await axe.run(document, { runOnly: { type: 'tag', values: ${JSON.stringify(TAGS)} }, resultTypes: ['violations'] });
  const og = document.querySelector('meta[property="og:site_name"]');
  const h1 = document.querySelector('h1');
  const html = document.documentElement.outerHTML;
  return {
    url: location.href,
    title: document.title,
    passes: res.passes.length,
    violations: res.violations.map((v) => ({
      id: v.id, impact: v.impact, help: v.help, description: v.description, helpUrl: v.helpUrl, tags: v.tags,
      count: v.nodes.length,
      nodes: v.nodes.slice(0, ${MAX_EXAMPLES}).map((n) => ({
        target: n.target, html: n.html, failureSummary: n.failureSummary,
        data: (n.any.find((c) => c.data && c.data.fgColor) || {}).data || null,
      })),
    })),
    links: Array.from(document.querySelectorAll('a[href]')).map((a) => a.href),
    context: {
      htmlTag: (html.match(/^<html[^>]*>/i) || ['<html>'])[0],
      text: (document.body ? document.body.innerText : '').slice(0, 4000),
      siteName: og ? og.content : '',
      h1: h1 ? h1.innerText.trim().slice(0, 80) : '',
      host: location.hostname,
    },
  };
})()`;

// Only public http(s) addresses: no local, private or link-local hosts.
function validateUrl(raw) {
  let u;
  try { u = new URL(String(raw).trim()); } catch { return { ok: false, reason: 'This is not a valid web address.' }; }
  if (!/^https?:$/.test(u.protocol)) return { ok: false, reason: 'Only http and https addresses can be scanned.' };
  const h = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (u.username || u.password) return { ok: false, reason: 'Addresses with a user name or password are not scanned.' };
  if (!h.includes('.') || h === 'localhost' || /\.(local|localhost|internal|lan|home|corp)$/.test(h)) {
    return { ok: false, reason: 'Only public websites can be scanned.' };
  }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) {
    const [a, b] = h.split('.').map(Number);
    if (a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127)) {
      return { ok: false, reason: 'Only public websites can be scanned.' };
    }
  }
  if (h.includes(':')) return { ok: false, reason: 'Please use the site name rather than an IPv6 address.' };
  u.hash = '';
  return { ok: true, url: u.href };
}

function sameSiteLinks(links, origin, seen) {
  const out = [];
  for (const href of links) {
    let u;
    try { u = new URL(href); } catch { continue; }
    if (u.origin !== origin) continue;
    u.hash = '';
    if (SKIP_EXT.test(u.pathname) || SKIP_PATH.test(u.pathname)) continue;
    const key = u.href;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

// Pages are picked so that the sample covers different templates: one link per first path segment first.
function pickVariedLinks(links, n) {
  const bySection = new Map();
  for (const l of links) {
    const seg = new URL(l).pathname.split('/').filter(Boolean)[0] || '';
    if (!bySection.has(seg)) bySection.set(seg, l);
  }
  const first = [...bySection.values()];
  const rest = links.filter((l) => !first.includes(l));
  return [...first, ...rest].slice(0, n);
}

async function scanPage(page, url, axe) {
  const status = await page.goto(url);
  if (status >= 400) {
    const hint = [401, 403, 429, 503].includes(status) ? ', the site may block automated browsers' : '';
    throw new Error(`the site answered with HTTP ${status}${hint}`);
  }
  await page.evaluate(axe);
  const r = await page.evaluate(PAGE_SCRIPT, { awaitPromise: true });
  r.status = status;
  return r;
}

async function scanSite(startUrl, { maxPages = 5, budgetMs = 40000, browser: given } = {}) {
  const t0 = Date.now();
  const browser = given || (await Browser.launch());
  const axe = await axeSource();
  const pages = [];
  const errors = [];
  try {
    // robots.txt is honoured for the "accessaudit" agent and for "*": a disallowed start page is not scanned,
    // and disallowed links are never followed.
    const robots = await fetchRobots(startUrl);
    if (!allowed(robots, startUrl)) throw new Error('the site robots.txt does not allow this page to be scanned');
    const page = await browser.newPage();
    const first = await scanPage(page, startUrl, axe);
    pages.push(first);
    const origin = new URL(first.url).origin;
    const seen = new Set([new URL(first.url).href, startUrl]);
    const links = sameSiteLinks(first.links, origin, seen).filter((l) => allowed(robots, l));
    const queue = pickVariedLinks(links, maxPages - 1);
    for (const url of queue) {
      if (Date.now() - t0 > budgetMs) break;
      try {
        const r = await scanPage(page, url, axe);
        if (new URL(r.url).origin === origin) pages.push(r);
      } catch (e) {
        errors.push({ url, error: e.message });
      }
    }
    await page.close();
  } finally {
    if (!given) await browser.close();
  }
  return { startUrl, pages, errors, ms: Date.now() - t0, aggregate: aggregate(pages) };
}

module.exports = { scanSite, scanPage, validateUrl, sameSiteLinks, pickVariedLinks, aggregate, TAGS };
