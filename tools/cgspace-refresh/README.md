# CGSpace refresh

A small program that lives in this repository and, once a week on GitHub, reads the
newest open-access journal articles tagged Climate Action on
[CGSpace](https://cgspace.cgiar.org/) and keeps the list the site searches up to date.
It proposes; a person decides. Built 17/11/2026.

## What the site does with the list

The Publications & Tools page shows the hand-picked items in `assets/catalogue.js`.
When someone searches, the results also include matches from `assets/archive.js`: the
newest 100 open-access journal articles tagged Climate Action on CGSpace, leaving out any
already hand-picked. They are listed after the hand-picked results, under "From CGSpace",
each linking to its publisher. They are never listed without a search, and they are not
counted under an area of work, because CGSpace does not record one.

For each article the file keeps the title, date, journal, link (the DOI, or the CGSpace
handle when there is no DOI), countries and regions, up to ten keywords, and the CGIAR
centres among the authors' affiliations. Author names are not kept.

## What happens each Monday

At 04:23 UTC (07:23 in Nairobi), GitHub runs `.github/workflows/cgspace-refresh.yml`, which:

1. runs the offline tests in `test.mjs`, and stops if any fails;
2. asks CGSpace's search for open-access journal articles tagged Climate Action, newest
   first, and keeps the newest 100 that have a date and are not already hand-picked;
3. if that list differs from `assets/archive.js`, rewrites the file and opens a pull
   request titled "CGSpace refresh: N added, N dropped, ...", with the added and dropped
   articles listed in its description (an open one is updated rather than duplicated);
4. if CGSpace could not be read, or returned too few articles to trust (under 40), changes
   nothing and opens an issue (or comments on the open one) saying so.

If nothing has changed, it does nothing. To have the pull requests and issues arrive by
email, watch the repository on GitHub (the Watch button, then "All Activity").

**Merging the pull request is what publishes.** GitHub Pages picks up the merge within a
minute or two, with nothing to run on a computer. To drop the whole update, close the pull
request. To keep one article out for good, the simplest route is to hand-pick it into
`catalogue.js` with a proper description, or to ask for an exclusion list to be added here.

You can also run it at any time: the repository's Actions tab, "CGSpace refresh",
"Run workflow".

## One setting, once

Before the first run: on GitHub, the repository's **Settings > Actions > General**, under
"Workflow permissions", turn on **"Allow GitHub Actions to create and approve pull
requests"**. If that box is greyed out, the CGIAR-Climate-Data-Hub organisation has it
switched off, and an organisation owner has to allow it first. Without it the
pull-request step fails with a permissions error.

GitHub pauses scheduled runs in a repository that has had no activity for 60 days, and
says so by email. Re-enable it from the Actions tab.

## What it does not do

- **It does not publish anything itself.** The only route to the site is a person merging.
- **It does not write descriptions or choose areas of work.** Those stay with the
  hand-picked items.
- **It does not judge relevance.** It trusts CGSpace's Climate Action tag. Some tagged
  articles are only loosely about climate; the pull request is the place to notice.
- **It does not ask much of CGSpace.** One or two requests a week, identified as
  `CGIAR-Climate-Action-Hub-cgspace-refresh`.

## Files

```
tools/cgspace-refresh/
  refresh.mjs      the weekly run (Node 20 or later, no packages to install)
  lib.mjs          choosing, tidying and writing the list, kept separate so it can be tested offline
  test.mjs         offline checks, including that assets/archive.js is in the format the run writes
  fixtures/        invented CGSpace answers for the tests (see fixtures/README.md)
  out/             the run's report and status, not committed
```

To run it on a computer with Node 20 or later and internet access, from the repository
folder: `node tools/cgspace-refresh/test.mjs`, then `node tools/cgspace-refresh/refresh.mjs`.

## Known limits

- The first list, of 17/11/2026, was read through a browser, because CGSpace could not be
  reached from where the site was built. Whether CGSpace answers requests from GitHub's
  servers is only known after the first run. If that run opens a "could not finish" issue,
  CGSpace is most likely refusing them; the list on the site then stays as it is.
- Which centres an article shows depends on how its affiliations are spelt on CGSpace. The
  names recognised are in `lib.mjs`; any other spelling counts as no centre.
