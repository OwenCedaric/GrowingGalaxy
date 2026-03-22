import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import matter from 'gray-matter';

// Helper to remove emojis
function removeEmojis(str: string): string {
    return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F200}-\u{1F2FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
}

async function walkDir(dir: string, fileList: string[] = []) {
    try {
        const files = await fs.readdir(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);
            if (stat.isDirectory()) {
                await walkDir(filePath, fileList);
            } else if (filePath.endsWith('.md') || filePath.endsWith('.mdx')) {
                fileList.push(filePath);
            }
        }
    } catch (err) { }
    return fileList;
}

async function main() {
    const blogDir = path.join(process.cwd(), 'src/content/blog');
    const pagesDir = path.join(process.cwd(), 'src/content/pages');
    
    // Cleanup: Rename "copy" files if any
    const rawFiles = await walkDir(blogDir);
    for (const f of rawFiles) {
        if (f.includes(' copy.mdx')) {
            const newName = f.replace(' copy.mdx', '.mdx');
            try {
                await fs.access(newName);
                console.log('Skipping rename, target exists:', newName);
            } catch {
                await fs.rename(f, newName);
                console.log('Renamed:', f, '->', newName);
            }
        }
    }

    const allFiles = [
        ...(await walkDir(blogDir)),
        ...(await walkDir(pagesDir))
    ];

    for (const filePath of allFiles) {
        const raw = await fs.readFile(filePath, 'utf-8');
        const parsed = matter(raw);
        let updated = false;
        
        const namespace = filePath.includes('/blog/') || filePath.includes('\\blog\\') ? 'blog' : 'pages';
        const basename = path.basename(filePath, path.extname(filePath)).replace(' copy', '');
        
        // Remove emojis from Title and Description
        if (parsed.data.title) {
            const cleanTitle = removeEmojis(parsed.data.title).trim();
            if (cleanTitle !== parsed.data.title) {
                parsed.data.title = cleanTitle;
                updated = true;
            }
        }
        if (parsed.data.description) {
            const cleanDesc = removeEmojis(parsed.data.description).trim();
            if (cleanDesc !== parsed.data.description) {
                parsed.data.description = cleanDesc;
                updated = true;
            }
        }

        // MCP Meta updates
        if (!parsed.data.id || parsed.data.id.includes(' copy')) {
            parsed.data.id = basename;
            updated = true;
        }
        
        if (!parsed.data.ai) {
            parsed.data.ai = {};
        }

        if (parsed.data.ai.searchable === undefined) {
            parsed.data.ai.searchable = true;
            updated = true;
        }
        
        if (!parsed.data.ai.summary && parsed.data.description) {
            parsed.data.ai.summary = parsed.data.description;
            updated = true;
        }

        if (!parsed.data.ai.namespace) {
            parsed.data.ai.namespace = namespace;
            updated = true;
        }

        if (!parsed.data.mcp) {
            parsed.data.mcp = {
                priority: 'normal',
                exclude_sections: []
            };
            updated = true;
        } else if (!parsed.data.mcp.exclude_sections) {
            parsed.data.mcp.exclude_sections = [];
            updated = true;
        }
        
        if (!parsed.data.canonical_url || parsed.data.canonical_url.includes(' copy')) {
            parsed.data.canonical_url = `/${namespace}/${basename}`;
            updated = true;
        }

        if (updated) {
            const newContent = matter.stringify(parsed.content, parsed.data);
            await fs.writeFile(filePath, newContent, 'utf-8');
            console.log('Refined meta and removed emojis for:', filePath);
        }
    }
    console.log('Done refining content meta info.');
}

main().catch(console.error);
