import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import matter from 'gray-matter';
import { pipeline, env } from '@huggingface/transformers';
import { MCP_CONFIG } from '../mcp.config';

// 注入环境约束
env.localModelPath = MCP_CONFIG.ai.localModelPath;
env.allowRemoteModels = true;

const { size: CHUNK_SIZE, overlap: OVERLAP } = MCP_CONFIG.chunking;
const { localModel, dtype, pooling, normalize, dimensions } = MCP_CONFIG.ai;
const { inputs, outputs, namespaces } = MCP_CONFIG.build;

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
        // 目录可能尚未创建
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
    console.log(`Building index from distribution output (${inputs.blogDir})...`);
    
    // 检查目录是否存在
    try {
        await fs.access(inputs.blogDir);
        await fs.access(inputs.pagesDir);
    } catch (e) {
        console.error(`Error: Distribution directories not found. Did you run 'npm run build' first?`);
        process.exit(1);
    }

    console.log(`Loading embedding model (${localModel} to match Cloudflare Workers AI)...`);
    
    // 初始化特征提取管线
    const extractor = await pipeline('feature-extraction', localModel, { dtype });
    
    const blogDir = path.join(process.cwd(), inputs.blogDir);
    const pagesDir = path.join(process.cwd(), inputs.pagesDir);
    
    const allFiles = [
        ...(await walkDir(blogDir)),
        ...(await walkDir(pagesDir))
    ];
    
    console.log(`Found ${allFiles.length} markdown files.`);

    const mcpDir = path.join(process.cwd(), outputs.mcpDir);
    await fs.mkdir(mcpDir, { recursive: true });

    const chunksJson = [];
    const indexJson = [];
    const vectorsNdjson = [];
    
    for (const file of allFiles) {
        const rawContent = await fs.readFile(file, 'utf-8');
        const parsed = matter(rawContent);
        
        const { id, ai, mcp } = parsed.data;
        
        if (ai?.searchable === false) continue;

        // 根据路径分配命名空间
        const namespace = file.includes(`/${namespaces.blog}/`) || file.includes(`\\${namespaces.blog}\\`) 
            ? namespaces.blog 
            : namespaces.pages;
            
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
            
            // 严格应用池化和归一化契约
            const output = await extractor(text, { 
                pooling, 
                normalize 
            });
            const vector = Array.from(output.data);

            const chunkData = { id: chunkId, doc_id: id, text, tokens: text.length, url, namespace };
            chunksJson.push(chunkData);

            vectorsNdjson.push(JSON.stringify({
                id: chunkId,
                values: vector,
                metadata: { doc_id: id, url, canonical_url, namespace, text: text.slice(0, 8000) }
            }));
        }
        console.log(`Processed ${file} -> ${textChunks.length} chunks`);
    }

    // 写入文件
    await fs.writeFile(path.join(mcpDir, outputs.indexFile), JSON.stringify(indexJson, null, 2));
    await fs.writeFile(path.join(mcpDir, outputs.chunksFile), JSON.stringify(chunksJson, null, 2));
    await fs.writeFile(path.join(process.cwd(), outputs.vectorsFile), vectorsNdjson.join('\n'));

    console.log(`Generated ${chunksJson.length} chunks across ${indexJson.length} documents.`);
    console.log(`Success: MCP index build complete (Dimensions: ${dimensions}).`);
}

main().catch(console.error);
