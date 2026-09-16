import { Card, Column, Heading, Media, Row, Tag, Text } from "@once-ui-system/core";
import type { PresentationSite } from "@/types";
import { filterByEvidenceGate } from "./evidence";

/* ==========================================================================
 * Presentation websites.
 *
 * Deliberately lighter than `SelectedProjects`: a compact card per site — one
 * screenshot, a category, a single line and the stack — and no case study
 * behind it. Client brochure sites are worth showing, but giving one the same
 * weight as a platform build flattens both, so they get their own section and
 * their own visual register.
 *
 * Same evidence gate as everywhere else. A site with no measurable authorship
 * and no live URL does not render, regardless of which section it sits in.
 * ========================================================================== */

/**
 * The section heading, exported because two routes render this section: /about,
 * where it also feeds the table of contents, and /work, where it sits under the
 * case studies. One string, so the TOC entry and the heading cannot drift.
 */
export const PRESENTATION_TITLE = "Presentation Websites";

interface PresentationSitesProps {
  title: string;
  sites: PresentationSite[];
}

export function PresentationSites({ title, sites }: PresentationSitesProps) {
  const visible = filterByEvidenceGate(sites);

  if (visible.length === 0) return null;

  return (
    <>
      <Heading as="h2" id={title} variant="display-strong-s" marginBottom="m">
        {title}
      </Heading>

      <Column fillWidth gap="l" marginBottom="40">
        {visible.map((site) => (
          <Card
            key={site.slug}
            fillWidth
            direction="column"
            radius="l"
            border="neutral-alpha-weak"
            background="surface"
            overflow="hidden"
            {...(site.href
              ? { href: site.href, target: "_blank", rel: "noreferrer noopener" }
              : {})}
          >
            {site.images[0] && (
              <Media
                aspectRatio="16 / 9"
                sizes="(max-width: 768px) 100vw, 720px"
                alt={`${site.name} — ${site.category}`}
                src={site.images[0]}
              />
            )}

            <Column fillWidth gap="12" paddingX="20" paddingY="20">
              <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
                <Heading as="h3" variant="heading-strong-m">
                  {site.name}
                </Heading>
                <Text variant="label-default-s" onBackground="brand-weak">
                  {site.category}
                </Text>
              </Row>

              <Text variant="body-default-s" onBackground="neutral-weak">
                {site.summary}
              </Text>

              {site.stack.length > 0 && (
                <Row gap="8" wrap paddingTop="4">
                  {site.stack.map((tech) => (
                    <Tag key={tech} size="s" variant="neutral">
                      {tech}
                    </Tag>
                  ))}
                </Row>
              )}
            </Column>
          </Card>
        ))}
      </Column>
    </>
  );
}
