import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from "url";
import expressiveCode, { type AstroExpressiveCodeOptions } from "astro-expressive-code";
const local = (path: string) => fileURLToPath(new URL(path, import.meta.url));

const expressiveCodeOptions: AstroExpressiveCodeOptions = {
  styleOverrides: {
    // tooltipSuccessBackground: '#60ddcd',
    // tooltipSuccessForeground: 'black'
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
        "@swup/fragment-plugin": local("./packages/fragment-plugin/src/index.js"),
      }
    }
  },
  trailingSlash: "always"
});