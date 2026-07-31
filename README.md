# focustender

Mobile-first site scaffolded from the Illustrator mockup, built with [Vite](https://vitejs.dev) (plain HTML/CSS/JS, no framework).

## Develop

```
npm install
npm run dev
```

## Build

```
npm run build
npm run preview   # check the production build locally
```

`dist/` is what gets deployed — do not edit it directly.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In the repo, go to **Settings → Pages → Source** and choose **GitHub Actions**.
3. Push to `main` — `.github/workflows/deploy.yml` builds and publishes automatically.

## Project structure

```
index.html          Home
work.html            Work
design.html          Design
ceramics.html        Ceramics
src/styles/
  variables.css       Design tokens (color, type scale, spacing, breakpoints)
  fonts.css           @font-face declarations
  base.css            Reset + shared nav/footer
  home.css            Home page hero + statement
  subpage.css         Work/Design/Ceramics page styles
src/
  design.js            Populates the Design masonry from assets/design/
  work.js               Wires the resume link on Work from assets/resume/
assets/
  focustendersword.svg Star mark, extracted as vector from mobile.ai
  hero-bg.jpg           Hero background, cropped from the mockup export
  fonts/                PP Mori webfont files
  resume/                Drop your resume .pdf here — see its README
  design/                Drop portfolio images here — see its README
```

You can preview the site by just opening `index.html` in a browser or with
a VS Code Live Server-style extension — all asset paths are relative, so no
dev server is required to look at it. `npm run dev` is still recommended
for real development (instant reload, matches the production build).

## Mobile-first / desktop scaffolding

All base styles target mobile. Desktop overrides live in `min-width` media
queries next to the styles they adjust (`768px` tablet, `1024px` desktop) —
see `variables.css` for the breakpoint reference. To design desktop, find
the relevant `@media (min-width: ...)` block in each stylesheet and fill it
in; no restructuring needed.

## Fonts

PP Mori is a licensed commercial typeface. The `.otf` files you provided
were converted to `.woff` (works everywhere, no extra build step needed).
For smaller `.woff2` files, once you have network access, run:

```
npx ttf2woff2 PPMori-Regular.otf > assets/fonts/PPMori-Regular.woff2
npx ttf2woff2 PPMori-Semibold.otf > assets/fonts/PPMori-Semibold.woff2
```

then add `woff2` `src` entries above the `woff` ones in `src/styles/fonts.css`.

## Work / Design / Ceramics pages

The mockup only fleshed out the home page — the other three artboards were
a banner with a title and a blank grid. The banner was dropped: the nav
already marks the current page, so repeating its label as a heading right
below it was redundant. Each page keeps a screen-reader-only `<h1>` for
accessibility even though no heading is shown visually. Beyond that, each
page is now different:

- **Work** — the actual resume, rendered as HTML (name, experience,
  education, skills, projects — References intentionally left off the
  public page). A small "Download PDF" link near the top is wired up the
  same way: `work.js` finds whatever `.pdf` is in `assets/resume/` (see
  that folder's README) and sets the link's `href` at build time; if no
  PDF is there yet, it renders disabled with "Résumé coming soon" instead
  of pointing nowhere.
- **Design** — a floating masonry of images. `design.js` auto-populates
  it from whatever's in `assets/design/` (see that folder's README) via
  Vite's `import.meta.glob`, so adding a portfolio image is just a file
  drop, no HTML edits. Each image gets a small random rotation/offset for
  the scattered look; if the folder's empty it shows a placeholder
  message instead. Run `npm run optimize:design` after adding new images
  and before deploying — see "Optimizing design images" below.
- **Ceramics** — a static "waiting on my kiln to fire." message
  (`.empty-state` in `subpage.css`) until there's real ceramics content
  to show.

Both `work.js` and `design.js` use `import.meta.glob` with `eager: true`
so the matched files are resolved and inlined/emitted at **build time**,
not fetched at runtime — this only works because it's a Vite build, and
is why `npm run build` (not just opening the HTML files directly) is
required to see real resume/image content reflected. Files under ~4KB get
inlined as base64 data URIs directly into the JS bundle; anything larger
is emitted as its own hashed file in `dist/assets/` — both cases work
correctly with no extra config, this project's `publicDir: false` setup
already treats `assets/` as processed source, not static passthrough.

Both globs also pass `query: "?url"` and list extensions in both cases
(`png`/`PNG`, etc.) — glob matching is case-sensitive, and phone/camera
exports commonly use uppercase extensions. Without `?url`, a matched
uppercase file crashes the Vite dev server outright ("invalid JS
syntax"), because Vite's own asset-type detection is *also*
case-sensitive and falls back to trying to parse the raw image/PDF bytes
as JavaScript. If you add support for a new file type to either glob,
keep both fixes (case variants + `?url`) or you'll hit the same crash.

## Optimizing design images

Phone photos and raw design-tool exports are often multiple MB each,
which is a lot of page weight for a masonry grid. `scripts/optimize-design-images.mjs`
(via `npm run optimize:design`) resizes everything in `assets/design/` to
a 2000px max dimension and converts it to `.webp` — typically 80-90%
smaller with no visible quality loss. Run it after dropping in new
images, before deploying. Originals are moved to `assets/design/_originals/`
(gitignored, kept locally as a backup) rather than deleted.
