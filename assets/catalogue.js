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
 *   issued      publication date as ISO (YYYY-MM-DD, or YYYY-MM), used to order publications
 *   centres     CGIAR centres among the authors' affiliations, from the CGSpace record (or the journal's
 *               record when the item is not on CGSpace); shown on the item and counted on About
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
    { id: 'p13', type: 'publication', kind: 'Brief', title: 'A capitation model for bundling index-based livestock insurance with animal health services',
      provider: 'ILRI, via CGSpace', centres: ['ILRI'], aow: 'aow2', lens: 'adaptation', geo: 'Ethiopia, Kenya', year: 'September 2026', issued: '2026-09',
      resolution: null, temporal: null, cadence: null, licence: 'CC BY 4.0', formats: 'PDF',
      url: 'https://cgspace.cgiar.org/items/8a5691a5-13cc-4662-bd9c-7ffea2e98ecb', verified: 'Read from CGSpace and the DOI record, 17/11/2026',
      blurb: 'Index-based livestock insurance sold together with the animal health inputs and services pastoralists prioritise, with insurers negotiating with private providers in Ethiopia and Kenya.',
      tags: ['index insurance', 'livestock', 'pastoralists', 'animal health', 'risk management'] },

    { id: 'p14', type: 'publication', kind: 'Report', title: 'Anticipatory Action and Response Plan for Maharashtra: Managing Agricultural Risks from El Niño-Induced Below-Normal Conditions',
      provider: 'ICRISAT', centres: ['ICRISAT', 'ILRI'], aow: 'aow2', lens: 'adaptation', geo: 'India', year: 'May 2026', issued: '2026-05-30',
      resolution: null, temporal: null, cadence: null, licence: 'Open access', formats: 'PDF',
      url: 'https://cgspace.cgiar.org/items/64a5860e-186c-4b1a-8783-aabd86e6580d', verified: 'Read from CGSpace and the DOI record, 17/11/2026',
      blurb: 'An anticipatory action and response plan to help rainfed farmers in Maharashtra, India, prepare for below-normal conditions brought by El Niño.',
      tags: ['anticipatory action', 'El Niño', 'drought', 'rainfed farming'] },

    { id: 'p15', type: 'publication', kind: 'Journal article', title: 'Enhancing rice yield and profitability in West African inland valleys through smart valleys: Insights from multi-country data and interpretable machine learning',
      provider: 'Smart Agricultural Technology', centres: ['AfricaRice'], aow: 'aow3', lens: 'adaptation', geo: 'West Africa', year: 'December 2026', issued: '2026-12-01',
      resolution: null, temporal: null, cadence: null, licence: 'CC BY-NC-ND 4.0', formats: 'Journal article',
      url: 'https://doi.org/10.1016/j.atech.2026.102475', verified: 'Read from CGSpace and the DOI record, 17/11/2026',
      blurb: 'How the Smart-Valleys approach to inland valley development performs, agronomically and economically, against adjacent undeveloped valleys across West African agro-ecological zones.',
      tags: ['rice', 'inland valleys', 'water control', 'smart valleys'] },

    { id: 'p16', type: 'publication', kind: 'Journal article', title: 'Historical trends reveal significant increase in hot-dry extremes in Mexico’s Bajío region',
      provider: 'Environmental Monitoring and Assessment', centres: ['CIMMYT'], aow: 'aow2', lens: 'adaptation', geo: 'Mexico', year: 'February 2026', issued: '2026-02-16',
      resolution: null, temporal: null, cadence: null, licence: 'CC BY-NC-ND 4.0', formats: 'Journal article',
      url: 'https://doi.org/10.1007/s10661-026-15074-x', verified: 'Read from CGSpace and the DOI record, 17/11/2026',
      blurb: 'Four decades of temperature and rainfall extremes in the Bajío: more warm days, warm nights and warm spells, with consequences for heat stress and evapotranspiration on farms.',
      tags: ['climate extremes', 'heat', 'drought', 'climate trends'] },

    { id: 'p17', type: 'publication', kind: 'Brief', title: 'Climate Information Services, Climate-Smart Agriculture, and Farmer Adaptation in Zambia',
      provider: 'CGIAR, via CGSpace', centres: ['ICRISAT', 'IWMI', 'WorldFish'], aow: 'aow2', lens: 'adaptation', geo: 'Zambia', year: 'November 2025', issued: '2025-11',
      resolution: null, temporal: null, cadence: null, licence: 'CC BY-ND 4.0', formats: 'PDF',
      url: 'https://cgspace.cgiar.org/items/e5a4e008-b929-4d16-882c-576f30e03f48', verified: 'Read from CGSpace and the DOI record, 17/11/2026',
      blurb: 'How access to climate information services affected maize yields, from 1,356 smallholder households across nine districts of Zambia.',
      tags: ['climate information services', 'advisories', 'maize', 'smallholders'] },

    { id: 'p4', type: 'publication', kind: 'Brief', title: 'Financing the Last Mile: An Investment Case for Early Warnings for All',
      provider: 'IWMI', centres: ['IWMI'], aow: 'aow5', lens: 'adaptation', geo: 'Bangladesh, India, Japan, Kazakhstan', year: 'November 2026', issued: '2026-11-06',
      resolution: null, temporal: null, cadence: null, licence: 'CC BY 4.0', formats: 'PDF',
      url: 'https://doi.org/10.5337/2026.233', verified: 'Read from CGSpace and the DOI record, 17/11/2026',
      blurb: 'Why financing for early warning systems lags behind their proven returns, drawing on more than seventy practitioners and global data to October 2026.',
      tags: ['early warning', 'investment case', 'climate finance', 'disaster risk'] },

    { id: 'p5', type: 'publication', kind: 'Editorial', title: 'Agriculture and food systems at a critical climate juncture',
      provider: 'PLOS Climate', centres: ['Alliance of Bioversity and CIAT', 'IRRI'], aow: 'aow1', lens: 'cross', geo: 'Global', year: 'November 2026', issued: '2026-11-04',
      resolution: null, temporal: null, cadence: null, licence: 'CC BY 4.0', formats: 'Journal article',
      url: 'https://doi.org/10.1371/journal.pclm.0001094', verified: 'Read from CGSpace and the DOI record, 17/11/2026',
      blurb: "A research agenda for PLOS Climate's Agriculture and Food Systems section, from climate impacts across food production to equity in food system transformation.",
      tags: ['food systems', 'research agenda', 'adaptation', 'mitigation'] },

    { id: 'p6', type: 'publication', kind: 'Journal article', title: "A bottom-up quantification of greenhouse gas emissions and mitigation potential in Kenya's crop and livestock systems",
      provider: 'Frontiers in Climate', centres: ['CIMMYT', 'IITA'], aow: 'aow4', lens: 'mitigation', geo: 'Kenya', year: 'October 2026', issued: '2026-10-21',
      resolution: null, temporal: null, cadence: null, licence: 'CC BY 4.0', formats: 'Journal article',
      url: 'https://doi.org/10.3389/fclim.2026.1920404', verified: 'Read from CGSpace and the DOI record, 17/11/2026',
      blurb: "County-level estimates for Kenya's major crop and livestock systems: agriculture emitted 26.74 Mt CO2e in 2021, 86 percent of it from livestock.",
      tags: ['greenhouse gas', 'emissions', 'mitigation', 'livestock', 'crops', 'inventory'] },

    { id: 'p7', type: 'publication', kind: 'Journal article', title: 'Coordinating assessment of climate adaptation and methane mitigation in rice production systems',
      provider: 'Environmental Research Letters', centres: ['IRRI'], aow: 'aow4', lens: 'cross', geo: 'Asia', year: 'October 2026', issued: '2026-10-06',
      resolution: null, temporal: null, cadence: null, licence: 'CC BY 4.0', formats: 'Journal article',
      url: 'https://doi.org/10.1088/1748-9326/aeac6d', verified: 'Read from CGSpace and the DOI record, 17/11/2026',
      blurb: 'How to assess adaptation and methane mitigation together in rice, where flooded paddies both buffer climate extremes and produce methane.',
      tags: ['rice', 'methane', 'mitigation', 'adaptation', 'water management'] },

    { id: 'p8', type: 'publication', kind: 'Brief', title: 'From agribusiness support to carbon-finance readiness: Agribusiness Facility for Africa (ABF)',
      provider: 'CGIAR, via CGSpace', centres: ['Alliance of Bioversity and CIAT'], aow: 'aow5', lens: 'mitigation', geo: 'Africa', year: 'October 2026', issued: '2026-10',
      resolution: null, temporal: null, cadence: null, licence: 'CC BY 4.0', formats: 'PDF',
      url: 'https://cgspace.cgiar.org/items/7ab9411a-ff59-48aa-8f9b-647b3ac02dda', verified: 'Read from CGSpace and the DOI record, 17/11/2026',
      blurb: 'How the Agribusiness Facility for Africa is adding carbon-finance readiness, from mitigation screening to cost-benefit analysis, to its support for agribusinesses.',
      tags: ['carbon finance', 'agribusiness', 'mitigation', 'investment readiness'] },

    { id: 'p9', type: 'publication', kind: 'Journal article', title: 'Locally led climate adaptation: Business unusual for agricultural research',
      provider: 'PLOS Climate', centres: ['Alliance of Bioversity and CIAT', 'IFPRI', 'ILRI', 'IRRI', 'WorldFish'], aow: 'aow3', lens: 'adaptation', geo: 'Global', year: 'May 2026', issued: '2026-05-04',
      resolution: null, temporal: null, cadence: null, licence: 'CC BY 4.0', formats: 'Journal article',
      url: 'https://doi.org/10.1371/journal.pclm.0000910', verified: 'Read from CGSpace and the DOI record, 17/11/2026',
      blurb: "Argues for agricultural research that puts affected communities' own priorities at the centre of adaptation, building on the eight principles for locally led adaptation.",
      tags: ['locally led adaptation', 'equity', 'agricultural research'] },

    { id: 'p10', type: 'publication', kind: 'Working paper', title: 'Opportunities for a low-emission transformation of African food systems',
      provider: 'CIFOR-ICRAF', centres: ['CIFOR-ICRAF'], aow: 'aow4', lens: 'mitigation', geo: 'Africa', year: 'January 2026', issued: '2026-01-20',
      resolution: null, temporal: null, cadence: null, licence: 'CC BY 4.0', formats: 'PDF',
      url: 'https://doi.org/10.17528/cifor-icraf/009428', verified: 'Read from CGSpace and the DOI record, 17/11/2026',
      blurb: 'A continent-wide overview of food system emissions in Africa, from FAOSTAT and national UNFCCC inventories, with no-regret mitigation priorities that support food security.',
      tags: ['food systems', 'emissions', 'mitigation', 'low-emission', 'inventory'] },

    { id: 'p11', type: 'publication', kind: 'Technical report', title: 'A bottom-up framework for assessing greenhouse gas emissions and mitigation potential in food systems',
      provider: 'IITA, via CGSpace', centres: ['CIMMYT', 'IITA'], aow: 'aow4', lens: 'mitigation', geo: '', year: 'December 2025', issued: '2025-12-31',
      resolution: null, temporal: null, cadence: null, licence: 'Open access', formats: 'PDF',
      url: 'https://cgspace.cgiar.org/items/668e797c-0d4c-4279-83d4-c1c0762b5000', verified: 'Read from CGSpace and the DOI record, 17/11/2026',
      blurb: 'A framework for bottom-up accounting of food system emissions, to show local hotspots and guide subnational mitigation where national inventories rely on default emission factors.',
      tags: ['greenhouse gas', 'emissions', 'mitigation', 'framework', 'inventory'] },

    { id: 'p12', type: 'publication', kind: 'Perspective', title: 'From project portfolios to institutional strategy: mainstreaming climate resilience in agricultural research at CGIAR',
      provider: 'Frontiers in Sustainable Food Systems', centres: ['IITA'], aow: 'aow1', lens: 'cross', geo: 'Africa', year: 'December 2025', issued: '2025-12-17',
      resolution: null, temporal: null, cadence: null, licence: 'Open access', formats: 'Journal article',
      url: 'https://doi.org/10.3389/fsufs.2025.1728611', verified: 'Read from CGSpace and the DOI record, 17/11/2026',
      blurb: "A four-method framework (discourse analysis, publication review, interviews and stakeholder mapping) for reorienting a research portfolio towards climate resilience, applied to IITA's 2013 to 2025 climate portfolio.",
      tags: ['climate resilience', 'research portfolio', 'mainstreaming', 'strategy'] },

    { id: 'p1', type: 'publication', kind: 'Journal article', title: 'Expert agreement on key elements of transformational adaptation to climate risks',
      provider: 'Nature Climate Change', author: 'Biesbroek et al.', aow: 'aow3', lens: 'adaptation', geo: 'Global', year: 'February 2026', issued: '2026-02',
      resolution: null, temporal: null, cadence: null, licence: 'Publisher terms', formats: 'Journal article',
      url: 'https://www.nature.com/articles/s41558-025-02548-y', verified: V_V02,
      blurb: 'Expert elicitation on what distinguishes transformational from incremental adaptation.',
      tags: ['transformational adaptation', 'expert elicitation'] },

    { id: 'p2', type: 'publication', kind: 'Flagship report', title: 'Global Food Policy Report 2025: Food policy lessons and priorities for a changing world',
      provider: 'IFPRI, via CGSpace', centres: ['IFPRI'], author: 'IFPRI', aow: 'aow5', lens: 'cross', geo: 'Global', year: 'May 2025', issued: '2025-05',
      resolution: null, temporal: null, cadence: 'Annual', licence: 'Open access', formats: 'PDF',
      url: 'https://cgspace.cgiar.org/items/f4fbb62c-f8df-4734-8a95-2ce35f5f9904', verified: V_V02,
      blurb: "IFPRI's annual assessment of food policy priorities.",
      tags: ['food policy', 'flagship report'] },

    { id: 'p3', type: 'publication', kind: 'Draft paper', title: 'Climate and Environmental Crop Risk Index (CRI)',
      provider: 'CGIAR, via CGSpace', centres: ['IRRI'], author: 'Breeding for Tomorrow', aow: 'aow1', lens: 'adaptation', geo: 'Global', year: 'Draft',
      resolution: null, temporal: null, cadence: null, licence: 'Open access', formats: 'PDF',
      url: 'https://cgspace.cgiar.org/items/2a1d0acb-2e0c-48fc-8b39-56e5899ba16c', verified: V_V02,
      blurb: 'Describes the crop risk index and its hazard inputs.',
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
     item. An OR search returned most of the catalogue for "climate finance".
     Searches the catalogue unless given another list (app.js passes the CGSpace
     articles from archive.js this way). */
  function search(q, list) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return (list || all).map(function (item) {
      const area = areaById(item.aow);
      const hay = [item.title, item.blurb, item.provider, item.kind, item.geo,
                   LENS_LABEL[item.lens], (item.tags || []).join(' '), (item.centres || []).join(' '),
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
