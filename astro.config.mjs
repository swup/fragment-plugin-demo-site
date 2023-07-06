import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from "url";

const alias = {
  "@packages/*": "./packages/*",
};

const local = (path) => fileURLToPath(new URL(path, import.meta.url));

if (import.meta.env.DEV) {
  alias["swup"] = local("./packages/swup/src/index.js");
  alias["@swup/fragment-plugin"] = local(
    "./packages/fragment-plugin/src/index.js"
  );
}

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [mdx(), sitemap()],
  vite: {
    resolve: {
      alias,
    },
  },
  trailingSlash: "always",
});
