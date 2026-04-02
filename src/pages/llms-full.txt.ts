import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_CONFIG } from '../config';
import { getSlug } from '@/utils/slug';

export async function GET({ request }: APIContext) {
    const site = SITE_CONFIG.site;
    const blogs = await getCollection('blog');
    const pages = await getCollection('pages');
    const blogroll = await getCollection('blogroll');
    const photos = await getCollection('photos');

    const content = `# ${SITE_CONFIG.title} Full Content Index

> This manifest provides a comprehensive index of all content on ${SITE_CONFIG.title}, with links to both the web version and the raw markdown version for optimized AI consumption.

## Blog Posts

${blogs.map(entry => `- [${entry.data.title}](${site}/${getSlug(entry)}) ([Raw Markdown](${site}/raw/blog/${getSlug(entry)}.md))`).join('\n')}

## Pages

${pages.map(entry => `- [${entry.data.title}](${site}/${getSlug(entry)}) ([Raw Markdown](${site}/raw/pages/${getSlug(entry)}.md))`).join('\n')}

## Gallery & Photos (Web Only)

${photos.map(entry => `- [${entry.data.name}](${site}/gallery/2025/${getSlug(entry).toLowerCase()})`).join('\n')}

## Blogroll

${blogroll.map(entry => `- [${entry.data.name}](${entry.data.link})`).join('\n')}
`;

    return new Response(content, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8'
        }
    });
}
