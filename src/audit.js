// Turns a raw scan into an audit: a score, the defects ranked by severity, a plain-language explanation
// for each, and a proposed fix that has passed the rule-based review.
'use strict';
const { Browser } = require('./cdp');
const { scanSite } = require('./scan');
const { explain } = require('./rules');
const { proposeFix } = require('./fixes');
const { verifyFix } = require('./verify');
const { score, rank, WEIGHT } = require('./score');

async function fixFor(page, rule, contexts) {
  const tried = [];
  for (const ex of rule.examples) {
    const fix = proposeFix(rule.id, ex, contexts.get(ex.page) || {});
    if (!fix) continue;
    const check = await verifyFix(page, fix);
    if (check.ok) return { ...fix, selector: (ex.target || []).join(' '), page: ex.page, verified: true };
    tried.push(check.reason);
    // Document-level rules have a single possible fix; no point trying other examples.
    if (['html-has-lang', 'html-lang-valid', 'document-title'].includes(rule.id)) break;
  }
  return null;
}

async function audit(url, { maxPages = 5, budgetMs = 40000, detailed = 3 } = {}) {
  const browser = await Browser.launch();
  try {
    const scan = await scanSite(url, { maxPages, budgetMs, browser });
    const contexts = new Map(scan.pages.map((p) => [p.url, { ...p.context, url: p.url }]));
    const ranked = rank(scan.aggregate);
    const page = await browser.newPage();
    const defects = [];
    for (const [i, r] of ranked.entries()) {
      const d = { ...r, explanation: explain(r) };
      if (i < detailed) d.fix = await fixFor(page, r, contexts);
      defects.push(d);
    }
    await page.close();
    return {
      url: scan.startUrl,
      finalUrl: scan.pages[0] ? scan.pages[0].url : scan.startUrl,
      scannedAt: new Date().toISOString(),
      pages: scan.pages.map((p) => ({ url: p.url, title: p.title, violations: p.violations.length, passes: p.passes })),
      errors: scan.errors,
      refused: scan.errors.length,
      ms: scan.ms,
      score: score(scan.aggregate),
      totalElements: scan.aggregate.reduce((s, r) => s + r.count, 0),
      defects,
    };
  } finally {
    await browser.close();
  }
}

module.exports = { audit, score, rank, WEIGHT };
