/* CGSpace refresh: the parts that can be tested without a network.
 * Kept free of Node-only modules, so the same functions run in a browser too.
 * See README.md in this folder. */

/* What is read: open-access journal articles tagged Climate Action on CGSpace. */
export const API = 'https://cgspace.cgiar.org/server/api/discover/search/objects';
export const QUERY = 'dsoType=ITEM&sort=dcterms.issued,DESC' +
  '&f.programAccelerator=Climate%20Action,equals' +
  '&f.itemtype=Journal%20Article,equals' +
  '&f.accessRights=Open%20Access,equals';
export const LIMIT = 100;      // how many articles the site keeps for search
export const MIN_SANE = 40;    // fewer than this after filtering means something is wrong: propose nothing
export const MAX_TAGS = 10;

/* CGSpace affiliation names that belong to a CGIAR centre, with the short name the
 * site shows. Exact matches only (case and punctuation ignored), so a national
 * institute with a similar name is never counted as a centre. Bioversity and CIAT
 * are shown as the Alliance they now form; CIFOR and ICRAF as CIFOR-ICRAF. */
const CENTRE_NAMES = {
  'Africa Rice Center': 'AfricaRice',
  'AfricaRice': 'AfricaRice',
  'Alliance of Bioversity International and CIAT': 'Alliance of Bioversity and CIAT',
  'Alliance of Bioversity International and the International Center for Tropical Agriculture': 'Alliance of Bioversity and CIAT',
  'Bioversity International and International Center for Tropical Agriculture': 'Alliance of Bioversity and CIAT',
  'Bioversity International': 'Alliance of Bioversity and CIAT',
  'International Center for Tropical Agriculture': 'Alliance of Bioversity and CIAT',
  'Center for International Forestry Research': 'CIFOR-ICRAF',
  'Center for International Forestry Research and World Agroforestry': 'CIFOR-ICRAF',
  'CIFOR-ICRAF': 'CIFOR-ICRAF',
  'World Agroforestry': 'CIFOR-ICRAF',
  'World Agroforestry Centre': 'CIFOR-ICRAF',
  'International Maize and Wheat Improvement Center': 'CIMMYT',
  'International Potato Center': 'CIP',
  'International Center for Agricultural Research in the Dry Areas': 'ICARDA',
  'International Crops Research Institute for the Semi-Arid Tropics': 'ICRISAT',
  'International Food Policy Research Institute': 'IFPRI',
  'International Institute of Tropical Agriculture': 'IITA',
  'International Livestock Research Institute': 'ILRI',
  'International Rice Research Institute': 'IRRI',
  'International Water Management Institute': 'IWMI',
  'WorldFish': 'WorldFish'
};

export function normalise(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

const CENTRES = {};
Object.keys(CENTRE_NAMES).forEach(function (k) { CENTRES[normalise(k)] = CENTRE_NAMES[k]; });

export function centresFrom(affiliations) {
  const seen = {};
  (affiliations || []).forEach(function (a) {
    const c = CENTRES[normalise(a)];
    if (c) seen[c] = true;
  });
  return Object.keys(seen).sort();
}

function values(item, key) {
  return ((item.metadata || {})[key] || []).map(function (v) { return String(v.value || '').trim(); })
    .filter(Boolean);
}
function first(item, key) { return values(item, key)[0] || ''; }

function bareDoi(s) {
  return String(s || '').trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:/i, '').toLowerCase();
}

/* The DOIs, handles and CGSpace ids already in catalogue.js, so a hand-picked
 * item is not listed twice. */
