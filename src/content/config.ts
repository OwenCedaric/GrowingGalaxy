import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
    loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        author: z.string().optional(),
        copyrightBg: z.string().optional().nullable(),
        category: z.string(), // "Flavor"
        tags: z.array(z.string()).optional(),
        readingTime: z.string().optional(), // Now automated, but keeping as optional for override
        depth: z.string(), // e.g. "Beginner", "Intermediate", "Deep Dive" - "Cocktail Strength"
        copyright: z.object({
            enabled: z.boolean().optional(),
            declaration: z.string().optional(),
            proof: z.object({
                enabled: z.boolean().optional(),
                linkText: z.string().optional(),
                baseUrl: z.string().optional(),
                mode: z.enum(['static', 'dynamic']).optional(),
            }).optional(),
        }).optional(),
    }),
});

export { blog };

const pages = defineCollection({
    loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/pages" }),
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
    }),
});

const blogroll = defineCollection({
    loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blogroll" }),
    schema: z.object({
        name: z.string(),
        link: z.string().url(),
        avatar: z.string(),
        description: z.string(),
    }),
});

const photos = defineCollection({
    loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/photos" }),
    schema: z.object({
        name: z.string(),
        date: z.coerce.date(),
        author: z.string().optional(),
        location: z.string().optional(),
        tag: z.array(z.string()).optional(),
    }),
});

export const collections = { blog, pages, blogroll, photos };
