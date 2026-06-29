// @ts-check
import { defineConfig } from 'astro/config';
import { SITE_CONFIG } from "./src/config";
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcore from '@tailwindcss/vite';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import matter from 'gray-matter';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeTracesBrutalism from './src/utils/rehype-traces-brutalism.ts';

/**
 * @param {Date | string | number | undefined} date
 * @returns {string | undefined}
 */
function formatDate(date) {
    if (!date) return undefined;
    const d = new Date(date);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString().split('T')[0];
}

/**
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function getFilesRecursive(dir) {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        /** @type {any[]} */
        const files = await Promise.all(entries.map(async (entry) => {
            const res = path.resolve(dir, entry.name);
            return entry.isDirectory() ? getFilesRecursive(res) : res;
        }));
        return files.flat();
    } catch {
        return [];
    }
}

/**
 * @param {string} dirPath
 * @returns {Promise<Date>}
 */
async function getLatestDateFromDir(dirPath) {
    let latest = new Date(0);
    try {
        const files = await getFilesRecursive(dirPath);
        for (const file of files) {
            if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
            const content = await fs.readFile(file, 'utf-8');
            const { data } = matter(content);
            const date = data.updatedDate || data.pubDate || data.date;
            if (date) {
                const d = new Date(date);
                if (d > latest) latest = d;
            }
        }
    } catch (e) {
        // ignore
    }
    return latest.getTime() > 0 ? latest : new Date();
}

/**
 * @param {string} collection
 * @param {string} slug
 * @returns {Promise<string | null>}
 */
async function findContentFile(collection, slug) {
    const possiblePaths = [
        path.join('src', 'content', collection, `${slug}.mdx`),
        path.join('src', 'content', collection, `${slug}.md`),
        path.join('src', 'content', collection, `${slug}/index.mdx`),
        path.join('src', 'content', collection, `${slug}/index.md`)
    ];
    for (const p of possiblePaths) {
        try {
            await fs.access(p);
            return p;
        } catch {
            // continue
        }
    }
    return null;
}

/**
 * @param {string} filePath
 * @param {string} collection
 * @param {string} defaultLastMod
 * @param {string} latestBlogDate
 * @param {string} latestGalleryDate
 * @param {string} latestTracesDate
 * @param {string} today
 * @returns {Promise<void>}
 */
async function processSitemapFile(filePath, collection, defaultLastMod, latestBlogDate, latestGalleryDate, latestTracesDate, today) {
    try {
        let xml = await fs.readFile(filePath, 'utf-8');

        // Regex to match <url>...</url> blocks
        const urlRegex = /<url>([\s\S]*?)<\/url>/gi;

        let updatedXml = xml;
        const urlBlocks = [];
        let match;
        while ((match = urlRegex.exec(xml)) !== null) {
            urlBlocks.push({
                full: match[0],
                inner: match[1]
            });
        }

        for (const block of urlBlocks) {
            const locMatch = /<loc>(.*?)<\/loc>/i.exec(block.inner);
            if (!locMatch) continue;

            const loc = locMatch[1];
            const urlObj = new URL(loc);
            const pathname = urlObj.pathname.replace(/\/$/, ''); // Remove trailing slash

            let lastmod = defaultLastMod;
            let imageTags = '';

            // Extract collection and slug from pathname
            let slug = '';
            let currentCollection = collection;

            if (pathname.startsWith('/blog/')) {
                currentCollection = 'blog';
                slug = pathname.substring(6);
            } else if (pathname.startsWith('/gallery/')) {
                currentCollection = 'photos';
                slug = pathname.substring(9);
            } else if (pathname.startsWith('/traces/')) {
                currentCollection = 'traces';
                slug = pathname.substring(8);
            } else if (pathname === '/blog' || pathname === '/blog/') {
                lastmod = latestBlogDate;
                slug = '';
            } else if (pathname === '/gallery' || pathname === '/gallery/') {
                lastmod = latestGalleryDate;
                slug = '';
            } else if (pathname === '/traces' || pathname === '/traces/') {
                lastmod = latestTracesDate;
                slug = '';
            } else if (pathname === '/blogroll' || pathname === '/search' || pathname === '') {
                slug = '';
            } else {
                currentCollection = 'pages';
                slug = pathname.substring(1);
            }

            if (slug) {
                const file = await findContentFile(currentCollection, slug);
                if (file) {
                    const content = await fs.readFile(file, 'utf-8');
                    const { data, content: body } = matter(content);

                    const date = data.updatedDate || data.pubDate || (data.baseline && data.baseline.date) || data.endDate || data.date;
                    if (date) {
                        const formatted = formatDate(date);
                        if (formatted) lastmod = formatted;
                    } else {
                        try {
                            const stat = await fs.stat(file);
                            const formatted = formatDate(stat.mtime);
                            if (formatted) lastmod = formatted;
                        } catch { }
                    }

                    // Add images
                    if (currentCollection === 'blog' && data.copyrightBg) {
                        imageTags = `<image:image><image:loc>${data.copyrightBg}</image:loc></image:image>`;
                    } else if (currentCollection === 'photos') {
                        // Parse body for markdown images
                        const imgRegex = /!\[.*?\]\((.*?)\)/g;
                        let imgMatch;
                        const images = [];
                        while ((imgMatch = imgRegex.exec(body)) !== null) {
                            images.push(imgMatch[1]);
                        }
                        if (images.length > 0) {
                            imageTags = images.map(imgUrl => `<image:image><image:loc>${imgUrl}</image:loc></image:image>`).join('');
                        }
                    }
                }
            }

            // Build the replacement url block
            let newInner = block.inner;

            // Ensure no duplicate lastmod
            newInner = newInner.replace(/<lastmod>.*?<\/lastmod>/gi, '');
            newInner += `<lastmod>${lastmod}</lastmod>`;

            if (imageTags) {
                newInner = newInner.replace(/<image:image>.*?<\/image:image>/gi, '');
                newInner += imageTags;
            }

            const replacement = `<url>${newInner}</url>`;
            updatedXml = updatedXml.replace(block.full, replacement);
        }

        await fs.writeFile(filePath, updatedXml, 'utf-8');
        console.log(`Successfully enriched sitemap: ${filePath}`);
    } catch (err) {
        console.error(`Error processing sitemap file ${filePath}:`, err);
    }
}

