
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getSlug } from '@/utils/slug';

export async function getStaticPaths() {
    const blogs = await getCollection('blog');
    const pages = await getCollection('pages');



    const paths = [
        ...blogs.map(entry => ({
            params: { collection: 'blog', slug: getSlug(entry) },
            props: { entry, baseDir: 'src/content/blog' }
        })),
        ...pages.map(entry => ({
            params: { collection: 'pages', slug: getSlug(entry) },
            props: { entry, baseDir: 'src/content/pages' }
        }))
    ];

    return paths;
}

export async function GET({ props }: APIContext) {
    const { entry, baseDir } = props;

    // Try to find the file
    // entry.id might vary based on loader configuration. 
    // We try exact match first, then extensions.
    const extensions = ['', '.md', '.mdx'];
    let content;

    for (const ext of extensions) {
        try {
            const filePath = path.join(process.cwd(), baseDir, entry.id + ext);
            content = await fs.readFile(filePath, 'utf-8');
            break;
        } catch (e) {
            continue;
        }
    }

    if (!content) {
        // Fallback: search directory for matching slug (handles spaces vs dashes)
        try {
            const dirPath = path.join(process.cwd(), baseDir);
            const files = await fs.readdir(dirPath);
            for (const file of files) {
                // simple slugify: lowercase and replace spaces with dashes
                const slugified = file.replace(/\.[^/.]+$/, "").toLowerCase().replace(/\s+/g, '-');
                if (slugified === entry.id) {
                    content = await fs.readFile(path.join(dirPath, file), 'utf-8');
                    break;
                }
            }
        } catch (e) {
            // ignore
        }
    }

    if (!content) {
        return new Response('File not found', { status: 404 });
    }

    // Dynamically supplement missing MCP metadata to reduce human error
    const { supplementMCPMeta } = await import('@/utils/mcp-meta');
    const supplementedContent = supplementMCPMeta(content, entry.id, props.collection);

    return new Response('\uFEFF' + supplementedContent, {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'X-Robots-Tag': 'noindex, follow',
        }
    });
}
