import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from "url";
import expressiveCode from "astro-expressive-code";
const local = path => fileURLToPath(new URL(path, import.meta.url));

/** @type {import('astro-expressive-code').AstroExpressiveCodeOptions} */
const expressiveCodeOptions = {
  frames: {
    styleOverrides: {
      tooltipSuccessBackground: '#60ddcd',
      tooltipSuccessForeground: 'black'
    }
  }
  // Example: Change the theme to "dracula"
  // theme: 'dracula',
}

// https://astro.build/config
export default defineConfig({
  site: "https://swup-fragment-plugin.netlify.app",
  integrations: [sitemap(), expressiveCode(expressiveCodeOptions), mdx()],
  vite: {
    resolve: {
      alias: {
        // swup: local("./packages/swup/src/index.js"),
        "@swup/fragment-plugin": local("./packages/fragment-plugin/src/index.js"),
        "@swup/parallel-plugin": local("./packages/parallel-plugin/src/index.js"),
        "@swup/debug-plugin": local("./packages/debug-plugin/src/index.js"),
      }
    }
  },
  trailingSlash: "always"
});