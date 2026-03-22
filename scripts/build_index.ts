import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import matter from 'gray-matter';
import { pipeline, env } from '@huggingface/transformers';

// Use local model cache or download from HuggingFace
env.localModelPath = './models';
env.allowRemoteModels = true;

const CHUNK_SIZE = 500;
const OVERLAP = 50;

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
    } catch (err) {
        // Directory might not exist yet
    }
    return fileList;
}

function chunkText(text: string, size: number, overlap: number) {
    const chunks = [];
    let i = 0;
    while (i < text.length) {
        chunks.push(text.slice(i, i + size));
        if (i + size >= text.length) break;
        i += size - overlap;
    }
    return chunks;
}

async function main() {
    console.log('Loading embedding model (Xenova/bge-small-en-v1.5 to match Cloudflare Workers AI)...');
    // Using BGE small to match Cloudflare's @cf/baai/bge-small-en-v1.5 exactly!
    const extractor = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5', {
        dtype: 'fp32' // Use fp32 for consistency or let it auto-select
    });
    
    const blogDir = path.join(process.cwd(), 'src/content/blog');
    const pagesDir = path.join(process.cwd(), 'src/content/pages');
    
    const allFiles = [
        ...(await walkDir(blogDir)),
        ...(await walkDir(pagesDir))
    ];
    
    console.log(`Found ${allFiles.length} markdown files.`);

    const mcpDir = path.join(process.cwd(), 'public/mcp');
    await fs.mkdir(mcpDir, { recursive: true });

    const chunksJson = [];
    const indexJson = [];
    const vectorsNdjson = [];
    
    for (const file of allFiles) {
        const rawContent = await fs.readFile(file, 'utf-8');
        
        // Use the shared utility to supplement missing meta dynamically
        const { supplementMCPMeta } = await import('../src/utils/mcp-meta');
        const supplementedContent = supplementMCPMeta(rawContent, file);
        const parsed = matter(supplementedContent);
        
        const { id, ai, mcp } = parsed.data;
        
        if (ai?.searchable === false) continue;

        const namespace = file.includes('/blog/') || file.includes('\\blog\\') ? 'blog' : 'pages';
        const filename = path.basename(file).replace(/\.(md|mdx)$/, '');
        const url = `/raw/${namespace}/${filename}.md`;
        const canonical_url = `/${namespace}/${filename}`;
        
        indexJson.push({
            id,
            title: parsed.data.title || filename,
            url,
            canonical_url,
            namespace
        });

        const textChunks = chunkText(parsed.content || '', CHUNK_SIZE, OVERLAP);
        
        for (let i = 0; i < textChunks.length; i++) {
            const chunkId = `${id}-chunk-${i}`;
            const text = textChunks[i];
            
            // Extract embedding
            const output = await extractor(text, { pooling: 'mean', normalize: true });
            const vector = Array.from(output.data);

            const chunkData = {
                id: chunkId,
                doc_id: id,
                text,
                tokens: text.length,
                url,
                namespace,
            };

            chunksJson.push(chunkData);

            vectorsNdjson.push(JSON.stringify({
                id: chunkId,
                values: vector,
                metadata: {
                    doc_id: id,
                    url,
                    canonical_url,
                    namespace,
                    text: text.slice(0, 8000) 
                }
            }));
        }
        console.log(`Processed ${file} -> ${textChunks.length} chunks`);
    }

    await fs.writeFile(path.join(mcpDir, 'index.json'), JSON.stringify(indexJson, null, 2));
    await fs.writeFile(path.join(mcpDir, 'chunks.json'), JSON.stringify(chunksJson, null, 2));
    await fs.writeFile(path.join(process.cwd(), 'vectors.ndjson'), vectorsNdjson.join('\n'));

    console.log(`Generated ${chunksJson.length} chunks across ${indexJson.length} documents.`);
    console.log('Success: MCP index build complete.');
}

main().catch(console.error);
