/// <reference types="astro/client" />
import type { APIRoute } from 'astro';

const robotsTxt = `
User-agent: *
Allow: /

Sitemap: ${import.meta.env.SITE}/sitemap-index.xml
llms-txt: ${import.meta.env.SITE}/llms.txt
`.trim();

export const GET: APIRoute = () => {
    return new Response(robotsTxt, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
};
