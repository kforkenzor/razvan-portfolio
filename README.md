# razvan-portfolio

Personal portfolio for **Razvan Calota** — full-stack TypeScript engineer.

Currently a **skeleton**: every section exists and renders, and the copy that needs
Razvan's input is marked in place with `TODO(razvan):`. Structure and wiring are done;
prose is not.

```bash
grep -rn "TODO(razvan)" src public *.md
```

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript `strict` |
| Design system | [`@once-ui-system/core`](https://once-ui.com) 1.8.4 — SCSS + CSS custom properties. **Not Tailwind.** |
| Content | `.mdx` case studies via `next-mdx-remote/rsc` + `gray-matter`, read off disk at build time |
| Package manager | pnpm |

Forked from `once-ui-system/magic-portfolio` v2.3.0. See `LICENSE` (CC BY-NC 4.0) —
attribution in the footer is a licence obligation, not leftover template text.

## Run it

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # must exit 0
```

`pnpm lint` runs Biome. It currently exits 1 on ~20 style findings, all of them in code
inherited from the template — `any` in `mdx.tsx`, array-index React keys, two `useEffect`
dependency warnings. They are reported rather than silenced. `pnpm biome-write` applies the
safe fixes; `pnpm typecheck` runs `tsc --noEmit`.

Biome's `organizeImports` is disabled on purpose (`biome.json`). It sorts contiguous import
blocks alphabetically, and `layout.tsx` opens with three side-effect CSS imports whose order
*is* the cascade — `custom.css` must stay last or every override in it is dropped.

## Routes

| Route | Rendering | Source |
|---|---|---|
| `/` | static | `src/app/page.tsx` + `home` in `src/resources/content.tsx` |
| `/about` | static | `src/app/about/page.tsx` + `about` / `person` / `projects` |
| `/work` | static | `src/app/work/page.tsx`, lists the `.mdx` files |
| `/work/[slug]` | SSG | one `.mdx` per file in `src/app/work/projects/` |
| `/sitemap.xml`, `/robots.txt` | static | `src/app/sitemap.ts`, `src/app/robots.ts` |
| `/api/og/generate` | dynamic | Open Graph card, 1200×630 |

`/blog` and `/gallery` shipped with the template and were deleted, not toggled off.
An unknown `/work/<slug>` returns a real 404.

## Where the content lives

**`src/resources/content.tsx`** is the single source of truth for everything that is not
a case study: identity, social links, the home hero, and every `/about` section. Editing it
is how you edit the site.

**`src/app/work/projects/*.mdx`** — one file per case study. The filename is the route slug.
Frontmatter carries the title, date, summary, screenshots and team; the body is the case study.

**`src/resources/once-ui.config.ts`** — theme tokens, enabled routes, fonts, `baseURL`.

## The evidence gate

`src/components/about/evidence.ts` is a hard rule enforced in code, not a review checklist:

> Nothing renders unless it has `provenance !== "unverified"` **and** a measured `ownership`
> block — real commit counts, a real contributor count, a real date window.

`OWNERSHIP.md` holds those measurements and how they were taken (`git log HEAD`, 2026-09-08).
The `yt-blog` entry in `projects` deliberately fails the gate: the repo has no `.git` directory,
so authorship cannot be measured, so it does not reach the page. If it ever appears on `/about`,
the gate has been bypassed.

Adding a project therefore has two steps: write the entry, **and** measure who wrote the code.

## Ground rules for the copy

From `content-spec.md` §6, and they are not stylistic:

1. Never invent a number, metric, outcome, date, employer or job title. If a slot needs one and
   none exists, it stays a `TODO(razvan):` marker.
2. Contribution phrasing for shared codebases. `yt-newsletter-backend` is 70 of 1,068 commits on
   a six-author repo; it says so, on the page.
3. `yt-admin-dashboard` (2 of 175) and `portal-backend` (0 of 22) are **not** his work and appear
   nowhere on the site.

## Before deploying

- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real origin (see `.env.example`). It drives canonical
      URLs, OG tags and JSON-LD; without it everything self-references `localhost`.
- [ ] Add `src/app/favicon.ico` — the current file is the template's.
- [ ] Add `/public/images/avatar.webp` and point `person.avatar` at it.
- [ ] Fill the `TODO(razvan)` markers, or delete the sections that are still empty.
- [ ] Drop the `eslint` devDependency. `.eslintrc.json` has been deleted (it extended
      `next/core-web-vitals`, and `eslint-config-next` was never installed); `next lint` no
      longer exists in Next 16. Removing the dep needs a `pnpm install` to resync the lockfile,
      which is why it was left in place rather than done here.
