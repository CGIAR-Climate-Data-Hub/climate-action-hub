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
 *   type        dataset | publication | method | innovation
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

  const V_HUB   = 'Read from the CGIAR Climate Data Hub, 10/08/2026';
  const V_V02   = 'Carried over from the v0.2 prototype, link checked when that was built';
  const V_SRC   = 'Read from the provider’s own dataset page, 10/08/2026';

  /* ---------- Datasets ---------- */
  const datasets = [
    { id: 'd1', type: 'dataset', kind: 'Geospatial', title: 'African Agriculture Adaptation Atlas',
      provider: 'CGIAR', aow: 'aow1', lens: 'adaptation', geo: 'Africa', year: '2023',
      resolution: 'Country and sub-national', temporal: null, cadence: null,
      licence: 'Set by the source platform', formats: 'Web maps',
      url: 'https://adaptationatlas.cgiar.org/', verified: V_V02,
      blurb: 'Spatial climate risk, adaptation options and food security across Africa.',
      tags: ['adaptation options', 'climate risk', 'food security'] },

    { id: 'd2', type: 'dataset', kind: 'Geospatial', title: 'South Asia Climate Adaptation Atlas (ACASA)',
      provider: 'CIMMYT-BISA', aow: 'aow1', lens: 'adaptation', geo: 'South Asia', year: '2025',
      resolution: 'Sub-district, approximately 25 km²', temporal: null, cadence: null,
      licence: 'Set by the source platform', formats: 'Web maps',
      url: 'https://acasa-bisa.org/', verified: V_V02,
      blurb: 'Climate hazards, vulnerability and expert-validated adaptation options for 15 crops and six livestock species.',
      tags: ['hazards', 'vulnerability', 'adaptation options', 'crops', 'livestock'] },

    { id: 'd3', type: 'dataset', kind: 'Open data portal', title: 'Gardian',
      provider: 'CGIAR', aow: 'aow1', lens: 'cross', geo: 'Global', year: 'Live',
      resolution: null, temporal: null, cadence: 'Continuous',
      licence: 'Varies by record', formats: 'Web search, per-record downloads',
      url: 'https://gardian.cgiar.org/', verified: V_V02,
      blurb: "CGIAR's flagship open data portal: research datasets, publications and project outputs.",
      tags: ['data portal', 'metadata', 'catalogue'] },

    { id: 'd4', type: 'dataset', kind: 'Emissions', title: 'AgMRV',
      provider: 'CGIAR', aow: 'aow4', lens: 'mitigation', geo: 'Global', year: '2024',
      resolution: null, temporal: null, cadence: null,
      licence: 'Set by the source platform', formats: 'Web tools',
      url: 'https://www.agmrv.org/', verified: V_V02,
      blurb: 'Monitoring, reporting and verification for agricultural greenhouse gas emissions, on IPCC-aligned methodology.',
      tags: ['emissions', 'MRV', 'greenhouse gas', 'IPCC'] },

    { id: 'd5', type: 'dataset', kind: 'Monitoring', title: 'South Asia Drought Monitoring System',
      provider: 'IWMI', aow: 'aow2', lens: 'adaptation', geo: 'South Asia', year: 'Live',
      resolution: null, temporal: null, cadence: 'Weekly',
      licence: 'Set by the source platform', formats: 'Web maps',
      url: 'https://www.iwmi.org/data/sadms/', verified: V_V02,
      blurb: 'Near real-time drought monitoring, with drought work expanding in Africa.',
      tags: ['drought', 'monitoring', 'early warning'] },

    { id: 'd6', type: 'dataset', kind: 'Advisory / API', title: 'AgWise',
      provider: 'CGIAR', aow: 'aow2', lens: 'adaptation', geo: 'Africa', year: '2024',
      resolution: 'Location-specific', temporal: null, cadence: null,
      licence: 'Set by the source platform', formats: 'API, GIS',
      url: 'https://agwise.org/', verified: V_V02,
      blurb: 'Location-specific climate-smart agronomic recommendations with API and GIS integration.',
      tags: ['advisories', 'agronomy', 'API', 'decision support'] },

    { id: 'd7', type: 'dataset', kind: 'Geospatial', title: 'MapSPAM',
      provider: 'IFPRI', aow: 'aow1', lens: 'cross', geo: 'Global', year: '2020',
      resolution: '5 arcminute', temporal: null, cadence: null,
      licence: 'Set by the source platform', formats: 'Raster downloads',
      url: 'https://www.mapspam.info/', verified: V_V02,
      blurb: 'Global spatially-explicit crop production surfaces: yield, area and value.',
      tags: ['crops', 'production', 'yield', 'geospatial'] },

    { id: 'd8', type: 'dataset', kind: 'Analysis', title: 'Climate Security Observatory',
      provider: 'CGIAR', aow: 'aow1', lens: 'adaptation', geo: 'Global', year: '2024',
      resolution: 'Country profiles', temporal: null, cadence: null,
      licence: 'Set by the source platform', formats: 'Web profiles',
      url: 'https://cso.cgiar.org/', verified: V_V02,
      blurb: 'Evidence base on the climate, conflict and food security nexus, with country profiles.',
      tags: ['climate security', 'conflict', 'food security', 'country profiles'] },

    { id: 'd9', type: 'dataset', kind: 'Repository', title: 'CGSpace',
      provider: 'CGIAR', aow: 'aow1', lens: 'cross', geo: 'Global', year: 'Live',
      resolution: null, temporal: null, cadence: 'Continuous',
      licence: 'Varies by item; open access repository', formats: 'Web, OAI-PMH',
      url: 'https://cgspace.cgiar.org/', verified: V_V02,
      blurb: 'Open-access institutional repository for CGIAR research outputs, around 150,000 records.',
      tags: ['repository', 'publications', 'open access'] },

    /* ---- Held by the technical Climate Data Hub itself, read 10/08/2026 ---- */
    { id: 'd10', type: 'dataset', kind: 'Geospatial', title: 'MapSPAM 2020, harmonised in the Data Hub',
      provider: 'IFPRI, via the CGIAR Climate Data Hub', aow: 'aow1', lens: 'cross', geo: 'Global', year: '2020',
      resolution: '5 arcminute', temporal: '2020', cadence: 'Static release',
      licence: 'Openly licensed, per Hub policy', formats: 'Analysis-ready, cloud-optimised',
      url: 'https://cgiar-climate-data-hub.github.io/catalog/spam2020/', verified: V_HUB,
      blurb: 'Global spatially-disaggregated crop production statistics for 2020.',
      tags: ['crops', 'production', 'geospatial', 'harmonised'] },

    { id: 'd11', type: 'dataset', kind: 'Geospatial', title: 'Gridded Livestock Density 2020 (GLW4)',
      provider: 'FAO, via the CGIAR Climate Data Hub', aow: 'aow4', lens: 'mitigation', geo: 'Global', year: '2020',
      resolution: '5 arcminute', temporal: '2020', cadence: 'Static release',
      licence: 'Openly licensed, per Hub policy', formats: 'Zarr store, streamable',
      url: 'https://cgiar-climate-data-hub.github.io/catalog/glw4-2020/', verified: V_HUB,
      blurb: 'Modelled densities of six livestock species globally.',
      tags: ['livestock', 'density', 'geospatial', 'emissions'] },

    /* ---- Foundational climate data the program works from. Metadata read
           from each provider's own dataset page on 10/08/2026. ---- */
    { id: 'd12', type: 'dataset', kind: 'Precipitation', title: 'CHIRPS',
      provider: 'Climate Hazards Center, UC Santa Barbara, with USGS', aow: 'aow2', lens: 'adaptation', geo: '50°S to 50°N', year: 'Live',
      resolution: '0.05°', temporal: '1981 to present', cadence: 'Updated operationally',
      licence: 'Open', formats: 'Gridded rasters',
      url: 'https://www.chc.ucsb.edu/data/chirps', verified: V_SRC,
      blurb: 'Climate Hazards Group InfraRed Precipitation with Station data: a 35-year quasi-global rainfall record blending satellite imagery with station measurements, built for drought early warning.',
      tags: ['rainfall', 'precipitation', 'drought', 'early warning', 'satellite'] },

    { id: 'd13', type: 'dataset', kind: 'Reanalysis', title: 'ERA5',
      provider: 'ECMWF, under the Copernicus Climate Change Service', aow: 'aow2', lens: 'cross', geo: 'Global', year: 'Live',
      resolution: '0.25°, uncertainty at 0.5°', temporal: '1940 to present, hourly', cadence: 'Daily, about 5 days behind real time',
      licence: 'Copernicus licence, free with registration', formats: 'NetCDF, GRIB, CDS API',
      url: 'https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels', verified: V_SRC,
      blurb: 'Fifth-generation ECMWF reanalysis: hourly atmospheric, ocean-wave and land-surface variables, with uncertainty from a 10-member ensemble.',
      tags: ['reanalysis', 'temperature', 'rainfall', 'wind', 'uncertainty'] },

    { id: 'd14', type: 'dataset', kind: 'Agrometeorology', title: 'AgERA5',
      provider: 'Copernicus Climate Change Service, from ERA5', aow: 'aow2', lens: 'adaptation', geo: 'Global', year: 'Live',
      resolution: '0.1°', temporal: '1979 to present, daily', cadence: 'Daily',
      licence: 'Copernicus licence, free with registration', formats: 'NetCDF, CDS API',
      url: 'https://cds.climate.copernicus.eu/datasets/sis-agrometeorological-indicators', verified: V_SRC,
      blurb: 'Daily surface meteorology prepared as input to agricultural and agro-ecological models, topographically corrected and downscaled so users need no preprocessing.',
      tags: ['agrometeorology', 'crop models', 'daily weather', 'downscaled'] }
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

  /* ---------- Methods, manuals, tools and training ---------- */
  const methods = [
    { id: 'm1', type: 'method', kind: 'Tutorial', title: 'Getting started with the Climate Data Hub',
      provider: 'CGIAR Climate Data Hub', aow: 'aow1', lens: 'cross', geo: 'Global', year: '2026',
      duration: '10 minutes', resolution: null, temporal: null, cadence: null,
      licence: 'Open', formats: 'Runnable notebook',
      url: 'https://cgiar-climate-data-hub.github.io/tutorials/getting-started/', verified: V_HUB,
      blurb: 'Find and evaluate a dataset in the catalogue, read a metadata record with confidence, and get data into Python, R or a desktop GIS.',
      tags: ['onboarding', 'metadata', 'Python', 'R', 'GIS'] },

    { id: 'm2', type: 'method', kind: 'Tutorial', title: 'Tropical Livestock Units from GLW4',
      provider: 'CGIAR Climate Data Hub', aow: 'aow4', lens: 'mitigation', geo: 'Global', year: '2026',
      duration: '15 minutes', resolution: null, temporal: null, cadence: null,
      licence: 'Open', formats: 'Runnable notebook',
      url: 'https://cgiar-climate-data-hub.github.io/tutorials/tlu_glw4/', verified: V_HUB,
      blurb: 'Stream GLW4 species densities from the Zarr store, collapse them into one TLU per km² surface using FAO weights, and subset a region without downloading the full cube.',
      tags: ['livestock', 'Zarr', 'TLU', 'subsetting'] },

    { id: 'm3', type: 'method', kind: 'Catalogue', title: 'Climate Data Hub dataset catalogue',
      provider: 'CGIAR Climate Data Hub', aow: 'aow1', lens: 'cross', geo: 'Global', year: 'Live',
      resolution: null, temporal: null, cadence: 'As datasets are contributed',
      licence: 'Openly licensed throughout', formats: 'Web, STAC, analysis-ready cloud-optimised',
      url: 'https://cgiar-climate-data-hub.github.io/catalog/', verified: V_HUB,
      blurb: 'Consistently formatted, openly licensed, ready-to-use datasets, so teams build on each other\'s work instead of starting over. Currently holds two datasets.',
      tags: ['catalogue', 'metadata', 'STAC', 'harmonisation'] },

    { id: 'm4', type: 'method', kind: 'Agent skills', title: 'AI and agent access to the Data Hub',
      provider: 'CGIAR Climate Data Hub', aow: 'aow1', lens: 'cross', geo: 'Global', year: 'Live',
      resolution: null, temporal: null, cadence: null, licence: 'Open', formats: 'Agent skills, machine-callable',
      url: 'https://cgiar-climate-data-hub.github.io/ai/', verified: V_V02,
      blurb: 'Machine-callable access and agent skills usable from Claude, ChatGPT or Gemini.',
      tags: ['AI', 'agents', 'API', 'machine-readable'] },

    { id: 'm5', type: 'method', kind: 'Method review', title: 'GCF climate rationale: data, skills and notebook review',
      provider: 'CGIAR Climate Data Hub', aow: 'aow5', lens: 'adaptation', geo: 'Global', year: '2026',
      resolution: null, temporal: null, cadence: null, licence: 'Open', formats: 'Web review',
      url: 'https://cgiar-climate-data-hub.github.io/use-cases/gcf-preparation-facility/gcf-prep-review.html', verified: V_V02,
      blurb: 'What evidence a Green Climate Fund climate rationale needs, and which datasets and steps produce it.',
      tags: ['GCF', 'climate rationale', 'climate finance', 'evidence'] },

    { id: 'm6', type: 'method', kind: 'Method review', title: 'Crop Risk Index review: data and methods',
      provider: 'CGIAR Climate Data Hub', aow: 'aow1', lens: 'adaptation', geo: 'Global', year: '2026',
      resolution: null, temporal: null, cadence: null, licence: 'Open', formats: 'Web review',
      url: 'https://cgiar-climate-data-hub.github.io/use-cases/b4t/cri-review.html', verified: V_V02,
      blurb: 'Audit of the hazard inputs, scoring logic and prioritisation role of the Breeding for Tomorrow crop risk index.',
      tags: ['crop risk index', 'audit', 'hazard inputs', 'methods'] },

    { id: 'm7', type: 'method', kind: 'MRV methodology', title: 'AgMRV: IPCC-aligned agricultural emissions MRV',
      provider: 'CGIAR', aow: 'aow4', lens: 'mitigation', geo: 'Global', year: '2024',
      resolution: null, temporal: null, cadence: null, licence: 'Set by the source platform', formats: 'Methodology and tooling',
      url: 'https://www.agmrv.org/', verified: V_V02,
      blurb: 'Methodology and tooling for monitoring, reporting and verifying agricultural greenhouse gas emissions.',
      tags: ['MRV', 'emissions', 'IPCC', 'inventories'] },

    { id: 'm8', type: 'method', kind: 'Practice database', title: 'WOCAT global database of sustainable land management practices',
      provider: 'WOCAT; consortium includes Alliance Bioversity-CIAT, ICARDA and FAO', aow: 'aow3', lens: 'cross', geo: '110 countries', year: 'Live',
      resolution: null, temporal: null, cadence: 'Continuous contribution',
      licence: 'Open', formats: 'Web database, factsheets',
      url: 'https://wocat.net/en/database/', verified: 'Read from wocat.net, 10/08/2026',
      blurb: 'Over 2,000 documented practices across 110 countries: 1,499 SLM technologies and 574 approaches, filterable by theme including climate change adaptation, drought mitigation and carbon benefits. Recognised by the UNCCD since 2014.',
      tags: ['sustainable land management', 'practices', 'drought mitigation', 'carbon', 'adaptation'] }
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

  /* The four kinds of resource the site shows. */
  const all = [].concat(datasets, publications, methods, innovations);
  const byId = {};
  all.forEach(function (i) { byId[i.id] = i; });

  /* Metadata completeness, for datasets only: how many of the six fields a data
     user needs have been recorded. Shown on the About page. */
  const META_FIELDS = ['provider', 'resolution', 'temporal', 'cadence', 'licence', 'formats'];
  function completeness(item) {
    if (item.type !== 'dataset') return null;
    const have = META_FIELDS.filter(function (f) { return item[f]; });
    return { have: have.length, of: META_FIELDS.length,
             missing: META_FIELDS.filter(function (f) { return !item[f]; }) };
  }

  const LENS_LABEL = { adaptation: 'Adaptation', mitigation: 'Mitigation', cross: 'Cross-cutting' };
  const TYPE_LABEL = {
    dataset: 'Dataset', publication: 'Publication', method: 'Method, manual or tool',
    innovation: 'Innovation catalogue'
  };
  const TYPE_PLURAL = {
    dataset: 'Datasets', publication: 'Publications', method: 'Methods, manuals and tools',
    innovation: 'Innovation catalogues'
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
    datasets: datasets, publications: publications, methods: methods, innovations: innovations,
    all: all, byId: byId, AREAS: AREAS, TARGETS: TARGETS,
    LENS_LABEL: LENS_LABEL, TYPE_LABEL: TYPE_LABEL, TYPE_PLURAL: TYPE_PLURAL,
    META_FIELDS: META_FIELDS, completeness: completeness, areaById: areaById, search: search
  };
})();
