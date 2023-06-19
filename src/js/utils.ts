import { getCollection, CollectionEntry } from "astro:content";

export async function getSortedCharacters(): Promise<CollectionEntry<"characters">[]> {
  return (await getCollection("characters"))
    .sort((a, b) => (a.data.sortOrder || 10000) - (b.data.sortOrder || 10000));
}