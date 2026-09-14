import {
  Avatar,
  Button,
  Column,
  Heading,
  Icon,
  IconButton,
  Media,
  Row,
  SmartLink,
  Tag,
  Text,
} from "@once-ui-system/core";
import React from "react";

import { about, person, presentationSites, projects, social } from "@/resources";
import { JsonLd } from "@/components";
import { ogImagePath, pageMetadata } from "@/utils/seo";
import TableOfContents from "@/components/about/TableOfContents";
import KeyAchievements from "@/components/about/KeyAchievements";
import SelectedProjects from "@/components/about/SelectedProjects";
import { PresentationSites } from "@/components/about/PresentationSites";
import { filterByEvidenceGate } from "@/components/about/evidence";
import styles from "@/components/about/about.module.scss";

/* ==========================================================================
 * /about — the CV page. Rendered from `content.tsx` only; no MDX.
 *
 * Section order is content-spec.md §1:
 *   Introduction → Key Achievements → Work Experience → Projects
 *   → Education → Technical Skills
 *
 * Projects is the one deviation from the reference architecture and is
 * argued for in content-spec.md §1. Everything else — the fixed TOC rail, the
 * 3:9 rail split, the sticky avatar column, the responsive behaviour — follows
 * SPEC.md §3.7.
 *
 * Anchor ids follow SPEC.md §3.7.10: the id IS the raw section title, spaces
 * and all, because TableOfContents scrolls to `document.getElementById(title)`.
 * Rename a section and you silently move its anchor.
 * ========================================================================== */

/**
 * Section heading and anchor id for Projects.
 *
 * It lives here rather than in `content.tsx` because the section is a property
 * of this page's architecture, not of the content model: `projects` is a
 * top-level array consumed by both /about and /work.
 */
const PROJECTS_TITLE = "Projects";

/** Section heading and anchor id for the lighter client-site section. */
const PRESENTATION_TITLE = "Presentation Websites";

export async function generateMetadata() {
  return pageMetadata({
    title: about.title,
    description: about.description,
    image: ogImagePath(about.title),
    path: about.path,
  });
}

