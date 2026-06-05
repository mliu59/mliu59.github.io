import { PROJECT_NAMES } from "@consts";
import { humanize, slugify } from "@lib/utils";

// A post's project is its top-level folder under src/content/blog.
// Renaming that folder re-buckets every post inside it.
export function getProject(id: string) {
  const folder = id.split("/")[0] ?? "";
  return {
    slug: slugify(folder),
    name: PROJECT_NAMES[folder] ?? humanize(folder),
  };
}
