/* CGIAR Climate Action Hub - the catalogue
 * ============================================================================
 * Every item on the site comes from this file, and every count on the site is
 * worked out from it when a page loads, so nothing needs updating by hand.
 *
 * Each entry was either carried over from the earlier prototype, where its link
 * had already been checked, or read from the provider's own page on 10/08/2026.
 * The `verified` field says which. Nothing is invented.
 *
 * TO ADD AN ITEM
 * Copy an entry of the same type, give it a new id, and fill in only what the
 * provider publishes. Leave a field null rather than guess: an empty field shows
 * as empty, and the metadata count on the About page stays a real measurement.
 *
 * FIELDS
 *   type        publication | method (tools, platforms and methods) | innovation
 *   kind        the label shown on the card, e.g. Journal article, Reanalysis
 *   provider    the institution that publishes it
 *   resolution  spatial resolution, verbatim from the source
 *   temporal    time coverage, verbatim from the source
 *   cadence     how often it updates
 *   licence     access and reuse conditions
 *   formats     how you get the data
 *   aow         area of work, one of the five ids in AREAS below
 *   lens        adaptation | mitigation | cross
 *   geo         region or country label
 *   url         where the item lives; the site links to it and copies nothing
 *   verified    where the metadata came from, and when
 *   tags        words the search also looks in
 * ============================================================================ */
