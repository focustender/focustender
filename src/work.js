// Work page: filterable project grid, image-forward cards (modeled on a
// reference agency site's Work page structure — filters above, image +
// title + tag pills per card, a dynamic page title, and removable
// active-filter chips). Data-driven rather than hand-authored HTML per
// tile: the Tools/Industry filter facets are derived from this same
// array, so adding a project here automatically keeps the filter lists
// in sync instead of risking the two drifting apart.
//
// Photos are pulled via import.meta.glob rather than referenced as
// plain strings — same reasoning as design.js's image glob and the old
// work.js's resume-PDF glob (see CLAUDE.md): Vite only copies/rewrites
// assets it can see through static import syntax. A bare string like
// "assets/photos/x.webp" assigned to img.src at runtime is invisible to
// Vite's build, so the file silently never makes it into dist/ — caught
// here by checking dist/assets after a build, not by dev-server behavior
// (dev serves the repo directly, so a plain string still "works" there).
const photos = import.meta.glob("/assets/photos/*.{jpg,jpeg,png,webp,gif,JPG,JPEG,PNG,WEBP,GIF}", {
  eager: true,
  import: "default",
  query: "?url",
});

function photoUrl(filename) {
  const entry = Object.entries(photos).find(([path]) => path.endsWith(`/${filename}`));
  return entry ? entry[1] : "";
}

// All 5 projects now have real pages on this site. Two (SQL Hospital
// Readmissions, Telehealth No-Show) don't have a visual asset — neither
// project produced a dashboard, just notebooks/queries — so image stays
// null and renders a plain placeholder square (see renderGrid).
const projects = [
  {
    title: "Facilities Maintenance Analytics",
    href: "project-facilities-maintenance.html",
    image: "grifolsFBM.webp",
    tools: ["Python", "Tableau"],
    industry: "Operations",
  },
  {
    title: "Hospital Readmissions & Utilization Risk",
    href: "project-hospital-readmissions.html",
    image: null,
    tools: ["SQL"],
    industry: "Health",
  },
  {
    title: "Telehealth No-Show Prediction",
    href: "project-telehealth-noshow.html",
    image: null,
    tools: ["Python"],
    industry: "Health",
  },
  {
    title: "Hospital Cost & Rurality Dashboard",
    href: "project-hospital-cost-dashboard.html",
    image: "hospitalCostDashboardSquare.png",
    tools: ["Tableau"],
    industry: "Health",
  },
  {
    title: "Drug Access & Affordability Forecasting",
    href: "project-drug-access-forecasting.html",
    image: "drugAccessDashboardSquare.png",
    tools: ["SQL", "Python", "Tableau"],
    industry: "Health",
  },
];

const DEFAULT_TITLE = "All Work";

const grid = document.getElementById("work-grid");
const toolsList = document.getElementById("filter-tools");
const industryList = document.getElementById("filter-industry");
const titleEl = document.getElementById("work-title");
const activeFiltersEl = document.getElementById("active-filters");

const allTools = [...new Set(projects.flatMap((p) => p.tools))].sort();
const allIndustries = [...new Set(projects.map((p) => p.industry))].sort();

const activeTools = new Set();
const activeIndustries = new Set();
// Ordered list of every currently-active filter, most-recently-activated
// last — drives both the dynamic <h1> (shows the last entry) and the
// active-filter chip row (shows all of them). A plain Set doesn't
// preserve "which one was clicked most recently" once a value is
// removed and re-added, hence a separate ordered array rather than
// deriving order from activeTools/activeIndustries directly.
const activeOrder = [];

// Keyed by "group:value" so a Tools "Tableau" and an Industry "Tableau"
// (hypothetically) can't collide — filter button elements are looked up
// here when a chip's remove control needs to flip the matching button
// back to unpressed.
const filterButtons = new Map();

function renderFilterGroup(container, values, group, activeSet) {
  for (const value of values) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "work-filter";
    button.textContent = value;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => toggleFilter(group, value, activeSet, button));
    li.appendChild(button);
    container.appendChild(li);
    filterButtons.set(`${group}:${value}`, button);
  }
}

// Chip DOM nodes are created once per activation and only ever removed
// on their own deactivation — never wiped and rebuilt wholesale — so an
// existing chip is never touched (and never re-fades) just because some
// other filter was toggled elsewhere.
const chipElements = new Map();

function deactivateFilter(entry) {
  const activeSet = entry.group === "tools" ? activeTools : activeIndustries;
  filterButtons.get(entry.key)?.setAttribute("aria-pressed", "false");
  activeSet.delete(entry.value);
  const index = activeOrder.findIndex((e) => e.key === entry.key);
  if (index !== -1) activeOrder.splice(index, 1);
  removeChip(entry.key);
}

