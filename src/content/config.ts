import { defineCollection, z } from 'astro:content';

const characters = defineCollection({
	// Type-check frontmatter using a schema
	schema: z.object({
		name: z.string(),
		color: z.string(),
		filters: z.array(z.string()),
		image: z.string(),
	}),
});

export const collections = { characters };
