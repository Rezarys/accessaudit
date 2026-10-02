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
