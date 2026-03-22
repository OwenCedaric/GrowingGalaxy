// @ts-check
import { defineConfig } from 'astro/config';
import { SITE_CONFIG } from "./src/config";
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcore from '@tailwindcss/vite';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
    site: SITE_CONFIG.site,
    integrations: [mdx({
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex]
    }), sitemap(), react()],
    image: {
        domains: SITE_CONFIG.imageServer,
    },
    vite: {
        plugins: [tailwindcore()]
    }
});