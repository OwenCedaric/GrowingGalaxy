/// <reference types="astro/client" />
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import fs from 'node:fs/promises';
import path from 'node:path';
import { SITE_CONFIG } from '@/config';

export async function getStaticPaths() {
    const collectionsToExport = [
        { name: 'blog', baseDir: 'src/content/blog', entries: await getCollection('blog') },
        { name: 'pages', baseDir: 'src/content/pages', entries: await getCollection('pages') },
        { name: 'projects', baseDir: 'src/content/projects', entries: await getCollection('projects') },
        { name: 'traces', baseDir: 'src/content/traces', entries: await getCollection('traces') }
    ];

    const paths = [];

    for (const { name, baseDir, entries } of collectionsToExport) {
        for (const entry of entries) {
            let extension = '.md';
            if (entry.filePath && entry.filePath.endsWith('.mdx')) {
                extension = '.mdx';
            } else {
                try {
                    // Check if .mdx version exists
                    await fs.access(path.join(process.cwd(), baseDir, entry.id + '.mdx'));
                    extension = '.mdx';
                } catch (e) {
                    // Fallback to .md
                }
            }
            paths.push({
                params: { collection: name, slug: entry.id + extension },
                props: { entry, baseDir, collection: name, extension }
            });
        }
    }

    return paths;
}

export async function GET({ props }: APIContext) {
    const { entry, baseDir, collection, extension } = props;

    let content;

    try {
        const filePath = entry.filePath 
            ? path.join(process.cwd(), entry.filePath)
            : path.join(process.cwd(), baseDir, entry.id + extension);
        content = await fs.readFile(filePath, 'utf-8');
    } catch (e) {
        // Fallback for case-insensitive or slugified matches if needed, 
        // though getStaticPaths should have found the exact one.
        const dirPath = path.join(process.cwd(), baseDir);
        const files = await fs.readdir(dirPath);
        for (const file of files) {
            const clean1 = file.toLowerCase().replace(/[^a-z0-9]/g, '');
            const clean2 = (entry.id + extension).toLowerCase().replace(/[^a-z0-9]/g, '');
            if (clean1 === clean2) {
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
    let canonicalUrl: string;
    if (collection === 'blog') {
        canonicalUrl = `${site}/blog/${id}`;
    } else if (collection === 'traces') {
        canonicalUrl = `${site}/traces/${id}`;
    } else if (collection === 'projects') {
        canonicalUrl = `${site}/projects#${id}`;
    } else {
        canonicalUrl = `${site}/${id}`;
    }
    canonicalUrl = canonicalUrl.replace(/\/+/g, '/').replace(':/', '://');

    return new Response('\uFEFF' + supplementedContent, {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'X-Robots-Tag': 'noindex, follow',
            'Link': `<${canonicalUrl}>; rel="canonical"`
        }
    });
}
