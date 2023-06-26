import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath, URL } from 'node:url';

const __FRAGMENT_PLUGIN_PATH__ =
  import.meta.env.DEV
    ? fileURLToPath(new URL("./packages/fragment-plugin/src/index.js", import.meta.url))
    : "@swup/fragment-plugin";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [mdx(), sitemap()],
  vite: {
    resolve: {
      alias: {
        "@packages/*": "./packages/*",
        __FRAGMENT_PLUGIN_PATH__
      },
    },
  },
});
