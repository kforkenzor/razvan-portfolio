import type { MetadataRoute } from "next";

import { baseURL, routes as routesConfig } from "@/resources";
import { getProjectPosts } from "@/utils/utils";

/**
 * Emits only routes that actually exist: the enabled static routes from the
 * config, plus one entry per project case study. `getProjectPosts` returns [] when the
 * projects directory is missing or empty, so this never throws during a build.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().split("T")[0];

  const staticRoutes = Object.entries(routesConfig)
    .filter(([, enabled]) => enabled)
    .map(([route]) => ({
      url: `${baseURL}${route === "/" ? "" : route}`,
      lastModified: today,
    }));

  const works = getProjectPosts().map((post) => ({
    url: `${baseURL}/work/${post.slug}`,
    lastModified: post.metadata.publishedAt || today,
  }));

  return [...staticRoutes, ...works];
}
