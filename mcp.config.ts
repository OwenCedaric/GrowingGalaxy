export const MCP_CONFIG = {
  server: {
    name: 'growing-galaxy-mcp',
    version: '1.4.0',
    protocolVersion: '2024-11-05'
  },
  ai: {
    localModel: 'Xenova/bge-m3',
    cloudflareModel: '@cf/baai/bge-m3',
    dimensions: 1024,
    localModelPath: './models',
    dtype: 'fp32',
    // 强制约束两端的张量降维与归一化机制
    pooling: 'cls',
    normalize: true,
    metric: 'cosine'
  },
  chunking: {
    size: 500,
    overlap: 50
  },
  search: {
    defaultTopK: 5
  },
  build: {
    inputs: {
      blogDir: 'dist/raw/blog',
      pagesDir: 'dist/raw/pages'
    },
    outputs: {
      mcpDir: 'public/mcp',
      vectorsFile: 'vectors.ndjson',
      indexFile: 'index.json',
      chunksFile: 'chunks.json'
    },
    namespaces: {
      blog: 'blog',
      pages: 'pages'
    }
  },
  routes: {
    base: '/mcp',
    version: '/mcp/version',
    listDocs: '/mcp/list_docs',
    indexJson: '/mcp/index.json',
    message: '/mcp/message',
    search: '/mcp/search',
    context: '/mcp/context'
  }
} as const;
