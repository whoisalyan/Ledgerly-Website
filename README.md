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

## Cache policy, and why the filenames have hashes

`assets/screens/w/` holds the responsive variants the pages actually
reference, and each filename carries a hash of its own bytes:

```
sales-1000.b56899f4d0.webp
```

They are served `immutable` for a year, which is only safe *because* of
that hash. Earlier they were served `immutable` under stable filenames,
and correcting an image left every previous visitor looking at the old
one — the browser had been told there was no point checking. A hashed
name makes a changed image a new URL, so a fix always lands.

Everything unhashed — the source PNGs, `og-card.png`, `style.css`,
`app.js` and the HTML — is served `must-revalidate`, or a deployment
would be invisible to anyone who had already visited.

Two things to remember when editing this file:

- **`vercel.json` takes no comments and no extra keys.** A `comment`
  property inside a header rule fails schema validation and the whole
  deployment stops. Explanations belong here instead.
- **Keep the `source` patterns from overlapping.** When two rules matched
  the same path, the broader one won and a deliberately long cache came
  out as something else entirely.

### After changing any screenshot

```bash
python tools/optimise_screens.py       # in the application repo
python tools/apply_image_manifest.py   # rewrites the markup from the manifest
```

The second refuses to finish if any reference points at a file that is
not on disk, which is the failure a hand-edited hashed filename would
otherwise cause.
