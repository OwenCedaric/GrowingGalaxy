# Growing Galaxy — Astro Theme Starter

> An ultra-minimalist digital garden, photography exhibition, and field journal theme built for [Astro](https://astro.build/).

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## Highlights

- **Aesthetic Minimalism**: Airy glassmorphism, deliberate whitespace, and architectural typography.
- **Curated Photography Gallery**:
  - Compact 16:10 album catalog navigation.
  - Dual exhibition modes: **Stage** (cinematic spotlight with centered filmstrip) & **Wall** (dense masonry grid).
  - Clean fullscreen Lightbox mounted via React Portal.
- **Traces Explorer**:
  - Interactive cartographic field journal powered by Leaflet.
  - Route tracking, environmental baseline data, and coordinates.
- **Fast Static Search**: Instant client-side full-text search powered by [Pagefind](https://pagefind.app/).
- **Smooth Dark Mode**: Seamless theme switching powered by the native View Transitions API.
- **Zero Platform Lock-in**: 100% static generation (`output: "static"`). Deploys to Cloudflare Pages, Vercel, Netlify, or GitHub Pages with zero configuration.

---

## Quick Start

### Option 1: Using Astro CLI (Recommended)

```bash
# Initialize project with this template
pnpm create astro@latest -- --template OwenCedaric/GrowingGalaxy#starter
# or with npm
npm create astro@latest -- --template OwenCedaric/GrowingGalaxy#starter
```

### Option 2: Clone Repository

```bash
# Clone the starter branch
git clone -b starter https://github.com/OwenCedaric/GrowingGalaxy.git my-site
cd my-site

# Install dependencies
pnpm install

# Start local dev server (http://localhost:4321)
pnpm run dev
```

---

## Tech Stack

- **Framework**: [Astro 7](https://astro.build/) (Static Site Generation)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Motion**: [Motion 14](https://motion.dev/) (Framer Motion)
- **Icons**: [Remix Icon](https://remixicon.com/) (`@remixicon/react`)
- **Maps**: [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
- **Search**: [Pagefind](https://pagefind.app/)
- **Math**: KaTeX via `remark-math` & `rehype-katex`
- **Fonts**: Inter & Playfair Display

---

## Project Structure

```text
src/
├── components/
│   ├── gallery/           # Photography gallery (PhotoCard, PhotoGrid, ExhibitionStream)
│   ├── traces/            # Cartographic field journal (Leaflet map & route telemetry)
│   └── ui/                # Reusable UI primitives (Navigation, ThemeToggle, SpotlightCard)
├── content/
│   ├── blog/              # Markdown & MDX articles
│   ├── photos/            # Curated photo albums with image lists
│   ├── projects/          # Open-source works & digital experiments
│   └── traces/            # Route journals, coordinates & map references
├── layouts/
│   └── Layout.astro       # Base layout with navbar, footer & View Transitions
├── pages/
│   ├── blog/              # Blog archive & post reader
│   ├── gallery/           # Gallery catalog & album exhibition (/gallery/[...slug])
│   ├── traces/            # Traces explorer & field journal view
│   ├── projects/          # Curated projects showcase
│   ├── elsewhere.astro    # Socials, contact & links
│   └── search.astro       # Instant client-side Pagefind search
└── config.ts              # Site metadata, navigation, links & copyright config
```

---

## Content Authoring

### 1. New Blog Post (`src/content/blog/`)

Create a `.mdx` file:

```mdx
---
title: "The Art of Content Curation"
description: "A short synopsis of this article."
pubDate: 2026-10-20
category: "Design"
tags: ["minimalism", "web"]
depth: "Light"
heroImage: "/path/to/cover.jpg"
---

Your content here... Supports standard Markdown, MDX, and KaTeX math formulas:

$$
E = mc^2
$$
```

### 2. New Photography Album (`src/content/photos/`)

Create a `.md` file inside `src/content/photos/[year]/`:

```markdown
---
name: "Shinjuku Gyoen Cherry Blossoms"
date: 2025-04-05
author: "Your Name"
location: "Tokyo, Japan"
tag: ["Spring", "Sakura", "Tokyo"]
---

![Cover Photo](https://example.com/photo1.jpg)
First photo description

![Second Frame](https://example.com/photo2.jpg)
Second photo description
```

### 3. New Trace Journal (`src/content/traces/`)

Create a `.md` file inside `src/content/traces/[year]/`:

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

---

## Available Commands

| Command | Description |
| :--- | :--- |
| `pnpm run dev` | Start development server at `localhost:4321` |
| `pnpm run check` | Run TypeScript & Astro diagnostics |
| `pnpm run build` | Full production build: static site + Pagefind search index |
| `pnpm run preview` | Preview production build locally |

---

## Deployment

Because this theme builds to a 100% static output (`dist/`), it can be hosted anywhere:

- **Cloudflare Pages**: Framework preset `Astro`, Build command `pnpm run build`, Output directory `dist`.
- **Vercel**: Framework preset `Astro`, Output directory `dist`.
- **Netlify**: Build command `pnpm run build`, Publish directory `dist`.
- **GitHub Pages**: Supported out-of-the-box via GitHub Actions.

---

> 💡 **Looking for AI Agent & MCP (Model Context Protocol) Semantic Search?**  
> If you are interested in native Model Context Protocol (MCP) server endpoints and Cloudflare Vectorize vector database integration, explore the [`main` branch](https://github.com/OwenCedaric/GrowingGalaxy/tree/main)!

---

## License

MIT © [Growing Galaxy](https://github.com/OwenCedaric/GrowingGalaxy)
