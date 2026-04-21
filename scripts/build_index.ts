import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';
import { pipeline, env } from '@huggingface/transformers';
import { MCP_CONFIG } from '../mcp.config';

// 注入环境约束
env.localModelPath = MCP_CONFIG.ai.localModelPath;
env.allowRemoteModels = true;

const { size: CHUNK_SIZE, overlap: OVERLAP } = MCP_CONFIG.chunking;
const { localModel, dtype, pooling, normalize, dimensions } = MCP_CONFIG.ai;
const { inputs, outputs, namespaces } = MCP_CONFIG.build;

function hashText(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
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
    } catch (err) {
        // 目录可能尚未创建
    }
    return fileList;
}

function structuralChunkText(text: string, title: string, size: number) {
    const chunks: string[] = [];
    const lines = text.split('\n');
    let currentChunk = '';
    let currentChapter = '';
    let inCodeBlock = false;

    const commitChunk = () => {
        if (currentChunk.trim().length === 0) return;
        const prefix = `Context: [${title}] > [${currentChapter || 'Intro'}]\n\n`;
        const fullText = prefix + currentChunk.trim();
        
        let i = 0;
        while (i < fullText.length) {
            chunks.push(fullText.slice(i, i + size));
            i += size; // 结构化分片暂不强制overlap，保证纯净
        }
        currentChunk = '';
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
        }

        const isHeader = !inCodeBlock && /^#{2,3}\s+(.+)$/.test(line.trim());

        if (isHeader) {
            commitChunk();
            const match = line.trim().match(/^#{2,3}\s+(.+)$/);
            currentChapter = match ? match[1] : '';
        }

        currentChunk += line + '\n';

        if (currentChunk.length >= size * 2 && !inCodeBlock) {
             commitChunk();
        }
    }
    commitChunk();
    return chunks;
}

interface ManifestEntry {
    hash: string;
    chunk_ids: string[];
}

