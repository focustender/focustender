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

    // Each item is a <button> wrapping the <img>, not a bare clickable
    // img — plain <img> elements aren't keyboard-focusable (no tabindex
    // by default), so without this a mouse click would work but keyboard
    // users couldn't reach it at all, and even the "return focus to the
    // thumbnail on close" behavior below would silently fail. The button
    // carries the accessible name (aria-label) and the img inside it is
    // marked alt="" so its filename-derived text isn't announced twice.
    const button = document.createElement("button");
    button.type = "button";
    button.className = "masonry__item";
    button.setAttribute("aria-label", `Expand image: ${alt}`);
    button.dataset.alt = alt;
    button.style.setProperty("--gap", GOLDEN_GAPS[Math.floor(Math.random() * GOLDEN_GAPS.length)]);
    button.addEventListener("click", () => openLightbox(button));

    const img = document.createElement("img");
    img.src = images[path];
    img.alt = "";
    img.loading = "lazy";
    img.className = "masonry__item-img";

    button.appendChild(img);
    container.appendChild(button);
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

// ---- Lightbox ----
// Click a masonry image to expand it over the whole page, with
// everything behind it (nav included) blurred via .page.is-blurred —
// see subpage.css. Single-image view only: no next/previous, closing
// just returns to the grid exactly where it was. function declarations
// are hoisted, so openLightbox can be referenced above in the click
// listener even though it's defined after the loop that adds it.
const lightbox = document.getElementById("lightbox");
const lightboxImage = lightbox.querySelector(".lightbox__image");
const lightboxClose = lightbox.querySelector(".lightbox__close");
const page = document.querySelector(".page");
let lastFocused = null;

function openLightbox(button) {
  lastFocused = button;
  lightboxImage.src = button.querySelector("img").src;
  lightboxImage.alt = button.dataset.alt;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  // .page.inert (not just the blur) is what actually stops the blurred
  // background from being clicked or tabbed into while it's open —
  // filter:blur() alone is only visual.
  page.classList.add("is-blurred");
  page.inert = true;
  document.documentElement.style.overflow = "hidden";
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  page.classList.remove("is-blurred");
  page.inert = false;
  document.documentElement.style.overflow = "";
  lastFocused?.focus();
}

lightboxClose.addEventListener("click", closeLightbox);

// Click anywhere in the lightbox that isn't the image itself (i.e. the
// blurred backdrop showing through around it) closes it.
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
    closeLightbox();
  }
});
