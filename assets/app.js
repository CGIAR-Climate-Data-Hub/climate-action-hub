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

  function lensChip(lens) {
    if (!lens || !H.LENS_LABEL[lens]) return '';
    return '<span class="lens lens-' + lens + '">' + esc(H.LENS_LABEL[lens]) + '</span>';
  }

  /* A card: used for datasets, tools and the Resources list. */
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
      specHTML +
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
        '<div class="row-blurb">' + esc(item.blurb) + '</div>' +
      '</div>' +
      '<div class="row-side">' + lensChip(item.lens) + '</div>' +
    '</' + tag + '>';
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

  /* ---------- Home: three doors by resource type ---------- */
  (function typecards() {
    const host = $('#typecards');
    if (!host) return;
    const doors = [
      { type: 'publication', name: 'Publications', desc: 'Journal articles, reports and briefs, each linked to its publisher.' },
      { type: 'dataset',     name: 'Datasets',     desc: 'Climate records with resolution, coverage, cadence and licence stated where the provider publishes them.' },
      { type: 'method',      name: 'Tools and methods', desc: 'Tutorials, manuals and notebooks: how to do the work, not only what exists.' }
    ];
    host.innerHTML = doors.map(function (d) {
      return '<a class="typecard" href="resources.html?type=' + esc(d.type) + '">' +
        '<div class="typecard-name">' + esc(d.name) + '</div>' +
        '<div class="typecard-desc">' + esc(d.desc) + '</div>' +
        '<span class="typecard-go">Browse &rarr;</span></a>';
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

  /* ---------- Home: four foundational climate records ---------- */
  (function foundational() {
    const host = $('#foundational');
    if (!host) return;
    const pick = H.datasets.filter(function (d) {
      return ['CHIRPS', 'ERA5', 'AgERA5'].indexOf(d.title) > -1 || d.title.indexOf('GLW4') > -1;
    });
    host.innerHTML = pick.map(cardHTML).join('');
  })();

  /* ---------- Home: selected publications ----------
   * Drafts stay off the Home page; Resources & Data still lists them. */
  (function latest() {
    const host = $('#latestPubs');
    if (!host) return;
    host.innerHTML = H.publications.filter(function (p) { return p.year !== 'Draft'; }).map(rowHTML).join('');
  })();

  /* ---------- Resources: search plus two filters, with deep links ----------
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

    function run() {
      const q = qIn.value.trim();
      let items = q ? H.search(q) : H.all;
      if (typeSel.value !== 'all') items = items.filter(function (i) { return i.type === typeSel.value; });
      if (areaSel.value !== 'all') items = items.filter(function (i) { return i.aow === areaSel.value; });
      const area = H.areaById(areaSel.value);
      count.textContent = plural(items.length, 'resource') + (area ? ' under ' + area.name : '');
      out.innerHTML = items.length
        ? '<div class="cards">' + items.map(cardHTML).join('') + '</div>'
        : '<div class="empty"><strong>Nothing matches.</strong> Every search word has to appear in an item, so try ' +
          'one word rather than a phrase, or clear a filter.</div>';
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
    const ds = H.datasets;
    const full = ds.filter(function (d) { const c = H.completeness(d); return c && c.have === c.of; }).length;
    const rows = ['dataset', 'publication', 'method', 'innovation'].map(function (t) {
      return [H.TYPE_PLURAL[t], H.all.filter(function (i) { return i.type === t; }).length];
    }).filter(function (r) { return r[1] > 0; });
    host.innerHTML = '<div class="tablescroll"><table class="plain"><tbody>' +
      rows.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + r[1] + '</td></tr>'; }).join('') +
      '<tr><td>Datasets with all six metadata fields recorded</td><td>' + full + ' of ' + ds.length + '</td></tr>' +
      '</tbody></table></div>';
  })();

  /* ---------- Any stated catalogue size is recounted at load ---------- */
  (function corpusSize() {
    Array.prototype.forEach.call(document.querySelectorAll('.corpus-n'), function (el) {
      el.textContent = H.all.length;
    });
  })();
})();