async function main() {
    console.log(`Building index from distribution output (${inputs.blogDir})...`);
    
    const stateDir = path.join(process.cwd(), 'state');
    const manifestPath = path.join(stateDir, 'manifest.json');
    let manifest: Record<string, ManifestEntry> = {};

    try {
        await fs.access(stateDir);
        const data = await fs.readFile(manifestPath, 'utf-8');
        manifest = JSON.parse(data);
        console.log(`Loaded state manifest with ${Object.keys(manifest).length} entries.`);
    } catch (e) {
        console.log('No state manifest found, initializing empty state.');
        await fs.mkdir(stateDir, { recursive: true });
    }

    try {
        await fs.access(inputs.blogDir);
        await fs.access(inputs.pagesDir);
    } catch (e) {
        console.error(`[Warn] Some distribution directories are missing. Proceeding with available files...`);
    }
    
    // 初始化特征提取管线（延迟加载由按需构建触发）
    let extractor: any = null;
    const getExtractor = async () => {
        if (!extractor) {
            console.log(`Loading embedding model (${localModel} to match Cloudflare Workers AI)...`);
            extractor = await pipeline('feature-extraction', localModel, { dtype: dtype as any });
        }
        return extractor;
    };
    
    const blogDir = path.join(process.cwd(), inputs.blogDir);
    const pagesDir = path.join(process.cwd(), inputs.pagesDir);
    
    const allFiles = [
        ...(await walkDir(blogDir)),
        ...(await walkDir(pagesDir))
    ];
    
    console.log(`Found ${allFiles.length} markdown files.`);

    const mcpDir = path.join(process.cwd(), outputs.mcpDir);
    await fs.mkdir(mcpDir, { recursive: true });

    const newManifest: Record<string, ManifestEntry> = {};
    const idsToDelete: string[] = [];

    const chunksJson = [];
    const indexJson = [];
    const vectorsNdjson = [];
    
    for (const file of allFiles) {
        const rawContent = await fs.readFile(file, 'utf-8');
        const parsed = matter(rawContent);
        
        const namespace = file.includes(`/${namespaces.blog}/`) || file.includes(`\\${namespaces.blog}\\`) 
            ? namespaces.blog 
            : namespaces.pages;
            
        const baseDir = namespace === namespaces.blog ? blogDir : pagesDir;
        // 使用相对路径保留子目录结构，并统一转换为正斜杠
        const filename = path.relative(baseDir, file)
            .replace(/\.(md|mdx)$/, '')
            .split(path.sep)
            .join('/');

        let { id } = parsed.data;
        if (!id) id = filename;

        const { ai, mcp } = parsed.data;
        if (ai?.searchable === false) continue;

        const currentHash = hashText(rawContent);

        const url = `/raw/${namespace}/${filename}.md`;
        const canonical_url = `/${namespace}/${filename}`;
        
        indexJson.push({
            id,
            title: parsed.data.title || path.basename(filename),
            url,
            canonical_url,
            namespace
        });

        // 对比 Hash
        if (manifest[id] && manifest[id].hash === currentHash) {
            // Unchanged file
            newManifest[id] = manifest[id];
            continue;
        }

        // Updated or New file
        if (manifest[id]) {
            // Existing file is updated
            idsToDelete.push(...manifest[id].chunk_ids);
        }

        const modelExtractor = await getExtractor();
        const textChunks = structuralChunkText(parsed.content || '', parsed.data.title || filename, CHUNK_SIZE);
        const newChunkIds: string[] = [];

        for (let i = 0; i < textChunks.length; i++) {
            const chunkId = `${id}-chunk-${i}`;
            const text = textChunks[i];
            
            newChunkIds.push(chunkId);
            
            const output = await modelExtractor(text, { pooling, normalize });
            const vector = Array.from(output.data);

            const chunkData = { id: chunkId, doc_id: id, text, tokens: text.length, url, namespace };
            chunksJson.push(chunkData);

            // Vectorize 强制要求 metadata 总大小不超过限制，保证 text 长度安全
            vectorsNdjson.push(JSON.stringify({
                id: chunkId,
                values: vector,
                metadata: { doc_id: id, url, canonical_url, namespace, text: text.slice(0, 8000) }
            }));
        }
        
        newManifest[id] = { hash: currentHash, chunk_ids: newChunkIds };
        console.log(`Processed ${file} -> ${textChunks.length} chunks`);
    }

    // 检查已删除的文件
    const currentDocIds = new Set(Object.keys(newManifest));
    for (const [oldId, oldData] of Object.entries(manifest)) {
        if (!currentDocIds.has(oldId)) {
            // 文件已被移除
            idsToDelete.push(...oldData.chunk_ids);
        }
    }

    // 写入 MCP 资源与向量库同步状态
    if (indexJson.length > 0)
        await fs.writeFile(path.join(mcpDir, outputs.indexFile), JSON.stringify(indexJson, null, 2));
    if (chunksJson.length > 0)
        await fs.writeFile(path.join(mcpDir, outputs.chunksFile), JSON.stringify(chunksJson, null, 2));
    
    // 如果没有增量数据，空写可能破坏 ndjson
    if (vectorsNdjson.length > 0) {
        await fs.writeFile(path.join(process.cwd(), outputs.vectorsFile), vectorsNdjson.join('\n'));
    } else {
        console.log('No vectors to update in this build run.');
        await fs.rm(path.join(process.cwd(), outputs.vectorsFile)).catch(() => {});
    }

    // 写入状态相关产物
    await fs.writeFile(manifestPath, JSON.stringify(newManifest, null, 2));
    await fs.writeFile(path.join(process.cwd(), 'deletions.json'), JSON.stringify(idsToDelete));

    console.log(`Generated ${chunksJson.length} NEW chunks.`);
    console.log(`Found ${idsToDelete.length} chunks to DELETE.`);
    console.log(`Success: MCP index build complete (Dimensions: ${dimensions}).`);
}

main().catch(console.error);
