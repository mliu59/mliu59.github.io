import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Blog posts live under src/content/blog/<project-folder>/<post-slug>/index.md
// (folder-per-post so images/GIFs can be co-located and referenced relatively).
// The top-level <project-folder> determines the post's project — see lib/projects.ts.
const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      // Optional cover image (optimized by Astro). Place it next to index.md
      // and reference it relatively, e.g. cover: ./cover.png
      cover: image().optional(),
      coverAlt: z.string().optional(),
      tags: z.array(z.string()).optional(),
      draft: z.boolean().optional().default(false),
    }),
});

// Projects live under src/content/projects/<project-slug>/index.md, one folder
// per project so the thumbnail (static image or GIF) can sit next to it.
//
// Each project needs a `link` OR a markdown body (or both):
//   - `link` set   -> the card on /projects and the homepage carousel goes
//                     straight there (blog post, GitHub repo, live site, ...).
//                     No detail page is generated.
//   - `link` unset -> a detail page is generated at /projects/<project-slug>
//                     from the markdown body, rendered like a blog post.
const projects = defineCollection({
  loader: glob({ pattern: "**/index.{md,mdx}", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Preview image, static or animated GIF. Place it next to index.md and
      // reference it relatively, e.g. thumbnail: ./thumbnail.gif
      thumbnail: image(),
      // Where the project card points. Internal ("/blog/...") or external
      // ("https://..."). Omit to use the generated detail page instead.
      link: z.string().optional(),
      // Extra links shown on the detail page (repo, live site, write-up, ...).
      links: z
        .array(z.object({ label: z.string(), href: z.string() }))
        .optional()
        .default([]),
      // Featured projects appear in the homepage carousel.
      featured: z.boolean().optional().default(true),
      draft: z.boolean().optional().default(false),
    }),
});

export const collections = { blog, projects };
