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
      description: z.string(),
      date: z.coerce.date(),
      // Optional cover image (optimized by Astro). Place it next to index.md
      // and reference it relatively, e.g. cover: ./cover.png
      cover: image().optional(),
      coverAlt: z.string().optional(),
      tags: z.array(z.string()).optional(),
      draft: z.boolean().optional().default(false),
    }),
});

export const collections = { blog };
