/* CGSpace refresh: offline checks. The workflow runs these first and stops if
 * any fails, so a broken reader never proposes a list.
 *
 *   node tools/cgspace-refresh/test.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as L from './lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
let passed = 0, failed = 0;
function check(name, ok, detail) {
  if (ok) { passed++; } else { failed++; console.error('FAIL ' + name + (detail ? ': ' + detail : '')); }
}
const eq = function (a, b) { return JSON.stringify(a) === JSON.stringify(b); };

/* The query */
check('query asks for Climate Action', L.QUERY.indexOf('f.programAccelerator=Climate%20Action,equals') > -1);
check('query asks for journal articles', L.QUERY.indexOf('f.itemtype=Journal%20Article,equals') > -1);
check('query asks for open access', L.QUERY.indexOf('f.accessRights=Open%20Access,equals') > -1);
check('query sorts newest first', L.QUERY.indexOf('sort=dcterms.issued,DESC') > -1);
check('limit is 100', L.LIMIT === 100);

/* Centres */
check('IRRI matched, national rice institute not', eq(L.centresFrom(['Bangladesh Rice Research Institute', 'International Rice Research Institute']), ['IRRI']));
check('case and punctuation ignored', eq(L.centresFrom(['International Crops Research Institute for the Semi-Arid tropics']), ['ICRISAT']));
check('Bioversity and CIAT shown as the Alliance, once', eq(L.centresFrom(['Bioversity International', 'International Center for Tropical Agriculture']), ['Alliance of Bioversity and CIAT']));
check('CIFOR and ICRAF shown as CIFOR-ICRAF', eq(L.centresFrom(['Center for International Forestry Research', 'World Agroforestry Centre']), ['CIFOR-ICRAF']));
check('CGIAR itself is not a centre', eq(L.centresFrom(['CGIAR', 'CGIAR System Organization', 'CGIAR Science Program on Climate Action']), []));
check('centres sorted', eq(L.centresFrom(['WorldFish', 'International Potato Center', 'Africa Rice Center']), ['AfricaRice', 'CIP', 'WorldFish']));
check('all fifteen-centre names covered', eq(L.centresFrom([
  'Africa Rice Center', 'Alliance of Bioversity International and CIAT', 'CIFOR-ICRAF',
  'International Maize and Wheat Improvement Center', 'International Potato Center',
  'International Center for Agricultural Research in the Dry Areas',
  'International Crops Research Institute for the Semi-Arid Tropics', 'International Food Policy Research Institute',
  'International Institute of Tropical Agriculture', 'International Livestock Research Institute',
  'International Rice Research Institute', 'International Water Management Institute', 'WorldFish']),
  ['AfricaRice', 'Alliance of Bioversity and CIAT', 'CIFOR-ICRAF', 'CIMMYT', 'CIP', 'ICARDA', 'ICRISAT',
   'IFPRI', 'IITA', 'ILRI', 'IRRI', 'IWMI', 'WorldFish']));

/* Hand-picked items */
const snippet = readFileSync(join(HERE, 'fixtures', 'catalogue-snippet.js'), 'utf8');
const cur = L.curatedKeys(snippet);
check('DOI read from the catalogue', cur.has('doi:10.9999/test.a'));
check('CGSpace item id read from the catalogue', cur.has('uuid:00000000-0000-4000-8000-000000000007'));

