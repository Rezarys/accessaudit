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
