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
