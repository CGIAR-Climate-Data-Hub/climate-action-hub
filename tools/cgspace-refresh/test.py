"""CGSpace refresh: offline checks. The workflow runs these first and stops if any
fails, so a broken reader never proposes a list.

    python3 tools/cgspace-refresh/test.py
"""
import copy
import json
import os
import re
import shutil
import sys
import tempfile
from urllib.parse import parse_qs, urlparse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..', '..')
sys.path.insert(0, HERE)
import cgspace as C  # noqa: E402
import refresh as R  # noqa: E402

passed = failed = 0


def check(name, ok, detail=''):
    global passed, failed
    if ok:
        passed += 1
    else:
        failed += 1
        print('FAIL ' + name + (': ' + str(detail) if detail else ''))


def read(*p):
    with open(os.path.join(*p), encoding='utf-8') as f:
        return f.read()


# The query
check('query asks for Climate Action', 'f.programAccelerator=Climate%20Action,equals' in C.BASE_QUERY)
check('query asks for open access', 'f.accessRights=Open%20Access,equals' in C.BASE_QUERY)
check('query sorts newest first', 'sort=dcterms.issued,DESC' in C.BASE_QUERY)
check('one query per type', C.type_query('Journal Article').endswith('&f.itemtype=Journal%20Article,equals'))
check('four types', [t for t, _ in C.TYPES] == ['Journal Article', 'Working Paper', 'Report', 'Brief'])
check('limit is 300', C.LIMIT == 300)

# Centres
check('IRRI matched, national rice institute not',
      C.centres_from(['Bangladesh Rice Research Institute', 'International Rice Research Institute']) == ['IRRI'])
check('case and punctuation ignored',
      C.centres_from(['International Crops Research Institute for the Semi-Arid tropics']) == ['ICRISAT'])
check('Bioversity and CIAT shown as the Alliance, once',
      C.centres_from(['Bioversity International', 'International Center for Tropical Agriculture']) == ['Alliance of Bioversity and CIAT'])
check('CIFOR and ICRAF shown as CIFOR-ICRAF',
      C.centres_from(['Center for International Forestry Research', 'World Agroforestry Centre']) == ['CIFOR-ICRAF'])
check('CGIAR itself is not a centre',
      C.centres_from(['CGIAR', 'CGIAR System Organization', 'CGIAR Science Program on Climate Action']) == [])
check('all thirteen centre names covered', C.centres_from([
    'Africa Rice Center', 'Alliance of Bioversity International and CIAT', 'CIFOR-ICRAF',
    'International Maize and Wheat Improvement Center', 'International Potato Center',
    'International Center for Agricultural Research in the Dry Areas',
    'International Crops Research Institute for the Semi-Arid Tropics', 'International Food Policy Research Institute',
    'International Institute of Tropical Agriculture', 'International Livestock Research Institute',
    'International Rice Research Institute', 'International Water Management Institute', 'WorldFish']) ==
    ['AfricaRice', 'Alliance of Bioversity and CIAT', 'CIFOR-ICRAF', 'CIMMYT', 'CIP', 'ICARDA', 'ICRISAT',
     'IFPRI', 'IITA', 'ILRI', 'IRRI', 'IWMI', 'WorldFish'])

# Hand-picked items
cur = C.curated_keys(read(HERE, 'fixtures', 'catalogue-snippet.js'))
check('DOI read from the catalogue', 'doi:10.9999/test.a' in cur)
check('CGSpace item id read from the catalogue', 'uuid:00000000-0000-4000-8000-000000000007' in cur)

# A fake CGSpace that answers each type's query from the fixture
FIX = json.loads(read(HERE, 'fixtures', 'search.json'))
ITEMS = [o['_embedded']['indexableObject'] for o in FIX['_embedded']['searchResult']['_embedded']['objects']]


