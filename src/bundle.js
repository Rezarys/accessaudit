// Builds docs/scan.js, the in-browser scan, from the same source modules the Node engine uses.
// A tiny module table stands in for require(); no build tool is needed. Run: node src/bundle.js
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const MODULES = ['rules', 'color', 'fixes', 'score', 'report', 'browser'];
const OUT = path.join(__dirname, '..', 'docs', 'scan.js');

function buildBundle() {
  const parts = [
    '/*! accessaudit in-browser scan, MIT licence, https://github.com/Rezarys/accessaudit (built by src/bundle.js, do not edit) */',
    '(function () {',
    "  'use strict';",
    "  if (window.__accessauditRunning) return;",
    '  window.__accessauditRunning = true;',
    "  var BASE = document.currentScript && document.currentScript.src ? new URL('.', document.currentScript.src).href : 'https://rezarys.github.io/accessaudit/';",
    '  var defs = {}, cache = {};',
    "  function req(name) { name = name.replace(/^\\.\\//, ''); if (cache[name]) return cache[name].exports; var m = { exports: {} }; cache[name] = m; defs[name](m, m.exports, req); return m.exports; }",
  ];
  for (const name of MODULES) {
    const src = fs.readFileSync(path.join(__dirname, `${name}.js`), 'utf8');
    parts.push(`  defs[${JSON.stringify(name)}] = function (module, exports, require) {\n${src}\n  };`);
  }
  parts.push("  req('browser').start(BASE).finally(function () { window.__accessauditRunning = false; });");
  parts.push('})();');
  return parts.join('\n') + '\n';
}

if (require.main === module) {
  fs.writeFileSync(OUT, buildBundle());
  console.log(`wrote ${OUT}`);
}

module.exports = { buildBundle, OUT };
