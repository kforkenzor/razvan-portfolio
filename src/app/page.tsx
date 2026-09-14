import { Heading, Text, Button, Avatar, RevealFx, Column, Badge, Row } from "@once-ui-system/core";
import { about, home, person } from "@/resources";
import { Projects } from "@/components/work/Projects";
import { JsonLd } from "@/components";
import { ogImagePath, pageMetadata } from "@/utils/seo";

export async function generateMetadata() {
  return pageMetadata({
    title: home.title,
    description: home.description,
    path: home.path,
    image: home.image,
  });
}

/* SPEC.md §12 #24 — the reference's hero reveal finishes at t ≈ 2.6s after
   hydration: RevealFx defaults to speed="medium" (2000ms) and the last block
   carries delay={0.6}. Two and a half seconds is a long time to wait for a
   headline. Every RevealFx below runs at speed="fast" (1000ms) on a halved
   stagger, so the last one lands at ~1.3s.

   No `useReducedMotion` gate is needed: the `prefers-reduced-motion` block in
   custom.css sets `transition-duration: .01ms !important`, and !important beats
   RevealFx's inline transition style. */
const REVEAL_SPEED = "fast";

export default function Home() {
  return (
    <Column maxWidth={76} gap="xl" paddingY="12" horizontal="center">
      <JsonLd
        type="WebPage"
        path={home.path}
        title={home.title}
        description={home.description}
        image={ogImagePath(home.title)}
      />
      <Column fillWidth horizontal="center" gap="m">
        <Column maxWidth="s" horizontal="center" align="center">
          {home.featured.display && (
            <RevealFx
              speed={REVEAL_SPEED}
              fillWidth
              horizontal="center"
              paddingTop="16"
              paddingBottom="32"
              paddingLeft="12"
            >
              <Badge
                background="brand-alpha-weak"
                paddingX="12"
                paddingY="4"
                onBackground="neutral-strong"
                textVariant="label-default-s"
                arrow={false}
                href={home.featured.href}
              >
                <Row paddingY="2">{home.featured.title}</Row>
              </Badge>
            </RevealFx>
          )}
          <RevealFx
            speed={REVEAL_SPEED}
            translateY="4"
            fillWidth
            horizontal="center"
            paddingBottom="16"
          >
            <Heading wrap="balance" variant="display-strong-l">
              {home.headline}
            </Heading>
          </RevealFx>
          <RevealFx
            speed={REVEAL_SPEED}
            translateY="8"
            delay={0.1}
            fillWidth
            horizontal="center"
            paddingBottom="32"
          >
            <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-xl">
              {home.subline}
            </Text>
          </RevealFx>
          <RevealFx
            speed={REVEAL_SPEED}
            paddingTop="12"
            delay={0.2}
            horizontal="center"
            paddingLeft="12"
          >
            <Button
              id="about"
              data-border="rounded"
              href={about.path}
              variant="secondary"
              size="m"
              weight="default"
              arrowIcon
            >
              <Row gap="8" vertical="center" paddingRight="4">
                {/* Also gated on `person.avatar` being set. With an empty avatar
                    Once UI renders its generic person glyph, and a stock icon
                    inside the page's primary CTA reads as a broken image. */}
                {about.avatar.display && person.avatar && (
                  <Avatar
                    marginRight="8"
                    style={{ marginLeft: "-0.75rem" }}
                    src={person.avatar}
                    size="m"
                  />
                )}
                {about.title}
              </Row>
            </Button>
          </RevealFx>
        </Column>
      </Column>
      <RevealFx speed={REVEAL_SPEED} translateY="16" delay={0.3}>
        <Projects range={[1, 1]} />
      </RevealFx>
      <Projects range={[2]} />
    </Column>
  );
}
