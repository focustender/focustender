# Design images

Drop image files here (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, or
`.svg`) and they'll automatically show up in the floating masonry layout
on the Design page next time the site builds — no code changes needed.

Images are sorted alphabetically by filename, so prefix them if you want
to control the order, e.g. `01-poster.jpg`, `02-branding.jpg`.

Non-image files (raw source files like `.ai`/`.psd`/`.fig`, or camera RAW
formats like `.dng`/`.cr2`) can live here too for safekeeping, but only
the extensions above actually render in the masonry — browsers can't
display RAW camera formats as images at all, so those need exporting to
a JPG/PNG first regardless.

Phone photos and raw exports are often several MB each. Before deploying,
run:

```
npm run optimize:design
```

from the project root — it resizes everything here to a 2000px max
dimension and converts it to `.webp` (usually 80-90% smaller, no visible
quality loss), moving the originals to `_originals/` as a backup rather
than deleting them.
