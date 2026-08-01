// Landing intro: on a visitor's first page load this tab session, the
// hero photo fills the viewport (see .hero-intro in home.css — that
// fullscreen starting state is plain CSS, not set here), then ~1s after
// the page finishes loading a clip-path shrinks the visible window down
// to the real .hero's spot and removes itself. The real .hero (photo +
// icon) renders normally in the document the whole time — it's just
// hidden behind the opaque overlay until that's removed, so there's no
// separate "reveal" animation to keep in sync for the photo itself.
//
// The statement's "focustender" word is the exception: home.css lifts it
// above the overlay (z-index) and starts it white, since the overlay
// covers it from frame one. As the clip-path shrinks toward the hero's
// resting spot — which sits above the statement — the photo's bottom
// edge rises past this word well before the shrink animation finishes,
// so waiting for transitionend to fade it to black would leave it
// invisible (white on the page's white background) for most of the
// shrink. Instead this polls the overlay's live clip-path every frame
// and flips the color the instant the photo's edge actually passes over
// the word — see parseInsetBottom below.
//
// Repeat loads within the same session are skipped: index.html's <head>
// has a blocking inline script that adds .no-hero-intro to <html>
// *before first paint* if sessionStorage already has the flag, and
// home.css hides .hero-intro (and un-whites .statement__brand) whenever
// that class is present. That check has to happen before this module
// runs (module scripts are deferred) or the fullscreen photo — and the
// white word — would flash for a frame on every repeat visit.
const overlay = document.querySelector(".hero-intro");
const hero = document.querySelector(".hero");
const brand = document.querySelector(".statement__brand");
const alreadyPlayed = document.documentElement.classList.contains("no-hero-intro");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// clip-path's computed value collapses to the shortest equivalent
// inset() form (same rule as margin/padding shorthand), so the bottom
// value isn't always at a fixed index — with 3 or 4 values it's index 2,
// with 1 or 2 values every side (or the top/bottom pair) shares index 0.
function parseInsetBottom(clipPathValue) {
  const match = clipPathValue.match(/inset\(([^)]*)\)/);
  if (!match) return 0;
  const nums = match[1].trim().split(/\s+/).map(parseFloat);
  return nums.length >= 3 ? nums[2] : nums[0];
}

if (!overlay || !hero || alreadyPlayed || prefersReducedMotion) {
  overlay?.remove();
} else {
  // Marked as played as soon as we commit to running it (not when it
  // finishes) — a visitor navigating away mid-animation still counts as
  // having seen it, so it won't replay on the way back.
  try {
    sessionStorage.setItem("heroIntroPlayed", "1");
  } catch {
    // Storage unavailable (e.g. private browsing) — animation still
    // plays fine, it just won't be remembered for the next page load.
  }

  window.addEventListener("load", () => {
    setTimeout(() => {
      const heroRect = hero.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // inset() order is top/right/bottom/left, each measured inward
      // from the corresponding viewport edge — this is what turns
      // "clip nothing" (fullscreen) into "clip everything outside
      // .hero's rect" over the transition.
      overlay.style.clipPath = `inset(${heroRect.top}px ${vw - heroRect.right}px ${vh - heroRect.bottom}px ${heroRect.left}px)`;

      if (brand) {
        // Fixed at load time since the real word doesn't move during
        // the animation — only the overlay's clip window does.
        const brandTop = brand.getBoundingClientRect().top;
        const pollUncovered = () => {
          if (!overlay.isConnected) return; // already removed (transitionend or safety net below)
          const bottomInset = parseInsetBottom(getComputedStyle(overlay).clipPath);
          if (vh - bottomInset <= brandTop) {
            brand.classList.add("is-settled");
            return;
          }
          requestAnimationFrame(pollUncovered);
        };
        requestAnimationFrame(pollUncovered);
      }

      // Safety net in case transitionend never fires (e.g. the tab was
      // backgrounded mid-animation) — don't leave the photo stuck
      // covering the page forever, or the word stuck white if the poll
      // above somehow never crossed its threshold first.
      setTimeout(() => {
        overlay.remove();
        brand?.classList.add("is-settled");
      }, 1500);
    }, 1000);
  });

  overlay.addEventListener("transitionend", (event) => {
    if (event.propertyName !== "clip-path") return;
    overlay.remove();
    brand?.classList.add("is-settled");
  });
}
