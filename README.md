# Growing Galaxy

> A curated digital gallery for storytelling and visual experiences.

## Features

- **Ultra-minimalist design** with glassmorphism UI
- **Smooth dark mode** with View Transitions API
- **Fully responsive** and mobile-optimized
- **Modern stack**: Astro 5 + React 19 + Tailwind CSS 4
- **MDX support** for rich content
- **Smooth animations** powered by Framer Motion
- **SEO optimized** with sitemap and RSS feed

## Design Philosophy

Ceda.is is designed with "content curation" at its core - not just a reader, but a digital art gallery. The experience should feel like browsing a high-end lounge menu, with:

- **Airy glassmorphism effects** (backdrop-blur + translucent surfaces)
- **Generous whitespace** - content "floats" above the background
- **Soft color palette** - warm sand for light mode, matte black for dark mode
- **Thin typography** - elegant and breathable

## Tech Stack

- **Framework**: [Astro 5](https://astro.build/) - Zero JS by default
- **UI Library**: [React 19](https://react.dev/) - For interactive components
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Custom theme tokens
- **Animations**: [Framer Motion 12](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: Inter (sans-serif), Playfair Display (serif)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server at http://localhost:4321
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## Project Structure

```text
.github/workflows/
└── deploy.yml           # CI/CD: Auto-build, index & Vectorize sync
scripts/
├── build_index.ts      # Local embedding generator (Local AI)
└── patch_frontmatter.ts # Metadata bulk injection tool
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── GlassCard.astro
│   │   ├── Navigation.tsx
│   │   └── ThemeToggle.tsx
│   └── BaseHead.astro   # SEO & meta tags
├── content/
│   ├── blog/            # MDX blog posts (w/ MCP metadata)
│   └── pages/           # Static pages (w/ MCP metadata)
├── pages/
│   ├── index.astro      # Homepage
│   └── raw/             # Dynamic raw MD endpoints for MCP
workers/
└── index.ts            # MCP API Layer (Search/Context)
init.py                 # Vectorize Index Initializer
wrangler.json           # Cloudflare deployment config
```

## Customization

### Color Theme

Edit `src/styles/global.css` to customize the color scheme:

```css
@theme {
    --color-canvas: #ffffff;
    --color-canvas-dark: #141414;
    --color-surface: rgba(255, 255, 255, 0.8);
    --color-surface-dark: rgba(30, 30, 30, 0.60);
    /* ... */
}
```

### Site Configuration

Update `src/config.ts` for site metadata, navigation, and footer:

```typescript
export const SITE_CONFIG = {
    title: "Your Site Name",
    description: "Your description",
    // ...
}
```

## Creating Content

### New Blog Post

> **Tip:** Check out our [Markdown & MDX Syntax Guide](./MARKDOWN_SYNTAX.md) for a full list of supported features, including Math formulas and JSX components.

Create a new `.mdx` file in `src/content/blog/`:

```mdx
---
title: "Your Post Title"
description: "Brief description"
pubDate: 2026-02-03
category: "Design"
tags: ["web", "design"]
depth: "Intermediate"
heroImage: "/path/to/image.jpg"
---

Your content here...
```

### New Blogroll Entry

Add a `.md` file in `src/content/blogroll/`:

```md
---
name: "Site Name"
link: "https://example.com"
avatar: "/avatars/example.png"
description: "Brief description"
---
```

## Available Scripts

| Command | Description |
| --- | --- |
| `pnpm run dev` | Start dev server at `localhost:4321` |
| `pnpm run build` | Build for production to `./dist/` |
| `pnpm run build_index` | Generate local embeddings & MCP assets |
| `pnpm run patch_meta` | Batch update MD frontmatter for MCP |
| `pnpm run preview` | Preview production build locally |

## Performance

This site is optimized for performance:

- ✅ **Static site generation** - Pre-rendered at build time
- ✅ **Zero JS by default** - Only interactive components ship JS
- ✅ **Image optimization** - Automatic format conversion
- ✅ **Font optimization** - Variable fonts with subsetting

Target: **Lighthouse Performance 95+**

## MCP (Model Context Protocol) Integration

This project natively supports **Model Context Protocol (MCP)**, allowing AI agents (like Cursor, Windsurf, or custom LLMs) to semantically "understand" and retrieve your content.

### 1. Initialization (One-time)
Use the provided `init.py` to create your Vectorize database via API, or use Wrangler:
```bash
npx wrangler vectorize create growing-galaxy-mcp --dimensions=1024 --metric=cosine
```

### 2. Building & Indexing
Embeddings are generated **offline** during build time using `@huggingface/transformers` (BGE Small model), ensuring no API costs:
```bash
pnpm run build_index
```
This produces `vectors.ndjson` (for Cloudflare) and `public/mcp/chunks.json` (for the Worker).

### 3. Usage with AI Tools

#### Cursor / Windsurf
Add your deployed site as a **Context Provider** or **Custom Docs** source:
- **Search URL**: `https://your-domain.com/mcp/search`
- **Context URL**: `https://your-domain.com/mcp/context`
- **Direct Capability**: Semantic search across all blog posts and pages.

#### Claude Code / Claude Desktop

**Standard MCP-over-HTTP** is natively supported.

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

### 4. Available Tools

- `search`: Semantically search all contents (blog + pages).
- `get_context`: Retrieve full markdown context for specific chunks based on search results.

### 5. API Endpoints
- `POST /mcp`: Standard JSON-RPC root (Supports both SSE and raw POST)
- `GET /mcp/list_docs`: Metadata catalog for all searchable content.
- `GET /mcp/version`: Protocol health check.

## Full-Auto Deployment (GitHub Actions)

We provide a production-ready CI/CD pipeline in `.github/workflows/deploy.yml`.

### Prerequisites
In your GitHub Repo Settings, add these **Secrets**:
1. `CLOUDFLARE_API_TOKEN`: Must have permissions for `Account.Vectorize (Edit)`, `Account.Workers AI (Read)`, and `Account.Workers Scripts (Edit)`.
2. `CLOUDFLARE_ACCOUNT_ID`: Found in your Cloudflare Dashboard sidebar.

### Workflow
Every `git push` to `main` will:
1. Install dependencies & build the Astro site.
2. **Generate AI Embeddings** in the cloud runner.
3. Sync the `vectors.ndjson` to Cloudflare Vectorize.
4. Deploy the Workers & Static Assets to the edge.

## License

MIT - feel free to use this template for your own projects!

## Credits

- Design inspiration from minimalist lounge aesthetics
- Built with [Astro](https://astro.build/)
- Powered by modern web technologies

---

**Designed with intention.**
