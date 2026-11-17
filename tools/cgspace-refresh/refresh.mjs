/* CGSpace refresh: the weekly run. Node 20 or later, no packages.
 *
 *   node tools/cgspace-refresh/refresh.mjs
 *
 * Reads CGSpace, works out the list the site should hold, and rewrites
 * assets/archive.js only if that list has changed. Writes out/status.json and
 * out/report.md for the workflow, which turns a change into a pull request.
 * Exits with an error, and changes nothing, if CGSpace cannot be read or returns
 * an implausibly short list. See README.md in this folder. */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { API, QUERY, MIN_SANE, curatedKeys, select, render, parse, compare } from './lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const CATALOGUE = join(ROOT, 'assets', 'catalogue.js');
const ARCHIVE = join(ROOT, 'assets', 'archive.js');
const OUT = join(HERE, 'out');
const PAGE = 100;
const MAX_PAGES = 10;
const AGENT = 'CGIAR-Climate-Action-Hub-cgspace-refresh (+https://github.com/CGIAR-Climate-Data-Hub/climate-action-hub)';

function today() { return new Date().toISOString().slice(0, 10); }
function dmy(iso) { const p = iso.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }

async function getJSON(url) {
  let last;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': AGENT, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(60000)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status + ' from ' + url);
      return await res.json();
    } catch (e) {
      last = e;
      await new Promise(function (r) { setTimeout(r, attempt * 5000); });
    }
  }
  throw last;
}

async function readCGSpace() {
  const items = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await getJSON(API + '?' + QUERY + '&size=' + PAGE + '&page=' + page);
    const sr = data && data._embedded && data._embedded.searchResult;
    if (!sr) throw new Error('CGSpace answered, but not with search results.');
    const objs = ((sr._embedded && sr._embedded.objects) || [])
      .map(function (o) { return o._embedded && o._embedded.indexableObject; }).filter(Boolean);
    items.push.apply(items, objs);
    const pg = sr.page || {};
    if (page + 1 >= (pg.totalPages || 0) || !objs.length) return { items: items, total: pg.totalElements || items.length };
  }
  return { items: items, total: items.length };
}

function line(r) {
  return '- [' + r.title.replace(/[[\]]/g, '') + '](' + r.url + ') ' +
    [r.journal, r.issued].filter(Boolean).join(', ') +
    (r.centres.length ? '. ' + r.centres.join(', ') : '');
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const read = today();
  const got = await readCGSpace();
  const curated = curatedKeys(readFileSync(CATALOGUE, 'utf8'));
  const records = select(got.items, curated);
  if (records.length < MIN_SANE) {
    throw new Error('Only ' + records.length + ' usable articles came back from CGSpace (' + got.total +
      ' matched). That is too few to trust, so nothing was changed.');
  }

  const old = existsSync(ARCHIVE) ? parse(readFileSync(ARCHIVE, 'utf8')) : null;
  const diff = compare(old ? old.items : [], records);
  if (!diff.same) writeFileSync(ARCHIVE, render(records, read));

  const summary = diff.same
    ? 'No change: the site already holds the newest ' + records.length + ' articles.'
    : diff.added.length + ' added, ' + diff.removed.length + ' dropped, ' + diff.edited.length + ' with changed details';
  const report = [
    '## CGSpace refresh, ' + dmy(read),
    '',
    'CGSpace has ' + got.total + ' open-access journal articles tagged Climate Action. The site keeps the newest ' +
      records.length + ' that are not already hand-picked in `assets/catalogue.js`.',
    '',
    '**' + summary + '.**',
    '',
    'Merging this pull request puts the new list live. Closing it leaves the site as it is. To keep an ' +
      'article out for good, add it to `assets/catalogue.js` (hand-picked items are never listed twice) or ' +
      'ask for an exclusion list to be added to this refresh.',
    ''
  ];
  if (diff.added.length) report.push('### Added', '', diff.added.map(line).join('\n'), '');
  if (diff.removed.length) report.push('### Dropped (now older than the newest ' + records.length + ', or hand-picked)', '',
    diff.removed.map(line).join('\n'), '');
  if (diff.edited.length) report.push('### Details changed on CGSpace', '', diff.edited.map(line).join('\n'), '');
  report.push('_Written by the weekly CGSpace refresh (`tools/cgspace-refresh`). Author names are not kept._', '');

  writeFileSync(join(OUT, 'report.md'), report.join('\n'));
  writeFileSync(join(OUT, 'status.json'), JSON.stringify({
    changed: !diff.same, total: got.total, kept: records.length,
    added: diff.added.length, removed: diff.removed.length, edited: diff.edited.length, summary: summary
  }, null, 2) + '\n');
  console.log(summary);
}

main().catch(function (e) {
  try {
    mkdirSync(OUT, { recursive: true });
    writeFileSync(join(OUT, 'report.md'), '## CGSpace refresh could not finish, ' + dmy(today()) + '\n\n' +
      String(e && e.message || e) + '\n\nNothing on the site was changed. If this happens two weeks running, ' +
      'check that https://cgspace.cgiar.org/server/api answers in a browser, and whether CGSpace has started ' +
      'refusing requests from GitHub.\n');
  } catch (ignore) { /* the error below is what matters */ }
  console.error(e && e.stack || e);
  process.exit(1);
});