export default function About() {
  /* ------------------------------------------------------------------------
   * The evidence gate (content-spec.md §6, src/components/about/evidence.ts).
   *
   * Run here as well as inside the section components, for one reason: the
   * table of contents must not advertise a section that renders nothing. A
   * section whose entries are all gated out disappears from the rail and from
   * the page together.
   *
   * `yt-blog` has no `.git` history, so its `ownership` cannot be filled — it
   * is dropped here and never reaches the DOM. That is the gate working, not a
   * bug to fix.
   * ---------------------------------------------------------------------- */
  const visibleAchievements = filterByEvidenceGate(about.achievements.items);
  const visibleProjects = filterByEvidenceGate(projects);
  const visibleSites = filterByEvidenceGate(presentationSites);

  const showAchievements = about.achievements.display && visibleAchievements.length > 0;
  const showProjects = visibleProjects.length > 0;
  const showSites = visibleSites.length > 0;

  const structure = [
    {
      title: about.intro.title,
      display: about.intro.display,
      items: [],
    },
    {
      title: about.achievements.title,
      display: showAchievements,
      items: visibleAchievements.map((achievement) => achievement.title),
    },
    {
      title: about.work.title,
      display: about.work.display,
      items: about.work.experiences.map((experience) => experience.company),
    },
    {
      title: PROJECTS_TITLE,
      display: showProjects,
      items: visibleProjects.map((project) => project.name),
    },
    {
      title: PRESENTATION_TITLE,
      display: showSites,
      items: visibleSites.map((site) => site.name),
    },
    {
      title: about.studies.title,
      display: about.studies.display,
      items: about.studies.institutions.map((institution) => institution.name),
    },
    {
      title: about.technical.title,
      display: about.technical.display,
      items: about.technical.skills.map((skill) => skill.title),
    },
  ];

  return (
    <Column maxWidth={76}>
      <JsonLd
        type="WebPage"
        path={about.path}
        title={about.title}
        description={about.description}
        image={ogImagePath(about.title)}
      />

      {/* TOC rail — fixed to the left edge, vertically centred, outside the
          measure. Hidden at ≤768px here and at ≤1024px by the component's own
          column, so effectively >1024px only (SPEC.md §3.7.1). */}
      {about.tableOfContent.display && (
        <Column
          left="0"
          style={{ top: "50%", transform: "translateY(-50%)" }}
          position="fixed"
          paddingLeft="24"
          gap="32"
          s={{ hide: true }}
        >
          <TableOfContents structure={structure} about={about} />
        </Column>
      )}

      <Row fillWidth s={{ direction: "column" }} horizontal="center">
        {/* Avatar rail — flex 3 against the content rail's 9 (SPEC.md §3.7.2).
            Sticky at top:4rem above 768px, relative and stacked below it. */}
        {about.avatar.display && (
          <Column
            top="64"
            fitHeight
            position="sticky"
            s={{ position: "relative", style: { top: "auto" } }}
            xs={{ style: { top: "auto" } }}
            minWidth="160"
            paddingX="l"
            paddingBottom="xl"
            gap="m"
            flex={3}
            horizontal="center"
          >
            <Avatar src={person.avatar} size="xl" />
            <Row gap="8" vertical="center">
              <Icon onBackground="accent-weak" name="globe" />
              {/* `displayLocation`, never `location` — the latter is the IANA
                  zone id that drives the header clock. */}
              {person.displayLocation}
            </Row>
            {person.languages && person.languages.length > 0 && (
              <Row wrap gap="8">
                {person.languages.map((language, index) => (
                  <Tag key={index} size="l">
                    {language}
                  </Tag>
                ))}
              </Row>
            )}
          </Column>
        )}

        {/* Content rail — flex 9, 40rem measure (SPEC.md §3.7.3). */}
        <Column className={styles.blockAlign} flex={9} maxWidth={58}>
          {/* Identity header. The `Introduction` anchor sits on this Column,
              not on a heading (SPEC.md §3.7.10). */}
          <Column
            id={about.intro.title}
            fillWidth
            minHeight="160"
            vertical="center"
            marginBottom="32"
          >
            {about.contactCta.display && (
              /* The whole pill is the link. Upstream put the href on the trailing
                 IconButton alone, which left the icon and the label — most of the
                 target — inert. */
              <SmartLink
                href={about.contactCta.link}
                unstyled
                className={styles.blockAlign}
                aria-label={about.contactCta.label}
              >
                <Row
                  fitWidth
                  border="brand-alpha-medium"
                  background="brand-alpha-weak"
                  radius="full"
                  padding="4"
                  gap="8"
                  marginBottom="m"
                  vertical="center"
                  style={{
                    backdropFilter: "blur(var(--static-space-1))",
                  }}
                >
                  <Icon
                    paddingLeft="12"
                    name={about.contactCta.icon}
                    onBackground="brand-weak"
                  />
                  <Row paddingX="8">{about.contactCta.label}</Row>
                  <IconButton
                    data-border="rounded"
                    variant="secondary"
                    icon="chevronRight"
                    tabIndex={-1}
                  />
                </Row>
              </SmartLink>
            )}
            <Heading className={styles.textAlign} variant="display-strong-xl">
              {person.name}
            </Heading>
            <Text
              className={styles.textAlign}
              variant="display-default-xs"
              onBackground="neutral-weak"
            >
              {person.role}
            </Text>
            {social.length > 0 && (
              <Row
                className={styles.blockAlign}
                paddingTop="20"
                paddingBottom="8"
                gap="8"
                wrap
                horizontal="center"
                fitWidth
                data-border="rounded"
              >
                {/* An empty `link` renders nothing — see content.tsx. A missing
                    profile button beats a broken one. */}
                {social
                  .filter((item) => item.essential)
                  .map(
                    (item) =>
                      item.link && (
                        <React.Fragment key={item.name}>
                          <Row s={{ hide: true }}>
                            <Button
                              key={item.name}
                              href={item.link}
                              prefixIcon={item.icon}
                              label={item.name}
                              size="s"
                              weight="default"
                              variant="secondary"
                            />
                          </Row>
                          <Row hide s={{ hide: false }}>
                            <IconButton
                              size="l"
                              key={`${item.name}-icon`}
                              href={item.link}
                              icon={item.icon}
                              variant="secondary"
                            />
                          </Row>
                        </React.Fragment>
                      ),
                  )}
              </Row>
            )}
          </Column>

          {/* 1 — Introduction (content-spec.md §4.1) */}
          {about.intro.display && (
            <Column textVariant="body-default-l" fillWidth gap="m" marginBottom="xl">
              {about.intro.description}
              {about.intro.tags && about.intro.tags.length > 0 && (
                <Row wrap gap="8" paddingTop="m">
                  {about.intro.tags.map((tag, index) => (
                    <Tag key={`intro-${index}`} size="l" prefixIcon={tag.icon}>
                      {tag.name}
                    </Tag>
                  ))}
                </Row>
              )}
            </Column>
          )}

          {/* 2 — Key Achievements (content-spec.md §4.2). The component runs the
                 evidence gate itself; `showAchievements` only keeps this call in
                 step with the TOC. */}
          {showAchievements && (
            <KeyAchievements title={about.achievements.title} items={about.achievements.items} />
          )}

          {/* 3 — Work Experience (content-spec.md §4.3) */}
          {about.work.display && (
            <>
              <Heading as="h2" id={about.work.title} variant="display-strong-s" marginBottom="m">
                {about.work.title}
              </Heading>
              <Column fillWidth gap="l" marginBottom="40">
                {about.work.experiences.map((experience, index) => (
                  <Column key={`${experience.company}-${experience.role}-${index}`} fillWidth>
                    <Row fillWidth horizontal="between" vertical="end" marginBottom="4">
                      <Text id={experience.company} variant="heading-strong-l">
                        {experience.company}
                      </Text>
                      <Text variant="heading-default-xs" onBackground="neutral-weak">
                        {experience.timeframe}
                      </Text>
                    </Row>
                    <Text variant="body-default-s" onBackground="brand-weak" marginBottom="m">
                      {experience.role}
                    </Text>
                    <Column as="ul" gap="16">
                      {experience.achievements.map(
                        (achievement: React.ReactNode, achievementIndex: number) => (
                          <Text
                            as="li"
                            variant="body-default-m"
                            key={`${experience.company}-${achievementIndex}`}
                          >
                            {achievement}
                          </Text>
                        ),
                      )}
                    </Column>
                    {experience.images && experience.images.length > 0 && (
                      <Row fillWidth paddingTop="m" paddingLeft="40" gap="12" wrap>
                        {experience.images.map((image, imageIndex) => (
                          <Row
                            key={imageIndex}
                            border="neutral-medium"
                            radius="m"
                            minWidth={image.width}
                            height={image.height}
                          >
                            <Media
                              enlarge
                              radius="m"
                              sizes={image.width.toString()}
                              alt={image.alt}
                              src={image.src}
                            />
                          </Row>
                        ))}
                      </Row>
                    )}
                  </Column>
                ))}
              </Column>
            </>
          )}

          {/* 4 — Projects (content-spec.md §4.4). NEW section, and the
                 one deviation from the reference architecture. */}
          {showProjects && <SelectedProjects title={PROJECTS_TITLE} projects={projects} />}

          {/* 4b — Presentation websites. Smaller client sites, compact cards, no case
                  studies. Kept out of Projects on purpose so the platform work is not
                  measured against a brochure site. */}
          {showSites && <PresentationSites title={PRESENTATION_TITLE} sites={presentationSites} />}

          {/* 5 — Education (content-spec.md §4.6) */}
          {about.studies.display && (
            <>
              <Heading as="h2" id={about.studies.title} variant="display-strong-s" marginBottom="m">
                {about.studies.title}
              </Heading>
              <Column fillWidth gap="l" marginBottom="40">
                {about.studies.institutions.map((institution, index) => (
                  <Column key={`${institution.name}-${index}`} fillWidth gap="4">
                    <Text id={institution.name} variant="heading-strong-l">
                      {institution.name}
                    </Text>
                    <Text variant="heading-default-xs" onBackground="neutral-weak">
                      {institution.description}
                    </Text>
                  </Column>
                ))}
              </Column>
            </>
          )}

          {/* 6 — Technical Skills (content-spec.md §4.5). Last block on the
                 page, so no marginBottom on the list. */}
          {about.technical.display && (
            <>
              <Heading
                as="h2"
                id={about.technical.title}
                variant="display-strong-s"
                marginBottom="40"
              >
                {about.technical.title}
              </Heading>
              <Column fillWidth gap="l">
                {about.technical.skills.map((skill, index) => (
                  // Upstream templated the whole `skill` object into the key,
                  // producing "[object Object]-0". SPEC.md §3.7.9 says fix it.
                  <Column key={`${skill.title}-${index}`} fillWidth gap="4">
                    <Text id={skill.title} variant="heading-strong-l">
                      {skill.title}
                    </Text>
                    <Text variant="body-default-m" onBackground="neutral-weak">
                      {skill.description}
                    </Text>
                    {skill.tags && skill.tags.length > 0 && (
                      <Row wrap gap="8" paddingTop="8">
                        {skill.tags.map((tag, tagIndex) => (
                          <Tag key={`${skill.title}-${tagIndex}`} size="l" prefixIcon={tag.icon}>
                            {tag.name}
                          </Tag>
                        ))}
                      </Row>
                    )}
                    {skill.images && skill.images.length > 0 && (
                      <Row fillWidth paddingTop="m" gap="12" wrap>
                        {skill.images.map((image, imageIndex) => (
                          <Row
                            key={imageIndex}
                            border="neutral-medium"
                            radius="m"
                            minWidth={image.width}
                            height={image.height}
                          >
                            <Media
                              enlarge
                              radius="m"
                              sizes={image.width.toString()}
                              alt={image.alt}
                              src={image.src}
                            />
                          </Row>
                        ))}
                      </Row>
                    )}
                  </Column>
                ))}
              </Column>
            </>
          )}
        </Column>
      </Row>
    </Column>
  );
}
