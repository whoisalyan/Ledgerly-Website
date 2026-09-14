# Ledgerly website

The marketing site and user guide for [Ledgerly](https://github.com/whoisalyan/ledgerly),
a desktop bookkeeping and stock application for small businesses.

Live at <https://ledgerly-website-iota.vercel.app/>

## What is here

```
index.html            landing page
docs.html             the full user guide
assets/style.css      design tokens and layout
assets/app.js         screenshot tabs, lightbox, docs contents
assets/screens/       screenshots, generated from the real application
downloads/            the Windows installer, served directly
vercel.json           caching and security headers
```

No build step and no dependencies. It is four hand-written files plus
images, so it deploys as static hosting anywhere.

## Running it locally

```bash
python -m http.server 4000
```

Then open <http://localhost:4000>. Opening `index.html` straight from the
filesystem mostly works, but `file://` blocks some behaviour, so the
server is worth the one command.

## Updating the screenshots

They are generated, not taken by hand, so the site cannot drift away from
the application. From the Ledgerly application repository:

```bash
python tools/make_screenshots.py
```

That builds a throwaway database with demo data, drives the real UI, and
overwrites `assets/screens/`. Change a screen in the app, re-run it, and
the site is current.

## Releasing a new installer version

1. Build it in the application repository: `python tools/build.py`
2. Copy `dist/LedgerlySetup-<version>.exe` into `downloads/`
3. Update the version, size, SHA-256 and download link in `index.html`
   (the download section) and in `docs.html`
4. Delete the previous `.exe` so the repository does not accumulate them

### A note on committing the installer

The `.exe` is about 34 MB and lives in this repository so the download
works with no external dependency. Git stores binaries whole rather than
as diffs, so **every version committed adds another ~34 MB to the history
permanently** — deleting the file later does not reclaim it.

That is fine for a handful of releases. Past that, move the binaries to
GitHub Releases (or Vercel Blob) and point the download button at the
release URL instead.
