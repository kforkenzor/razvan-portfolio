# Ownership Measurements

Fills the `ownership` gate required by `content-spec.md` §3. Every number here was measured
on this machine on **2026-09-08**, not estimated. Commands are given so any of it can be re-run.

Identities counted as Razvan: `c.razvan27@yahoo.com`, `rzv@Razvans-MacBook-Pro.local`,
`kforkenzor <101364836+kforkenzor@users.noreply.github.com>`, `calotarazvan27@gmail.com`.

All counts are **`HEAD`-only** (`git log HEAD`), not `--all`. Measuring with `--all` double-counts
commits reachable from feature branches and produced author totals exceeding the repo's own
commit count — that is the error behind the "seven authors" figure in `content-spec.md` §3.

---

## Summary

| Repo | His commits | Total | % commits | % source lines | Distinct authors | Window |
|---|---:|---:|---:|---:|---:|---|
| `autmated content creation` (short-form-content-platform) | **16** | **16** | **100%** | **100%** | 1 | 2026-08-24 → 2026-08-25 |
| `yt-newsletter-backend` | 70 | 1068 | 6.6% | **0.6%** | 6 | 2024-08-10 → 2026-05-21 |
| `yt-admin-dashboard` | 2 | 175 | 1.1% | — | 2 | 2024-08-08 → 2026-01-09 |
| `portal-backend` | 0 | 22 | 0% | 0% | 1 | 2025-08-22 → 2026-03-24 |
| `yt-blog` (`~/Downloads/yt-blog-main`) | — | — | — | — | — | **no `.git` — unverifiable** |
| `casa-teo` | 0 | 0 | — | — | — | repo initialised, nothing committed |
| `gt6` | 1 | 1 | 100% | 100% | 1 | 2026-09-06 |
| `hotel/web` | 1 | 1 | 100% | 100% | 1 | 2026-05-18 |

---

## `short-form-content-platform` — sole author

```ts
{ myCommits: 16, totalCommits: 16, contributors: 1,
  window: "2026-08-24 → 2026-08-25", note: "sole author; agent-assisted implementation" }
```

**37,733 source lines / 541 files.** pnpm + Turborepo monorepo.

| Package | Lines |
|---|---:|
| `packages/db` (Drizzle schema, RLS on every table, Supabase migrations) | 12,962 |
| `apps/worker` (NestJS + BullMQ, per-stage processors) | 7,672 |
| `packages/core` (domain types, Zod env contract, nine scoring signal extractors) | 6,779 |
| `packages/mcp` (MCP server: `score_candidate`, `dedupe_check`, `select_daily_winner`) | 4,259 |
| `packages/sources` (SourceAdapter registry + adapters) | 2,016 |
| `apps/api` (NestJS 11, health probes, OpenAPI) | 1,325 |
| `apps/renderer` (Remotion composition) | 1,052 |
| `apps/web` (Next 16 review dashboard) | 721 |

12-stage pipeline: ingest → score → select → script → voice → align → visual → render →
**human review gate** → publish → measure → feedback. CI carries a quality gate, a migration
format guard and an RLS assertion.

**Honest caveat, and it matters.** 37,733 lines across 16 commits in two days is
agent-assisted output, not hand-typed craft — the repo contains `.claude/` and a `CLAUDE.md`.
The defensible claim is **architecture and direction**: the pipeline decomposition, the
non-optional review gate, RLS-on-every-table, the Zod env contract, the MCP tool surface.
Do not claim the line count as craft. Be ready to defend *why* each stage boundary sits where
it does — that part is genuinely yours and is the more interesting answer anyway.

## `yt-newsletter-backend` — contributor

```ts
{ myCommits: 70, totalCommits: 1068, contributors: 6,
  window: "2024-08-10 → 2026-05-21", pairedWith: "coworker, from 2025-07-01",
  note: "59 of 522 commits in the paired window; 0.6% of non-generated source additions" }
```

Three counter-hypotheses were tested and **all three failed**:

1. **Line-count inflation** — excluding CSVs, lockfiles, `dist/` and migration-report JSON,
   real source additions are 636,764, of which Leonard wrote 632,576 (**99.3%**) and Razvan
   4,120 (**0.6%**).
2. **Squash-merge erasure** — 89 merge commits and many `feature/*` branches exist, but git
   merges *preserve* authorship and `git log HEAD` already counts merged-in commits.
   Exactly **1** `Co-authored-by` trailer in the entire history.
3. **Pairing invisibility** — in the paired window (since 2025-07-01) he has 59 of 522.
   Higher than his lifetime share, consistent with real pairing, still a minority.

**What the 70 commits actually are.** Read by subject and diff, they are overwhelmingly
ad-network and brand configuration: *"new brand added"*, *"aquasculpt new brand postmark
config"*, *"segments for pm-sends"*, *"earthecho adNetwork"*. Typical diffs are 1–16 lines
into `ad.entity.ts` and `emails.service.ts`.

Most-touched files: `sendPostmarkEmailConsumer.ts` (22), `emails.service.ts` (14),
`cron-scheduler.service.ts` (13), `webhooks.controller.ts` (11), `sendMailgunEmailConsumer.ts` (10).

Genuinely engineering-flavoured commits in the set: *"title changing AI service for less
spammy"* (`openai.service.ts`), *"resend migration fix"*, *"restore ad title and CTA from CSV
file"* + `scripts/update-ads-from-csv.ts`.

**Defensible scope:** ad-network and brand integration, ESP-consumer configuration and send
segmentation inside a high-volume production email platform. That is real, specific, and
survives a follow-up question. It is not "built the sending engine."

## `yt-admin-dashboard` — not his

```ts
{ myCommits: 2, totalCommits: 175, contributors: 2, window: "2024-08-08 → 2026-01-09" }
```

**0 commits since 2025-07-01** (of 35 in that window). Leonard authored 173 of 175.

### Methodology flaw in `SKILLS-EXTRACTION.md`

That document is titled *"SKILLS EXTRACTION — Razvan Calota"* and presents the console's scale —
*"175 commits, ~18,000 lines of TypeScript, 9 dashboard modules"* — as his. Its provenance key
defines `[PROVEN]` as *"read line-by-line in yt-admin-dashboard; file:line cited; defensible in
interview."*

Reading code line-by-line proves **the code exists**. It says nothing about who wrote it. Every
`[PROVEN]` tag in that file is a statement about the repo, not about authorship. `content-spec.md`
§3 was right to separate `ownership` from `provenance` and to call it unresolved.

---

## Consequence for `content-spec.md` §4.2

Under §6 (*"Render nothing with `provenance: 'unverified'` or with an empty `ownership`"*), the
seven candidate achievement cards now resolve as:

| Card | Backing repo | Verdict |
|---|---|---|
| Closed-Loop Email Platform | backend + dashboard | **Cut** — 0.6% / 1.1% |
| Multi-Provider Delivery Routing | backend | **Rewrite** — configured providers, did not engineer routing |
| Deliverability Infrastructure | backend | **Cut** — no SPF/DKIM/Cloudflare/warmup commits |
| AI Content Pipeline | backend | **Rewrite** — 2 commits on `openai.service.ts`; the real version belongs to short-form-content-platform |
| Revenue Attribution Across Networks | backend | **Cut** — no ClickBank/AES commits |
| Operations Console at Scale | dashboard | **Cut** — 2 of 175 commits |
| Session Security | dashboard | **Cut** — not his repo |

Five cut, two rewritten to their true scope. The replacement cards should come from
`short-form-content-platform`, where ownership is 100% and unambiguous.
