// @ts-check
import { defineConfig } from 'astro/config';
import { SITE_CONFIG } from "./src/config";
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcore from '@tailwindcss/vite';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
    site: SITE_CONFIG.site,
    integrations: [mdx({
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex]
    }), sitemap({
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