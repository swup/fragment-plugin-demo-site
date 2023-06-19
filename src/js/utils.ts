import { getCollection, CollectionEntry } from "astro:content";

export async function getSortedCharacters(): Promise<CollectionEntry<"characters">[]> {
  let cache: CollectionEntry<"characters">[] | undefined;
  if (cache) return cache;

  const posts = (await getCollection("characters"))
    .sort((a, b) => (a.data.sortOrder || 10000) - (b.data.sortOrder || 10000));
  cache = posts;
  return posts;
}