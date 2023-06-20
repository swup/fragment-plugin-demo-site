import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getCollection, CollectionEntry } from "astro:content";
import {icons, FeatherIconNames} from 'feather-icons';

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
 * Load the live version of the Swup initialization code
 */
export const loadSwupInitializationCode = (): string =>  {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const raw = fs.readFileSync(path.resolve(__dirname, '../js/global.ts'), 'utf8');
  const extract = raw.match(/\/\*\* PRINT START \*\*\/(.+)\/\*\* PRINT END \*\*\//s);
  if (!extract) return '';
  const swupCode = extract[1].trim();

  return `import Swup from "swup";

import SwupScrollPlugin from "@swup/scroll-plugin";
import SwupBodyClassPlugin from "@swup/body-class-plugin";
import SwupFragmentPlugin from "@swup/fragment-plugin";

${swupCode}`;
}