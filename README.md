# Growing Galaxy

> A curated digital garden, photography exhibition, and field journal with minimalist aesthetics.

## Features

- **Ultra-minimalist design** with glassmorphism UI and architectural typography
- **Smooth dark mode** with native View Transitions API
- **Curated Photography Gallery**:
  - Compact 16:10 album catalog directory
  - Dual viewing modes: **Stage** (cinematic spotlight with centered filmstrip) & **Wall** (masonry grid)
  - Fullscreen Lightbox mounted via React Portal with light/dark adaptive backdrops
- **Traces Explorer**:
  - Interactive cartographic field journal powered by Leaflet
  - Route tracking, environmental baseline data, and coordinates
- **Dual Search Architecture**:
  - Local client-side full-text search with **Pagefind**
  - AI semantic vector search via **Model Context Protocol (MCP)** & Cloudflare Vectorize
- **Modern stack**: Astro 7 + React 19 + Tailwind CSS 4 + TypeScript 6 + Motion 14
- **MDX & KaTeX support** for mathematical notations and rich interactive components
- **SEO optimized** with schema.org JSON-LD, sitemaps, and RSS feed

## Design Philosophy

Growing Galaxy is designed with "content curation" at its core — not just a personal blog, but a digital exhibition space:

- **Airy glassmorphism effects** (backdrop-blur + translucent surfaces)
- **Generous whitespace & clear hierarchy** - content breathes naturally above the canvas
- **Soft dual palette** - warm sand for light mode, matte carbon black for dark mode
- **Refined typography** - serif accents (Playfair Display) paired with clean sans-serif (Inter) and technical monospace markers

## Tech Stack

- **Framework**: [Astro 7.4](https://astro.build/) - Zero JS by default, static pre-rendering
- **UI Library**: [React 19.3](https://react.dev/) - Interactive components & client islands
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Custom `@theme` tokens and modern CSS features
- **Animations**: [Motion 14](https://motion.dev/) (Framer Motion)
- **Icons**: [Remix Icon](https://remixicon.com/) (`@remixicon/react`)
- **Maps**: [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
- **Search**: [Pagefind](https://pagefind.app/) (static search) + [Cloudflare Vectorize](https://developers.cloudflare.com/vectorize/) (MCP)
- **Fonts**: Inter (sans-serif), Playfair Display (serif)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server at http://localhost:4321
pnpm run dev

# Type check
pnpm run check

# Build for production (Astro + Pagefind)
pnpm run build

# Preview production build locally
pnpm run preview
```

## Project Structure

```text
.github/workflows/
└── deploy.yml              # CI/CD: Auto-build, Pagefind indexing & Vectorize sync
scripts/
├── build_index.ts         # Local embedding generator (BGE-small embeddings)
└── patch_frontmatter.ts    # Metadata bulk injection tool
src/
├── components/
│   ├── gallery/           # Gallery components (PhotoCard, PhotoGrid, ExhibitionStream)
│   ├── traces/            # Field journal & Leaflet interactive map components
│   ├── ui/                # Reusable UI components (Navigation, ThemeToggle, SpotlightCard)
│   └── BaseHead.astro      # SEO & meta tags
├── content/
│   ├── blog/              # MDX blog posts
│   ├── photos/            # Markdown photo albums with image lists
│   ├── projects/          # Curated projects & experiments
│   └── traces/            # Route journals & coordinates
├── layouts/
│   └── Layout.astro       # Root layout with navbar & view transitions
├── pages/
│   ├── blog/              # Blog index & post reader
│   ├── gallery/           # Gallery catalog & album exhibition (/gallery/[...slug])
│   ├── traces/            # Traces explorer & journal view
│   ├── projects/          # Projects showcase
│   ├── search.astro       # Client-side Pagefind search
│   └── raw/               # Dynamic raw MD endpoints for MCP
workers/
└── index.ts               # Cloudflare MCP API layer (Search / Context)
```

## Creating Content

### 1. New Blog Post

Create a `.mdx` file in `src/content/blog/`:

```mdx
---
title: "Post Title"
description: "A brief summary of the post."
pubDate: 2026-10-20
category: "Design"
tags: ["minimalism", "web"]
depth: "Intermediate"
heroImage: "/path/to/hero.jpg"
---

Your content here...
```

### 2. New Photo Collection (Gallery)

Create a `.md` file in `src/content/photos/[year]/`:

```markdown
---
name: "Shinjuku Gyoen Cherry Blossoms"
date: 2025-04-05
author: "Author Name"
location: "Tokyo, Japan"
tag: ["Spring", "Cherry Blossom", "Tokyo"]
---

![Cover Photo](https://example.com/photo1.jpg)
First photo description

![Photo Two](https://example.com/photo2.jpg)
Second photo description
```

### 3. New Trace Entry

Create a `.md` file in `src/content/traces/[year]/`:

```markdown
---
title: "Tokyo Urban Transit"
site_name: "Tokyo"
date: "2025-04"
endDate: 2025-04-10
tags: ["City", "Metro", "Japan"]
baseline:
  coordinates: "35.6762, 139.6503"
  environment: "Urban / Spring"
  mapUrl: "/maps/tokyo.geojson"
---

Field journal notes, observations, and route log...
```

### 4. New Project Entry

Add a `.md` file in `src/content/projects/`:

```markdown
---
title: "Project Name"
description: "Brief project overview"
url: "https://example.com"
github: "https://github.com/user/repo"
---
```

## Available Scripts

| Command | Description |
| --- | --- |
| `pnpm run dev` | Start development server at `localhost:4321` |
| `pnpm run check` | Run TypeScript & Astro diagnostics (`astro check`) |
| `pnpm run build` | Full production build: static site + Pagefind search index |
| `pnpm run preview` | Preview production build locally |
| `pnpm run build_index` | Generate offline embeddings & MCP vector assets |
| `pnpm run audit` | Run dependency security audit via pnpm |

## MCP (Model Context Protocol) Integration

This project natively supports **Model Context Protocol (MCP)**, allowing AI agents (Cursor, Windsurf, Claude Code, etc.) to semantically index and query your content.

### 1. Initialization
Create your Cloudflare Vectorize database:
```bash
npx wrangler vectorize create growing-galaxy-mcp --dimensions=1024 --metric=cosine
```

### 2. Building & Indexing
Embeddings are generated offline during build time using `@huggingface/transformers` (BGE Small model):
```bash
pnpm run build_index
```

### 3. Usage with AI Tools

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

## Full-Auto Deployment (GitHub Actions)

Production-ready CI/CD pipeline is provided in `.github/workflows/deploy.yml`.

### Prerequisites
Configure repository secrets:
1. `CLOUDFLARE_API_TOKEN`: Permissions for `Account.Vectorize (Edit)`, `Account.Workers AI (Read)`, and `Account.Workers Scripts (Edit)`.
2. `CLOUDFLARE_ACCOUNT_ID`: Found in Cloudflare Dashboard.

Every `git push` to `main` will build the static Astro site, generate Pagefind indexes, produce AI embeddings, sync vectors to Vectorize, and deploy to Cloudflare Edge.

## License

MIT © Growing Galaxy
