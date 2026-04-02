import matter from 'gray-matter';
import { SITE_CONFIG } from '@/config';

export interface MCPMeta {
    id: string;
    ai: {
        searchable: boolean;
        chunk_size: number;
        weight: number;
        namespace: string;
        summary?: string;
    };
    mcp: {
        priority: string;
        exclude_sections: string[];
    };
    canonical_url: string;
    raw_url: string;
}

export function supplementMCPMeta(content: string, filePath: string, overrideNamespace?: string): string {
    const parsed = matter(content);
    const data = parsed.data;
    let updated = false;

    const basename = filePath.split(/[/\\]/).pop()?.replace(/\.(md|mdx)$/, '') || 'unknown';
    const detectedNamespace = filePath.includes('/blog/') || filePath.includes('\\blog\\') ? 'blog' : 'pages';
    const namespace = overrideNamespace || detectedNamespace;

    if (!data.id) {
        data.id = basename;
        updated = true;
    }

    if (!data.ai) {
        data.ai = {};
        updated = true;
    }

    if (data.ai.searchable === undefined) {
        data.ai.searchable = true;
        updated = true;
    }

    if (data.ai.chunk_size === undefined) {
        data.ai.chunk_size = 500;
        updated = true;
    }

    if (data.ai.weight === undefined) {
        data.ai.weight = 1.0;
        updated = true;
    }

    if (!data.ai.namespace || data.ai.namespace !== namespace) {
        data.ai.namespace = namespace;
        updated = true;
    }

    if (!data.ai.summary && data.description) {
        const cleanSummary = data.description.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F200}-\u{1F2FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
        data.ai.summary = cleanSummary;
        updated = true;
    }

    if (!data.mcp) {
        data.mcp = {
            priority: 'normal',
            exclude_sections: []
        };
        updated = true;
    } else {
        if (!data.mcp.priority) {
            data.mcp.priority = 'normal';
            updated = true;
        }
        if (!data.mcp.exclude_sections) {
            data.mcp.exclude_sections = [];
            updated = true;
        }
    }

    // Both blog and pages are served at root /slug
    const urlNamespace = (namespace === 'blog' || namespace === 'pages') ? '' : namespace;
    const standardCanonical = `${SITE_CONFIG.site}/${urlNamespace}/${basename}`.replace(/\/+/g, '/').replace(':/', '://');
    const standardRaw = `${SITE_CONFIG.site}/raw/${namespace}/${basename}.md`.replace(/\/+/g, '/').replace(':/', '://');
    
    if (!data.canonical_url || data.canonical_url !== standardCanonical) {
        data.canonical_url = standardCanonical;
        updated = true;
    }

    if (!data.raw_url || data.raw_url !== standardRaw) {
        data.raw_url = standardRaw;
        updated = true;
    }

    if (updated) {
        return matter.stringify(parsed.content, data);
    }

    return content;
}