function toggleFilter(group, value, activeSet, button) {
  const key = `${group}:${value}`;
  const pressed = button.getAttribute("aria-pressed") === "true";

  if (pressed) {
    deactivateFilter({ key, group, value });
  } else {
    // Industry is single-select, not multi — every project has exactly
    // one industry, so unlike Tools (where OR-ing multiple values is a
    // real, useful combination), showing more than one industry active
    // at once doesn't add anything and just looks like a bug. Clear any
    // other active industry before activating this one.
    if (group === "industry") {
      for (const entry of activeOrder.filter((e) => e.group === "industry")) {
        deactivateFilter(entry);
      }
    }
    button.setAttribute("aria-pressed", "true");
    activeSet.add(value);
    const entry = { key, group, value };
    activeOrder.push(entry);
    addChip(entry);
  }

  updateTitle();
  applyFilters();
}

// Title reflects Industry specifically, not "whatever was clicked last"
// — a Tools click updates the chip row and the grid, but leaves the
// title alone.
function updateTitle() {
  const industryEntries = activeOrder.filter((entry) => entry.group === "industry");
  titleEl.textContent = industryEntries.length > 0 ? industryEntries[industryEntries.length - 1].value : DEFAULT_TITLE;
}

function addChip(entry) {
  const chip = document.createElement("span");
  chip.className = "work-active-filter";
  // Start transparent, flip to opaque on the next frame — setting both
  // in the same tick would never actually animate, the browser needs a
  // paint in between to register the starting state before the
  // transition can run.
  chip.style.opacity = "0";

  const label = document.createElement("span");
  label.textContent = entry.value;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "work-active-filter__remove";
  remove.setAttribute("aria-label", `Remove ${entry.value} filter`);
  remove.textContent = "×";
  remove.addEventListener("click", () => {
    const activeSet = entry.group === "tools" ? activeTools : activeIndustries;
    const button = filterButtons.get(entry.key);
    toggleFilter(entry.group, entry.value, activeSet, button);
  });

  chip.append(label, remove);
  activeFiltersEl.appendChild(chip);
  chipElements.set(entry.key, chip);

  requestAnimationFrame(() => {
    chip.style.opacity = "1";
  });
}

function removeChip(key) {
  chipElements.get(key)?.remove();
  chipElements.delete(key);
}

function renderGrid() {
  for (const project of projects) {
    const tile = document.createElement("a");
    tile.href = project.href;
    // GitHub links leave the site; the one page that lives here doesn't.
    if (project.href.startsWith("http")) {
      tile.target = "_blank";
      tile.rel = "noopener noreferrer";
    }
    tile.className = "work-tile";
    tile.dataset.tools = project.tools.join(",");
    tile.dataset.industry = project.industry;

    const media = document.createElement("div");
    media.className = "work-tile-media";
    // No photo yet for most projects — leave the media box empty, its
    // own background color (see project.css) renders as a plain
    // placeholder square rather than a broken image icon.
    if (project.image) {
      const img = document.createElement("img");
      img.src = photoUrl(project.image);
      img.alt = "";
      img.loading = "lazy";
      media.appendChild(img);
    }

    const title = document.createElement("h2");
    title.className = "work-tile__title";
    title.textContent = project.title;

    const tags = document.createElement("div");
    tags.className = "work-tile__tags";
    for (const label of [...project.tools, project.industry]) {
      const tag = document.createElement("span");
      tag.className = "work-tile__tag";
      tag.textContent = label;
      tags.appendChild(tag);
    }

    tile.append(media, title, tags);
    grid.appendChild(tile);
  }
}

// Only tiles that actually transition from hidden to visible get the
// fade-in — a tile that was already showing (and still matches) is
// left completely untouched, so it doesn't "refresh" again just because
// some other tile's visibility changed.
function applyFilters() {
  for (const tile of grid.querySelectorAll(".work-tile")) {
    const tileTools = tile.dataset.tools.split(",");
    const tileIndustry = tile.dataset.industry;

    const matchesTools = activeTools.size === 0 || tileTools.some((t) => activeTools.has(t));
    const matchesIndustry = activeIndustries.size === 0 || activeIndustries.has(tileIndustry);
    const shouldShow = matchesTools && matchesIndustry;

    if (shouldShow && tile.hidden) {
      tile.hidden = false;
      tile.style.opacity = "0";
      requestAnimationFrame(() => {
        tile.style.opacity = "1";
      });
    } else if (!shouldShow) {
      tile.hidden = true;
    }
  }
}

if (projects.length === 0) {
  grid.innerHTML = '<p class="empty-state">new work loading soon.</p>';
} else {
  renderFilterGroup(toolsList, allTools, "tools", activeTools);
  renderFilterGroup(industryList, allIndustries, "industry", activeIndustries);
  renderGrid();
}
