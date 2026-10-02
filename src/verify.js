// Rule-based review of each proposed fix: the fixed markup is loaded into a blank page in the same
// headless browser and the same axe-core rule is run on it. A fix is kept only if that rule passes and
// the structural check (every original attribute preserved) holds.
'use strict';
const { axeSource } = require('./axe-source');
const { checkPreserved } = require('./fixes');

async function verifyFix(page, fix) {
  if (!checkPreserved(fix)) return { ok: false, reason: 'changes existing markup' };
  if (fix.kind === 'css' && !(fix.ratio >= fix.target)) return { ok: false, reason: 'ratio below target' };
  await page.setContent(fix.test);
  await page.evaluate(await axeSource());
  const res = await page.evaluate(
    `axe.run(document, { runOnly: { type: 'rule', values: [${JSON.stringify(fix.rule)}] } }).then((r) => ({ v: r.violations.length, p: r.passes.length, i: r.incomplete.length }))`,
    { awaitPromise: true },
  );
  if (res.v > 0) return { ok: false, reason: 'the same rule still fails on the fixed markup' };
  if (res.p === 0) return { ok: false, reason: 'the rule did not apply to the fixed markup' };
  return { ok: true };
}

module.exports = { verifyFix };
