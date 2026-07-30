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
  subpage.css         Work/Design/Ceramics banner + placeholder grid
assets/
  icon-star.svg        Star mark, extracted as vector from mobile.ai
  hero-bg.jpg           Hero background, cropped from the mockup export
  fonts/                PP Mori webfont files
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
a banner with a title and a blank grid. Those pages are scaffolded with the
same banner treatment and an empty responsive grid (`.grid` / `.grid__item`
in `subpage.css`) ready for real project content.
