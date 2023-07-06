import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from 'url';

const swup =
  import.meta.env.DEV
    ? fileURLToPath(new URL("./packages/swup/src/index.js", import.meta.url))
    : "swup";

const aliases = {
  swup,
  "@packages/*": "./packages/*",
}

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [mdx(), sitemap()],
  vite: {
    resolve: {
      alias: aliases
    },
  },
  trailingSlash: 'always',
});