window.HUB = (function () {
  'use strict';

  /* The five areas of work, exactly as published on cgiar.org, read 10/08/2026. */
  const AREAS = [
    { id: 'aow1', short: 'Prioritization & coordination',
      name: 'Prioritization and Coordination of Climate Action',
      desc: "CGIAR's climate integration and engagement platform, connecting climate research across the organisation to support adaptation and mitigation planning and investment decisions." },
    { id: 'aow2', short: 'Digital advisories & risk',
      name: 'Digital Advisories and Climate Risk Management',
      desc: 'Developing and scaling digital weather and climate advisories, early warning systems, anticipatory action approaches, insurance and other risk management products.' },
    { id: 'aow3', short: 'Locally-led adaptation',
      name: 'Locally-Led Adaptation',
      desc: 'Shifting adaptation decision-making, resources and authority closer to those most affected by climate change.' },
    { id: 'aow4', short: 'Low-emission transitions',
      name: 'Low-Emission Transitions',
      desc: 'Helping stakeholders design pathways to reduce greenhouse gas emissions from food, land and water systems.' },
    { id: 'aow5', short: 'Finance & policy',
      name: 'Finance and Policy for Scaling Solutions',
      desc: 'Developing climate risk analytics and adaptation and mitigation investment cases, and supporting financing mechanisms that direct capital toward climate action.' }
  ];

  /* Program targets, as published. Used as stated figures, never recomputed. */
  const TARGETS = [
    { figure: '16 million', label: 'smallholder farmers to benefit' },
    { figure: 'USD 15 billion', label: 'in climate finance to be unlocked' },
    { figure: '1 gigaton', label: 'CO2-equivalent reduction by 2030' },
    { figure: '20', label: 'Tier 1 countries where benefits are expected' }
  ];

  const V_V02   = 'Carried over from the v0.2 prototype, link checked when that was built';

  /* ---------- Tools and platforms ----------
     Filed as type 'method' so they sit with methods under "Tools and methods".
     Datasets are not catalogued here: they live on the Climate Data Hub. */
  const tools = [
    { id: 'd1', type: 'method', kind: 'Geospatial', title: 'African Agriculture Adaptation Atlas',
      provider: 'CGIAR', aow: 'aow1', lens: 'adaptation', geo: 'Africa', year: '2023',
      resolution: 'Country and sub-national', temporal: null, cadence: null,
      licence: 'Set by the source platform', formats: 'Web maps',
      url: 'https://adaptationatlas.cgiar.org/', verified: V_V02,
      blurb: 'Spatial climate risk, adaptation options and food security across Africa.',
      tags: ['adaptation options', 'climate risk', 'food security'] },

    { id: 'd2', type: 'method', kind: 'Geospatial', title: 'South Asia Climate Adaptation Atlas (ACASA)',
      provider: 'CIMMYT-BISA', aow: 'aow1', lens: 'adaptation', geo: 'South Asia', year: '2025',
      resolution: 'Sub-district, approximately 25 km²', temporal: null, cadence: null,
      licence: 'Set by the source platform', formats: 'Web maps',
      url: 'https://acasa-bisa.org/', verified: V_V02,
      blurb: 'Climate hazards, vulnerability and expert-validated adaptation options for 15 crops and six livestock species.',
      tags: ['hazards', 'vulnerability', 'adaptation options', 'crops', 'livestock'] },

    { id: 'd5', type: 'method', kind: 'Monitoring', title: 'South Asia Drought Monitoring System',
      provider: 'IWMI', aow: 'aow2', lens: 'adaptation', geo: 'South Asia', year: 'Live',
      resolution: null, temporal: null, cadence: 'Weekly',
      licence: 'Set by the source platform', formats: 'Web maps',
      url: 'https://www.iwmi.org/data/sadms/', verified: V_V02,
      blurb: 'Near real-time drought monitoring, with drought work expanding in Africa.',
      tags: ['drought', 'monitoring', 'early warning'] },

    { id: 'd6', type: 'method', kind: 'Advisory / API', title: 'AgWise',
      provider: 'CGIAR', aow: 'aow2', lens: 'adaptation', geo: 'Africa', year: '2024',
      resolution: 'Location-specific', temporal: null, cadence: null,
      licence: 'Set by the source platform', formats: 'API, GIS',
      url: 'https://agwise.org/', verified: V_V02,
      blurb: 'Location-specific climate-smart agronomic recommendations with API and GIS integration.',
      tags: ['advisories', 'agronomy', 'API', 'decision support'] },

    { id: 'd8', type: 'method', kind: 'Analysis', title: 'Climate Security Observatory',
      provider: 'CGIAR', aow: 'aow1', lens: 'adaptation', geo: 'Global', year: '2024',
      resolution: 'Country profiles', temporal: null, cadence: null,
      licence: 'Set by the source platform', formats: 'Web profiles',
      url: 'https://cso.cgiar.org/', verified: V_V02,
      blurb: 'Evidence base on the climate, conflict and food security nexus, with country profiles.',
      tags: ['climate security', 'conflict', 'food security', 'country profiles'] },

  ];

  /* ---------- Publications ---------- */
  const publications = [
    { id: 'p1', type: 'publication', kind: 'Journal article', title: 'Expert agreement on key elements of transformational adaptation to climate risks',
      provider: 'Nature Climate Change', author: 'Biesbroek et al.', aow: 'aow3', lens: 'adaptation', geo: 'Global', year: 'February 2026',
      resolution: null, temporal: null, cadence: null, licence: 'Publisher terms', formats: 'Journal article',
      url: 'https://www.nature.com/articles/s41558-025-02548-y', verified: V_V02,
      blurb: 'Expert elicitation on what distinguishes transformational from incremental adaptation.',
      tags: ['transformational adaptation', 'expert elicitation'] },

    { id: 'p2', type: 'publication', kind: 'Flagship report', title: 'Global Food Policy Report 2025: Food policy lessons and priorities for a changing world',
      provider: 'IFPRI, via CGSpace', author: 'IFPRI', aow: 'aow5', lens: 'cross', geo: 'Global', year: 'May 2025',
      resolution: null, temporal: null, cadence: 'Annual', licence: 'Open access', formats: 'PDF',
      url: 'https://cgspace.cgiar.org/items/f4fbb62c-f8df-4734-8a95-2ce35f5f9904', verified: V_V02,
      blurb: "IFPRI's annual assessment of food policy priorities.",
      tags: ['food policy', 'flagship report'] },

    { id: 'p3', type: 'publication', kind: 'Draft paper', title: 'Climate and Environmental Crop Risk Index (CRI)',
      provider: 'CGIAR, via CGSpace', author: 'Breeding for Tomorrow', aow: 'aow1', lens: 'adaptation', geo: 'Global', year: 'Draft',
      resolution: null, temporal: null, cadence: null, licence: 'Open access', formats: 'PDF',
      url: 'https://cgspace.cgiar.org/items/2a1d0acb-2e0c-48fc-8b39-56e5899ba16c', verified: V_V02,
      blurb: 'Describes the crop risk index and its hazard inputs. Its methodology is under audit; read the review before citing it.',
      tags: ['crop risk index', 'hazard inputs', 'breeding prioritisation'] }
  ];

  /* ---------- Methods and manuals ---------- */
  const methods = [

    { id: 'm7', type: 'method', kind: 'MRV methodology', title: 'AgMRV: IPCC-aligned agricultural emissions MRV',
      provider: 'CGIAR', aow: 'aow4', lens: 'mitigation', geo: 'Global', year: '2024',
      resolution: null, temporal: null, cadence: null, licence: 'Set by the source platform', formats: 'Methodology and tooling',
      url: 'https://www.agmrv.org/', verified: V_V02,
      blurb: 'Methodology and tooling for monitoring, reporting and verifying agricultural greenhouse gas emissions.',
      tags: ['MRV', 'emissions', 'IPCC', 'inventories'] },

  ];

  /* ---------- Innovation catalogues ---------- */
  const innovations = [
    { id: 'i1', type: 'innovation', kind: 'Technology catalogue', title: 'TAAT e-catalogues',
      provider: 'TAAT, with CGIAR', aow: 'aow3', lens: 'adaptation', geo: 'Africa', year: 'Live',
      resolution: null, temporal: null, cadence: null, licence: 'Set by the source platform', formats: 'Web catalogue',
      url: 'https://e-catalogs.taat-africa.org/', verified: V_V02,
      blurb: 'Proven agricultural technologies for scaling across Africa, by commodity and by value chain stage.',
      tags: ['technologies', 'scaling', 'commodities', 'innovation'] },

    { id: 'i2', type: 'innovation', kind: 'Practice catalogue', title: 'WOCAT sustainable land management database',
      provider: 'WOCAT', aow: 'aow3', lens: 'cross', geo: '110 countries', year: 'Live',
      resolution: null, temporal: null, cadence: 'Continuous contribution', licence: 'Open', formats: 'Web database',
      url: 'https://wocat.net/en/database/', verified: 'Read from wocat.net, 10/08/2026',
      blurb: '1,499 SLM technologies and 574 approaches in a standardised, comparable format, searchable by land use type and by theme.',
      tags: ['land management', 'rangeland restoration', 'practices'] },

    { id: 'i3', type: 'innovation', kind: 'Results dashboard', title: 'CGIAR Results Dashboard',
      provider: 'CGIAR System', aow: 'aow1', lens: 'cross', geo: 'Global', year: 'Live',
      resolution: null, temporal: null, cadence: 'Reporting cycle', licence: 'Open', formats: 'Web dashboard',
      url: 'https://www.cgiar.org/food-security-impact/results-dashboard', verified: 'Fetched 10/08/2026',
      blurb: 'CGIAR-wide reporting on results and innovations. The route to answering whether a given innovation connects to climate.',
      tags: ['results', 'innovations', 'reporting'] }
  ];

  /* The kinds of resource the site shows. */
  const all = [].concat(publications, tools, methods, innovations);
  const byId = {};
  all.forEach(function (i) { byId[i.id] = i; });

  const LENS_LABEL = { adaptation: 'Adaptation', mitigation: 'Mitigation', cross: 'Cross-cutting' };
  const TYPE_LABEL = {
    publication: 'Publication', method: 'Tool or method', innovation: 'Innovation catalogue'
  };
  const TYPE_PLURAL = {
    publication: 'Publications', method: 'Tools and methods', innovation: 'Innovation catalogues'
  };

  function areaById(id) {
    for (var i = 0; i < AREAS.length; i++) if (AREAS[i].id === id) return AREAS[i];
    return null;
  }

  /* Search terms are combined with AND, so every word typed has to appear in an
     item. An OR search returned most of the catalogue for "climate finance". */
  function search(q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return all.map(function (item) {
      const area = areaById(item.aow);
      const hay = [item.title, item.blurb, item.provider, item.kind, item.geo,
                   LENS_LABEL[item.lens], (item.tags || []).join(' '),
                   item.resolution || '', item.temporal || '', area ? area.name : '']
                   .join(' ').toLowerCase();
      let score = 0, allPresent = true;
      terms.forEach(function (t) {
        if (hay.indexOf(t) === -1) { allPresent = false; return; }
        if (item.title.toLowerCase().indexOf(t) > -1) score += 5;
        if ((item.tags || []).join(' ').toLowerCase().indexOf(t) > -1) score += 3;
        score += 1;
      });
      return { item: item, score: allPresent ? score : 0 };
    }).filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .map(function (r) { return r.item; });
  }

  return {
    publications: publications, tools: tools, methods: methods, innovations: innovations,
    all: all, byId: byId, AREAS: AREAS, TARGETS: TARGETS,
    LENS_LABEL: LENS_LABEL, TYPE_LABEL: TYPE_LABEL, TYPE_PLURAL: TYPE_PLURAL,
    areaById: areaById, search: search
  };
})();
