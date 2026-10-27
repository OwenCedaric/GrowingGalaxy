export const MCP_CONFIG = {
  server: {
    name: 'growing-galaxy-mcp',
    version: '1.5.0',
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
    size: 500
  },
  search: {
    defaultTopK: 5
  },
  build: {
    inputs: {
      blogDir: 'dist/raw/blog',
      pagesDir: 'dist/raw/pages',
      projectsDir: 'dist/raw/projects',
      tracesDir: 'dist/raw/traces'
    },
    outputs: {
      mcpDir: 'public/mcp',
      vectorsFile: 'vectors.ndjson',
      indexFile: 'index.json',
      chunksFile: 'chunks.json'
    },
    namespaces: {
      blog: 'blog',
      pages: 'pages',
      projects: 'projects',
      traces: 'traces'
    }
  },
  routes: {
    base: '/mcp',
    version: '/mcp/version',
    profile: '/mcp/profile',
    listDocs: '/mcp/list_docs',
    indexJson: '/mcp/index.json',
    chunksJson: '/mcp/chunks.json',
    message: '/mcp/message',
    search: '/mcp/search',
    context: '/mcp/context'
  }
} as const;
