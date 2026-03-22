# AI 原生博客 MCP 规范（Cloudflare 生态版本）

版本: 1.1  
目标环境: Astro + Cloudflare Pages + Cloudflare Workers + Vectorize + R2 + KV

本规范基于已存在的 Markdown Raw Endpoint 实现。

---

## 1. 系统目标

系统必须允许 AI 代理执行：

- 枚举文档
- 获取 Markdown 原文
- 获取元数据
- 语义搜索
- 获取上下文片段
- 返回规范引用 URL

系统必须：

- 不解析 HTML
- 不依赖数据库服务器
- 可静态构建
- 可边缘执行

---

## 2. 当前已存在能力

当前系统已经提供：

Markdown 内容源

/content/blog/*.md
/content/pages/*.md

Astro collections

getCollection("blog")
getCollection("pages")

Raw Markdown Endpoint

/[collection]/[slug].md

由

[slug].md.ts

提供。

该接口为 MCP 内容源。

示例：

/blog/vector-database.md
/pages/about.md

返回：

text/markdown

此接口必须保持稳定。

不得删除。

不得改为 HTML。

---

## 3. Markdown 必须扩展 frontmatter

每个 Markdown 必须包含：

```md
---
id: post-001

title: 向量数据库

summary: 向量数据库介绍

tags:
  - ai
  - vector

topics:
  - embedding
  - similarity

entities:
  - openai
  - cloudflare

ai:
  searchable: true
  chunk_size: 500
  weight: 1.0
  namespace: blog

mcp:
  priority: normal

canonical_url: https://site/post/vector-database
markdown_url: https://site/blog/vector-database.md
---
```

frontmatter 是唯一权威元数据。

不得从 HTML 读取元数据。

---

## 4. 构建阶段必须生成索引

新增构建脚本：

/scripts/build_index.ts

构建流程：

读取 collections
→ 调用 raw markdown endpoint
→ 解析 frontmatter
→ 分块
→ 生成 embedding
→ 写入索引文件

生成文件：

/public/mcp/index.json
/public/mcp/chunks.json
/public/mcp/embeddings.json

---

## 5. 分块规则

默认：

chunk_size = 500 tokens

overlap = 50

允许 frontmatter 覆盖。

chunks.json 格式：

```json
{
  "id": "chunk-001",
  "doc_id": "post-001",
  "text": "...",
  "tokens": 312,
  "weight": 1.0,
  "url": "...",
  "namespace": "blog"
}
```

---

## 6. 向量存储

必须支持 Cloudflare 存储。

允许：

Cloudflare Vectorize
Cloudflare KV
Cloudflare R2
静态 JSON

推荐：

Vectorize + R2

要求支持：

top_k
namespace
tag filter
doc filter
cosine similarity

---

## 7. Workers MCP 服务

新增：

/workers/mcp.ts

部署为：

/mcp/*

必须实现接口：

7.1 search

POST /mcp/search

```
{
  "query": "",
  "top_k": 5,
  "namespace": "blog"
}
```

返回：

```
results[]
```

7.2 context

POST /mcp/context

```
{
  "chunk_ids": []
}
```

7.3 list_docs

GET /mcp/list_docs

7.4 get_doc

GET /mcp/doc?id=

7.5 version

GET /mcp/version

---

## 8. Workers 数据来源

Workers 必须从以下位置读取：

/public/mcp/index.json

或

R2

或

Vectorize

不得读取 HTML。

不得解析页面。

必须使用 Markdown 索引。

---

## 9. Astro 不负责 MCP

Astro 只负责：

HTML
Markdown Raw
Static files

MCP 必须在 Workers 实现。

---

## 10. URL 规范

Markdown

/blog/slug.md

HTML

/blog/slug

MCP

/mcp/search
/mcp/context

Index

/mcp/index.json

---

## 11. AI 调用顺序

AI 必须：

search
→ context
→ cite canonical_url

不得抓 HTML。

不得猜 URL。

不得解析 DOM。

---

## 12. Cloudflare 部署结构

Pages

HTML
Markdown
Index

Workers

MCP API

Vectorize

Embeddings

R2

Chunks

KV

Metadata

---

## 13. 未来扩展

允许：

多站点索引
多 namespace
权限控制
签名响应
引用策略
训练策略
缓存层
多语言
增量 embedding

不要求 v1 实现

---