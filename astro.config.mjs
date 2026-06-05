import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

// Wrap any standalone markdown image (an image alone in a paragraph) in a
// <figure>, using its alt text as a visible <figcaption>. Lets posts add image
// captions with plain `![caption](./img.gif)` syntax — no HTML, and Astro still
// optimizes the relative image because the <img> node is left untouched.
function rehypeImageFigure() {
  const isBlank = (n) => n.type === "text" && n.value.trim() === "";
  const walk = (node) => {
    if (!node.children) return;
    node.children = node.children.map((child) => {
      walk(child);
      if (child.type === "element" && child.tagName === "p") {
        const kids = child.children.filter((c) => !isBlank(c));
        const img = kids[0];
        if (
          kids.length === 1 &&
          img.type === "element" &&
          img.tagName === "img" &&
          img.properties?.alt
        ) {
          return {
            type: "element",
            tagName: "figure",
            properties: {},
            children: [
              img,
              {
                type: "element",
                tagName: "figcaption",
                properties: {},
                children: [{ type: "text", value: String(img.properties.alt) }],
              },
            ],
          };
        }
      }
      return child;
    });
  };
  return (tree) => walk(tree);
}

// Allow a trailing `{h=480 w=600}` attribute on a markdown image to cap its
// DISPLAY size, e.g. `![alt](./img.gif){h=480}`. Values are max pixels.
//
// NOTE: this controls layout only — the browser still downloads the full
// optimized image and scales it. Astro generates markdown images at their
// intrinsic resolution and ignores pre-set dimensions (its image step runs
// after plugins like this and overwrites width/height). To actually shrink the
// downloaded bytes, compress the source file or use the MDX <Image> component.
function remarkImageAttrs() {
  const ATTR = /^\s*\{([^}]*)\}/;
  const walk = (node) => {
    if (!Array.isArray(node.children)) return;
    for (let i = 0; i < node.children.length; i++) {
      const n = node.children[i];
      const next = node.children[i + 1];
      if (n.type === "image" && next && next.type === "text") {
        const m = next.value.match(ATTR);
        if (m) {
          const opts = {};
          for (const pair of m[1].trim().split(/\s+/)) {
            const [k, v] = pair.split("=");
            if (k && v) opts[k] = v;
          }
          const h = parseInt(opts.h ?? opts.height, 10);
          const w = parseInt(opts.w ?? opts.width, 10);
          const styles = [];
          if (Number.isFinite(h)) styles.push(`max-height:${h}px`);
          if (Number.isFinite(w)) styles.push(`max-width:${w}px`);
          if (styles.length) {
            styles.push("width:auto", "height:auto");
            n.data = n.data || {};
            n.data.hProperties = { ...n.data.hProperties, style: styles.join(";") };
          }
          next.value = next.value.replace(ATTR, "");
        }
      }
      walk(n);
    }
  };
  return (tree) => walk(tree);
}

export default defineConfig({
  site: "https://mliu59.github.io",
  integrations: [mdx(), sitemap(), tailwind()],
  markdown: {
    remarkPlugins: [remarkImageAttrs],
    rehypePlugins: [rehypeImageFigure],
  },
});
