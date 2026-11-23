# Benefit-country map

The map on the About page ("Where Climate Action expects its work to bring benefits") is a static SVG written
into about.html. This script makes it.

Country lists come from "Where we bring benefits" on the CGIAR Climate Action page
(https://www.cgiar.org/cgiar-research-portfolio-2025-2030/climate-action), read 23/11/2026: 20 Tier 1 and 6 Tier 2
countries. Country shapes are Natural Earth 1:110m (public domain), from the world-atlas package.

To change the map when the lists change:

1. Edit TIER1 and TIER2 in build-map.mjs (use the Natural Earth names; the script stops if a name is not on the map).
2. Run `npm install` and then `node build-map.mjs` in this folder. It writes benefit-map.svg.
3. In about.html, replace the `<svg class="benefitmap"> ... </svg>` block with the new file, and update the two
   country lists and the read date under the map.

The colours are set in assets/site.css (.bm-t1, .bm-t2, .bm-other), not in the SVG.
