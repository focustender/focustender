// Auto-populates the Design page's masonry from assets/design/. Drop an
// image in that folder and it shows up here next time the site builds —
// no HTML edits needed. Sorted alphabetically by filename, so prefix
// filenames (01-, 02-, ...) to control display order.
// Extensions are listed in both cases because glob matching here is
// case-sensitive — phone/camera exports and some design tools save
// .JPG/.PNG (uppercase), which a lowercase-only pattern silently misses.
//
// query:"?url" is required (same reason as work.js's PDF glob): Vite's
// default assetsInclude — which decides "treat this as a raw asset" vs.
// "parse this as JS source" — is *also* case-sensitive and only lists
// lowercase extensions. Without ?url, matching an uppercase .JPG/.PNG
// makes Vite try to parse the raw image bytes as JavaScript, which
// crashes the dev server with an "invalid JS syntax" error rather than
// just quietly failing.
const images = import.meta.glob(
  "/assets/design/*.{jpg,jpeg,png,webp,gif,svg,JPG,JPEG,PNG,WEBP,GIF,SVG}",
  { eager: true, import: "default", query: "?url" },
);

const container = document.querySelector(".masonry");
const paths = Object.keys(images).sort();

if (paths.length === 0) {
  container.innerHTML = '<p class="empty-state">new work loading soon.</p>';
} else {
  for (const path of paths) {
    const filename = path.split("/").pop().replace(/\.[^.]+$/, "");
    const alt = filename.replace(/^\d+[-_]*/, "").replace(/[-_]+/g, " ");

    const img = document.createElement("img");
    img.src = images[path];
    img.alt = alt;
    img.loading = "lazy";
    img.className = "masonry__item";
    img.style.setProperty("--rotate", `${(Math.random() * 8 - 4).toFixed(2)}deg`);
    img.style.setProperty("--offset", `${Math.round(Math.random() * 24 - 12)}px`);

    container.appendChild(img);
  }
}
