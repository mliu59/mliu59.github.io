# mliu59.github.io

Personal website built with [Astro](https://astro.build/) and Tailwind CSS.

## Requirements

- Node.js 20+

## Develop

```bash
npm install      # first time only
npm run dev      # start dev server at http://localhost:4321
```

## Build

```bash
npm run build    # type-check + build static site to ./dist
npm run preview  # serve the production build locally
```

## Deploy

Pushing to `main` triggers a GitHub Actions workflow that builds and publishes
to GitHub Pages — see [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

## Writing blog posts

Posts live under `src/content/blog/<project>/<post>/index.md`. The top-level
folder is the **project** the post is grouped under; co-locate images/GIFs next
to `index.md` and reference them relatively (e.g. `![](./demo.gif)`).

```
src/content/blog/
  my-project/
    my-first-post/
      index.md
      cover.jpg
```

Frontmatter:

```yaml
---
title: "My first post"
description: "A short summary."
date: 2026-06-03
cover: ./cover.jpg   # optional
tags: ["astro"]      # optional
draft: false         # optional
---
```
