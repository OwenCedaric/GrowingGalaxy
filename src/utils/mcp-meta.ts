import matter from 'gray-matter';
import { SITE_CONFIG } from '@/config';
import { MCP_CONFIG } from '@/../mcp.config';

export interface MCPMeta {
    id: string;
    ai?: {
        searchable?: boolean;
        chunk_size?: number;
        weight?: number;
        namespace?: string;
        summary?: string;
    };
    mcp?: {
        priority?: 'high' | 'normal' | 'low';
        exclude_sections?: string[];
    };
    canonical_url: string;
    raw_url: string;
}

/**
 * Supplements markdown content with MCP-specific metadata in frontmatter.
 * This is used for the raw file generation.
 */
export function supplementMCPMeta(content: string, slug: string, overrideNamespace?: string, extension: string = '.md'): string {
    const { data, content: body } = matter(content);

    // Detect namespace
    const detectedNamespace = (slug.includes('/') ? 'blog' : 'pages');
    const namespace = overrideNamespace || detectedNamespace;

    // Ensure ID is the full slug
    if (!data.id || data.id !== slug) {
        data.id = slug;
    }

    // Consolidate AI/MCP metadata
    if (!data.ai) data.ai = {};

    // Only include if NOT default
    if (data.ai.searchable === true) delete data.ai.searchable;
    if (data.ai.chunk_size === MCP_CONFIG.chunking.size) delete data.ai.chunk_size;
    if (data.ai.weight === 1) delete data.ai.weight;
    if (data.ai.namespace) delete data.ai.namespace; // Derivable from path

    // Deduplicate summary/description: remove ai.summary if it matches description
    if (data.ai.summary && data.ai.summary === data.description) {
        delete data.ai.summary;
    }

    // Clean up empty ai block
    if (Object.keys(data.ai).length === 0) delete data.ai;

    // Clean up default mcp block
    if (data.mcp) {
        if (data.mcp.priority === 'normal' && (!data.mcp.exclude_sections || data.mcp.exclude_sections.length === 0)) {
            delete data.mcp;
        }
    }

    // Both blog and pages are served at root /slug
    const urlNamespace = namespace === 'blog' ? 'blog' : '';
    const standardCanonical = `${SITE_CONFIG.site}/${urlNamespace}/${slug}`.replace(/\/+/g, '/').replace(':/', '://');
    const standardRaw = `${SITE_CONFIG.site}/raw/${namespace}/${slug}${extension}`.replace(/\/+/g, '/').replace(':/', '://');

    data.canonical_url = standardCanonical;
    data.raw_url = standardRaw;

    return matter.stringify(body, data);
}
