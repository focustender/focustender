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

// Golden-ratio spacing scale: base × φ⁰, ×φ¹, ×φ² (φ ≈ 1.618). Each item's
// margin-bottom is randomly drawn from this so the whitespace between
// images feels organic/varied but every value is still golden-ratio
// related rather than arbitrary — matches the .masonry column-gap base.
const GOLDEN_GAPS = ["3rem", "4.854rem", "7.854rem"];

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
    img.style.setProperty("--gap", GOLDEN_GAPS[Math.floor(Math.random() * GOLDEN_GAPS.length)]);

    container.appendChild(img);
  }

  // Fade in on scroll, except items already visible on page load — those
  // just appear immediately. IntersectionObserver's first callback
  // reports the current state of every newly-observed target (including
  // ones already in the viewport), so isInitialBatch distinguishes that
  // one-time initial report from a real scroll-triggered entry: for the
  // former, transitions are disabled right before adding .is-visible so
  // it snaps in instead of animating.
  let isInitialBatch = true;
  const observer = new IntersectionObserver((entries) => {
    const initial = isInitialBatch;
    isInitialBatch = false;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (initial) entry.target.style.transition = "none";
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });

  for (const img of container.querySelectorAll(".masonry__item")) {
    observer.observe(img);
  }
}
