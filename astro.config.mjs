import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from "url";

const local = (path) => fileURLToPath(new URL(path, import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [mdx(), sitemap()],
  vite: {
    resolve: {
      alias: {
        swup: local("./packages/swup/src/index.js"),
        "@swup/fragment-plugin": local(
          "./packages/fragment-plugin/src/index.js"
        ),
      },
    },
  },
  trailingSlash: "always",
});
