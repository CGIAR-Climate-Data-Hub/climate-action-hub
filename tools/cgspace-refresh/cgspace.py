"""CGSpace refresh: the parts that need no network, so they can be tested offline.

Python 3.9 or later, standard library only, so the same code runs on GitHub and
on a Mac. See README.md in this folder.
"""
import json
import re
from urllib.parse import quote

# What is read: open-access research outputs tagged Climate Action on CGSpace.
API = 'https://cgspace.cgiar.org/server/api/discover/search/objects'
BASE_QUERY = ('dsoType=ITEM&sort=dcterms.issued,DESC'
              '&f.programAccelerator=Climate%20Action,equals'
              '&f.accessRights=Open%20Access,equals')
# CGSpace type, and the label the site shows. CGSpace combines two filters on the
# same field with AND, so each type is read with its own query.
TYPES = [
    ('Journal Article', 'Journal article'),
    ('Working Paper', 'Working paper'),
    ('Report', 'Report'),
    ('Brief', 'Brief'),
]
LIMIT = 300      # how many items the site keeps for search
MIN_SANE = 100   # fewer than this after filtering means something is wrong: propose nothing
MAX_TAGS = 10
FIELDS = ['id', 'kind', 'title', 'issued', 'source', 'url', 'centres', 'geo', 'tags']


def type_query(cgspace_type):
    return BASE_QUERY + '&f.itemtype=' + quote(cgspace_type) + ',equals'


# CGSpace affiliation names that belong to a CGIAR centre, with the short name the
# site shows. Exact matches only (case and punctuation ignored), so a national
# institute with a similar name is never counted as a centre. Bioversity and CIAT
# are shown as the Alliance they now form; CIFOR and ICRAF as CIFOR-ICRAF.
CENTRE_NAMES = {
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
    'WorldFish': 'WorldFish',
}


def normalise(s):
    return re.sub(r'[^a-z0-9]+', ' ', str(s or '').lower()).strip()


CENTRES = {normalise(k): v for k, v in CENTRE_NAMES.items()}


def centres_from(affiliations):
    found = {CENTRES[normalise(a)] for a in (affiliations or []) if normalise(a) in CENTRES}
    return sorted(found)


def _sp(s):
    return re.sub(r'\s+', ' ', str(s or '')).strip()


def values(item, key):
    out = []
    for v in ((item.get('metadata') or {}).get(key) or []):
        s = _sp(v.get('value'))
        if s:
            out.append(s)
    return out


def first(item, key):
    v = values(item, key)
    return v[0] if v else ''


def bare_doi(s):
    s = str(s or '').strip()
    s = re.sub(r'^https?://(dx\.)?doi\.org/', '', s, flags=re.I)
    s = re.sub(r'^doi:', '', s, flags=re.I)
    return s.lower()


def curated_keys(catalogue_text):
    """The DOIs, handles and CGSpace ids already in catalogue.js, so a hand-picked
    item is not listed twice."""
    text = str(catalogue_text or '')
    keys = set()
    for d in re.findall(r'10\.[0-9]{4,9}/[^\s\'"<>]+', text):
        keys.add('doi:' + d.lower())
    for h in re.findall(r'10568/[0-9]+', text):
        keys.add('hdl:' + h)
    for u in re.findall(r'items/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})', text):
        keys.add('uuid:' + u.lower())
    return keys


def keys_of(item):
    k = []
    doi = bare_doi(first(item, 'cg.identifier.doi'))
    if doi:
        k.append('doi:' + doi)
    if item.get('handle'):
        k.append('hdl:' + item['handle'])
    if item.get('uuid'):
        k.append('uuid:' + str(item['uuid']).lower())
    return k


def tidy(r):
    """Runs of spaces become one, a keyword listed twice is kept once, and the
    fields are put in a fixed order."""
    tags = []
    for t in r.get('tags') or []:
        t = _sp(t)
        if t and t not in tags:
            tags.append(t)
    out = {f: _sp(r.get(f)) for f in FIELDS}
    out['centres'] = list(r.get('centres') or [])
    out['tags'] = tags
    return out


