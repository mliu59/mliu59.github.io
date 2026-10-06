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

## Adding projects

Projects live under `src/content/projects/<project>/index.md`, one folder per
project with its thumbnail (static image or GIF) alongside. They show up on
`/projects` and, if `featured`, in the homepage carousel.

```
src/content/projects/
  my-project/
    index.md
    thumbnail.gif
```

Frontmatter:

```yaml
---
title: "My project"
description: "One or two sentences for the card."
thumbnail: ./thumbnail.gif
thumbnailAlt: "What the thumbnail shows"   # optional
date: 2026-06-03                           # ordering only, newest first
tags: ["robotics"]                         # optional
link: https://github.com/me/my-project     # optional, see below
links:                                     # optional, shown on the detail page
  - label: "GitHub repo"
    href: "https://github.com/me/my-project"
featured: true                             # optional, default true
draft: false                               # optional
---
```

A project's card links in one of two ways:

- **`link` set:** the card goes straight there. Internal (`/blog/...`) or
  external (`https://...`) both work, and no detail page is generated.
- **`link` omitted:** a detail page is generated at `/projects/<project>` from
  the markdown body, rendered like a blog post. Use `links` for repo/site links.

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
