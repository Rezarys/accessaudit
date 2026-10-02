// Locates the axe-core build: node_modules first (GitHub Actions runs `npm install`),
// then a cached copy downloaded from the npm registry for local test runs.
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');

const VERSION = require('../package.json').dependencies['axe-core'];
let cached = null;

function extractFromTarball(tgz) {
  const tar = zlib.gunzipSync(tgz);
  let off = 0;
  while (off + 512 <= tar.length) {
    const name = tar.toString('utf8', off, off + 100).replace(/\0[\s\S]*$/, '');
    if (!name) break;
    const sizeField = tar.toString('utf8', off + 124, off + 136).replace(/\0[\s\S]*$/, '').trim();
    const size = parseInt(sizeField || '0', 8);
    if (name === 'package/axe.min.js') return tar.subarray(off + 512, off + 512 + size).toString('utf8');
    off += 512 + Math.ceil(size / 512) * 512;
  }
  throw new Error('axe.min.js not found in the axe-core tarball');
}

async function axeSource() {
  if (cached) return cached;
  const local = path.join(__dirname, '..', 'node_modules', 'axe-core', 'axe.min.js');
  if (fs.existsSync(local)) return (cached = fs.readFileSync(local, 'utf8'));
  const tmp = path.join(os.tmpdir(), `accessaudit-axe-${VERSION}.min.js`);
  if (fs.existsSync(tmp)) return (cached = fs.readFileSync(tmp, 'utf8'));
  const url = `https://registry.npmjs.org/axe-core/-/axe-core-${VERSION}.tgz`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`axe-core download failed: ${res.status}`);
  const src = extractFromTarball(Buffer.from(await res.arrayBuffer()));
  fs.writeFileSync(tmp, src);
  return (cached = src);
}

module.exports = { axeSource, AXE_VERSION: VERSION };
