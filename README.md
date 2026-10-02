**Use it: https://rezarys.github.io/accessaudit/** (add one bookmark, open a page of your site, click it)

# accessaudit

Free accessibility check of a web page: a score out of 100 and the three most serious WCAG 2.1 AA defects, each explained in plain words with a proposed fix in the site's code. It runs in your own browser: no content of the page leaves it; the bookmark only downloads two script files from this site. [Try it on a demo shop](https://rezarys.github.io/accessaudit/demo/).

Defects are detected automatically and must be confirmed by a human audit. Automated tools find only part of the accessibility problems a site can have, so a good score does not mean a site meets WCAG or any law.

## How a check runs

1. The bookmark loads `docs/scan.js` and the [axe-core](https://github.com/dequelabs/axe-core) build next to it into the page you have open.
2. axe-core runs the rules tagged WCAG 2.0 and 2.1, levels A and AA, on that page.
3. Defects are grouped by rule and ranked by impact, then by the number of elements affected.
4. For the three most serious defects, a fix is proposed from the failing markup (an added `alt`, `aria-label`, `title` or `lang`, a viewport tag without zoom blockers, or the nearest text colour that reaches the required contrast). Each proposal is reviewed by rules before it is shown: the same axe-core rule is run on the fixed markup in a hidden frame and must pass, and every attribute of the original tag must be kept. A proposal that fails either check is dropped.
5. A panel shows the result. Nothing is stored, and no content of the page is sent anywhere.

Some sites forbid scripts from other addresses (their Content Security Policy); on those sites the bookmark shows a short message or does nothing, and no panel opens.

## Score

Each failing rule costs 12 (critical), 8 (serious), 4 (moderate) or 2 (minor) points, multiplied by up to 2 with the number of failing elements (1 element: x1, 10: x1.5, 100 or more: x2). The score is 100 minus the total, never below 0. It is a rough indicator for comparing a page with itself over time, not a measure of conformance.

## Limits

- Only the open page is checked.
- Proposed labels and alt texts are guesses from file names, classes or addresses, or an EDIT ME text. Only a person knows what an image or a button is for.
- Colours measured on images or gradients can be approximate.

## Full report and monitoring

Full report for one site (every page, every defect explained, a proposed fix for each, in order of priority): 49 EUR once. Monitoring (a new scan after every change, with an alert): 19 EUR per month, not built yet. Neither is open for payment yet; if you want one, [say so in issue #1](https://github.com/Rezarys/accessaudit/issues/1). Nothing is charged.

The multi-page engine for the full report is in `src/` too (`src/audit.js`). It is run by hand on a computer and is not available from the web page. It drives a local headless Chrome over the DevTools protocol, follows up to four more links of the same site, honours robots.txt for the `accessaudit` agent and for `*`, and identifies itself as `accessaudit/0.1 (+https://rezarys.github.io/accessaudit/)`.

## Development

```
npm install
npm test
```

Node 22 or later and a local Chrome or Chromium (`CHROME_PATH` to point to it). `node src/bundle.js` rebuilds `docs/scan.js` from the sources; a test fails if it is stale. The tests scan a small local shop site with known defects, run the bookmark on the demo page and from another origin, and scan this project's own pages, which must have no automated violations.

## Licence

MIT, see LICENSE. `docs/vendor/axe.min.js` is axe-core 4.10.3 by Deque Systems, redistributed unchanged under its own licence, the Mozilla Public License 2.0 (notice at the top of the file).

Made by Younes Z. Built with AI assistance, tested with automated tests, not reviewed line by line. Not affiliated with Deque, GitHub or the European Union.
