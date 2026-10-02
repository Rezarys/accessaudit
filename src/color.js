// WCAG contrast arithmetic, and the nearest text colour that reaches a required ratio.
'use strict';

function parseColor(str) {
  if (!str) return null;
  const s = String(str).trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3})$/);
  if (m) return m[1].split('').map((c) => parseInt(c + c, 16));
  m = s.match(/^#([0-9a-f]{6})(?:[0-9a-f]{2})?$/);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  m = s.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (m) return [m[1], m[2], m[3]].map((v) => Math.round(Number(v)));
  return null;
}

function toHex(rgb) {
  return '#' + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// Moves the text colour toward black or white (whichever direction can reach the target)
// in small steps, and returns the first colour that meets the ratio. Hue is kept as long as possible.
function nearestPassingColor(fg, bg, target) {
  const towardBlack = contrastRatio([0, 0, 0], bg) >= target;
  const towardWhite = contrastRatio([255, 255, 255], bg) >= target;
  const dirs = [];
  // Prefer the direction that already increases contrast.
  if (luminance(fg) <= luminance(bg)) { if (towardBlack) dirs.push([0, 0, 0]); if (towardWhite) dirs.push([255, 255, 255]); }
  else { if (towardWhite) dirs.push([255, 255, 255]); if (towardBlack) dirs.push([0, 0, 0]); }
  for (const end of dirs) {
    for (let t = 0.01; t <= 1.0001; t += 0.01) {
      const c = fg.map((v, i) => Math.round(v + (end[i] - v) * t));
      if (contrastRatio(c, bg) >= target) return c;
    }
  }
  return null;
}

module.exports = { parseColor, toHex, luminance, contrastRatio, nearestPassingColor };
