"""CGSpace refresh: the weekly run. Python 3.9 or later, standard library only.

    python3 tools/cgspace-refresh/refresh.py

Reads CGSpace, works out the list the site should hold, and rewrites
assets/archive.js only if that list has changed. Writes out/status.json and
out/report.md, which the GitHub workflow turns into a pull request. Exits with an
error, and changes nothing, if CGSpace cannot be read or returns an implausibly
short list. See README.md in this folder.
"""
import datetime
import json
import os
import sys
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import cgspace as C  # noqa: E402

PAGE = 50        # smaller pages answer faster; a page of 100 is about 1.5 MB
MAX_PAGES = 10   # per type and spelling: 500 items, beyond anything the list can need
MARGIN = 40      # extra items read beyond LIMIT, for those dropped as hand-picked or undated
TIMEOUT = 120    # seconds per request; CGSpace can be slow at busy times
AGENT = 'CGIAR-Climate-Action-Hub-cgspace-refresh (+https://github.com/CGIAR-Climate-Data-Hub/climate-action-hub)'


def get_json(url):
    last = None
    for attempt in (1, 2, 3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': AGENT, 'Accept': 'application/json'})
            with urllib.request.urlopen(req, timeout=TIMEOUT) as res:
                data = json.loads(res.read().decode('utf-8'))
            time.sleep(1)  # one request at a time, with a pause, to go easy on CGSpace
            return data
        except Exception as e:  # network, HTTP or JSON: retry, then give up
            last = e
            time.sleep(attempt * 10)
    raise RuntimeError('Could not read ' + url + ': ' + str(last))


def read_cgspace(fetch=get_json):
    """Each type (and each spelling of the impact area) is read newest first, a page at
    a time. A stream stops once its next page could not reach the newest LIMIT items
    overall, so the run asks CGSpace for little more than it keeps. Returns
    (item, kind) pairs and the total CGSpace holds for each kind."""
    streams = [(cg_type, kind, area) for cg_type, kind in C.TYPES for area in C.IMPACT_AREAS]
    state = {s: {'page': 0, 'done': False, 'last': ''} for s in streams}
    found, totals, seen, dates = [], {kind: 0 for _, kind in C.TYPES}, set(), []

    def pull(s):
        cg_type, kind, area = s
        st = state[s]
        data = fetch(C.API + '?' + C.type_query(cg_type, area) + '&size=' + str(PAGE) + '&page=' + str(st['page']))
        sr = ((data or {}).get('_embedded') or {}).get('searchResult')
        if not sr:
            raise RuntimeError('CGSpace answered, but not with search results.')
        objs = [o.get('_embedded', {}).get('indexableObject') for o in (sr.get('_embedded') or {}).get('objects') or []]
        objs = [o for o in objs if o]
        pg = sr.get('page') or {}
        if st['page'] == 0:
            totals[kind] += pg.get('totalElements', len(objs))
        for o in objs:
            found.append((o, kind))
            issued = C.first(o, 'dcterms.issued')
            if o.get('handle') and o['handle'] not in seen and C.ISSUED.match(issued):
                seen.add(o['handle'])
                dates.append(issued)
                st['last'] = issued
        st['page'] += 1
        if not objs or st['page'] >= (pg.get('totalPages') or 0) or st['page'] >= MAX_PAGES:
            st['done'] = True

    for s in streams:
        pull(s)
    while True:
        # The date of the item at the edge of the list so far, with a margin for items
        # that will be dropped as hand-picked.
        edge = sorted(dates, reverse=True)[C.LIMIT + MARGIN - 1] if len(dates) >= C.LIMIT + MARGIN else ''
        need = [s for s in streams if not state[s]['done'] and state[s]['last'] >= edge]
        if not need:
            return found, totals
        # Read on in the stream whose items are newest; the others may never be needed.
        pull(max(need, key=lambda s: state[s]['last']))


def read_programs(fetch=get_json):
    """Program counts under the impact area, both spellings added together."""
    return C.merge_programs([fetch(C.FACET_API + '?' + C.programs_query(a)) for a in C.IMPACT_AREAS])


def dmy(iso):
    y, m, d = iso.split('-')
    return d + '/' + m + '/' + y


def line(r):
    title = r['title'].replace('[', '').replace(']', '')
    bits = ', '.join(b for b in (r['kind'], r['source'], r['issued']) if b)
    return '- [' + title + '](' + r['url'] + ') ' + bits + ('. ' + ', '.join(r['centres']) if r['centres'] else '')


def run(root, fetch=get_json, today=None):
    """Returns the status dict. Raises on failure, having changed nothing."""
    read = today or datetime.date.today().isoformat()
    out = os.path.join(HERE, 'out') if root is None else os.path.join(root, 'tools', 'cgspace-refresh', 'out')
    root = root or os.path.join(HERE, '..', '..')
    os.makedirs(out, exist_ok=True)
    catalogue = os.path.join(root, 'assets', 'catalogue.js')
    archive = os.path.join(root, 'assets', 'archive.js')

    found, totals = read_cgspace(fetch)
    with open(catalogue, encoding='utf-8') as f:
        curated = C.curated_keys(f.read())
    records = C.select(found, curated)
    total = sum(totals.values())
    if len(records) < C.MIN_SANE:
        raise RuntimeError('Only %d usable items came back from CGSpace (%d matched). That is too few '
                           'to trust, so nothing was changed.' % (len(records), total))

    old = None
    if os.path.exists(archive):
        with open(archive, encoding='utf-8') as f:
            old = C.parse(f.read())
    # The program counts are a side panel: if CGSpace will not give them, keep the last ones.
    programs, programs_read, programs_note = None, read, ''
    try:
        programs = read_programs(fetch) or None
    except Exception as e:  # noqa: BLE001
        programs_note = 'Program counts could not be read (' + str(e) + '); the previous ones are kept.'
    if not programs and old and old.get('programs'):
        programs, programs_read = old['programs'], old.get('programsRead', old.get('read'))
    diff = C.compare(old['items'] if old else [], records)
    first_programs = bool(programs) and not (old and old.get('programs'))
    if not diff['same'] or first_programs:
        with open(archive, 'w', encoding='utf-8', newline='\n') as f:
            f.write(C.render(records, read, programs, programs_read))

    if diff['same'] and first_programs:
        summary = 'Program counts added; the newest %d items are unchanged' % len(records)
    elif diff['same']:
        summary = 'No change: the site already holds the newest %d items' % len(records)
    else:
        summary = '%d added, %d dropped, %d with changed details' % (
            len(diff['added']), len(diff['removed']), len(diff['edited']))
    mix = ', '.join('%s %d' % (k, sum(1 for r in records if r['kind'] == k)) for _, k in C.TYPES)
    report = [
        '## CGSpace refresh, ' + dmy(read), '',
        'CGSpace has %d open-access items of these types under CGIAR\'s climate adaptation and mitigation impact area (%s). The site keeps the '
        'newest %d that are not already hand-picked in `assets/catalogue.js`: %s.' % (
            total, ', '.join('%s %d' % (k, n) for k, n in totals.items()), len(records), mix), '',
        '**' + summary + '.**', '',
        'Merging this pull request puts the new list live. Closing it leaves the site as it is. To keep an '
        'item out for good, hand-pick it into `assets/catalogue.js` (hand-picked items are never listed '
        'twice) or ask for an exclusion list to be added to this refresh.', '',
    ]
    if diff['added']:
        report += ['### Added', ''] + [line(r) for r in diff['added']] + ['']
    if diff['removed']:
        report += ['### Dropped (now older than the newest %d, or hand-picked)' % len(records), ''] + \
                  [line(r) for r in diff['removed']] + ['']
    if diff['edited']:
        report += ['### Details changed on CGSpace', ''] + [line(r) for r in diff['edited']] + ['']
    if programs_note:
        report += [programs_note, '']
    report += ['_Written by the CGSpace refresh (`tools/cgspace-refresh`). Author names are not kept._', '']
    status = {'changed': (not diff['same']) or first_programs, 'total': total, 'kept': len(records),
              'added': len(diff['added']), 'removed': len(diff['removed']), 'edited': len(diff['edited']),
              'summary': summary}
    with open(os.path.join(out, 'report.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(report))
    with open(os.path.join(out, 'status.json'), 'w', encoding='utf-8') as f:
        f.write(json.dumps(status, indent=2) + '\n')
    return status


def main():
    try:
        status = run(None)
        print(status['summary'])
        return 0
    except Exception as e:
        out = os.path.join(HERE, 'out')
        try:
            os.makedirs(out, exist_ok=True)
            with open(os.path.join(out, 'report.md'), 'w', encoding='utf-8') as f:
                f.write('## CGSpace refresh could not finish, ' + dmy(datetime.date.today().isoformat()) + '\n\n'
                        + str(e) + '\n\nNothing on the site was changed. If this happens two weeks running, '
                        'check that https://cgspace.cgiar.org/server/api answers in a browser, and whether '
                        'CGSpace has started refusing requests from GitHub.\n')
        except OSError:
            pass
        print('CGSpace refresh could not finish: ' + str(e), file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
