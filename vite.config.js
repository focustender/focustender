import { defineConfig } from "vite";
import { resolve } from "path";

// Relative base so the build works from any GitHub Pages path
// (username.github.io/repo-name/) without extra config.
export default defineConfig({
  base: "./",
  publicDir: false, // no /public dir — assets live in /assets and are processed like any other source file
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        work: resolve(__dirname, "work.html"),
        design: resolve(__dirname, "design.html"),
        ceramics: resolve(__dirname, "ceramics.html"),
      },
    },
  },
});
