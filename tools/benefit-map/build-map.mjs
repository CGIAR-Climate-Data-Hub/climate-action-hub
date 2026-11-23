// Builds the Climate Action "where we bring benefits" map as a static, inline SVG.
// Country shapes: Natural Earth 1:110m via the world-atlas package (public domain).
// Country lists: cgiar.org Climate Action page, "Where we bring benefits", read 23/11/2026.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const world = require('world-atlas/countries-110m.json');
const topojson = require('topojson-client');
const d3 = await import('d3-geo');

const TIER1 = ['Bangladesh', 'Brazil', 'China', 'Colombia', 'Egypt', 'Ethiopia', 'Ghana', 'India', 'Indonesia', 'Kenya',
  'Mali', 'Myanmar', 'Niger', 'Nigeria', 'Pakistan', 'Philippines', 'Sudan', 'Tanzania', 'Uganda', 'Vietnam'];
const TIER2 = ['Cambodia', 'Guatemala', 'Honduras', 'Senegal', 'Sri Lanka', 'Zambia'];
const SHOWN = { Vietnam: 'Viet Nam' }; // the page says "The Socialist Republic of Vietnam"; the map uses the short form

const fc = topojson.feature(world, world.objects.countries);
const land = fc.features.filter(f => f.properties.name !== 'Antarctica');
const W = 960, H = 470;
const proj = d3.geoEqualEarth().fitExtent([[4, 4], [W - 4, H - 4]], { type: 'FeatureCollection', features: land });
const path = d3.geoPath(proj).digits(1);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const names = land.map(f => f.properties.name);
for (const n of TIER1.concat(TIER2)) if (!names.includes(n)) throw new Error('not on the map: ' + n);

const other = land.filter(f => !TIER1.includes(f.properties.name) && !TIER2.includes(f.properties.name))
  .map(f => path(f)).filter(Boolean).join('');
const tier = (list, cls, label) => list.map(n => {
  const f = land.find(x => x.properties.name === n);
  return `<path class="${cls}" d="${path(f)}"><title>${esc(SHOWN[n] || n)}: ${label}</title></path>`;
}).join('\n');

const svg = `<svg class="benefitmap" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="bmTitle bmDesc" xmlns="http://www.w3.org/2000/svg">
<title id="bmTitle">Where Climate Action expects its work to bring benefits</title>
<desc id="bmDesc">World map. Tier 1, ${TIER1.length} countries: ${TIER1.map(n => SHOWN[n] || n).join(', ')}. Tier 2, ${TIER2.length} countries: ${TIER2.join(', ')}.</desc>
<path class="bm-other" d="${other}"/>
${tier(TIER2, 'bm-t2', 'Tier 2')}
${tier(TIER1, 'bm-t1', 'Tier 1')}
</svg>`;
fs.writeFileSync('benefit-map.svg', svg);
console.log('bytes', svg.length, 'tier1', TIER1.length, 'tier2', TIER2.length);