export function curatedKeys(catalogueText) {
  const keys = new Set();
  const text = String(catalogueText || '');
  (text.match(/10\.\d{4,9}\/[^\s'"<>]+/g) || []).forEach(function (d) { keys.add('doi:' + d.toLowerCase()); });
  (text.match(/10568\/\d+/g) || []).forEach(function (h) { keys.add('hdl:' + h); });
  (text.match(/items\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [])
    .forEach(function (u) { keys.add('uuid:' + u.slice(6).toLowerCase()); });
  return keys;
}

function keysOf(item) {
  const k = [];
  const doi = bareDoi(first(item, 'cg.identifier.doi'));
  if (doi) k.push('doi:' + doi);
  if (item.handle) k.push('hdl:' + item.handle);
  if (item.uuid) k.push('uuid:' + String(item.uuid).toLowerCase());
  return k;
}

/* One CGSpace item as the site stores it. Author names are not kept. */
export function toRecord(item) {
  const doi = first(item, 'cg.identifier.doi');
  const url = doi
    ? (/^https?:\/\//i.test(doi) ? doi.replace(/^http:/i, 'https:') : 'https://doi.org/' + doi)
    : 'https://hdl.handle.net/' + item.handle;
  const geo = [];
  values(item, 'cg.coverage.country').concat(values(item, 'cg.coverage.region')).forEach(function (g) {
    if (geo.indexOf(g) === -1) geo.push(g);
  });
  return tidy({
    id: 'cgs' + String(item.handle).split('/').pop(),
    title: first(item, 'dc.title'),
    issued: first(item, 'dcterms.issued'),
    journal: first(item, 'cg.journal') || first(item, 'dcterms.publisher'),
    url: url,
    centres: centresFrom(values(item, 'cg.contributor.affiliation')),
    geo: geo.join(', '),
    tags: values(item, 'dcterms.subject').slice(0, MAX_TAGS)
  });
}

/* Runs of spaces become one, and a keyword listed twice is kept once. */
export function tidy(r) {
  const sp = function (s) { return String(s || '').replace(/\s+/g, ' ').trim(); };
  const tags = [];
  (r.tags || []).forEach(function (t) { t = sp(t); if (t && tags.indexOf(t) === -1) tags.push(t); });
  return {
    id: r.id, title: sp(r.title), issued: sp(r.issued), journal: sp(r.journal), url: sp(r.url),
    centres: (r.centres || []).slice(), geo: sp(r.geo), tags: tags
  };
}

/* From every item CGSpace returned to the list the site keeps: dated, not
 * already hand-picked, newest first, at most LIMIT. Ties go to the newer
 * handle, so the order is the same on every run. */
export function select(items, curated) {
  const recs = [];
  (items || []).forEach(function (it) {
    if (!it || !it.handle) return;
    if (keysOf(it).some(function (k) { return curated.has(k); })) return;
    const r = toRecord(it);
    if (!r.title || !/^\d{4}(-\d{2}){0,2}$/.test(r.issued)) return;
    recs.push(r);
  });
  recs.sort(function (a, b) {
    if (a.issued !== b.issued) return a.issued < b.issued ? 1 : -1;
    return Number(b.id.slice(3)) - Number(a.id.slice(3));
  });
  return recs.slice(0, LIMIT);
}

const HEADER = [
  '/* CGIAR Climate Action Hub - CGSpace journal articles for search',
  ' * ============================================================================',
  ' * Written by tools/cgspace-refresh/refresh.mjs. Please do not edit by hand: each',
  ' * Monday the refresh reads CGSpace again and, when the list has changed,',
  ' * proposes a new version of this file as a pull request. Nothing changes on the',
  ' * site until someone merges it.',
  ' *',
  ' * The newest open-access journal articles tagged Climate Action on CGSpace,',
  ' * leaving out any already hand-picked in catalogue.js. They appear in search',
  ' * results on Publications & Tools, after the hand-picked items. CGSpace records',
  ' * no area of work, so they are not counted under one. Centres are the CGIAR',
  ' * centres among the authors\' affiliations on each record; author names are not',
  ' * kept. "read" is the day CGSpace was last read for this list.',
  ' * ========================================================================== */',
  'window.HUB_ARCHIVE = '
].join('\n');

export function render(records, readDate) {
  return HEADER + '{\n' +
    '  "read": ' + JSON.stringify(readDate) + ',\n' +
    '  "items": [\n' +
    records.map(function (r) { return '    ' + JSON.stringify(r); }).join(',\n') +
    '\n  ]\n};\n';
}

/* Reads back a file written by render(). Returns null if it cannot. */
export function parse(text) {
  const t = String(text || '');
  const at = t.indexOf('window.HUB_ARCHIVE = ');
  const end = t.lastIndexOf(';');
  if (at === -1 || end <= at) return null;
  try { return JSON.parse(t.slice(at + 'window.HUB_ARCHIVE = '.length, end)); } catch (e) { return null; }
}

/* What changed between the list on the site and the new one. */
export function compare(oldItems, newItems) {
  const before = {}, after = {};
  (oldItems || []).forEach(function (r) { before[r.id] = r; });
  newItems.forEach(function (r) { after[r.id] = r; });
  return {
    same: JSON.stringify(oldItems || []) === JSON.stringify(newItems),
    added: newItems.filter(function (r) { return !before[r.id]; }),
    removed: (oldItems || []).filter(function (r) { return !after[r.id]; }),
    edited: newItems.filter(function (r) {
      return before[r.id] && JSON.stringify(before[r.id]) !== JSON.stringify(r);
    })
  };
}
