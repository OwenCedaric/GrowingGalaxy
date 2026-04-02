import type { APIContext } from 'astro';
import { SITE_CONFIG } from '../config';

export async function GET({ request }: APIContext) {
    const site = SITE_CONFIG.site;
    const title = SITE_CONFIG.title;
    const description = SITE_CONFIG.description;

    const content = `# ${title}

> ${description}

## Core Resources

- [Homepage](${site}/)
- [Blog](${site}/blog)
- [Gallery](${site}/gallery)
- [About](${site}/about)

## LLM & AI Services

- [MCP Server](${site}/mcp) - Model Context Protocol entry point.
- [MCP Search](${site}/mcp/search) - Semantic search endpoint.
- [MCP Context](${site}/mcp/context) - Content retrieval endpoint.
- [LLMs Full Index](${site}/llms-full.txt) - Complete index of all documents with raw markdown links.

`;

    return new Response(content, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8'
        }
    });
}
