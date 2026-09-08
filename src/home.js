// Landing page showcase: cycles through the 3 most recent Work projects
// (image, title, short description), auto-advancing on a timer with a
// clickable 3-dot indicator. Project data is shared with the Work page
// grid — see src/data/projects.js — so this list and Work's stay in sync
// automatically instead of drifting apart.
import { projects, photoUrl } from "./data/projects.js";

const RECENT_PROJECTS = projects.slice(0, 3);
const AUTO_ADVANCE_MS = 6000;

const projectLink = document.getElementById("landing-project");
const projectImage = document.getElementById("landing-project-image");
const projectTitle = document.getElementById("landing-project-title");
const projectDesc = document.getElementById("landing-project-desc");
const dotsContainer = document.getElementById("landing-dots");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let activeIndex = 0;
let timer = null;

const dots = RECENT_PROJECTS.map((project, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.className = "landing__dot";
  dot.setAttribute("role", "tab");
  dot.setAttribute("aria-label", `Show project ${index + 1}: ${project.title}`);
  dot.addEventListener("click", () => {
    showProject(index);
    restartTimer();
  });
  dotsContainer.appendChild(dot);
  return dot;
});

function showProject(index) {
  activeIndex = index;
  const project = RECENT_PROJECTS[index];

  projectLink.href = project.href;
  projectImage.src = project.image ? photoUrl(project.image) : "";
  projectImage.alt = project.title;
  projectTitle.textContent = project.title;
  projectDesc.textContent = project.description ?? "";

  dots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === index;
    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-selected", String(isActive));
  });
}

function advance() {
  showProject((activeIndex + 1) % RECENT_PROJECTS.length);
}

function restartTimer() {
  if (prefersReducedMotion || timer === null) return;
  clearInterval(timer);
  timer = setInterval(advance, AUTO_ADVANCE_MS);
}

showProject(0);

if (!prefersReducedMotion && RECENT_PROJECTS.length > 1) {
  timer = setInterval(advance, AUTO_ADVANCE_MS);
}
