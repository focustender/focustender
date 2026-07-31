// Wires the resume link on the Work page to whatever PDF is in
// assets/resume/ — drop a .pdf there and it's picked up automatically on
// the next build, no HTML edits needed. See assets/resume/README.md.
//
// query:"?url" is required here (unlike design.js's images) because Vite
// only treats common image/font/media extensions as assets by default —
// without it, a .pdf import would fail since Vite wouldn't know how to
// bundle it as a JS module.
const resumeFiles = import.meta.glob("/assets/resume/*.pdf", {
  eager: true,
  import: "default",
  query: "?url",
});

const link = document.querySelector(".resume-link");
const paths = Object.keys(resumeFiles).sort();

if (paths.length > 0) {
  link.href = resumeFiles[paths[0]];
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.removeAttribute("aria-disabled");
  link.innerHTML = 'Download PDF <span class="resume-link__arrow" aria-hidden="true">→</span>';
}
