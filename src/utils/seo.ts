import type { Metadata } from "next";
import { Meta } from "@once-ui-system/core";

import { about, baseURL, person, social } from "@/resources";

/* ==========================================================================
 * Shared SEO helpers.
 *
 * Two jobs, both of them fixes to defects SPEC.md §8.8 records on the
 * reference site:
 *
 *   #3 — no <link rel="canonical"> anywhere. Once UI's `Meta.generate` only
 *        emits `alternates.canonical` when it is handed a non-empty
 *        `alternates` array, which no page has any reason to pass. So the
 *        canonical is added here instead, once, for every route.
 *
 *   #4 — JSON-LD author image double-prefixed with the baseURL. The `Schema`
 *        component prefixes `image` itself, so the author image has to be
 *        built by hand — and must be omitted entirely while `person.avatar`
 *        is empty, or it resolves to the bare origin.
 *
 * And one bug in Once UI itself. `Meta.generate` computes
 * `metadataBase: new URL(base.startsWith("https://") ? base : \`https://${base}\`)`.
 * Any origin that is not already https — `http://localhost:3000`, say — comes
 * back as `https://http/localhost:3000`, and every relative og:image and
 * twitter:image on the site resolves against that. Verified in the served HTML.
 * `pageMetadata` overrides `metadataBase` with the real origin afterwards.
 * ========================================================================== */

/** `Meta.generate`'s input, minus the two arguments this module always supplies. */
type MetaArgs = Omit<Parameters<typeof Meta.generate>[0], "baseURL"> & {
  path: string;
};

function normalisedBase(): string {
  return baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
}

/**
 * Absolute URL for a route path. Used for the canonical tag and for the
 * JSON-LD author URL, so the two never drift apart.
 */
export function absoluteUrl(path: string): string {
  return `${normalisedBase()}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * `Meta.generate` plus a canonical link. Every page's `generateMetadata`
 * should call this rather than `Meta.generate` directly.
 */
export function pageMetadata(args: MetaArgs): Metadata {
  const meta = Meta.generate({ ...args, baseURL });

  return {
    ...meta,
    // Overrides Once UI's mangled value — see the note at the top of this file.
    // Every relative image URL in `meta` is resolved against this by Next.
    metadataBase: new URL(normalisedBase()),
    alternates: {
      ...(meta.alternates ?? {}),
      canonical: absoluteUrl(args.path),
    },
  };
}

/**
 * The JSON-LD author block, shared by every `<Schema>` on the site.
 *
 * `image` is omitted while `person.avatar` is empty. Passing
 * `` `${baseURL}${person.avatar}` `` unguarded would publish the site origin
 * as a photograph of a person, which is worse than publishing no photo.
 */
export const schemaAuthor: { name: string; url: string; image?: string } = {
  name: person.name,
  url: absoluteUrl(about.path),
  ...(person.avatar ? { image: absoluteUrl(person.avatar) } : {}),
};

/**
 * Profile URLs for the JSON-LD `sameAs` array — how a search engine ties this
 * Person to the same person on GitHub and LinkedIn.
 *
 * Derived from `social` in content.tsx rather than from a second config object,
 * so there is one list of profile links and it cannot drift. `mailto:` is
 * excluded (`sameAs` is for profile pages), and empty links drop out, which is
 * why this is currently an empty array: both profile URLs are still TODO.
 */
export const schemaSameAs: string[] = social
  .map((item) => item.link)
  .filter((link) => link && !link.startsWith("mailto:"));

/**
 * Path to the generated OG card for a given title. Centralised so the query
 * shape is identical everywhere and only has to change in one place.
 */
export function ogImagePath(title: string): string {
  return `/api/og/generate?title=${encodeURIComponent(title)}`;
}
