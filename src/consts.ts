import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Miles Liu",
  EMAIL: "liumai1999@hotmail.com",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION:
    "Miles Liu — Systems Engineer at Intuitive Surgical.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "Notes on robotics, engineering, and side projects.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Where I've worked and what I've done.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "Things I've built — links to repos and demos.",
};

// Optional display-name overrides for blog project folders.
// Key = folder name under src/content/blog, value = how it appears in the UI.
// Anything not listed is auto-humanized (e.g. "medical-robotics" -> "Medical Robotics").
export const PROJECT_NAMES: Record<string, string> = {
  "kartogen": "Kartogen",
};

export const SOCIALS: Socials = [
  {
    NAME: "linkedin",
    HREF: "https://www.linkedin.com/in/miles-liu-0426/",
  },
  {
    NAME: "github",
    HREF: "https://github.com/mliu59",
  },
  {
    NAME: "soundcloud",
    HREF: "https://soundcloud.com/notanumbermusic",
  },
  {
    NAME: "instagram",
    HREF: "https://www.instagram.com/shaomaiz/",
  },
];
