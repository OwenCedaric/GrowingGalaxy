# Growing Galaxy — Astro 极简主题模板（Starter）

> 专为 [Astro](https://astro.build/) 打造的超极简数字花园、摄影展厅与足迹探索主题。

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

[English](./README.md) | [简体中文](./README_zh.md)

---

## 主题特性

- **极致极简美学**：空灵微磨砂（Glassmorphism）、呼吸感大留白与杂志级版式排版。
- **策展级摄影展厅（Gallery）**：
  - 紧凑型 16:10 画幅目录导航网格。
  - 双模式展览：**Stage（聚光灯影院模式，配有底部居中胶卷片条）** 与 **Wall（密集瀑布流展墙）**。
  - 纯净的 React Portal 顶层灯箱与全屏自适应暗色/亮色遮罩。
- **足迹与田野日志（Traces）**：
  - 基于 Leaflet 的交互式矢量地图。
  - 路线追踪、环境基线数据与坐标展示。
  - 独特的粗野主义设计日志排版。
- **极速客户端静态搜索**：基于 [Pagefind](https://pagefind.app/) 驱动的高性能全文本离线检索。
- **无感暗色模式**：基于原生 View Transitions API 实现丝滑主题切换。
- **零平台锁定（Zero Lock-in）**：100% 纯静态生成（SSG），无需任何外部云服务配置，可零配置一键部署至 Cloudflare Pages、Vercel、Netlify 或 GitHub Pages。

---

## 快速上手

### 方式一：使用 Astro 官方 CLI 脚手架（推荐）

```bash
# 使用本模板初始化全新项目
pnpm create astro@latest -- --template OwenCedaric/GrowingGalaxy#starter
# 或使用 npm
npm create astro@latest -- --template OwenCedaric/GrowingGalaxy#starter
```

### 方式二：手动 Clone 仓库

```bash
# 拉取 starter 主题分支
git clone -b starter https://github.com/OwenCedaric/GrowingGalaxy.git my-site
cd my-site

# 安装依赖
pnpm install

# 启动本地开发服务器（http://localhost:4321）
pnpm run dev
```

---

## 技术架构

- **框架核心**：[Astro 7](https://astro.build/)（静态生成 SSG）
- **UI 岛屿组件**：[React 19](https://react.dev/)
- **原子样式**：[Tailwind CSS 4](https://tailwindcss.com/)
- **动效引擎**：[Motion 14](https://motion.dev/)（Framer Motion）
- **图标系统**：[Remix Icon](https://remixicon.com/) (`@remixicon/react`)
- **交互地图**：[Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
- **全文本搜索**：[Pagefind](https://pagefind.app/)
- **排版字体**：Inter 与 Playfair Display

---

## 目录结构

```text
src/
├── components/
│   ├── gallery/           # 摄影画廊组件（PhotoCard 目录卡、PhotoGrid 网格、ExhibitionStream 展厅）
│   ├── traces/            # 足迹探索组件（Leaflet 交互地图与路线遥测）
│   └── ui/                # 通用 UI 原子（导航栏、主题切换、SpotlightCard）
├── content/
│   ├── blog/              # Markdown / MDX 博客文章
│   ├── photos/            # 摄影集相册数据与照片列表
│   ├── projects/          # 开源项目与数字实验
│   └── traces/            # 旅行路线、坐标与地图元数据
├── layouts/
│   └── Layout.astro       # 基础页面布局（含导航栏、页脚与页面过渡）
├── pages/
│   ├── blog/              # 博客列表与文章阅读器
│   ├── gallery/           # 画廊相册目录与展厅详情 (/gallery/[...slug])
│   ├── traces/            # 足迹探索地图与田野日志
│   ├── projects/          # 项目展示页
│   ├── elsewhere.astro    # 社交与联络入口
│   └── search.astro       # Pagefind 静态全文搜索界面
└── config.ts              # 站点全局配置、导航、社交链与版权声明
```

---

## 内容创作

### 1. 新建博客文章（`src/content/blog/`）

新建 `.mdx` 文件：

```mdx
---
title: "文章标题"
description: "简短的文章概要。"
pubDate: 2026-10-20
category: "Design"
tags: ["minimalism", "web"]
depth: "Light"
heroImage: "/path/to/cover.jpg"
---

正文内容... 支持 Markdown、MDX 组件以及 KaTeX 数学公式渲染：

$$
E = mc^2
$$
```

### 2. 新建摄影相册（`src/content/photos/`）

在 `src/content/photos/[year]/` 下新建 `.md` 文件：

```markdown
---
name: "新宿御苑の樱"
date: 2025-04-05
author: "摄影师姓名"
location: "Tokyo, Japan"
tag: ["Spring", "Sakura", "Tokyo"]
---

![首图封面](https://example.com/photo1.jpg)
第一张照片描述

![第二张](https://example.com/photo2.jpg)
第二张照片描述
```

### 3. 新建足迹日志（`src/content/traces/`）

在 `src/content/traces/[year]/` 下新建 `.md` 文件：

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

田野日志、漫游观察与路径记录...
```

---

## 常用脚本指令

| 命令 | 描述 |
| :--- | :--- |
| `pnpm run dev` | 启动本地开发调试服务器（`localhost:4321`） |
| `pnpm run check` | 执行全站 TypeScript 与 Astro 类型诊断 |
| `pnpm run build` | 完整生产打包：生成静态站点并构建 Pagefind 搜索索引 |
| `pnpm run preview` | 本地预览编译后的生产产物 |

---

## 一键部署

由于本模板采用纯静态打包输出（`dist/` 目录），你可以在各大托管平台上免配置直接部署：

* **Cloudflare Pages**：预设选择 `Astro`，构建命令 `pnpm run build`，产物目录 `dist`。
* **Vercel**：框架预设选择 `Astro`，产物目录 `dist`。
* **Netlify**：构建命令 `pnpm run build`，发布目录 `dist`。
* **GitHub Pages**：仓库自带 GitHub Actions 自动构建支持。

---

> 💡 **想要体验更硬核的 AI Agent 与 MCP（Model Context Protocol）语义检索？**  
> 如果你想探索原生的 Model Context Protocol 协议端点以及 Cloudflare Vectorize 向量数据库能力，欢迎切换查看我们的 [`main` 主分支](https://github.com/OwenCedaric/GrowingGalaxy/tree/main)！

---

## 开源协议

MIT © [Growing Galaxy](https://github.com/OwenCedaric/GrowingGalaxy)
