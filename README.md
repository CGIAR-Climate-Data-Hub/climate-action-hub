# CGIAR Climate Action Hub

The front door to the evidence behind the CGIAR Climate Action Science Program: publications, datasets, tools and methods, each linked to where it lives, with the [Climate Data Hub](https://cgiar-climate-data-hub.github.io/) as the place for the data itself.

This is the beta of 17/11/2026: three pages of plain HTML, CSS and JavaScript. There is no build step, no server, no sign-in and no tracking. Open `index.html` in a browser and it works.

## Pages

| Page | What it holds |
|---|---|
| `index.html` (Home) | Photograph, mission line and search, the program's published targets, three ways in by resource type, the five areas of work, the Climate Data Hub call-out, four foundational climate records, latest publications |
| `resources.html` (Resources & Data) | The whole catalogue behind one search field and two filters, resource type and area of work |
| `about.html` (About & Contact) | The program, quoted from cgiar.org with the date it was read; what the site holds, counted when the page loads; how to get in touch |

The layout follows [gender.cgiar.org](https://gender.cgiar.org/): the logo in a header, a tab bar beneath it, an image-led hero and plain sections down the page.

Resources & Data takes three link parameters, so other pages can send people straight to a filtered list: `?q=` for a search, `?type=` for a resource type (`dataset`, `publication`, `method`, `innovation`) and `?aow=` for an area of work (`aow1` to `aow5`). For example, `resources.html?aow=aow2&type=dataset`.

## Files

```
index.html, resources.html, about.html
assets/catalogue.js    every item on the site, the five areas of work, the targets and the photograph credits
assets/app.js          puts the catalogue on the pages
assets/site.css        all the styles
assets/cgiar-logo.png  the CGIAR Climate Action logo
assets/img/            two Creative Commons photographs, credited on screen
```

## Making changes

- To add or change a resource, edit `assets/catalogue.js`. The instructions are at the top of the file. Every count on the site is worked out from the catalogue when a page loads, so nothing else needs updating.
- The header, tab bar and footer are repeated in each of the three HTML files, so a change to any of them has to be made in all three.
- Text about the program is quoted from the Climate Action page on cgiar.org, with the date it was read printed beneath it. If that page changes, requote it and update the date.
- Where a provider has not published a field (a dataset's resolution, say), leave it empty. Please don't fill it with an estimate.

## Publishing on GitHub Pages

In the repository, go to Settings, then Pages, and choose "Deploy from a branch" with `main` and `/ (root)`. The site then appears at `https://cgiar-climate-data-hub.github.io/climate-action-hub/`. Every link inside the site is relative, so it works at that address or at a custom domain. The empty `.nojekyll` file tells GitHub to serve the files exactly as they are.

## Before the site is promoted

- `climate@cgiar.org` is the only contact address on the site. Please confirm someone reads it.
- Each page carries `<meta name="robots" content="noindex, nofollow">`, so search engines leave the beta alone. Remove that line from all three pages once the site is at its final address.
- There is no analytics. If visit counts are wanted to plan the next version, add a CGIAR-owned, cookie-free analytics account once the final address is known.
- Both photographs are CC BY-NC-SA 2.0 (NonCommercial). That suits a program site, but check before any sponsored or commercial use.
- The "Sign in" link at the right of the tab bar opens the contact section. The internal operating system it is meant to lead to is not part of this site.
- The repository has no licence file yet. The owners should choose one.

## What changed from the earlier prototype

The beta was cut down from the review prototype on 17/11/2026 to keep the first version simple. The Themes page and the News & Events page came out. The ten themes were an informal grouping of item tags, not a CGIAR taxonomy, so the site now browses by the program's five published areas of work. Funding calls and events need someone to keep them current, which can come back in a later version. People and projects were never shown, so they are not in the catalogue.
