import { Column, Icon, Row, Text } from "@once-ui-system/core";
import type { Ownership } from "@/types";
import { summariseOwnership } from "./evidence";

/* ==========================================================================
 * The ownership receipt that travels with a project.
 *
 * content-spec.md §4.4 requires the `ownership` block to be part of every
 * Selected Projects entry, not a footnote in the data. Printing the measured
 * numbers next to the claim is the point: it removes the awkward follow-up
 * before it is asked, and it means a reader can size the contribution without
 * having to trust an adjective.
 *
 * Everything here is measured (OWNERSHIP.md, `git log HEAD`, 2026-09-08).
 * Nothing is derived, rounded or estimated.
 * ========================================================================== */

interface OwnershipBlockProps {
  ownership: Ownership;
}

export function OwnershipBlock({ ownership }: OwnershipBlockProps) {
  return (
    <Column
      fillWidth
      gap="4"
      padding="m"
      radius="m"
      border="neutral-alpha-weak"
      background="neutral-alpha-weak"
    >
      <Row gap="8" vertical="center">
        <Icon name="document" size="xs" onBackground="neutral-weak" />
        <Text variant="label-default-s" onBackground="neutral-weak">
          Measured ownership
        </Text>
      </Row>
      <Text variant="body-default-s" onBackground="neutral-medium">
        {summariseOwnership(ownership)}
      </Text>
      {ownership.note && (
        <Text variant="body-default-s" onBackground="neutral-weak">
          {ownership.note}
        </Text>
      )}
    </Column>
  );
}

export default OwnershipBlock;
