# Growing Galaxy

> 一个专注于讲故事与视觉体验的精选数字画廊。

## 核心特性

- **极简主义设计** 搭配毛玻璃 (glassmorphism) UI 形态
- **平滑深色模式 (Dark mode)** 基于 View Transitions API 实现
- **完美的响应式适配** 与移动端优化
- **现代技术栈**: Astro 5 + React 19 + Tailwind CSS 4
- **原生 MDX 支持** 提供丰富的排版体验
- **丝滑的页面动画** 由 Framer Motion 驱动
- **SEO 友好** 自动生成 sitemap 与 RSS feed

## 设计哲学

Ceda.is 的核心使命是“内容策展 (Content Curation)”——它不仅仅是一个阅读器，而是一个数字艺术画廊。整体体验应该像在浏览一本奢华且高端的休息室菜单，包含：

- **空灵的毛玻璃效果** (背景高斯模糊 + 半透明表面)
- **宽裕的留白** - 让内容在背景之上“悬浮”
- **柔和的配色** - 浅色模式下的暖沙色，深色模式下的亚光黑
- **纤细的排版** - 优雅且充满呼吸感

## 核心架构

- **框架支持**: [Astro 5](https://astro.build/) - 默认零 JS (Zero JS) 静态输出
- **UI 组件**: [React 19](https://react.dev/) - 用于高交互的组件渲染
- **样式方案**: [Tailwind CSS 4](https://tailwindcss.com/) - 自定义设计系统 Tokens
- **动画引擎**: [Framer Motion 12](https://www.framer.com/motion/)
- **图标系统**: [Lucide React](https://lucide.dev/)
- **网络字体**: Inter (无衬线), Playfair Display (衬线体)

## 快速开始

```bash
# 安装所需依赖
pnpm install

# 启动本地开发服务器 (默认端口 http://localhost:4321)
pnpm run dev

# 编译为生产环境静态文件
pnpm run build

# 本地预览生产环境构建效果
pnpm run preview
```

## 目录结构

```text
.github/workflows/
└── deploy.yml           # CI/CD: 自动化构建、向量索引生成与数据库同步
scripts/
├── build_index.ts      # 本地 AI 嵌入生成器 (@huggingface/transformers)
└── patch_frontmatter.ts # Markdown 元数据批量补全工具
src/
├── components/
│   ├── ui/              # 全局可复用的 UI 架构组件
│   │   ├── GlassCard.astro
│   │   ├── Navigation.tsx
│   │   └── ThemeToggle.tsx
│   └── BaseHead.astro   # SEO 与元数据标签管理
├── content/
│   ├── blog/            # 博客文章夹 (携带 MCP 检索属性)
│   └── pages/           # 静态页面夹 (携带 MCP 检索属性)
├── pages/
│   ├── index.astro      # 首页门户
│   └── raw/             # 供 MCP 调用的动态原始 Markdown 端点
workers/
└── index.ts            # MCP API 接入层 (Search/Context 路由实现)
init.py                 # Vectorize 数据库 API 初始化脚本
wrangler.json           # Cloudflare Worker & Assets 部署配置
```

## 网站个性化配置

### 色彩主题设计

你可以编辑 `src/styles/global.css` 来重新定制自己的专属配色系统：

```css
@theme {
    --color-canvas: #ffffff;
    --color-canvas-dark: #141414;
    --color-surface: rgba(255, 255, 255, 0.8);
    --color-surface-dark: rgba(30, 30, 30, 0.60);
    /* ... */
}
```

### 全局网站参数配置

站点全局数据（像标题、描述、导航菜单以及页脚文案等）都在 `src/config.ts` 文件中修改：

```typescript
export const SITE_CONFIG = {
    title: "你的网站名称",
    description: "简短一句话介绍",
    // ...
}
```

## 创作新内容

### 发布博客文章

> **提示:** 强烈建议你在开始撰写前先检阅 [Markdown 与 MDX 语法指南](./MARKDOWN_SYNTAX.md)，它完整记载了网站所支持的所有排版特性（包括高等数学公式和 React 组件内嵌等功能支持）。

只需在 `src/content/blog/` 下创建一个新的 `.mdx` 文件：

```mdx
---
title: "你的新文章标题"
description: "文章一句话概览简介..."
pubDate: 2026-02-03
category: "Design"
tags: ["web", "design"]
depth: "Intermediate"
heroImage: "/path/to/image.jpg"
---

这里是正文排版...
```

### 新增友情链接

只需在 `src/content/blogroll/` 目录下创建一个新的 `.md` 文件：

```md
---
name: "友站名称"
link: "https://example.com"
avatar: "/avatars/example.png"
description: "站点摘要描述..."
---
```

## 可用的运行命令

| Command 命令 | Description 说明 |
| --- | --- |
| `pnpm run dev` | 在本地启动热重载开发服务器 `localhost:4321` |
| `pnpm run build` | 为生产环境打包压缩至静态的 `./dist/` 文件夹内 |
| `pnpm run build_index` | 触发本地 AI 模型进行文章切块与向量索引生成 |
| `pnpm run patch_meta` | 批量为所有 Markdown 文档补全 MCP 所需 Frontmatter |
| `pnpm run preview` | 本地测试并预览编译后的静态资源构建效果 |

## 性能目标

本项目遵循极客优化的性能实践：

- [x] **静态页面生成引擎 (SSG)** - 所有内容会在部署构建期间提前编排为 HTML
- [x] **默认无 JavaScript 包袱** - 仅那些负责强视觉交互的组件才会向客户端发送少量的 JS
- [x] **图像托管自优化引擎** - WebP 无损转换策略
- [x] **首屏字体优化** - 可变字体合并与子集加载

项目标杆要求: **Lighthouse 各项性能指数稳定在 95 分以上。**

## MCP (Model Context Protocol) 深度集成

本项目原生支持 **Model Context Protocol (MCP)** 标准，允许 AI 代理（如 Cursor, Windsurf 或自定义 LLMs）以语义化的方式“理解”并检索你的全站内容。

### 1. 数据库初始化 (单次操作)
你可以使用提供的 `init.py` 脚本通过官方 API 一键开辟数据库，或者直接使用 Wrangler：
```bash
npx wrangler vectorize create growing-galaxy-mcp --dimensions=384 --metric=cosine
```

### 2. 自动化索引构建
Embeddings（向量嵌入）是在构建阶段通过 `@huggingface/transformers` (BGE Small 模型) 在**本地/云端 Runner 内部离线生成**的。这意味着：
- **零成本**：无需调用 OpenAI 等付费 Embedding API。
- **高安全**：数据无需流向第三方 AI 平台进行处理。
你可以手动触发：`pnpm run build_index`。

### 3. 在 AI 编辑器中使用

#### Cursor / Windsurf
你可以将部署后的站点地址添加为 Cursor 或 Windsurf 的 **Context Provider** 或 **Custom Docs** 来源：
- **搜索端点**: `https://your-domain.com/mcp/search`
- **全文能力**: 支持全站博客与页面的全文语义检索与 RAG 还原。

#### Claude Code / Claude Desktop

**原生支持标准 MCP-over-HTTP** 协议。

**Claude Code**:
```bash
claude mcp add growing-galaxy https://your-domain.com/mcp
```

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "growing-galaxy": {
      "url": "https://your-domain.com/mcp" 
    }
  }
}
```

### 4. 核心可用工具

- `search`: 语义检索全站精选内容（博客 + 静态页面）。
- `get_context`: 根据搜索结果的 ID，完整还原 Markdown 原文内容。

### 5. API 端点
- `POST /mcp`: 标准 JSON-RPC 根端点 (同时支持 SSE 与 原始 POST)。
- `GET /mcp/list_docs`: 全站可搜索文档的元数据编目。
- `GET /mcp/version`: 协议运行健康检查。

## 全自动 CI/CD 部署 (GitHub Actions)

我们在 `.github/workflows/deploy.yml` 中配置了一套生产级别的持续集成流水线。

### 前置准备
在 GitHub 仓库的 **Settings > Secrets** 中，添加以下变量：
1. `CLOUDFLARE_API_TOKEN`: 必须具备 `Account.Vectorize (Edit)`, `Account.Workers AI (Read)` 以及 `Account.Workers Scripts (Edit)` 权限。
2. `CLOUDFLARE_ACCOUNT_ID`: 在你的 Cloudflare 控制台侧边栏即可找到。

### 自动化流转
每次向 `main` 分支执行 `git push` 时：
1. 自动安装依赖并编译 Astro 前端。
2. **在 Action 的云端节点运行 AI 模型**，自动提取新增文章的向量特征。
3. 自动将 `vectors.ndjson` 增量同步至 Cloudflare Vectorize。
4. 部署 Workers 逻辑并更新边缘节点的静态资源。

## 开源许可证

MIT - 您可随时使用该模板构建私人以及商业项目！

## 鸣谢与致敬

- 视觉设计深受“现代极简主义美术馆”的交互灵感影响
- 基于出色的 [Astro](https://astro.build/) 引擎框架搭建
- 依托时下最现代化的全球 Web 集成技术构建运行

---

**Designed with intention. 倾注巧思与诚意构建。**
