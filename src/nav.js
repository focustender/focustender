// Hamburger menu for Work/Design on mobile/tablet (<1024px). Ceramics is
// delisted from nav for now (2026-08-19, Ian's call) but the page and its
// vite.config.js build entry are untouched, so relinking it later is just
// restoring the nav links, not rebuilding the page.
// The toggle itself doubles as open AND close control — no separate
// close button — its two bars morph into an X via CSS keyed off
// aria-expanded (see .nav__toggle-bar in base.css); the pill around
// them never changes shape. The nav row (sword + toggle) stays fixed in
// place and visible for as long as the menu is open — .nav--above-menu
// briefly lifts its z-index above #site-menu's so it paints on top —
// so there's nothing else to keep in sync with it: the menu itself is
// a curtain that slides down from behind that fixed row (see
// .site-menu in subpage.css) rather than drawing its own copy of the
// nav on a full-screen overlay.
//
// Only <main> gets .inert while the menu is open, not the whole .page
// — .nav lives inside .page too, and inerting the whole thing would
// make the toggle itself unclickable, breaking the only way to close
// the menu.
const toggle = document.querySelector(".nav__toggle");
const menu = document.getElementById("site-menu");

if (toggle && menu) {
  const nav = document.querySelector(".nav--overlay");
  const main = document.querySelector("main");

  function openMenu() {
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    nav.classList.add("nav--above-menu");
    nav.classList.remove("nav--scroll-hidden");
    main.inert = true;
    document.documentElement.style.overflow = "hidden";
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
  }

  function closeMenu() {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    nav.classList.remove("nav--above-menu");
    main.inert = false;
    document.documentElement.style.overflow = "";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    toggle.focus();
  }

  toggle.addEventListener("click", () => {
    if (menu.classList.contains("is-open")) closeMenu();
    else openMenu();
  });

  for (const link of menu.querySelectorAll(".site-menu__links a, .site-menu__contact")) {
    link.addEventListener("click", closeMenu);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      closeMenu();
    }
  });

  // Crossing into the desktop breakpoint (a window resize, not just
  // initial load) hides the toggle/menu via CSS but wouldn't otherwise
  // clear main.inert — without this, resizing up while the menu is
  // open would leave the real page permanently locked out even though
  // the menu that was blocking it is gone.
  const desktopQuery = window.matchMedia("(min-width: 1024px)");
  desktopQuery.addEventListener("change", (event) => {
    if (event.matches && menu.classList.contains("is-open")) closeMenu();
  });

  // ---- Scroll-fade for the closed nav row ----
  // Visible only at the very top of the page — any scroll away from
  // y=0, in either direction, fades it out. Never while the menu is
  // open, since the nav row is the only way to close it. Visual-only
  // effect: .nav--scroll-hidden's opacity rule is scoped to <1024px in
  // base.css, so this is a no-op at desktop even though the listener
  // itself isn't width-gated.
  window.addEventListener(
    "scroll",
    () => {
      if (menu.classList.contains("is-open")) return;
      nav.classList.toggle("nav--scroll-hidden", window.scrollY > 0);
    },
    { passive: true },
  );
}
