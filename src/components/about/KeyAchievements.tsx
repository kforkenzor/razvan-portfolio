import { Column, Heading, Icon, Row, Text } from "@once-ui-system/core";
import type { Achievement } from "@/types";
import { filterByEvidenceGate } from "./evidence";

/* ==========================================================================
 * Key Achievements — content-spec.md §4.2, SPEC.md §3.7.6.
 *
 * Layout is SPEC.md §3.7.6's: a stack of [icon] [title / body] rows, no cards.
 * The one thing added on top of it is the evidence gate, applied here rather
 * than in the data, so a card added to content.tsx without a measured
 * `ownership` block silently does not ship instead of silently shipping.
 *
 * OWNERSHIP.md cut five of the seven candidate cards in content-spec.md §4.2
 * for cause. They are absent from the data; if one is ever restored without its
 * measurements, `filterByEvidenceGate` drops it again here.
 * ========================================================================== */

interface KeyAchievementsProps {
  title: string;
  items: Achievement[];
}

export function KeyAchievements({ title, items }: KeyAchievementsProps) {
  // THE GATE. Anything with `provenance: "unverified"` or an unfilled
  // `ownership` block never reaches the DOM.
  const visible = filterByEvidenceGate(items);

  // An empty section is worse than no section. The caller also checks this so
  // the heading never appears in the table of contents pointing at nothing.
  if (visible.length === 0) return null;

  return (
    <>
      <Heading as="h2" id={title} variant="display-strong-s" marginBottom="m">
        {title}
      </Heading>
      <Column fillWidth gap="4" marginBottom="xl">
        {visible.map((item) => (
          <Row key={item.id} fillWidth gap="s" vertical="start" paddingY="s">
            {item.icon && (
              <Icon
                name={item.icon}
                size="m"
                onBackground="brand-strong"
                style={{ marginTop: "2px", flexShrink: 0 }}
              />
            )}
            <Column gap="2" flex={1}>
              {/* The anchor id follows SPEC.md §3.7.10's convention — the raw
                  title string. §3.7.1 flags the reference's missing achievement
                  ids as a defect (TOC sub-items scroll nowhere); giving them
                  ids is what makes `tableOfContent.subItems` safe to enable. */}
              <Text id={item.title} variant="heading-strong-s">
                {item.title}
              </Text>
              <Text variant="body-default-l" onBackground="neutral-weak">
                {item.body}
              </Text>
            </Column>
          </Row>
        ))}
      </Column>
    </>
  );
}

export default KeyAchievements;
