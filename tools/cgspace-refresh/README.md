# CGSpace refresh

A small program that lives in this repository and, once a week on GitHub, reads the
newest open-access research outputs tagged Climate Action on
[CGSpace](https://cgspace.cgiar.org/) and keeps the list the site searches up to date.
It proposes; a person decides. Built 17/11/2026, widened to 300 items of four types
on 18/11/2026.

## What the site does with the list

The Publications & Tools page shows the hand-picked items in `assets/catalogue.js`, and
its result count says that a search reaches more ("37 hand-picked resources. Search to
include 300 more from CGSpace."). When someone searches, the results also include
matches from `assets/archive.js`: the newest 300 open-access journal articles, working
papers, reports and briefs tagged Climate Action on CGSpace, leaving out any already
hand-picked. They are listed after the hand-picked results, under "From CGSpace", each
labelled with its type and linking to its DOI, or to CGSpace when it has none. They are
never listed without a search, and they are not counted under an area of work, because
CGSpace does not record one.

For each item the file keeps the type, title, date, journal or publisher, link,
countries and regions, up to ten keywords, and the CGIAR centres among the authors'
affiliations. Author names are not kept.

## What happens each Monday

At 04:23 UTC (07:23 in Nairobi), GitHub runs `.github/workflows/cgspace-refresh.yml`, which:

1. runs the offline checks in `test.py`, and stops if any fails;
2. asks CGSpace's search for each of the four types in turn (CGSpace cannot combine
   them in one search), open access, tagged Climate Action, newest first, and keeps the
   newest 300 overall that have a date and are not already hand-picked;
3. if that list differs from `assets/archive.js`, rewrites the file and opens a pull
   request titled "CGSpace refresh: N added, N dropped, ...", with the added and dropped
   items listed in its description (an open one is updated rather than duplicated);
4. if CGSpace could not be read, or returned too few items to trust (under 100), changes
   nothing and opens an issue (or comments on the open one) saying so.

If nothing has changed, it does nothing. To have the pull requests and issues arrive by
email, watch the repository on GitHub (the Watch button, then "All Activity").

**Merging the pull request is what publishes.** GitHub Pages picks up the merge within a
minute or two, with nothing to run on a computer. To drop the whole update, close the pull
request. To keep one item out for good, the simplest route is to hand-pick it into
`catalogue.js` with a proper description, or to ask for an exclusion list to be added here.

You can also run it at any time: the repository's Actions tab, "CGSpace refresh",
"Run workflow".

## Running it on a computer

It needs Python 3.9 or later and nothing else. From the repository folder:

```
python3 tools/cgspace-refresh/test.py
python3 tools/cgspace-refresh/refresh.py
```

The report is then in `tools/cgspace-refresh/out/report.md`. On John's Mac,
"Refresh CGSpace list.command" (beside the site folder) does both and prints the report;
publishing is then a separate step. Use it when the GitHub run cannot reach CGSpace, or to
update the list straight away.

## One setting, once

Before the first run on GitHub: the repository's **Settings > Actions > General**, under
"Workflow permissions", turn on **"Allow GitHub Actions to create and approve pull
requests"**. If that box is greyed out, the CGIAR-Climate-Data-Hub organisation has it
switched off, and an organisation owner has to allow it first. Without it the
pull-request step fails with a permissions error.

GitHub pauses scheduled runs in a repository that has had no activity for 60 days, and
says so by email. Re-enable it from the Actions tab.

## What it does not do

- **It does not publish anything itself.** The only route to the site is a person merging
  (or, from a computer, a person publishing).
- **It does not write descriptions or choose areas of work.** Those stay with the
  hand-picked items.
- **It does not judge relevance.** It trusts CGSpace's Climate Action tag and type. Some
  tagged items are only loosely about climate; the pull request is the place to notice.
- **It does not ask much of CGSpace.** About ten requests a week, identified as
  `CGIAR-Climate-Action-Hub-cgspace-refresh`.

## Files

```
tools/cgspace-refresh/
  refresh.py       the run (Python 3.9 or later, standard library only)
  cgspace.py       choosing, tidying and writing the list, kept separate so it can be tested offline
  test.py          offline checks, including whole runs against fake CGSpaces, and that
                   assets/archive.js is in the format the run writes
  fixtures/        invented CGSpace answers for the checks (see fixtures/README.md)
  out/             the run's report and status, not committed
```

## Known limits

- Whether CGSpace answers requests from GitHub's servers is only known after the first
  run there. If that run opens a "could not finish" issue, CGSpace is most likely refusing
  them; the list on the site then stays as it is, and the refresh can be run from a
  computer instead.
- Which centres an item shows depends on how its affiliations are spelt on CGSpace. The
  names recognised are in `cgspace.py`; any other spelling counts as no centre.