/* Selecting from a CGSpace answer */
const fixture = JSON.parse(readFileSync(join(HERE, 'fixtures', 'search.json'), 'utf8'));
const items = fixture._embedded.searchResult._embedded.objects.map(function (o) { return o._embedded.indexableObject; });
const recs = L.select(items, cur);
const ids = recs.map(function (r) { return r.id; });
check('hand-picked by DOI left out, whatever its case', ids.indexOf('cgs900001') === -1, ids.join(' '));
check('hand-picked by CGSpace id left out', ids.indexOf('cgs900007') === -1, ids.join(' '));
check('undated left out', ids.indexOf('cgs900002') === -1, ids.join(' '));
check('newest first, ties to the newer handle', eq(ids, ['cgs900003', 'cgs900004', 'cgs900006', 'cgs900005']), ids.join(' '));
const byId = {};
recs.forEach(function (r) { byId[r.id] = r; });
check('http DOI link made https', byId.cgs900003.url === 'https://doi.org/10.9999/test.c', byId.cgs900003.url);
check('bare DOI given a link', byId.cgs900005.url === 'https://doi.org/10.9999/test.e', byId.cgs900005.url);
check('no DOI: handle link', byId.cgs900004.url === 'https://hdl.handle.net/10568/900004', byId.cgs900004.url);
check('publisher used when no journal', byId.cgs900004.journal === 'Test Publisher');
check('spaces tidied in journal', byId.cgs900005.journal === 'Journal of Spaces', byId.cgs900005.journal);
check('spaces and line breaks tidied in title', byId.cgs900006.title === 'Invented article F, same date as E', byId.cgs900006.title);
check('keywords tidied and kept once', eq(byId.cgs900004.tags, ['soil', 'water use']), JSON.stringify(byId.cgs900004.tags));
check('countries then regions, each once', byId.cgs900006.geo === 'Kenya, Eastern Africa', byId.cgs900006.geo);
check('three centres from one item', eq(byId.cgs900006.centres, ['CIP', 'ICARDA', 'ICRISAT']), JSON.stringify(byId.cgs900006.centres));
check('no author names kept', !/author|contributor"/.test(JSON.stringify(recs)));
check('record fields in a fixed order', eq(Object.keys(recs[0]), ['id', 'title', 'issued', 'journal', 'url', 'centres', 'geo', 'tags']));

/* The limit */
const many = [];
for (let i = 0; i < 150; i++) {
  many.push({ handle: '10568/' + (800000 + i), uuid: 'u' + i, metadata: {
    'dc.title': [{ value: 'Invented ' + i }], 'dcterms.issued': [{ value: '2025-' + String(1 + (i % 12)).padStart(2, '0') }] } });
}
const capped = L.select(many, new Set());
check('never more than the limit', capped.length === L.LIMIT, String(capped.length));
const keptIds = {};
capped.forEach(function (r) { keptIds[r.id] = 1; });
const oldestKept = capped[capped.length - 1].issued;
check('the limit keeps the newest', many.every(function (it) {
  const r = L.toRecord(it);
  return keptIds[r.id] || r.issued <= oldestKept;
}));

/* Writing and reading back */
const text = L.render(recs, '2026-11-17');
const back = L.parse(text);
check('file reads back', back && back.read === '2026-11-17' && eq(back.items, recs));
check('file is a script that sets HUB_ARCHIVE', /\nwindow\.HUB_ARCHIVE = \{/.test(text) && /\};\n$/.test(text));
check('unreadable file gives null', L.parse('nonsense') === null);
const c1 = L.compare(back.items, recs);
check('same list is same', c1.same && !c1.added.length && !c1.removed.length && !c1.edited.length);
const changed = recs.slice(1).concat([Object.assign({}, recs[0], { id: 'cgs1' })]);
changed[0] = Object.assign({}, changed[0], { title: 'Renamed' });
const c2 = L.compare(recs, changed);
check('added, dropped and edited found', !c2.same && c2.added.length === 1 && c2.removed.length === 1 && c2.edited.length === 1);

/* The file the site uses now */
const live = readFileSync(join(ROOT, 'assets', 'archive.js'), 'utf8');
const site = L.parse(live);
check('assets/archive.js reads', !!site);
if (site) {
  check('assets/archive.js is in the refresh\'s own format', L.render(site.items, site.read) === live);
  check('assets/archive.js within the limit', site.items.length <= L.LIMIT && site.items.length >= L.MIN_SANE, String(site.items.length));
  const seen = {};
  check('assets/archive.js ids unique', site.items.every(function (r) { if (seen[r.id]) return false; seen[r.id] = 1; return true; }));
  check('assets/archive.js items complete', site.items.every(function (r) { return r.id && r.title && /^\d{4}/.test(r.issued) && /^https:\/\//.test(r.url); }));
  check('assets/archive.js already tidy', site.items.every(function (r) { return eq(L.tidy(r), r); }));
  const catKeys = L.curatedKeys(readFileSync(join(ROOT, 'assets', 'catalogue.js'), 'utf8'));
  check('assets/archive.js repeats no hand-picked item', site.items.every(function (r) {
    return !catKeys.has('doi:' + r.url.replace(/^https:\/\/doi\.org\//, '').toLowerCase());
  }));
  check('assets/archive.js newest first', site.items.every(function (r, i, a) { return i === 0 || a[i - 1].issued >= r.issued; }));
}

console.log(passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
