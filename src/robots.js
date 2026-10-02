// Minimal robots.txt support (RFC 9309): the group for "accessaudit" if present, else "*";
// longest matching Allow or Disallow wins, with "*" and "$" wildcards.
'use strict';

const AGENT = 'accessaudit';

function parseRobots(text) {
  const groups = [];
  let current = null;
  let lastWasAgent = false;
  for (const raw of String(text || '').split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === 'user-agent') {
      if (!lastWasAgent) { current = { agents: [], rules: [] }; groups.push(current); }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (current && (key === 'allow' || key === 'disallow')) current.rules.push({ allow: key === 'allow', path: value });
    }
  }
  const own = groups.filter((g) => g.agents.some((a) => a !== '*' && AGENT.startsWith(a)));
  const chosen = own.length ? own : groups.filter((g) => g.agents.includes('*'));
  return chosen.flatMap((g) => g.rules).filter((r) => r.path !== '' || r.allow === false);
}

function matches(pattern, path) {
  const anchored = pattern.endsWith('$');
  const body = (anchored ? pattern.slice(0, -1) : pattern).split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*');
  return new RegExp(`^${body}${anchored ? '$' : ''}`).test(path);
}

function allowed(rules, url) {
  if (!rules || rules.length === 0) return true;
  let path;
  try { const u = new URL(url); path = u.pathname + u.search; } catch { return false; }
  let best = null;
  for (const r of rules) {
    if (r.path === '') continue; // "Disallow:" with no path allows everything
    if (!matches(r.path, path)) continue;
    if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow)) best = r;
  }
  return !best || best.allow;
}

// A missing robots.txt (4xx) allows everything; an unreachable one (5xx, network error) also allows,
// because the page itself will then fail to load and be reported.
async function fetchRobots(url, { timeoutMs = 5000 } = {}) {
  let origin;
  try { origin = new URL(url).origin; } catch { return []; }
  if (!/^https?:/.test(origin)) return [];
  try {
    const res = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(timeoutMs), redirect: 'follow' });
    if (!res.ok) return [];
    return parseRobots(await res.text());
  } catch {
    return [];
  }
}

module.exports = { parseRobots, allowed, fetchRobots, AGENT };
