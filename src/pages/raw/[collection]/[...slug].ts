/// <reference types="astro/client" />
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import fs from 'node:fs/promises';
import path from 'node:path';
import { SITE_CONFIG } from '@/config';

export async function getStaticPaths() {
    const blogs = await getCollection('blog');
    const pages = await getCollection('pages');

    const paths = [];

    // Blog entries
    for (const entry of blogs) {
        let extension = '.md';
        try {
            // Check if .mdx version exists
            await fs.access(path.join(process.cwd(), 'src/content/blog', entry.id + '.mdx'));
            extension = '.mdx';
        } catch (e) {
            // Fallback to .md (already set as default)
        }
        paths.push({
            params: { collection: 'blog', slug: entry.id + extension },
            props: { entry, baseDir: 'src/content/blog', collection: 'blog', extension }
        });
    }

    // Pages entries
    for (const entry of pages) {
        let extension = '.md';
        try {
            // Check if .mdx version exists
            await fs.access(path.join(process.cwd(), 'src/content/pages', entry.id + '.mdx'));
            extension = '.mdx';
        } catch (e) {
            // Fallback to .md
        }
        paths.push({
            params: { collection: 'pages', slug: entry.id + extension },
            props: { entry, baseDir: 'src/content/pages', collection: 'pages', extension }
        });
    }

    return paths;
}

export async function GET({ props }: APIContext) {
    const { entry, baseDir, collection, extension } = props;

    let content;

    try {
        const filePath = path.join(process.cwd(), baseDir, entry.id + extension);
        content = await fs.readFile(filePath, 'utf-8');
    } catch (e) {
        // Fallback for case-insensitive or slugified matches if needed, 
        // though getStaticPaths should have found the exact one.
        const dirPath = path.join(process.cwd(), baseDir);
        const files = await fs.readdir(dirPath);
        for (const file of files) {
            const slugified = file.toLowerCase().replace(/\s+/g, '-');
            if (slugified === (entry.id + extension).toLowerCase().replace(/\s+/g, '-')) {
                content = await fs.readFile(path.join(dirPath, file), 'utf-8');
                break;
            }
        }
    }

    if (!content) {
        return new Response('File not found', { status: 404 });
    }

    // Dynamically supplement missing MCP metadata to reduce human error
    const { supplementMCPMeta } = await import('@/utils/mcp-meta');
    const supplementedContent = supplementMCPMeta(content, entry.id, props.collection, extension);

    // Calculate canonical URL - should include full slug/id
    const site = SITE_CONFIG.site;
    const id = entry.id; // full relative path like "2026/foo"
    const urlNamespace = collection === 'blog' ? 'blog' : '';
    const canonicalUrl = `${site}/${urlNamespace}/${id}`.replace(/\/+/g, '/').replace(':/', '://');

    return new Response('\uFEFF' + supplementedContent, {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'X-Robots-Tag': 'noindex, follow',
            'Link': `<${canonicalUrl}>; rel="canonical"`
        }
    });
}
