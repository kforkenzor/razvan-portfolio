import { Button, Column, Heading, Media, Row, Tag, Text } from "@once-ui-system/core";
import type { Project } from "@/types";
import { getProjectPosts } from "@/utils/utils";
import { filterByEvidenceGate } from "./evidence";
import { OwnershipBlock } from "./OwnershipBlock";

/* ==========================================================================
 * Selected Projects — content-spec.md §4.4.
 *
 * The one deliberate deviation from the reference architecture. The reference
 * has no project section because its author's repos belong to his employers;
 * here there is per-repo evidence, and burying it inside job bullets would
 * waste it (content-spec.md §1).
 *
 * Per entry, §4.4 asks for: name, one-line summary, a 2–4 sentence description,
 * role and team shape, stack tags, 3–4 highlights, links, and the ownership
 * block. All nine are rendered below, in that order.
 *
 * The evidence gate runs here, in code, not in a review checklist. `yt-blog`
 * sits in the data with `provenance: "unverified"` and no `ownership`, and it
 * must not appear on the page. When Razvan adds a project, it renders once —
 * and only once — its authorship has been measured.
 * ========================================================================== */

interface SelectedProjectsProps {
  title: string;
  projects: Project[];
}

export function SelectedProjects({ title, projects }: SelectedProjectsProps) {
  // THE GATE.
  const visible = filterByEvidenceGate(projects);

  /* Hero screenshots come from the case study's own frontmatter rather than from a
     second `images` field on Project. One source of truth: the .mdx already lists the
     screenshots for /work, and duplicating those paths into content.tsx guarantees the
     two drift. A project with no case study, or one with `images: []`, simply has no
     hero — same rule the carousel on /work follows. */
  const heroBySlug = new Map(
    getProjectPosts()
      .filter((post) => post.metadata.images?.[0])
      .map((post) => [post.slug, post.metadata.images[0]] as const),
  );

  if (visible.length === 0) return null;

  return (
    <>
      <Heading as="h2" id={title} variant="display-strong-s" marginBottom="m">
        {title}
      </Heading>
      <Column fillWidth gap="l" marginBottom="40">
        {visible.map((project) => (
          <Column
            key={project.slug}
            fillWidth
            radius="l"
            border="neutral-alpha-weak"
            background="surface"
            overflow="hidden"
          >
            {/* Matches the PresentationSites treatment: one screenshot, full-bleed at
                the top of the card. Padding moved to the inner Column so the image can
                reach the border instead of floating inside a margin. */}
            {heroBySlug.get(project.slug) && (
              <Media
                aspectRatio="16 / 9"
                sizes="(max-width: 768px) 100vw, 720px"
                alt={`${project.name} — screenshot`}
                src={heroBySlug.get(project.slug) as string}
              />
            )}

            <Column fillWidth gap="16" padding="l">
              {/* Name + one-line summary. The id follows SPEC.md §3.7.10's
                convention: the string the TOC scrolls to is the visible name. */}
              <Column fillWidth gap="4">
                <Text id={project.name} variant="heading-strong-l">
                  {project.name}
                </Text>
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {project.summary}
                </Text>
              </Column>

              {/* Role and team shape. Contribution phrasing lives in the data
                (content-spec.md §2); this only prints it. */}
              <Row fillWidth gap="8" wrap vertical="center">
                <Text variant="label-default-s" onBackground="brand-weak">
                  {project.role}
                </Text>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  ·
                </Text>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {project.teamShape}
                </Text>
              </Row>

              {/* 2–4 sentence description. */}
              <Text variant="body-default-m">{project.description}</Text>

              {/* Stack tags. Plain strings, not IconName — no prefixIcon here. */}
              {project.stack.length > 0 && (
                <Row fillWidth wrap gap="8">
                  {project.stack.map((technology) => (
                    <Tag key={`${project.slug}-${technology}`} size="l">
                      {technology}
                    </Tag>
                  ))}
                </Row>
              )}

              {/* 3–4 highlights, verb-first, one anchor each. */}
              {project.highlights.length > 0 && (
                <Column as="ul" gap="12" paddingY="4">
                  {project.highlights.map((highlight, index) => (
                    <Text
                      as="li"
                      variant="body-default-m"
                      key={`${project.slug}-highlight-${index}`}
                    >
                      {highlight}
                    </Text>
                  ))}
                </Column>
              )}

              {/* Links. An empty array renders nothing — a project whose repo is
                private or whose disclosure is unresolved simply has no links,
                rather than a dead one. */}
              {project.links.length > 0 && (
                <Row fillWidth wrap gap="8" data-border="rounded">
                  {project.links.map((link) => (
                    <Button
                      key={`${project.slug}-${link.href}`}
                      href={link.href}
                      label={link.label}
                      suffixIcon="arrowUpRight"
                      size="s"
                      weight="default"
                      variant="secondary"
                    />
                  ))}
                </Row>
              )}

              {/* The receipt. Guaranteed present: the gate above already
                established that `ownership` is measured. */}
              {project.ownership && <OwnershipBlock ownership={project.ownership} />}
            </Column>
          </Column>
        ))}
      </Column>
    </>
  );
}

export default SelectedProjects;
