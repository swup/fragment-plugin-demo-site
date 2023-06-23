import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath, URL } from 'node:url';

const resolve = (path) => fileURLToPath(new URL(path, import.meta.url));

const __FRAGMENT_PLUGIN_PATH__ =
  import.meta.env.MODE === "development"
    ? resolve("./packages/fragment-plugin/src/index.js")
    : "@swup/fragment-plugin";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [mdx(), sitemap()],
  vite: {
    resolve: {
      alias: {
        __FRAGMENT_PLUGIN_PATH__
      },
    },
  },
});
