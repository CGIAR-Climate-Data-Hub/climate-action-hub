# CGIAR Climate Hub

Hand-picked publications, tools and methods on climate from across CGIAR, each linked to where it is published. Renamed from "CGIAR Climate Action Hub" on 23/11/2026, when its scope widened from the Climate Action Science Program to climate work across CGIAR; the program's targets and five areas of work stay on the site, labelled as Climate Action's, and the web address is unchanged. Datasets are not listed here: they are on the [Climate Data Hub](https://cgiar-climate-data-hub.github.io/), and every page points to it, so the two sites do not catalogue the same things.

This is the beta of 17/11/2026: three pages of plain HTML, CSS and JavaScript. There is no build step, no server, no sign-in and no tracking. Open `index.html` in a browser and it works.

## Pages

| Page | Contents |
|---|---|
| `index.html` (Home) | Photograph, main heading and search, the program's published targets, three ways in (publications, tools and methods, and data on the Climate Data Hub), the five areas of work, the Climate Data Hub call-out, four featured tools, selected publications |
| `resources.html` (Publications & Tools) | The whole catalogue behind one search field and two filters, resource type and area of work. A search also reaches the newest 300 open-access research outputs on CGSpace under CGIAR's climate adaptation and mitigation impact area, from any CGIAR program (journal articles, working papers, reports and briefs), listed after the hand-picked results. The result count says so before anyone searches |
| `about.html` (About & Contact) | What the site is; climate at CGIAR, with a chart of where CGSpace climate research comes from by program or accelerator (counts refreshed with the CGSpace list); the Climate Action program, quoted from cgiar.org, with its targets and areas of work; a count of what is catalogued (worked out when the page loads); and how to get in touch |

The layout follows [gender.cgiar.org](https://gender.cgiar.org/): the logo in a header, a tab bar beneath it, an image-led hero and plain sections down the page.

Three link parameters work on Publications & Tools, so other pages can send people straight to a filtered list: `?q=` for a search, `?type=` for a resource type (`publication`, `method`, `innovation`) and `?aow=` for an area of work (`aow1` to `aow5`). For example, `resources.html?aow=aow2&type=method`.

## Files

```
index.html, resources.html, about.html
assets/catalogue.js    every hand-picked item, the five areas of work and the targets
assets/archive.js      the CGSpace research outputs that search also reaches; written by the refresh, not by hand
assets/app.js          puts the catalogue on the pages
assets/site.css        all the styles
assets/cgiar-logo.png  the CGIAR Climate Action logo, kept until an approved logo for the wider site is supplied
assets/img/            four photographs by John Choptiany (location data removed): two on Home, one each on Publications & Tools and About
assets/favicon.png, apple-touch-icon.png, social-card.jpg   tab icon, phone icon and the preview card for shared links
404.html               the page shown for a mistyped address (it works out where it is served from, so it works at any depth and on any domain)
tools/cgspace-refresh/ the weekly refresh of archive.js, with its own README
.github/workflows/     the schedule that runs it on GitHub each Monday
```

## Making changes

- To add or change a resource, edit `assets/catalogue.js`. The instructions are at the top of the file. Every count on the site is worked out from the catalogue when a page loads, so nothing else needs updating.
- Please leave `assets/archive.js` alone: each Monday a GitHub Action reads CGSpace again and, when the list has changed, opens a pull request with the new file. Merging it is what puts the change live. An item hand-picked into `catalogue.js` drops out of `archive.js` at the next refresh, so nothing is listed twice; an item listed in `tools/cgspace-refresh/exclude.txt` is never listed at all. The same refresh can be run on a computer with Python 3. See `tools/cgspace-refresh/README.md`.
- The header, tab bar and footer are repeated in each of the three HTML files, so a change to any of them has to be made in all three.
- The program's aim, targets and areas of work are taken word for word from the [Climate Action page on cgiar.org](https://www.cgiar.org/cgiar-research-portfolio-2025-2030/climate-action), last checked on 17/11/2026, and credited on the pages with a source link. If that page changes, update the text to match.
- Where a provider has not published a field (a tool's coverage, say), leave it empty. Please don't fill it with an estimate.
- Datasets go to the Climate Data Hub, not here. A tool or platform built on data (an atlas, a monitor, an advisory service) belongs here as `type: 'method'`.

## Publishing on GitHub Pages

In the repository, go to Settings, then Pages, and choose "Deploy from a branch" with `main` and `/ (root)`. The site then appears at `https://cgiar-climate-data-hub.github.io/climate-action-hub/`. Every link inside the site is relative, so it works at that address or at a custom domain. The empty `.nojekyll` file is there so that GitHub serves the files exactly as they are.

## Moving to an address of its own

The site works at any address: every link inside the pages is relative, and the 404 page works out where it is being served from (tested 23/11/2026 both under `/climate-action-hub/` and at the root of a domain). To serve it at, say, `climate.cgiar.org`, if that is the address chosen:

1. CGIAR IT adds a DNS record: a `CNAME` from the chosen name to `cgiar-climate-data-hub.github.io`.
2. An owner of the CGIAR-Climate-Data-Hub organisation verifies the domain for the organisation (organisation Settings, Pages, "Add a domain"), so that no one else can claim it.
3. In this repository, Settings, Pages, "Custom domain": enter the name and save. GitHub commits a `CNAME` file to `main`; the publish script takes that commit in before its next push. Tick "Enforce HTTPS" once GitHub has issued the certificate.
4. Replace `https://cgiar-climate-data-hub.github.io/climate-action-hub/` with the new address in the `og:url` and `og:image` lines of index.html, resources.html and about.html, and remove the `noindex` line from each page (see below).

The github.io address then forwards to the new one. The Climate Data Hub is the organisation's own site (`cgiar-climate-data-hub.github.io`): if it is given a domain first, this site moves under that domain at `/climate-action-hub/` until it has one of its own, and it works there too.

## Before the site is promoted

- `climate@cgiar.org` is the only contact address on the site. Please confirm someone reads it.
- There is a `<meta name="robots" content="noindex, nofollow">` line in each page, so search engines leave the beta alone. Remove that line from all three pages once the site is at its final address.
- There is no analytics. If visit counts are wanted to plan the next version, add a CGIAR-owned, cookie-free analytics account once the final address is known.
- The four photographs are John Choptiany's, used with his agreement and credited in the footer. Ask him before reusing them elsewhere.
- The "Sign in" link at the right of the tab bar opens the contact section. The internal operating system it is meant to lead to is not part of this site.
- The repository has no licence file yet. The owners should choose one.
- For the weekly CGSpace refresh to open pull requests, turn on Settings > Actions > General > "Allow GitHub Actions to create and approve pull requests" (an organisation owner may need to allow it first), then run it once from the Actions tab to confirm CGSpace answers GitHub's servers.

## What changed from the earlier prototype

The beta was cut down from the review prototype on 17/11/2026 to keep the first version simple. The Themes page and the News & Events page came out. The ten themes were an informal grouping built from item tags, so browsing is now by the program's five published areas of work. Funding calls and events need someone to keep them current, which can come back in a later version. People and projects were never shown, so they are not in the catalogue.