def to_record(item, kind):
    """One CGSpace item as the site stores it. Author names are not kept."""
    doi = first(item, 'cg.identifier.doi')
    if doi:
        url = re.sub(r'^http:', 'https:', doi, flags=re.I) if re.match(r'^https?://', doi, flags=re.I) \
            else 'https://doi.org/' + doi
    else:
        url = 'https://hdl.handle.net/' + item['handle']
    geo = []
    for g in values(item, 'cg.coverage.country') + values(item, 'cg.coverage.region'):
        if g not in geo:
            geo.append(g)
    return tidy({
        'id': 'cgs' + str(item['handle']).split('/')[-1],
        'kind': kind,
        'title': first(item, 'dc.title'),
        'issued': first(item, 'dcterms.issued'),
        'source': first(item, 'cg.journal') or first(item, 'dcterms.publisher'),
        'url': url,
        'centres': centres_from(values(item, 'cg.contributor.affiliation')),
        'geo': ', '.join(geo),
        'tags': values(item, 'dcterms.subject')[:MAX_TAGS],
    })


ISSUED = re.compile(r'^[0-9]{4}(-[0-9]{2}){0,2}$')


def select(found, curated):
    """From (item, kind) pairs to the list the site keeps: dated, not already
    hand-picked, each item once, newest first, at most LIMIT. Ties go to the newer
    handle, so the order is the same on every run."""
    recs, seen = [], set()
    for item, kind in found:
        if not item or not item.get('handle') or item['handle'] in seen:
            continue
        if any(k in curated for k in keys_of(item)):
            continue
        r = to_record(item, kind)
        if not r['title'] or not ISSUED.match(r['issued']):
            continue
        seen.add(item['handle'])
        recs.append(r)
    recs.sort(key=lambda r: (r['issued'], int(r['id'][3:])), reverse=True)
    return recs[:LIMIT]


HEADER = '\n'.join([
    '/* CGIAR Climate Action Hub - CGSpace research outputs for search',
    ' * ============================================================================',
    ' * Written by tools/cgspace-refresh/refresh.py. Please do not edit by hand: each',
    ' * Monday the refresh reads CGSpace again and, when the list has changed,',
    ' * proposes a new version of this file as a pull request. Nothing changes on the',
    ' * site until someone merges it.',
    ' *',
    ' * The newest open-access journal articles, working papers, reports and briefs',
    ' * tagged Climate Action on CGSpace, leaving out any already hand-picked in',
    ' * catalogue.js. They appear in search results on Publications & Tools, after',
    ' * the hand-picked items. CGSpace records no area of work, so they are not',
    ' * counted under one. Centres are the CGIAR centres among the authors\'',
    ' * affiliations on each record; author names are not kept. "read" is the day',
    ' * CGSpace was last read for this list.',
    ' * ========================================================================== */',
    'window.HUB_ARCHIVE = ',
])


def _js(obj):
    # The same text JavaScript's JSON.stringify writes.
    return json.dumps(obj, ensure_ascii=False, separators=(',', ':'))


def render(records, read_date):
    return (HEADER + '{\n'
            + '  "read": ' + _js(read_date) + ',\n'
            + '  "items": [\n'
            + ',\n'.join('    ' + _js(r) for r in records)
            + '\n  ]\n};\n')


def parse(text):
    """Reads back a file written by render(). Returns None if it cannot."""
    t = str(text or '')
    mark = 'window.HUB_ARCHIVE = '
    at, end = t.find(mark), t.rfind(';')
    if at == -1 or end <= at:
        return None
    try:
        return json.loads(t[at + len(mark):end])
    except ValueError:
        return None


def compare(old_items, new_items):
    old_items = old_items or []
    before = {r['id']: r for r in old_items}
    after = {r['id']: r for r in new_items}
    return {
        'same': _js(old_items) == _js(new_items),
        'added': [r for r in new_items if r['id'] not in before],
        'removed': [r for r in old_items if r['id'] not in after],
        'edited': [r for r in new_items if r['id'] in before and _js(before[r['id']]) != _js(r)],
    }
