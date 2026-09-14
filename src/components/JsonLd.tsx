import { absoluteUrl, schemaAuthor, schemaSameAs } from "@/utils/seo";

/* ==========================================================================
 * Server-rendered JSON-LD.
 *
 * SPEC.md §8.8 #5: on the reference site every piece of structured data is
 * client-rendered and therefore invisible to any crawler that does not run JS.
 * The teardown blames `RouteGuard`, which is deleted here — but deleting it is
 * not sufficient. Once UI's own `<Schema>` component renders through
 * `next/script`, whose default `afterInteractive` strategy injects the tag from
 * the client. Measured on this build: `/about` served zero
 * `<script type="application/ld+json">` tags while `<Schema>` was in use; the
 * JSON only existed inside the RSC flight payload.
 *
 * This component is a plain server component that emits the tag directly, so
 * the structured data is in the HTML a crawler receives.
 *
 * `JSON.stringify` + escaping `<` is what stops a `</script>` sequence inside
 * any content string from closing the tag early.
 * ========================================================================== */

type JsonLdProps = {
  /**
   * `WebPage` for the standing pages, `BlogPosting` for a case study.
   * BlogPosting is the pairing SPEC.md §8.8 #8 wants alongside
   * `og:type=article`, which `pageMetadata` sets on the same routes.
   */
  type: "WebPage" | "BlogPosting";
  /** Route path, e.g. "/about". Becomes the canonical `url`. */
  path: string;
  title: string;
  description: string;
  /** Path or absolute URL. A path is resolved against the site origin. */
  image: string;
  /** BlogPosting only. ISO date from the .mdx frontmatter. */
  datePublished?: string;
  dateModified?: string;
};

function escapeForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function JsonLd({
  type,
  path,
  title,
  description,
  image,
  datePublished,
  dateModified,
}: JsonLdProps) {
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);

  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    url: absoluteUrl(path),
    // schema.org names a WebPage and headlines an article. Once UI's <Schema>
    // put `headline` on both; this keeps each type to its own vocabulary.
    ...(type === "WebPage" ? { name: title } : { headline: title }),
    description,
    image: imageUrl,
    ...(datePublished ? { datePublished, dateModified: dateModified ?? datePublished } : {}),
    author: {
      "@type": "Person",
      name: schemaAuthor.name,
      url: schemaAuthor.url,
      ...(schemaAuthor.image ? { image: { "@type": "ImageObject", url: schemaAuthor.image } } : {}),
      // Empty until the profile URLs in content.tsx are filled in; an empty
      // `sameAs` is worse than none, so the key is omitted rather than sent bare.
      ...(schemaSameAs.length > 0 ? { sameAs: schemaSameAs } : {}),
    },
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: the only way to emit a JSON-LD body; content is escaped above.
      dangerouslySetInnerHTML={{ __html: escapeForScript(schema) }}
    />
  );
}

export default JsonLd;
