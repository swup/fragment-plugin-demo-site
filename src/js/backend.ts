import fs from "fs";
import { getCollection, CollectionEntry } from "astro:content";

/**
 * Get the characters, sorted, cached
 */
export async function getSortedCharacters(): Promise<CollectionEntry<"characters">[]> {
  let cache: CollectionEntry<"characters">[] | undefined;
  if (cache) return cache;

  const posts = (await getCollection("characters"))
    .sort((a, b) => (a.data.sortOrder || 10000) - (b.data.sortOrder || 10000));
  cache = posts;
  return posts;
}

/**
 * Get the filters, sorted, cached
 */
export async function getSortedFilters(): Promise<CollectionEntry<"filters">[]> {
  let cache: CollectionEntry<"filters">[] | undefined;
  if (cache) return cache;

  const posts = (await getCollection("filters"))
    .sort((a, b) => (a.data.sortOrder || 10000) - (b.data.sortOrder || 10000));
  cache = posts;
  return posts;
}

/**
 * Load the live version of the Swup transitions css
 */
export const loadSwupCSS = (): string =>  {
  const file = `${process.cwd()}/src/styles/inc/transitions.css`;
  return fs.readFileSync(file, 'utf8').split("/* cut */")[0].trim();
}

/**
 * Load the live version of the Swup initialization code
 */
export const loadSwupJS = (): string =>  {
  const file = `${process.cwd()}/src/js/global.ts`;
  const raw = fs.readFileSync(file, 'utf8');
  const extract = raw.match(/\/\*\* RULES START \*\*\/(.+)\/\*\* RULES END \*\*\//s);
  if (!extract) return '';
  const swupCode = extract[1].trim();

  return `import Swup from "swup";
import SwupFragmentPlugin, { Rule as FragmentRule } from "@swup/fragment-plugin";

${swupCode}

/**
 * Initialize Swup with Fragment Plugin
 */
const swup = new Swup({
  plugins: [
    new FragmentPlugin({ rules }),
  ],
});`;
}