def fake(items):
    def fetch(url):
        q = parse_qs(urlparse(url).query)
        want = q['f.itemtype'][0].rsplit(',', 1)[0]
        size, page = int(q['size'][0]), int(q['page'][0])
        hits = [i for i in items if want in [v['value'] for v in i['metadata'].get('dcterms.type', [])]]
        part = hits[page * size:(page + 1) * size]
        return {'_embedded': {'searchResult': {'_embedded': {'objects': [{'_embedded': {'indexableObject': i}} for i in part]},
                'page': {'number': page, 'size': size, 'totalElements': len(hits), 'totalPages': -(-len(hits) // size)}}}}
    return fetch


found, totals = R.read_cgspace(fake(ITEMS))
check('each type read', totals == {'Journal article': 7, 'Working paper': 1, 'Report': 1, 'Brief': 1}, totals)
recs = C.select(found, cur)
ids = [r['id'] for r in recs]
by = {r['id']: r for r in recs}
check('hand-picked by DOI left out, whatever its case', 'cgs900001' not in ids, ids)
check('hand-picked by CGSpace id left out', 'cgs900007' not in ids, ids)
check('undated left out', 'cgs900002' not in ids, ids)
check('an item under two types listed once, as the first type', ids.count('cgs900003') == 1 and by['cgs900003']['kind'] == 'Journal article', ids)
check('newest first across types, ties to the newer handle',
      ids == ['cgs900008', 'cgs900003', 'cgs900009', 'cgs900004', 'cgs900006', 'cgs900005'], ids)
check('kind from the type it was read under', by['cgs900008']['kind'] == 'Report' and by['cgs900009']['kind'] == 'Working paper')
check('http DOI link made https', by['cgs900003']['url'] == 'https://doi.org/10.9999/test.c', by['cgs900003']['url'])
check('bare DOI given a link', by['cgs900005']['url'] == 'https://doi.org/10.9999/test.e', by['cgs900005']['url'])
check('no DOI: handle link', by['cgs900004']['url'] == 'https://hdl.handle.net/10568/900004', by['cgs900004']['url'])
check('publisher used when no journal', by['cgs900004']['source'] == 'Test Publisher')
check('spaces tidied in journal', by['cgs900005']['source'] == 'Journal of Spaces', by['cgs900005']['source'])
check('spaces and line breaks tidied in title', by['cgs900006']['title'] == 'Invented article F, same date as E', by['cgs900006']['title'])
check('keywords tidied and kept once', by['cgs900004']['tags'] == ['soil', 'water use'], by['cgs900004']['tags'])
check('countries then regions, each once', by['cgs900006']['geo'] == 'Kenya, Eastern Africa', by['cgs900006']['geo'])
check('three centres from one item', by['cgs900006']['centres'] == ['CIP', 'ICARDA', 'ICRISAT'], by['cgs900006']['centres'])
check('no author names kept', not re.search(r'author|contributor"', json.dumps(recs)))
check('record fields in a fixed order', list(recs[0].keys()) == C.FIELDS, list(recs[0].keys()))

# The limit
many = []
for i in range(450):
    many.append(({'handle': '10568/%d' % (800000 + i), 'uuid': 'u%d' % i, 'metadata': {
        'dc.title': [{'value': 'Invented %d' % i}], 'dcterms.issued': [{'value': '2025-%02d' % (1 + i % 12)}]}}, 'Report'))
capped = C.select(many, set())
check('never more than the limit', len(capped) == C.LIMIT, len(capped))
oldest = capped[-1]['issued']
kept = {r['id'] for r in capped}
check('the limit keeps the newest', all(C.to_record(it, k)['id'] in kept or C.to_record(it, k)['issued'] <= oldest for it, k in many))

# Writing and reading back, in the text JavaScript's JSON.stringify writes
text = C.render(recs, '2026-11-18')
back = C.parse(text)
check('file reads back', back and back['read'] == '2026-11-18' and back['items'] == recs)
check('file is a script that sets HUB_ARCHIVE', '\nwindow.HUB_ARCHIVE = {' in text and text.endswith('};\n'))
check('non-ASCII kept as written', '"é"' in C._js('é') and C._js({'a': 'x"y'}) == '{"a":"x\\"y"}')
check('unreadable file gives None', C.parse('nonsense') is None)
c1 = C.compare(back['items'], recs)
check('same list is same', c1['same'] and not c1['added'] and not c1['removed'] and not c1['edited'])
changed = recs[1:] + [dict(recs[0], id='cgs1')]
changed[0] = dict(changed[0], title='Renamed')
c2 = C.compare(recs, changed)
check('added, dropped and edited found', not c2['same'] and len(c2['added']) == 1 and len(c2['removed']) == 1 and len(c2['edited']) == 1)

# The whole run, in a copy of the site, against fake CGSpaces
tmp = tempfile.mkdtemp()
try:
    os.makedirs(os.path.join(tmp, 'assets'))
    with open(os.path.join(tmp, 'assets', 'catalogue.js'), 'w', encoding='utf-8') as f:
        f.write(read(HERE, 'fixtures', 'catalogue-snippet.js'))
    bulk = copy.deepcopy(ITEMS)
    for i in range(150):
        bulk.append({'handle': '10568/7%05d' % i, 'uuid': 'b%d' % i, 'metadata': {
            'dc.title': [{'value': 'Invented bulk %d' % i}], 'dcterms.issued': [{'value': '2024-%02d' % (1 + i % 12)}],
            'dcterms.type': [{'value': ['Journal Article', 'Report', 'Brief'][i % 3]}]}})
    s1 = R.run(tmp, fetch=fake(bulk), today='2026-11-18')
    arch = os.path.join(tmp, 'assets', 'archive.js')
    first_text = read(arch)
    check('first run writes the list', s1['changed'] and s1['kept'] == 156 and C.parse(first_text)['read'] == '2026-11-18', s1)
    s2 = R.run(tmp, fetch=fake(bulk), today='2026-11-25')
    check('second run, nothing new: file left alone', not s2['changed'] and read(arch) == first_text, s2)
    newer = bulk + [{'handle': '10568/999999', 'uuid': 'n1', 'metadata': {'dc.title': [{'value': 'Invented new brief'}],
                     'dcterms.issued': [{'value': '2026-11-17'}], 'dcterms.type': [{'value': 'Brief'}]}}]
    s3 = R.run(tmp, fetch=fake(newer), today='2026-12-02')
    rep = read(tmp, 'tools', 'cgspace-refresh', 'out', 'report.md')
    check('a new item is proposed and reported', s3['changed'] and s3['added'] == 1 and 'Invented new brief' in rep, s3)

    def down(url):
        raise RuntimeError('getaddrinfo ENOTFOUND cgspace.cgiar.org')
    before = read(arch)
    try:
        R.run(tmp, fetch=down, today='2026-12-09')
        check('CGSpace down: refused', False)
    except RuntimeError:
        check('CGSpace down: refused, nothing changed', read(arch) == before)
    try:
        R.run(tmp, fetch=fake(ITEMS), today='2026-12-09')
        check('short answer: refused', False)
    except RuntimeError as e:
        check('short answer: refused, nothing changed', 'too few' in str(e) and read(arch) == before, e)
finally:
    shutil.rmtree(tmp)

# The file the site uses now
live = read(ROOT, 'assets', 'archive.js')
site = C.parse(live)
check('assets/archive.js reads', bool(site))
if site:
    items = site['items']
    check("assets/archive.js is in the refresh's own format", C.render(items, site['read']) == live)
    check('assets/archive.js within the limit', C.MIN_SANE <= len(items) <= C.LIMIT, len(items))
    check('assets/archive.js ids unique', len({r['id'] for r in items}) == len(items))
    check('assets/archive.js items complete', all(r['id'] and r['title'] and r['kind'] and re.match(r'^[0-9]{4}', r['issued'])
                                                   and r['url'].startswith('https://') for r in items))
    check('assets/archive.js kinds known', {r['kind'] for r in items} <= {k for _, k in C.TYPES})
    check('assets/archive.js already tidy', all(C.tidy(r) == r for r in items))
    cat = C.curated_keys(read(ROOT, 'assets', 'catalogue.js'))
    check('assets/archive.js repeats no hand-picked item', not any(
        ('doi:' + C.bare_doi(r['url'])) in cat or ('hdl:10568/' + r['id'][3:]) in cat for r in items))
    check('assets/archive.js newest first', all(items[i - 1]['issued'] >= items[i]['issued'] for i in range(1, len(items))))

print('%d passed, %d failed' % (passed, failed))
sys.exit(1 if failed else 0)