// https://astro.build/config
export default defineConfig({
    site: SITE_CONFIG.site,
    markdown: {
        processor: unified({
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex, rehypeTracesBrutalism]
        })
    },
    integrations: [mdx(), sitemap({
        chunks: {
            'blog': (item) => {
                const urlPath = new URL(item.url).pathname;
                if (urlPath === '/blog' || urlPath === '/blog/' || urlPath.startsWith('/blog/')) {
                    return item;
                }
                return undefined;
            },
            'gallery': (item) => {
                const urlPath = new URL(item.url).pathname;
                if (urlPath === '/gallery' || urlPath === '/gallery/' || urlPath.startsWith('/gallery/')) {
                    return item;
                }
                return undefined;
            },
            'traces': (item) => {
                const urlPath = new URL(item.url).pathname;
                if (urlPath === '/traces' || urlPath === '/traces/' || urlPath.startsWith('/traces/')) {
                    return item;
                }
                return undefined;
            }
        }
    }), react(), {
        name: 'sitemap-rename-integration',
        hooks: {
            'astro:build:done': async ({ dir }) => {
                const sitemapIndexPath = fileURLToPath(new URL('sitemap-index.xml', dir));
                const sitemapPath = fileURLToPath(new URL('sitemap.xml', dir));
                try {
                    await fs.rename(sitemapIndexPath, sitemapPath);
                    console.log('Successfully renamed sitemap-index.xml to sitemap.xml in astro:build:done hook');
                } catch (err) {
                    console.error('Error renaming sitemap index file:', err);
                }

                // Now run post-processing to enrich each sitemap chunk with lastmod and images
                try {
                    const today = formatDate(new Date()) || '';
                    const latestBlogDate = formatDate(await getLatestDateFromDir('src/content/blog')) || today;
                    const latestGalleryDate = formatDate(await getLatestDateFromDir('src/content/photos')) || today;
                    const latestTracesDate = formatDate(await getLatestDateFromDir('src/content/traces')) || today;

                    const blogSitemap = fileURLToPath(new URL('sitemap-blog-0.xml', dir));
                    const gallerySitemap = fileURLToPath(new URL('sitemap-gallery-0.xml', dir));
                    const tracesSitemap = fileURLToPath(new URL('sitemap-traces-0.xml', dir));
                    const defaultSitemap = fileURLToPath(new URL('sitemap-pages-0.xml', dir));

                    await processSitemapFile(blogSitemap, 'blog', today, latestBlogDate, latestGalleryDate, latestTracesDate, today);
                    await processSitemapFile(gallerySitemap, 'photos', today, latestBlogDate, latestGalleryDate, latestTracesDate, today);
                    await processSitemapFile(tracesSitemap, 'traces', today, latestBlogDate, latestGalleryDate, latestTracesDate, today);
                    await processSitemapFile(defaultSitemap, 'pages', today, latestBlogDate, latestGalleryDate, latestTracesDate, today);
                } catch (err) {
                    console.error('Error post-processing sitemap chunks:', err);
                }
            }
        }
    }],
    image: {
        domains: SITE_CONFIG.imageServer,
    },
    vite: {
        plugins: [tailwindcore()]
    }
});