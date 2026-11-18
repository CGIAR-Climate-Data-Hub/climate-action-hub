/* CGIAR Climate Action Hub - one script for the three pages
 * ============================================================================
 * Each block looks for its own place on the page and does nothing if the page
 * does not have it. Nothing here needs a server, a sign-in or any service other
 * than this folder and the links it points to.
 *
 * Everything shown is matched from the catalogue in catalogue.js when the page
 * loads. No count is typed into the pages, so a number that looks wrong is a
 * statement about the catalogue, and the fix belongs there.
 * ========================================================================== */
(function () {
  'use strict';
  const H = window.HUB;
  const $  = function (s, r) { return (r || document).querySelector(s); };
  const esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  const plural = function (n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); };
  const dmy = function (iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? m[3] + '/' + m[2] + '/' + m[1] : '';
  };

  /* The newest open-access research outputs tagged Climate Action on CGSpace
   * (journal articles, working papers, reports and briefs), from archive.js. They
   * are searched, never listed on their own, and come after the hand-picked items.
   * CGSpace records no area of work, so they have none here. */
  const ARCHIVE_READ = (window.HUB_ARCHIVE && window.HUB_ARCHIVE.read) || '';
  const ARCHIVE = ((window.HUB_ARCHIVE && window.HUB_ARCHIVE.items) || []).map(function (r) {
    return { id: r.id, type: 'publication', kind: r.kind || 'Journal article', title: r.title,
      provider: r.source || r.journal || '', year: String(r.issued || '').slice(0, 4), issued: r.issued,
      url: r.url, centres: r.centres, geo: r.geo, tags: r.tags };
  });

  function lensChip(lens) {
    if (!lens || !H.LENS_LABEL[lens]) return '';
    return '<span class="lens lens-' + lens + '">' + esc(H.LENS_LABEL[lens]) + '</span>';
  }

  /* The CGIAR centres behind an item, from its catalogue record. */
  function centresHTML(item) {
    if (!item.centres || !item.centres.length) return '';
    return '<div class="item-centres">' + (item.centres.length === 1 ? 'Centre: ' : 'Centres: ') +
      item.centres.map(esc).join(', ') + '</div>';
  }

  /* A card: used for tools, methods and the Publications & Tools list. */
  function cardHTML(item) {
    const tag = item.url ? 'a' : 'div';
    const attrs = item.url ? ' href="' + esc(item.url) + '" target="_blank" rel="noopener"' : '';
    const specs = [['Resolution', item.resolution], ['Coverage', item.temporal],
                   ['Updated', item.cadence], ['Access', item.formats]]
      .filter(function (p) { return p[1]; });
    const specHTML = specs.length
      ? '<dl class="cardspecs">' + specs.map(function (p) {
          return '<dt>' + esc(p[0]) + '</dt><dd>' + esc(p[1]) + '</dd>';
        }).join('') + '</dl>'
      : '';
    return '<' + tag + ' class="card"' + attrs + '>' +
      '<div class="card-top">' + lensChip(item.lens) +
        '<span class="card-kind">' + esc(item.kind) + '</span></div>' +
      '<div class="card-title">' + esc(item.title) + '</div>' +
      '<div class="card-blurb">' + esc(item.blurb) + '</div>' +
      specHTML + centresHTML(item) +
      '<div class="card-foot"><span>' + esc(item.provider || '') +
        (item.year ? ' &middot; ' + esc(item.year) : '') + '</span><span class="go">' +
        (item.url ? 'Open &#8599;' : 'No link yet') + '</span></div>' +
      '</' + tag + '>';
  }

  /* A row: used for the latest publications on Home. */
  function rowHTML(item) {
    const tag = item.url ? 'a' : 'div';
    const attrs = item.url ? ' href="' + esc(item.url) + '" target="_blank" rel="noopener"' : '';
    return '<' + tag + ' class="row"' + attrs + '>' +
      '<div class="row-main">' +
        '<div class="row-title">' + esc(item.title) + '</div>' +
        '<div class="row-meta">' + esc(H.TYPE_LABEL[item.type]) + ' &middot; ' + esc(item.kind) +
          ' &middot; ' + esc(item.provider || '') + (item.year ? ' &middot; ' + esc(item.year) : '') + '</div>' +
        '<div class="row-blurb">' + esc(item.blurb) + '</div>' + centresHTML(item) +
      '</div>' +
      '<div class="row-side">' + lensChip(item.lens) + '</div>' +
    '</' + tag + '>';
  }

  /* A row for a CGSpace item in search results. */
  function archiveRowHTML(item) {
    const meta = [item.kind, item.provider, item.year].filter(Boolean).map(esc).join(' &middot; ');
    return '<a class="row" href="' + esc(item.url) + '" target="_blank" rel="noopener">' +
      '<div class="row-main">' +
        '<div class="row-title">' + esc(item.title) + '</div>' +
        '<div class="row-meta">' + meta + '</div>' + centresHTML(item) +
      '</div>' +
    '</a>';
  }

  /* ---------- Home: the program's published targets ---------- */
  (function targets() {
    const host = $('#targets');
    if (!host) return;
    host.innerHTML = H.TARGETS.map(function (t) {
      return '<div class="target"><span class="target-n">' + esc(t.figure) + '</span>' +
        '<span class="target-l">' + esc(t.label) + '</span></div>';
    }).join('');
  })();

  /* ---------- Home: three doors ----------
   * Two open Publications & Tools filtered by type. The third goes to the Climate
   * Data Hub, where the datasets are kept: this site does not list them. */
  (function typecards() {
    const host = $('#typecards');
    if (!host) return;
    const doors = [
      { href: 'resources.html?type=publication', name: 'Publications', go: 'Browse &rarr;',
        desc: 'Journal articles, reports and briefs, each linked to its publisher.' },
      { href: 'resources.html?type=method', name: 'Tools and methods', go: 'Browse &rarr;',
        desc: 'Decision tools, platforms and methods, from adaptation atlases to emissions MRV.' },
      { href: 'https://cgiar-climate-data-hub.github.io/', name: 'Data', go: 'Open the Climate Data Hub &#8599;', external: true,
        desc: 'Climate datasets with their metadata, notebooks and tutorials, on the Climate Data Hub.' }
    ];
    host.innerHTML = doors.map(function (d) {
      return '<a class="typecard" href="' + esc(d.href) + '"' + (d.external ? ' target="_blank" rel="noopener"' : '') + '>' +
        '<div class="typecard-name">' + esc(d.name) + '</div>' +
        '<div class="typecard-desc">' + esc(d.desc) + '</div>' +
        '<span class="typecard-go">' + d.go + '</span></a>';
    }).join('');
  })();

  /* ---------- Home and About: the five areas of work, each a link ---------- */
  (function areas() {
    const host = $('#aowList');
    if (!host) return;
    host.innerHTML = H.AREAS.map(function (a, idx) {
      const n = H.all.filter(function (i) { return i.aow === a.id; }).length;
      return '<a class="aowrow" href="resources.html?aow=' + esc(a.id) + '">' +
        '<div class="aowrow-n">' + (idx + 1) + '</div>' +
        '<div><div class="aowrow-name">' + esc(a.name) + '</div>' +
        '<div class="aowrow-desc">' + esc(a.desc) + '</div></div>' +
        '<div class="themerow-n">' + plural(n, 'item') + '</div>' +
      '</a>';
    }).join('');
  })();

  /* ---------- Home: four featured tools ---------- */
  (function featured() {
    const host = $('#featured');
    if (!host) return;
    host.innerHTML = ['d1', 'd2', 'd6', 'd8'].map(function (id) { return H.byId[id]; })
      .filter(Boolean).map(cardHTML).join('');
  })();

  /* ---------- Home: selected publications ----------
   * The four most recent, newest first. Drafts stay off the Home page;
   * Publications & Tools still lists them. */
  (function latest() {
    const host = $('#latestPubs');
    if (!host) return;
    host.innerHTML = H.publications.filter(function (p) { return p.year !== 'Draft' && p.issued; })
      .sort(function (a, b) { return a.issued < b.issued ? 1 : a.issued > b.issued ? -1 : 0; })
      .slice(0, 4).map(rowHTML).join('');
  })();

  /* ---------- Publications & Tools: search plus two filters, with deep links ----------
   * ?q= searches, ?type= sets the resource type and ?aow= the area of work, so
   * the doors and area rows on Home land here already filtered. */
  (function resources() {
    const typeSel = $('#fType');
    if (!typeSel) return;
    const areaSel = $('#fArea');
    const qIn = $('#fq');
    const out = $('#rResults');
    const count = $('#rCount');

    H.AREAS.forEach(function (a) {
      const o = document.createElement('option');
      o.value = a.id; o.textContent = a.name;
      areaSel.appendChild(o);
    });

    const qs = new URLSearchParams(location.search);
    const hasOption = function (sel, v) {
      return Array.prototype.some.call(sel.options, function (o) { return o.value === v; });
    };
    if (qs.get('type') && hasOption(typeSel, qs.get('type'))) typeSel.value = qs.get('type');
    if (qs.get('aow') && hasOption(areaSel, qs.get('aow'))) areaSel.value = qs.get('aow');
    if (qs.get('q')) qIn.value = qs.get('q');
    if (ARCHIVE.length) {
      qIn.placeholder = 'Search all ' + (H.all.length + ARCHIVE.length) + ', including ' + ARCHIVE.length + ' from CGSpace';
    }

    function run() {
      const q = qIn.value.trim();
      let items = q ? H.search(q) : H.all;
      let more = q ? H.search(q, ARCHIVE) : [];
      if (typeSel.value !== 'all') {
        items = items.filter(function (i) { return i.type === typeSel.value; });
        more = more.filter(function (i) { return i.type === typeSel.value; });
      }
      const outsideArea = areaSel.value !== 'all' ? more.length : 0;
      if (areaSel.value !== 'all') {
        items = items.filter(function (i) { return i.aow === areaSel.value; });
        more = [];
      }
      const area = H.areaById(areaSel.value);
      /* Say plainly that the hand-picked list is not everything search can reach. */
      const reachable = ARCHIVE.length && areaSel.value === 'all' &&
        (typeSel.value === 'all' || typeSel.value === 'publication');
      count.textContent = items.length + ' hand-picked ' + (items.length === 1 ? 'resource' : 'resources') +
        (area ? ' under ' + area.name : '') +
        (!reachable ? '' : q ? ', plus ' + more.length + ' from CGSpace'
          : '. Search to include ' + ARCHIVE.length + ' more from CGSpace.');

      let html = '';
      if (items.length) {
        html = '<div class="cards">' + items.map(cardHTML).join('') + '</div>';
      } else if (more.length) {
        html = '<div class="empty"><strong>No hand-picked item matches.</strong> The CGSpace articles below do.</div>';
      } else {
        html = '<div class="empty"><strong>Nothing matches.</strong> Results must contain every word you type, so ' +
          'try a single word, or clear a filter.</div>';
      }
      if (more.length) {
        html += '<div class="morehead"><h2>From CGSpace</h2>' +
          '<p>' + more.length + (more.length === 1 ? ' match' : ' matches') + ' in the ' + ARCHIVE.length +
          ' most recent open-access journal articles, working papers, reports and briefs tagged Climate Action on CGSpace' +
          (ARCHIVE_READ ? ' (list read on ' + dmy(ARCHIVE_READ) + ')' : '') + '. Links go to the DOI, or to CGSpace when an item has none.</p></div>' +
          '<div class="rows">' + more.map(archiveRowHTML).join('') + '</div>';
      } else if (outsideArea) {
        html += '<p class="src morenote">' + plural(outsideArea, 'CGSpace item') + ' also ' +
          (outsideArea === 1 ? 'matches' : 'match') + '. CGSpace does not record an area of work, so ' +
          (outsideArea === 1 ? 'it shows' : 'they show') + ' only with &ldquo;All areas of work&rdquo;.</p>';
      }
      out.innerHTML = html;
    }

    let timer = null;
    qIn.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 240); });
    typeSel.addEventListener('change', run);
    areaSel.addEventListener('change', run);
    $('#fReset').addEventListener('click', function () {
      typeSel.value = 'all'; areaSel.value = 'all'; qIn.value = ''; run();
    });
    run();
  })();

  /* ---------- About: what the catalogue holds, counted at load ---------- */
  (function measures() {
    const host = $('#measures');
    if (!host) return;
    const rows = ['publication', 'method', 'innovation'].map(function (t) {
      return [H.TYPE_PLURAL[t], H.all.filter(function (i) { return i.type === t; }).length];
    }).filter(function (r) { return r[1] > 0; });
    if (ARCHIVE.length) rows.push(['CGSpace research outputs reached by search', ARCHIVE.length]);
    host.innerHTML = '<div class="tablescroll"><table class="plain"><tbody>' +
      rows.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + r[1] + '</td></tr>'; }).join('') +
      '<tr><td>CGIAR centres with work on this site</td><td>' + centreList().length + '</td></tr>' +
      '</tbody></table></div>' +
      '<p class="src">Centres: ' + centreList().map(esc).join(', ') + '. For publications, taken from the authors&rsquo; affiliations' +
      (ARCHIVE.length ? ' (the CGSpace items included)' : '') + '; for tools and methods, from the centres their own pages name.</p>';
  })();

  function centreList() {
    const seen = {};
    H.all.concat(ARCHIVE).forEach(function (i) { (i.centres || []).forEach(function (c) { seen[c] = true; }); });
    return Object.keys(seen).sort(function (a, b) { return a.localeCompare(b); });
  }

  /* ---------- Any stated catalogue size is recounted at load ---------- */
  (function corpusSize() {
    Array.prototype.forEach.call(document.querySelectorAll('.corpus-n'), function (el) {
      el.textContent = H.all.length;
    });
    Array.prototype.forEach.call(document.querySelectorAll('.archive-n'), function (el) {
      el.textContent = ARCHIVE.length;
    });
  })();
})();
