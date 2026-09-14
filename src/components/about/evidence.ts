import type { Ownership, Provenance, SoleAuthor } from "@/types";

/* ==========================================================================
 * The evidence gate — content-spec.md §3 and §6, enforced in code.
 *
 * §6 rule 1: "Render nothing with `provenance: 'unverified'` or with an empty
 * `ownership`."
 *
 * That rule is deliberately NOT a comment on the data and NOT a manual step in
 * a review. It is this module, and every section that renders claim-bearing
 * content calls it. New entries added to content.tsx are gated automatically:
 * a project or achievement only reaches the page once someone has actually
 * measured who wrote the code.
 *
 * `yt-blog` is in `projects` precisely to exercise this. It has no `.git`
 * directory, so `ownership` cannot be filled, so it does not render. If it ever
 * appears on /about, this module has been bypassed.
 * ========================================================================== */

/**
 * The shape the gate needs. Both {@link Achievement} and {@link Project}
 * structurally satisfy it, which is why the gate is generic over it rather than
 * being written twice.
 */
export type EvidenceGated = {
  provenance: Provenance;
  ownership?: Ownership;
  /** Outbound links. A "deployed" entry must carry at least one, or it does not render. */
  links?: ReadonlyArray<{ label: string; href: string }>;
  /** Working-tree evidence. A "self-authored" entry must carry it, or it does not render. */
  soleAuthor?: SoleAuthor;
};

/**
 * True only when the working-tree evidence shows a genuinely solo project.
 *
 * `contributors > 1` means somebody else committed, and the entry must go through the
 * measured-ownership path instead. A remote is allowed (the code can be pushed somewhere)
 * but there must be real source to point at.
 */
export function hasSoleAuthorship(sa: SoleAuthor | undefined): sa is SoleAuthor {
  if (!sa) return false;
  if (!Number.isFinite(sa.contributors) || sa.contributors > 1) return false;
  if (!Number.isFinite(sa.files) || sa.files <= 0) return false;
  if (!Number.isFinite(sa.lines) || sa.lines <= 0) return false;
  if (typeof sa.inspected !== "string" || sa.inspected.trim() === "") return false;
  return true;
}

/**
 * True only when the ownership block holds real measurements.
 *
 * "Unfilled" is not just `undefined`. A block stubbed out with zeroes or an
 * empty window is unmeasured too, and must not let a claim through:
 *
 * - `totalCommits` must be positive — a repo with no commits was never measured.
 * - `myCommits` must be positive — 0 commits means the work is not his
 *   (`portal-backend` is 0 of 22).
 * - `contributors` must be positive — every measured repo has at least one author.
 * - `window` must be a non-empty string — the date range is part of the receipt.
 *
 * Doubles as a type guard so callers can read `ownership` without a null check.
 */
export function hasMeasuredOwnership(ownership: Ownership | undefined): ownership is Ownership {
  if (!ownership) return false;
  if (!Number.isFinite(ownership.totalCommits) || ownership.totalCommits <= 0) return false;
  if (!Number.isFinite(ownership.myCommits) || ownership.myCommits <= 0) return false;
  if (!Number.isFinite(ownership.contributors) || ownership.contributors <= 0) return false;
  if (typeof ownership.window !== "string" || ownership.window.trim() === "") return false;
  return true;
}

/**
 * The gate itself. Both conditions must hold:
 *
 * 1. `provenance !== "unverified"` — the code was actually read.
 * 2. ownership is measured — and it is known who wrote it.
 *
 * Provenance and ownership are separate questions and both have to pass.
 * Reading a file line by line proves the code exists; it says nothing about
 * authorship. That confusion is the methodology flaw OWNERSHIP.md documents,
 * and this function is where it is prevented from recurring.
 */
export function passesEvidenceGate(entry: EvidenceGated): boolean {
  // Never, under any circumstance.
  if (entry.provenance === "unverified") return false;

  // A live product Razvan owns but cannot be git-measured here. The public artifact IS
  // the evidence, so the gate requires a working link instead of a commit count. This is
  // deliberately not a bypass: without a link there is nothing for a reader to check,
  // and the entry is refused exactly like an unmeasured one.
  if (entry.provenance === "deployed") {
    return Boolean(entry.links?.some((l) => /^https?:\/\//.test(l.href)));
  }

  // A solo project with no commit history. The evidence is the working tree itself:
  // source that was read directly, with no other contributor who could have written it.
  // Narrower than it looks — one commit from anyone else and this path closes.
  if (entry.provenance === "self-authored") {
    return hasSoleAuthorship(entry.soleAuthor);
  }

  // Everything else must be measured.
  return hasMeasuredOwnership(entry.ownership);
}

/**
 * Filters a list down to entries that clear the gate. Preserves source order.
 */
export function filterByEvidenceGate<T extends EvidenceGated>(entries: readonly T[]): T[] {
  return entries.filter(passesEvidenceGate);
}

/**
 * One line summarising a measured ownership block, built only from numbers that
 * exist in it. Never derives, rounds or embellishes — the raw counts are the
 * claim.
 *
 * e.g. "Sole author · 16 of 16 commits · 2026-08-24 → 2026-08-25"
 *      "70 of 1,068 commits · 6 authors · 2024-08-10 → 2026-05-21"
 */
export function summariseOwnership(ownership: Ownership): string {
  const commits = `${ownership.myCommits.toLocaleString("en-US")} of ${ownership.totalCommits.toLocaleString("en-US")} commits`;
  const authorship =
    ownership.contributors === 1 ? "Sole author" : `${ownership.contributors} authors`;
  const parts =
    ownership.contributors === 1
      ? [authorship, commits, ownership.window]
      : [commits, authorship, ownership.window];
  if (ownership.pairedWith) parts.push(`paired with ${ownership.pairedWith}`);
  return parts.join(" · ");
}
