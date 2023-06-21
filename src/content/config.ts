import { defineCollection, z } from 'astro:content';

const characters = defineCollection({
	// Type-check frontmatter using a schema
	schema: z.object({
		name: z.string(),
		color: z.string(),
		filters: z.array(z.string()),
		image: z.string(),
		sortOrder: z.number().optional()
	}),
});

const filters = defineCollection({
	// Type-check frontmatter using a schema
	schema: z.object({
		name: z.string(),
		sortOrder: z.number().optional()
	}),
});

export const collections = { characters, filters };
