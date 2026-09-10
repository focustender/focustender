// Shared project data — single source of truth for both the Work page grid
// (src/work.js) and the landing page showcase (src/home.js). Extracted out
// of work.js so the two don't carry independent, driftable copies of the
// same title/image/href data.
//
// Photos are pulled via import.meta.glob rather than referenced as plain
// strings — same reasoning as design.js's image glob and the old work.js's
// resume-PDF glob (see CLAUDE.md): Vite only copies/rewrites assets it can
// see through static import syntax. A bare string like "assets/photos/x.webp"
// assigned to img.src at runtime is invisible to Vite's build, so the file
// silently never makes it into dist/ — caught here by checking dist/assets
// after a build, not by dev-server behavior (dev serves the repo directly,
// so a plain string still "works" there).
const photos = import.meta.glob("/assets/photos/*.{jpg,jpeg,png,webp,gif,JPG,JPEG,PNG,WEBP,GIF}", {
  eager: true,
  import: "default",
  query: "?url",
});

export function photoUrl(filename) {
  const entry = Object.entries(photos).find(([path]) => path.endsWith(`/${filename}`));
  return entry ? entry[1] : "";
}

// All 7 projects now have real pages on this site. Two (SQL Hospital
// Readmissions, Telehealth No-Show) don't have a visual asset — neither
// produced a dashboard, just notebooks/queries — so image stays null and
// renders a plain placeholder square (see work.js's renderGrid).
//
// `industries` is an array, not a single string — Subscription Economics
// is deliberately tagged both Business and Health (real business-metrics
// work, on a healthcare-adjacent subscription company), and a project
// legitimately spanning categories needed the data model to allow it.
//
// Order is maintained most-recent-first by hand (confirmed against git
// history where it's individually distinguishable) — the landing page's
// showcase relies on this, taking the first 3 as "most recent."
//
// `description` is only set on the first 3 entries — that's all the
// landing page showcase needs today. These are placeholder copy drafted
// from each project page's own summary paragraph; edit freely.
export const projects = [
  {
    title: "Coffee Wholesale Analytics",
    href: "project-coffee-wholesale-analytics.html",
    image: "CoffeeWholesaleProjectPhoto.jpeg",
    tools: ["Python", "HubSpot", "Shopify"],
    industries: ["Business"],
    description: "Not every at-risk account deserves the same response — segmented and verified live against a real CRM, not assumed from a spreadsheet.",
  },
  {
    title: "Fireclay Case Study",
    href: "project-trade-signal.html",
    image: "FireclayProjectPhoto.png",
    tools: ["Python", "Shopify", "HubSpot", "Salesforce", "Figma"],
    industries: ["Business"],
    description: "Finding the customer-journey stall — and shipping the fix, not just a slide.",
  },
  {
    title: "Subscription Economics",
    href: "project-subscription-economics.html",
    image: "himsLogoSquare.png",
    tools: ["Python"],
    industries: ["Business", "Health"],
    description: "Is Hims & Hers growing by adding subscribers, or by getting more from the ones it has?",
  },
  {
    title: "Facilities Maintenance Analytics",
    href: "project-facilities-maintenance.html",
    image: "grifolsFBM.jpg",
    tools: ["Python", "Tableau"],
    industries: ["Operations"],
    description: "Untangling technician performance from building-specific reliability problems.",
  },
  {
    title: "Hospital Readmissions & Utilization Risk",
    href: "project-hospital-readmissions.html",
    image: "hospitalReadmissionsAndUtilization.webp",
    tools: ["SQL"],
    industries: ["Health"],
  },
  {
    title: "Telehealth No-Show Prediction",
    href: "project-telehealth-noshow.html",
    image: "telehealthNoShowRezaGetty.webp",
    tools: ["Python"],
    industries: ["Health"],
  },
  {
    title: "Hospital Cost & Rurality Dashboard",
    href: "project-hospital-cost-dashboard.html",
    image: "hospitalCostDashboardSquare.png",
    tools: ["Tableau"],
    industries: ["Health"],
  },
  {
    title: "Drug Access & Affordability Forecasting",
    href: "project-drug-access-forecasting.html",
    image: "drugAccessDashboardSquare.png",
    tools: ["SQL", "Python", "Tableau"],
    industries: ["Health"],
  },
];
