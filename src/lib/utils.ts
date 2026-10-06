import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Turns a folder slug into a display name: "medical-robotics" -> "Medical Robotics".
export function humanize(slug: string) {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Maps a blog entry id (e.g. "wikispeedruns/intro/index") to its clean URL.
export function postPath(id: string) {
  return `/blog/${id.replace(/\/index$/, "")}`;
}

// Maps a projects entry id (e.g. "kartogen/index") to its detail page URL.
export function projectPath(id: string) {
  return `/projects/${id.replace(/\/index$/, "")}`;
}

// Where a project card should link: the explicit `link` if given, otherwise
// the generated detail page.
export function projectHref(id: string, link?: string) {
  return link ?? projectPath(id);
}

export function isExternalHref(href: string) {
  return /^(https?:)?\/\//.test(href);
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(date);
}

export function readingTime(html: string) {
  const textOnly = html.replace(/<[^>]+>/g, "");
  const wordCount = textOnly.split(/\s+/).length;
  const readingTimeMinutes = ((wordCount / 200) + 1).toFixed();
  return `${readingTimeMinutes} min read`;
}

export function dateRange(startDate: Date, endDate?: Date | string): string {
  const startMonth = startDate.toLocaleString("default", { month: "short" });
  const startYear = startDate.getFullYear().toString();
  let endMonth;
  let endYear;

  if (endDate) {
    if (typeof endDate === "string") {
      endMonth = "";
      endYear = endDate;
    } else {
      endMonth = endDate.toLocaleString("default", { month: "short" });
      endYear = endDate.getFullYear().toString();
    }
  }

  return `${startMonth}${startYear} - ${endMonth}${endYear}`;
}