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
MAX_PAGES = 8
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
    """Every type's newest items, enough of each to fill the list."""
    found, totals = [], {}
    for cg_type, kind in C.TYPES:
        got = 0
        for page in range(MAX_PAGES):
            data = fetch(C.API + '?' + C.type_query(cg_type) + '&size=' + str(PAGE) + '&page=' + str(page))
            sr = ((data or {}).get('_embedded') or {}).get('searchResult')
            if not sr:
                raise RuntimeError('CGSpace answered, but not with search results.')
            objs = [o.get('_embedded', {}).get('indexableObject') for o in (sr.get('_embedded') or {}).get('objects') or []]
            objs = [o for o in objs if o]
            found.extend((o, kind) for o in objs)
            got += len(objs)
            pg = sr.get('page') or {}
            totals[kind] = pg.get('totalElements', got)
            if not objs or page + 1 >= (pg.get('totalPages') or 0) or got >= C.LIMIT + 50:
                break
    return found, totals


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
    diff = C.compare(old['items'] if old else [], records)
    if not diff['same']:
        with open(archive, 'w', encoding='utf-8', newline='\n') as f:
            f.write(C.render(records, read))

    if diff['same']:
        summary = 'No change: the site already holds the newest %d items' % len(records)
    else:
        summary = '%d added, %d dropped, %d with changed details' % (
            len(diff['added']), len(diff['removed']), len(diff['edited']))
    mix = ', '.join('%s %d' % (k, sum(1 for r in records if r['kind'] == k)) for _, k in C.TYPES)
    report = [
        '## CGSpace refresh, ' + dmy(read), '',
        'CGSpace has %d open-access items of these types tagged Climate Action (%s). The site keeps the '
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
    report += ['_Written by the CGSpace refresh (`tools/cgspace-refresh`). Author names are not kept._', '']
    status = {'changed': not diff['same'], 'total': total, 'kept': len(records),
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
