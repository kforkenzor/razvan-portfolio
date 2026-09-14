# Portfolio Build Specification

**For:** Razvan — building a personal portfolio at `/Users/rzv/Documents/portfolio`. Node 22 + pnpm available; **not** a git repo yet.

**State of the working directory (updated 2026-09-08, after this document was drafted):** it is *not* empty, and it is no longer pristine. It holds a `@once-ui-system/magic-portfolio` v2.3.0 checkout with `pnpm install` already run (`node_modules/`, `pnpm-lock.yaml`) and a `.next/` build. **`pnpm build` passes (exit 0, verified).** Still true: it is not a git repo, `package.json` carries the template's own name/version, `@once-ui-system/core` is still declared as `latest` (resolved to **1.8.4** in the lockfile), `src/app/` still has `blog/`, `gallery/` and `api/`, and `src/resources/content.tsx` is still Selene Yu's demo copy.

Three changes have already been applied on top of upstream — read the rest of this document with them in mind:

1. **Build fix (required).** Upstream does **not** compile against `@once-ui-system/core` 1.8.4: the package renamed its exported type `opacity` → `Opacity`, so `src/app/layout.tsx:12` and `src/components/Mailchimp.tsx:5` both failed with `TS2724`. The imports and the four `as opacity` assertions in each file were renamed. Object keys and `.opacity` property reads stay lowercase. This is a direct consequence of the `latest` pin — see Phase 0 on locking it.
2. `routes["/blog"]` and `routes["/gallery"]` set to `false`. Note this is **not** how the reference did it (it deleted the folders outright, §2.3) — the config toggle drives nav visibility and `RouteGuard` only, so both routes still compile and appear in the build output.
3. `protectedRoutes` emptied — it pointed at a demo project slug that will not exist.

So **Route A's scaffold already exists** and Phase 0 is a cleanup pass rather than a from-scratch setup.

**Modelled on:** `https://blancbo.com/` — Bogdan Blanc's portfolio.
**Written:** 2026-09-08, from a byte-level teardown of the live site (server HTML, RSC flight payloads, six compiled CSS bundles, the minified client JS chunks) plus a full clone of the upstream template it forks.

---

## How to read this document

Every structural claim below traces to one of seven verified source writeups. Where those writeups disagreed with each other, or flagged something as unverifiable, this document says so **inline** with a callout rather than picking a winner silently:

| Marker | Meaning |
|---|---|
| **[VERIFIED]** | Read directly out of shipped bytes (HTML, RSC payload, CSS, JS, or the upstream git tree). Safe to build on. |
| **[CONFLICT]** | The source writeups contradicted each other. Both readings are given, with the evidence for each. |
| **[UNVERIFIED]** | Nobody could confirm it from the captured artifacts. Treated as an assumption, never as fact. |
| **[DEFECT]** | Real, verified bug on the live site. Documented so you deliberately *don't* copy it. |

Two conventions that matter throughout:

- **Reference copy is quoted, never adopted.** Anywhere Bogdan's actual words appear they are marked *"reference copy, to be replaced"*. None of it is yours; it is included only so you can see the shape and length of the slot it fills.
- **"Stock" vs "custom"** is called out constantly, because the single most useful fact about this site is how little of it is custom. The colour system, spacing, motion tokens, layout shell, header, footer and route guard are the untouched Magic Portfolio defaults. The distinctive look comes from exactly four things: the fonts, one small global stylesheet, a rewritten `ProjectCard`, and the content.

---

# 1. Reference analysis

## 1.1 What blancbo.com actually is

It is **`once-ui-system/magic-portfolio` v2.3.0** with the content swapped out, three components rewritten, and two routes deleted. **[VERIFIED]** — the upstream clone (HEAD `c64bdb5`, `package.json` `"version": "2.3.0"`) matches the deployed structure field for field, and the theme configuration serialised into the live page is **byte-identical** to the upstream default.

The stack:

- **Next.js 16** App Router (build id `f6vn-8NxvrRFdZ62EIc7A`)
- **React 19**
- **TypeScript**, `strict: true`, path alias `@/* → ./src/*`
- **`@once-ui-system/core`** — an SCSS + CSS-custom-property design system. **Not Tailwind.** It ships a token layer (`tokens.css`), an atomic utility layer (`styles.css`), and a component library whose primitives (`Row`, `Column`, `Flex`, `Grid`) replace raw `<div>`s and take spacing/colour/responsive props.
- **MDX** via `next-mdx-remote/rsc`, read off disk with `fs` + `gray-matter` at build time
- **Vercel** hosting, `fra1` edge region, all routes fully prerendered (`x-nextjs-prerender: 1`)

## 1.2 The single most important structural fact

**Nothing on any page is server-rendered except the chrome.** **[VERIFIED — all seven writeups agree]**

The root layout wraps `{children}` in `<RouteGuard>`, a `"use client"` component that initialises `loading = true` and only clears it inside a `useEffect`. So the HTML Vercel serves contains: the background layer, one top fade strip, `<header>`, **a loading spinner**, and `<footer>`. That is all. The body shell is ~11.6 KB and near-identical on every route.

```html
<!-- what actually ships in the <main> slot, on every route -->
<div class="display-flex position-relative p-l flex-1 justify-center min-width-0 fill-width">
  <div class="… fill-width" style="min-height:var(--static-space-0)">
    <div class="display-flex position-relative py-128 justify-center min-width-0 fill-width">
      <div class="display-flex position-relative center">
        <div class="… Spinner_m__qdeyf" role="status" aria-label="Loading"> … </div>
```

The real page content lives only in the RSC flight payload (`self.__next_f.push([1,"…"])` inline scripts) and materialises after hydration. Consequences:

- The LCP element is a spinner.
- **All JSON-LD structured data is client-rendered** — invisible to non-JS crawlers. `<head>` metadata (title/description/OG) *is* server-rendered, so link previews still get correct text.
- With JS disabled the site has no content and no `<h1>`.

This is inherited straight from upstream, not a customisation. **You should decide deliberately whether to keep it.** Recommendation in §12.

## 1.3 Confirmed dependency list

From `upstream/package.json` + `package-lock.json` (lockfileVersion 3). **[VERIFIED]**

| Package | Declared range | Locked version | Why it's there |
|---|---|---|---|
| `next` | `^16.0.10` | **16.1.6** | framework |
| `react` | `^19.2.4` | **19.2.4** | |
| `react-dom` | `^19.2.3` | **19.2.4** | |
| `@once-ui-system/core` | **`latest`** ⚠️ | **1.5.6** | the entire design system |
| `@next/mdx` | `^16.0.10` | 16.1.6 | MDX webpack wiring (see §1.6 — largely unused) |
| `@mdx-js/loader` | `^3.1.0` | 3.1.1 | ditto |
| `next-mdx-remote` | `^6.0.0` | 6.0.0 | **the real MDX pipeline** |
| `gray-matter` | `^4.0.3` | 4.0.3 | frontmatter parsing |
| `classnames` | `^2.5.1` | 2.5.1 | className joining in `layout.tsx` |
| `cookie` | `^1.0.2` | 1.0.2 | password-protection auth cookie |
| `react-icons` | `^5.5.0` | 5.5.0 | the icon registry |
| `sass` | `^1.86.3` | 1.93.3 | SCSS modules |
| `transliteration` | `^2.3.5` | 2.3.5 | MDX heading slugs |
| `lint-staged` | `^16.1.5` | 16.2.6 | |

devDependencies: `@biomejs/biome` 1.9.4, `@types/cookie` 0.6.0, `@types/node` 20.19.24, `@types/react` 19.2.14, `@types/react-dom` 19.2.3, `eslint` 9.39.0, `typescript` 5.9.3, `tzdata` 1.0.46.

⚠️ **`@once-ui-system/core` is pinned to `latest`.** A fresh install will not reproduce 1.5.6 unless you respect a lockfile. **Pin it explicitly** in your own `package.json`.

**No `engines` field, no `.nvmrc`, no `.node-version`** anywhere in the template. The README says Node 18.17+; Next 16 actually needs Node 20.9+. Your Node 22 is fine — add an `engines` field so it stays that way.

Also note `"export": "next export"` in the upstream scripts is dead (removed from Next years ago), and `"lint": "next lint"` is very likely dead too on Next 16. **[VERIFIED / partially UNVERIFIED]**

## 1.4 Hosting & delivery facts **[VERIFIED via HTTP, single edge region `fra1`]**

| Asset class | `cache-control` | Notes |
|---|---|---|
| Prerendered HTML | `public, max-age=0, must-revalidate` | `x-nextjs-prerender: 1`, `x-nextjs-stale-time: 300`, `x-vercel-cache: HIT` |
| RSC payload (`/about.rsc`) | same | `content-type: text/x-component`, 75 KB for `/about` |
| `/_next/static/*` | `public, max-age=31536000, immutable` | JS, CSS, fonts |
| `/public` images | `public, max-age=0, must-revalidate` | ⚠️ no long-lived caching |
| `/_next/image?…` | `public, max-age=0, must-revalidate`, `vary: Accept` | serves WebP at q=75; AVIF not negotiated |

**Security headers: only `strict-transport-security`.** No CSP, no `X-Content-Type-Options`, no `Referrer-Policy`, no `Permissions-Policy`. `access-control-allow-origin: *` on everything (Vercel static default).

**No analytics, no third-party scripts of any kind.** No GA, GTM, Plausible, PostHog, Vercel Analytics. **[VERIFIED]**

Bundle weight, uncompressed / brotli:

| Chunk | Raw | Brotli | What |
|---|---:|---:|---|
| Once UI core | **965 KB** | **257 KB** | the whole library, including ~115 `recharts` references for charts that are never rendered |
| Next app-router runtime | 176 KB | 47 KB | |
| react-dom | 168 KB | 54 KB | |
| polyfills (`noModule`) | 113 KB | 41 KB | |
| site components + **all content data** | 75 KB | 21 KB | |
| `app/about/page-*.js` | **47 KB** | | `TableOfContents` + the entire Prism language-loader map |
| **Shared total (raw)** | **~1.56 MB** | | 13 shared chunks per page |

That ~1 MB Once UI chunk is the price of Route A in §10.

## 1.5 Routes: what's enabled, what's gone, and *how*

This is counter-intuitive and three writeups had to correct each other on it. The resolved answer **[VERIFIED, curl 2026-09-08]**:

```ts
// still shipped in the client bundle, all five TRUE:
const routes = { "/": true, "/about": true, "/work": true, "/blog": true, "/gallery": true };
```

Yet `GET /blog` → **404**, `GET /gallery` → **404**, both with `x-matched-path: /404`.

**The routes were not disabled via config. The route folders were deleted, and the nav entries were deleted out of `Header.tsx`.** The `routes` map is now misleading dead config, as is `protectedRoutes`, which still points at an upstream demo slug (`/work/automate-design-handovers-with-a-figma-to-code-pipeline`) that no longer exists.

> **[CONFLICT — resolved]** `06-template.md`'s main body describes disabling via `routes["/blog"] = false` and its verification pass lists the mechanism as unverifiable. `03-work.md` and `05-content.md` both settled it with live 404s plus a read of the minified `Header` module (`94615`), which contains only the `/`, `/about`, `/work` and theme-switcher branches. **Build on the resolved version.**

Live route status:

| Path | Status | Note |
|---|---|---|
| `/`, `/about`, `/work` | 200, prerendered | |
| `/work/{orla,magitale,farfromwoke,connecter,framey}` | 200, prerendered | real, statically generated |
| `/work/<unknown-slug>` | **200** ⚠️ | renders the 404 UI at HTTP 200 — a soft 404 |
| `/blog`, `/gallery` | 404 | folders deleted |
| `/sitemap.xml` | **404, 0 bytes** ⚠️ | while `robots.txt` advertises it |
| `/api/rss` | 404 | route deleted |
| `/api/og/generate?title=…` | **500 on GET** ⚠️ (200 on HEAD) | every OG image on `/about`, `/work` and all project pages is broken |

## 1.6 What is stock vs custom — the honest summary

**Untouched upstream defaults** (do not treat these as design decisions somebody made):

- The entire `style` block: `theme:"system", neutral:"gray", brand:"cyan", accent:"red", solid:"contrast", solidStyle:"flat", border:"playful", surface:"translucent", transition:"all", scaling:"100"` — **byte-identical to stock.**
- `dataStyle`, `effects` (dots-only background), `mailchimp.effects`, `display` (`{location, time, themeSwitcher}` all true), `routes`, `protectedRoutes`
- `layout.tsx` body structure, the `theme-init` script, `RouteGuard`, `Providers`
- `Header.module.scss` (bottom-docking mobile header), `Footer.module.scss`
- The featured-badge JSX in the hero (only two strings and an href changed)
- `Projects.tsx`'s wrapper `Column fillWidth gap="xl" marginBottom="40" paddingX="l"` and `priority={index < 2}`
- The newsletter title phrasing, the Mailchimp hidden inputs and list IDs, `mailchimp.action` (still the literal placeholder `https://url/subscribe/post?parameters`)
- The 404 copy

**Genuine customisations** (these are the ones worth copying or deliberately rejecting):

1. **Fonts** — all three text faces replaced (upstream is Geist everywhere).
2. **`custom.css`** — a hand-written global override sheet, ~60% of which is dead code (§4.9).
3. **`ProjectCard`** — completely rewritten component + a full SCSS module where upstream ships a **0-byte file**.
4. **`RelatedProjectCard`** — a new component with no upstream equivalent.
5. **`Mailchimp`** — form POST replaced with a fake 1-second local-state success.
6. **The `/about` page** — a whole new "Key Achievements" section, a 17-tag cloud in the intro, and half a dozen prop tweaks.
7. **The `/work/[slug]` page** — tech-tag row, "View Project" button, "Back" button, related-projects section.
8. **PWA + SEO head block** — ten `<head>` tags upstream doesn't have, plus `public/manifest.json`.
9. **A hand-written `Person` JSON-LD** on the home page.
10. **Footer attribution** swapped from the Once UI link to a cal.com booking link.
11. **The headline heading variant** bumped `display-strong-l` → `display-strong-xl`.
12. Deletion of the blog/gallery routes, the home blog strip, and `src/components/blog/`.

---

# 2. Sitemap & route table

## 2.1 Reference site routes

| Route | Purpose | Data source | Rendering | Replicate? |
|---|---|---|---|---|
| `/` | Hero + featured project + project list + newsletter | `content.tsx` `home` object; project MDX via `getPosts()` | Server component, SSG | **Yes** |
| `/about` | CV: identity, intro, achievements, experience, education, skills | `content.tsx` `about` object **only** — no MDX | Server component, SSG | **Yes** |
| `/work` | Project index — heading + all project cards | project MDX via `getPosts(["src","app","work","projects"])` | Server component, SSG | **Yes** |
| `/work/[slug]` | Case study | one MDX file per slug; `generateStaticParams` | SSG, one page per MDX file | **Yes** — this is where the substance lives |
| `/blog`, `/blog/[slug]` | Blog index + posts | `src/app/blog/posts/*.mdx` | — | **No** (deleted on the reference; see §11 Q3) |
| `/gallery` | Masonry photo grid | `content.tsx` `gallery.images` | — | **No** (deleted; see §11 Q3) |
| `/api/og/generate` | Dynamic 1280×720 OG card | `next/og` `ImageResponse` | Node runtime | **Yes, but fix it** — it 500s on the reference |
| `/api/rss` | Hand-built RSS 2.0 for blog posts | blog MDX | — | **No** (dies with the blog) |
| `/api/authenticate`, `/api/check-auth` | Password gate for `protectedRoutes` | `PAGE_ACCESS_PASSWORD` env | — | **No** — see §2.3 |
| `/api/og/fetch`, `/api/og/proxy` | Link-preview scrapers for MDX authors | arbitrary URLs | edge / node | **No** — unauthenticated SSRF relays, referenced by nothing |
| `/robots.txt` | | `app/robots.ts` or a static file | | **Yes** |
| `/sitemap.xml` | | `app/sitemap.ts` | | **Yes, and fix it** — 404s on the reference |
| `/manifest.json` | PWA manifest | static `public/manifest.json` | | **Yes** |
| `/not-found` | 404 UI | hardcoded | | **Yes** |

## 2.2 Your route table

| Route | Build in phase | Data source |
|---|---|---|
| `/` | 4 | `src/resources/content.tsx` → `home` |
| `/about` | 7 | `src/resources/content.tsx` → `about` |
| `/work` | 5 | `src/app/work/projects/*.mdx` |
| `/work/[slug]` | 6 | `src/app/work/projects/<slug>.mdx` |
| `/api/og/generate` | 9 | `person` + query `?title=` |
| `/robots.txt`, `/sitemap.xml`, `/manifest.json` | 9 | config |
| 404 | 2 | hardcoded |

## 2.3 Things to delete from the template on day one

`src/app/blog/`, `src/app/gallery/`, `src/components/blog/`, `src/components/gallery/`, `src/app/api/rss/`, `src/app/api/og/fetch/`, `src/app/api/og/proxy/`, `src/app/api/authenticate/`, `src/app/api/check-auth/`, `src/components/RouteGuard.tsx`'s password branch (or the whole guard — see §12), the three demo `.mdx` project files, `src/components/HeadingLink.tsx` (dead — `mdx.tsx` uses Once UI's), `src/components/ThemeToggle.module.scss` (never imported), `src/components/work/Projects.module.scss` (never imported).

Then **fix the two things deleting them breaks**: `sitemap.ts` and `api/rss/route.ts` both call `getPosts(["src","app","blog","posts"])`, and `getMDXFiles()` calls `notFound()` on a missing directory. That is exactly why the reference site's `/sitemap.xml` returns a 0-byte 404. **[VERIFIED]**

---

# 3. Page blueprints

This is the heart of the document. Every prop value below was read out of the RSC flight payload or the de-minified client bundle.

## 3.0 Shared vocabulary — Once UI primitives

Before the blueprints, the five rules you need to read them:

1. **`Row` / `Column` / `Flex` / `Grid` replace `<div>`.** `Column` is `flex-direction: column`, `Row` is `row`.
2. **Axis props swap between Row and Column.** On a **`Row`**: `horizontal` → `justify-content`, `vertical` → `align-items`. On a **`Column`** they swap: `horizontal` → `align-items`, `vertical` → `justify-content`. **[VERIFIED from the rendered class strings]**
3. **`align="center"` sets `text-align`, not flex alignment.** Use `horizontal="center"` for flex.
4. **Spacing props take either a static token or a t-shirt token.** `gap="16"` → `var(--static-space-16)` = 1rem, fixed. `gap="m"` → `var(--responsive-space-m)` = 1.5rem / 1rem / 0.75rem across breakpoints. Both compile to utility classes (`.g-16`, `.g-m`).
5. **Size props are inline styles, not classes.** `maxWidth`/`minWidth`/`height`/`minHeight` resolve through:
   ```js
   // Once UI ServerFlex size resolver, verbatim from the shipped bundle
   (value, axis) => {
     if (typeof value === "number") return `${value}rem`;
     if (["0","1","2","4","8","12","16","20","24","32","40","48","56","64","80","104","128","160"].includes(value))
       return `var(--static-space-${value})`;
     if (["xs","s","m","l","xl"].includes(value))
       return `var(--responsive-${axis}-${value})`;
   }
   ```
   So `maxWidth="m"` → `style="max-width:var(--responsive-width-m)"` and `maxWidth={40}` → `style="max-width:40rem"`. There is no `.max-width-*` utility class. **[VERIFIED]**

**Responsive props:** `s={{…}}` → `@media(max-width:768px)`, `m={{…}}` → `1024px`, `l={{…}}` → `1440px`. All max-width; there are **no min-width queries anywhere in the compiled CSS.**

## 3.1 Root layout — `src/app/layout.tsx`

Wraps every page. **[VERIFIED — flight row `2`]**

```jsx
<Flex as="html" lang="en" fillWidth suppressHydrationWarning
      className={cn(fonts.heading.variable, fonts.body.variable,
                    fonts.label.variable, fonts.code.variable)}>
  {/* renders: <html class="display-flex position-relative min-width-0 fill-width
                            __variable_… ×4" lang="en"> */}

  <head>
    {/* --- the ten site-added tags (upstream has NONE of these) --- */}
    <link rel="manifest" href="/manifest.json"/>
    <meta name="theme-color" content="#00D4AA"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
    <meta name="apple-mobile-web-app-title" content={person.name}/>
    <link rel="apple-touch-icon" href="/images/og/home.png"/>
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"/>
    <meta name="author" content={person.name}/>
    <meta name="language" content="English"/>
    <meta name="revisit-after" content="7 days"/>
    <script id="theme-init" dangerouslySetInnerHTML={{__html: /* §4.1 */}}/>
  </head>

  <Providers>
    <Column as="body" background="page" fillWidth style={{minHeight:"100vh"}}
            margin="0" padding="0" horizontal="center">

      {/* 1 — background effect layer, FIRST child of body */}
      <RevealFx fill position="absolute">
        <Background
          mask={{x:50, y:0, radius:100, cursor:false}}
          gradient={{display:false, opacity:100, x:50, y:60, width:100, height:50, tilt:0,
                     colorStart:"accent-background-strong", colorEnd:"page-background"}}
          dots={{display:true, opacity:40, size:"2", color:"brand-background-strong"}}
          grid={{display:false, opacity:100, color:"neutral-alpha-medium",
                 width:"0.25rem", height:"0.25rem"}}
          lines={{display:false, opacity:100, size:"16", thickness:1, angle:45,
                  color:"neutral-alpha-weak"}}/>
      </RevealFx>

      {/* 2 — 16px top spacer, unmounted at ≤768px */}
      <Flex fillWidth minHeight="16" s={{hide:true}}/>

      {/* 3 */}
      <Header/>

      {/* 4 — the content shell. The padding="l" here is load-bearing: without it
              the page is flush to the viewport edge below 1024px and the card
              width arithmetic in §3.5 doesn't reproduce. */}
      <Flex zIndex={0} fillWidth padding="l" horizontal="center" flex={1}>
        <Flex horizontal="center" fillWidth minHeight="0">
          <RouteGuard>{children}</RouteGuard>
        </Flex>
      </Flex>

      {/* 5 */}
      <Footer/>
    </Column>
  </Providers>
</Flex>
```

Notes:

- `<Providers>` is the **parent** of `<body>`, not a child. It renders only context, no DOM, so the markup is still `<html><head>…</head><body>`.
- `suppressHydrationWarning` on `<html>` is required — the theme-init script mutates `documentElement` attributes before React hydrates.
- **[DEFECT]** The layout `RevealFx` gets no `translateY`, and the component emits the literal string `transform: translateY(undefined)` — invalid CSS, silently dropped by the browser. Harmless but it ships on every page. Guard the prop in your version.

`Providers` nesting, all five levels **[VERIFIED]**:

```
LayoutProvider
└── ThemeProvider  brand accent neutral solid solidStyle border surface transition scaling
    └── DataThemeProvider  variant mode height axis={{stroke}} tick={{fill,fontSize,line}}
        └── ToastProvider
            └── IconProvider icons={iconLibrary}
                └── {children}
```

⚠️ **No `theme=` prop is passed to `ThemeProvider`.** `style.theme` is declared, typed, exported — and read by nothing. Theme resolution is done entirely by the inline head script. Changing `style.theme` to `"dark"` has zero effect. **[VERIFIED]**

`IconProvider` **merges** your icon map on top of Once UI's 43 built-ins (`{...defaults, ...yours}`), which is why `light`/`dark`/`chevronRight` resolve without being in the registry. **[VERIFIED — module `51784`]**

## 3.2 Header — `src/components/Header.tsx` (`"use client"`)

Fully present in the SSR HTML, so this one is verified at the DOM level.

```jsx
{/* two Fade scrims, immediately before the header */}
<Fade s={{hide:true}} fillWidth position="fixed" height="80" zIndex={9}/>              {/* desktop, top    */}
<Fade hide s={{hide:false}} fillWidth position="fixed" bottom="0" to="top"
      height="80" zIndex={9}/>                                                          {/* mobile, bottom  */}

<Row as="header" fitHeight position="sticky" zIndex={9} fillWidth padding="8"
     horizontal="center" data-border="rounded" className={styles.position}
     s={{position:"fixed"}}>

  {/* LEFT — location */}
  <Row paddingLeft="12" fillWidth vertical="center" textVariant="body-default-s">
    {display.location && <Row s={{hide:true}}>{person.location}</Row>}
  </Row>

  {/* CENTRE — the nav pill */}
  <Row fillWidth horizontal="center">
    <Row background="page" border="neutral-alpha-weak" radius="m-4" shadow="l"
         padding="4" horizontal="center" zIndex={1}>
      <Row gap="4" vertical="center" textVariant="body-default-s" suppressHydrationWarning>
        <ToggleButton prefixIcon="home" href="/" selected={pathname === "/"}/>
        <Line background="neutral-alpha-medium" vert maxHeight="24"/>
        {/* desktop: labelled; mobile: icon-only twin — see the CONFLICT below */}
        <Row s={{hide:true}}>     <ToggleButton prefixIcon="person" href="/about" label={about.label}
                                                selected={pathname === "/about"}/></Row>
        <Row hide s={{hide:false}}><ToggleButton prefixIcon="person" href="/about"
                                                selected={pathname === "/about"}/></Row>
        <Row s={{hide:true}}>     <ToggleButton prefixIcon="grid" href="/work" label={work.label}
                                                selected={pathname.startsWith("/work")}/></Row>
        <Row hide s={{hide:false}}><ToggleButton prefixIcon="grid" href="/work"
                                                selected={pathname.startsWith("/work")}/></Row>
        <Line background="neutral-alpha-medium" vert maxHeight="24"/>
        <ThemeToggle/>
      </Row>
    </Row>
  </Row>

  {/* RIGHT — live clock */}
  <Flex fillWidth horizontal="end" vertical="center">
    <Flex paddingRight="12" horizontal="end" vertical="center"
          textVariant="body-default-s" gap="20">
      <Flex s={{hide:true}}>{display.time && <TimeDisplay timeZone={person.location}/>}</Flex>
    </Flex>
  </Flex>
</Row>
```

**Verbatim rendered header element** **[VERIFIED]**:
```html
<header class="display-flex position-sticky s-position-fixed p-8 top-0 justify-center
               fit-height min-width-0 fill-width z-index-9 Header_position__y2w_C"
        data-border="rounded">
```

`Header.module.scss` — the only two rules that matter:
```scss
.mask { /* defined but NEVER applied — the two <Fade>s replaced it. Dead. */ }
@media (max-width: 768px) {
  .position { top: auto; bottom: var(--static-space-24); }   // 1.5rem above the viewport bottom
  .mask     { transform: rotate(180deg); bottom: 0; }
}
```

**So: sticky top bar on desktop → floating pill docked 24px above the viewport bottom at ≤768px.** The `<Footer>` carries a matching `<Row height="80" hide s={{hide:false}}/>` spacer so the bar doesn't cover the footer.

The `data-border="rounded"` on `<header>` is a **scoped attribute override** — inside it `--radius-m-nest-4` is `1.5rem` instead of the global `playful` `1rem`. That is what makes the pill read as a pill.

Nav details **[VERIFIED]**:

| Order | Element | Icon | Label | href | Selected when |
|---|---|---|---|---|---|
| 1 | `ToggleButton` → `<a>` | `home` (Phosphor duotone, `viewBox 0 0 256 256`) | *(none, ever)* | `/` | `pathname === "/"` |
| 2 | `Line vert maxHeight="24"` | — | — | — | 1px × 1.5rem, `neutral-alpha-medium` |
| 3 | `ToggleButton` | `person` | reference: `About me` | `/about` | exact match |
| 4 | `ToggleButton` | `grid` | reference: `My work` | `/work` | `pathname.startsWith("/work")` |
| 5 | `Line vert maxHeight="24"` | — | — | — | |
| 6 | `ThemeToggle` → `<button>` | moon/sun (Heroicons) | — | — | `aria-label="Switch to {next} mode"` |

Sizes: `ToggleButton` size m = `height: 2rem`, `padding: 4px 8px`, ghost variant, `radius-m`. Icons render at `Icon_xs` = 16px. Labels use `label-default-s` typography.

> ### [CONFLICT] What the header does below 768px
>
> This is the one place two verified writeups reach opposite conclusions, and it matters for your build.
>
> **Reading A (`01-home.md`, corrected in its verification pass):** the icon-only twins **do mount** on mobile. Once UI's exported `Flex` runs a *JS* breakpoint test and returns `null` for hidden elements rather than emitting `display:none`. `LayoutProvider` seeds `currentBreakpoint = "l"` on the server, so every `hide`-true element is missing from *every* SSR snapshot regardless of viewport; after hydration at ≤768px the breakpoint becomes `"s"`, the `s.hide === false` branch fires, and the element mounts. Net: the mobile pill is **home · │ · person · grid · │ · theme** — four icon buttons.
>
> **Reading B (`07-platform.md` §11.1 C5):** the idiom is **dead**. The class builder is `r&&"flex-hide", s?.hide&&"l-flex-hide", c?.hide&&"m-flex-hide", u?.hide&&"s-flex-hide"` — bare `hide:true` emits `flex-hide` (`display:none`, unconditional) and `s:{hide:false}` emits *nothing*. `.flex-show`/`.s-flex-show` exist in the CSS but `grep -o 'flex-show'` in the Once UI bundle returns **0**: no component ever emits them. Net: below 768px the header has **no About and no Work link at all**, only an unnamed home icon and the theme toggle.
>
> Both readings are supported by real greps of different parts of the bundle; neither writeup captured a hydrated DOM at a narrow viewport, so neither could settle it.
>
> **What to do:** do not rely on the `hide` + `s={{hide:false}}` swap. Either (a) render one `ToggleButton` per section and let the *label* hide via a CSS media query, or (b) verify the behaviour in a real browser at 375px before you ship. Reading B, if correct, is also a serious accessibility defect (`A4`), so the safe move is to not reproduce the pattern.

**`TimeDisplay`** — `setInterval(…, 1000)` running `new Intl.DateTimeFormat(locale, {timeZone, hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false})`. Default locale `"en-GB"`. Renders `HH:MM:SS`. Empty on the server (`useState("")`), filled after hydration. Cleared on unmount.

⚠️ `person.location` does **double duty**: it is printed as literal text in the header's left slot *and* used as the `timeZone`. So the header shows the raw IANA id — the reference site literally displays `Europe/Bucharest`.

## 3.3 Footer — `src/components/Footer.tsx` (server component)

```jsx
<Row as="footer" fillWidth padding="8" horizontal="center" s={{direction:"column"}}>
  <Row className={styles.mobile} maxWidth="m" paddingY="8" paddingX="16" gap="16"
       horizontal="between" vertical="center"
       s={{direction:"column", horizontal:"center", align:"center"}}>

    <Text variant="body-default-s" onBackground="neutral-strong">
      <Text onBackground="neutral-weak">© {currentYear} /</Text>
      <Text paddingX="4">{person.name}</Text>
      <Text onBackground="neutral-weak">
        {/* reference copy, to be replaced: */}
        / Let's connect<SmartLink href={about.calendar.link}>here</SmartLink>.
      </Text>
    </Text>

    <Row gap="16">
      {social.map(item => item.link && (
        <IconButton key={item.name} href={item.link} icon={item.icon}
                    tooltip={item.name} size="s" variant="ghost"/>
      ))}
    </Row>
  </Row>

  <Row height="80" hide s={{hide:false}}/>   {/* mobile clearance for the bottom-docked header */}
</Row>
```

- `currentYear = new Date().getFullYear()`.
- The footer maps the **unfiltered** `social` array; `/about` maps only `essential: true` entries.
- There is **no `{" "}`** between "connect" and the link — the visual gap comes from `SmartLink`'s own `px-2 mx-2` classes. **[VERIFIED]**
- `Footer.module.scss` is one rule: `@media (max-width: 768px) { .mobile { text-align: center } }`.
- Upstream renders `/ Build your portfolio with <SmartLink>Once UI</SmartLink>` here. **The template's LICENSE is CC BY-NC 4.0 and its source comment states attribution is required without a Pro licence.** The reference site removed it. That is a licensing decision, not a design one — see §11 Q7.

## 3.4 Home page — `src/app/page.tsx`

Root container **[VERIFIED]**:
```jsx
<Column maxWidth="m" gap="xl" paddingY="12" horizontal="center">
```
- `maxWidth="m"` → `--responsive-width-m` = **64rem/1024px** desktop, **55rem/880px** at ≤1024px
- `gap="xl"` → **5rem → 4rem (≤1024px) → 2.5rem (≤768px)**
- `paddingY="12"` → 0.75rem static

Six direct children, in order:

| # | Node | Purpose |
|---|---|---|
| 1 | raw `<script type="application/ld+json">` | hand-written **Person** JSON-LD |
| 2 | `<Schema as="webPage" …/>` | Once UI helper → `<script id="schema-webPage-/">` |
| 3 | `<Column fillWidth horizontal="center" gap="m">` | **Hero** |
| 4 | `<RevealFx translateY="16" delay={0.6}>` → `<Column …>` | **Featured project** (1 card) |
| 5 | `<Column fillWidth gap="xl" marginBottom="40" paddingX="l">` | **Project list** (4 cards) |
| 6 | `<Mailchimp/>` | newsletter panel — **it renders** |

**Absent vs upstream:** the "Latest from the blog" block was **deleted from the source**, not gated off (`routes["/blog"]` is still `true`). Delete it in yours too, along with the `Posts` import.

> ### [CONFLICT] One project block or two?
>
> `01-home.md`, `03-work.md` and `05-content.md` all describe **two** `Projects` calls on the home page: `<Projects range={[1,1]}/>` (orla only, wrapped in `RevealFx translateY="16" delay={0.6}`) then `<Projects range={[2]}/>` (the remaining four, **not** wrapped).
>
> `07-platform.md` §11.1 C2 states the opposite as a correction: **one** `RevealFx` containing **one** `Column` whose children array is all five cards, contiguous, closing immediately before `<Mailchimp/>`.
>
> **Tiebreaker evidence:** the `priority` flags on the home page are `true, true, true, false, false`. `Projects` computes `priority={index < 2}`. A single call over five projects would give `true, true, false, false, false`. Three `true`s can only come from **two calls whose index counters restart** — which supports the two-block reading. (`07`'s own §11.1 C3 independently confirms the `true, true, true` split on `/`.)
>
> **Recommendation:** build **two blocks**. The only visible difference is whether cards 2–5 also fade in at t=0.6s; two blocks means only the featured card animates, which is also the better choice (see §7.6).

### 3.4.1 Hero

```jsx
<Column fillWidth horizontal="center" gap="m">
  <Column maxWidth="s" horizontal="center" align="center">
    {/* maxWidth s = 48rem/768px; align="center" = text-align:center */}

    {/* (a) featured badge */}
    <RevealFx fillWidth horizontal="center"
              paddingTop="16" paddingBottom="32" paddingLeft="12">
      <Badge background="brand-alpha-weak" paddingX="12" paddingY="4"
             onBackground="neutral-strong" textVariant="label-default-s"
             arrow={false} href="/work">
        <Row paddingY="2">
          <Row gap="12" vertical="center">
            <strong className="ml-4">{/* project name */}</strong>{" "}
            <Line background="brand-alpha-strong" vert height="20"/>
            <Text marginRight="4" onBackground="brand-medium">Featured Project</Text>
          </Row>
        </Row>
      </Badge>
    </RevealFx>

    {/* (b) headline */}
    <RevealFx translateY="4" fillWidth horizontal="center" paddingBottom="16">
      <Heading wrap="balance" variant="display-strong-xl">{home.headline}</Heading>
    </RevealFx>

    {/* (c) subline */}
    <RevealFx translateY="8" delay={0.2} fillWidth horizontal="center" paddingBottom="32">
      <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-xl">
        {home.subline}
      </Text>
    </RevealFx>

    {/* (d) CTA */}
    <RevealFx paddingTop="12" delay={0.4} horizontal="center" paddingLeft="12">
      <Button id="about" data-border="rounded" href="/about"
              variant="secondary" size="m" weight="default" arrowIcon>
        <Row gap="8" vertical="center" paddingRight="4">
          <Avatar marginRight="8" style={{marginLeft:"-0.75rem"}}
                  src={person.avatar} size="m"/>
          {about.title}
        </Row>
      </Button>
    </RevealFx>
  </Column>
</Column>
```

Verified rendered class strings:

| Element | Emitted className | Means |
|---|---|---|
| headline | `font-display font-strong font-xl neutral-on-background-strong`, tag `h1`, `style.textWrap="balance"` | `variant="display-strong-xl"` — **not** upstream's `display-strong-l` |
| subline | `font-heading font-default font-xl neutral-on-background-weak`, tag `span` | `variant="heading-default-xl"` (stock) |
| badge rule | `brand-background-alpha-strong` with `minWidth/width: var(--static-space-1); height: var(--static-space-20)` | `<Line vert>` → 1px × 1.25rem |

**Hero type sizes**, `--font-size-heading-multiplier: 1`:

| | ≥1025px | ≤1024px | ≤768px |
|---|---|---|---|
| h1 `display-strong-xl` | **5rem** (80px) | 3.5rem (56px) | 2.75rem (44px) |
| h1 line-height | 5rem | 3.75rem | 3rem |
| h1 weight | `--font-weight-display-strong` = 600 (see the Cal Sans caveat in §4.6) | | |
| subline `heading-default-xl` | 1.5rem | 1.33rem | 1.33rem |
| subline line-height | 2rem | 1.75rem | 1.75rem |

**Media in the hero:** exactly one image — the avatar, `size="m"` → 32×32px circular, pulled left by `margin-left:-0.75rem` and pushed right by `margin-right:0.5rem`.

**No `hide`/`s=`/`m=` props anywhere in the hero.** It is centred and fluid; the only responsive levers are the token scales.

**`Badge` internals you inherit whether you want them or not** **[VERIFIED — module `1047`]**: the component bakes in `fitWidth`, `vertical="center"`, `radius="full"`, `border="brand-alpha-medium"` and `effect={true}`. Your page-level props are spread *last* so they override `background`/`onBackground`/`padding`/`textVariant` — but **not** the border or the radius, and **not** the shine animation (§7.5). Also, `arrow` defaults to `!!href`; the reference explicitly passes `arrow={false}` to suppress the trailing animated arrow. If you copy "Badge with href" without that, you get an arrow the reference doesn't have.

### 3.4.2 Reference hero copy — *to be replaced*

Quoted only to show the slot sizes.

> **Badge:** `Orla AI Health Coach` │ `Featured Project` (whole badge links to `/work`)
> **H1** (two lines, `<br/>` between): `Senior AI Engineer` / `(Full Stack)`
> **Subline:** a single `<Text>` with **eight** hard `<br/>`s and one blank line — roughly 8 short lines of prose, ~430 characters.
> **Button label:** `About – Bogdan Blanc` (en-dash U+2013) — this is `{about.title}`, not a hand-written string.

### 3.4.3 Project blocks

Both blocks are emitted by the same `Projects` server component:

```jsx
<Column fillWidth gap="xl" marginBottom="40" paddingX="l">
  {/* ProjectCard × n */}
</Column>
```

- `paddingX="l"` = **2.5rem → 1.5rem → 1rem**
- `marginBottom="40"` = 2.5rem static
- Block A is wrapped in `<RevealFx translateY="16" delay={0.6}>`; block B is not.

⚠️ **[DEFECT]** Each `ProjectCard` receives `content` = **the entire MDX body of the project**, serialised into the flight payload, used only as a truthiness check for showing the "Read case study" button. On the reference that is **30.5 KB of case-study prose shipped to every home-page visitor**. Pass a boolean instead.

### 3.4.4 Newsletter panel — `<Mailchimp/>`

It renders (`newsletter.display === true`). Structure **[VERIFIED — module `61798`]**:

```jsx
<Column overflow="hidden" fillWidth padding="xl" radius="l" marginBottom="m"
        horizontal="center" align="center" background="surface" border="neutral-alpha-weak">

  <Background top="0" position="absolute"
    mask={{x:50, y:0, radius:100, cursor:true}}          {/* ← cursor-tracking! see §7.8 */}
    gradient={{display:true, opacity:90, x:50, y:0, width:50, height:50, tilt:0,
               colorStart:"accent-background-strong", colorEnd:"static-transparent"}}
    dots={{display:true, opacity:20, size:"2", color:"brand-on-background-weak"}}
    grid={{display:false, …}} lines={{display:false, …}}/>

  <Column maxWidth="xs" horizontal="center">
    <Heading marginBottom="s" variant="display-strong-xs">{newsletter.title}</Heading>
    <Text wrap="balance" marginBottom="l" variant="body-default-l" onBackground="neutral-weak">
      {newsletter.description}
    </Text>
  </Column>

  <form style={{width:"100%", display:"flex", justifyContent:"center"}}
        onSubmit={handleSubmit}       {/* ← reference has NO action, NO method */}
        id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form">
    <Row id="mc_embed_signup_scroll" fillWidth maxWidth={24} s={{direction:"column"}} gap="8">
      <Input formNoValidate id="mce-EMAIL" name="EMAIL" type="email" placeholder="Email"
             required disabled={subscribed} value={email} errorMessage={error}/>
      {/* … Mailchimp hidden group checkbox, #mce-responses, honeypot … */}
      <div className="clear">
        <Button id="mc-embedded-subscribe" type="submit" size="m" fillWidth
                disabled={loading || subscribed || email === "" || !!error}
                style={{height:"48px",
                        backgroundColor: subscribed ? "#10b981" : undefined,
                        color:           subscribed ? "white"   : undefined,
                        borderColor:     subscribed ? "#10b981" : undefined}}>
          {subscribed ? "Subscribed" : loading ? "Subscribing..." : "Subscribe"}
        </Button>
      </div>
    </Row>
  </form>
</Column>
```

⚠️ **[DEFECT] The reference form submits nowhere.** `onSubmit` calls `preventDefault()` then `setTimeout(() => setSubscribed(true), 1000)` — a **fake one-second success**. `mailchimp.action` is still the untouched placeholder `https://url/subscribe/post?parameters`, and the Mailchimp list IDs (`group[3492][1]`, honeypot `b_c1a5a210340eb6c7bff33b2ba_0462d244aa`) are Once UI's own, still shipping. **Either wire a real provider or delete the whole block.** See §11 Q5.

Email validation: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, debounced 2000ms until the first error appears, immediate thereafter. (Upstream re-creates the debounced function every render, defeating it — a real upstream bug.)

## 3.5 Work index — `src/app/work/page.tsx`

The entire page tree, verified **[VERIFIED — nothing else exists in the payload]**:

```jsx
<Column maxWidth="m" paddingTop="24">
  <Schema as="webPage" baseURL path={work.path} title={work.title}
          description={work.description}
          image={`/api/og/generate?title=${encodeURIComponent(work.title)}`}
          author={{name: person.name, url: `${baseURL}${about.path}`,
                   image: `${baseURL}${person.avatar}`}}/>
  <Heading marginBottom="l" variant="heading-strong-xl" align="center">{work.title}</Heading>
  <Projects/>          {/* no range → all projects, newest first */}
</Column>
```

Rendered heading — this is the exact DOM:
```html
<h1 class="font-heading font-strong font-xl neutral-on-background-strong mb-l"
    style="text-align:center;text-wrap:balance">Past Projects – Bogdan Blanc</h1>
```

**There is no sub-heading, no lede, no filter bar, no tab strip, no pagination, no "load more", no tag chips, and no newsletter block on `/work`.** Schema → `<h1>` → list of cards. That is the whole page. **[VERIFIED three ways]**

⚠️ Tags cannot be surfaced on `/work` without changing the component contract — `ProjectCard` has no tag prop at all.

### 3.5.1 `Projects` — the list component

```tsx
// src/components/work/Projects.tsx — server component, no "use client"
interface ProjectsProps {
  range?: [number, number?];   // 1-indexed, inclusive
  exclude?: string[];
}

export function Projects({ range, exclude }: ProjectsProps) {
  let all = getPosts(["src", "app", "work", "projects"]);
  if (exclude?.length) all = all.filter(p => !exclude.includes(p.slug));
  const sorted = all.sort((a, b) =>
    new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime());
  const shown = range ? sorted.slice(range[0] - 1, range[1] ?? sorted.length) : sorted;

  return (
    <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
      {shown.map((post, index) => (
        <ProjectCard
          priority={index < 2}
          key={post.slug}
          href={`/work/${post.slug}`}
          images={post.metadata.images}
          title={post.metadata.title}
          description={post.metadata.summary}
          content={post.content}                       /* ← see the defect in §3.4.3 */
          avatars={post.metadata.team?.map(m => ({src: m.avatar})) || []}
          link={post.metadata.link || ""}
        />
      ))}
    </Column>
  );
}
```

> **[CONFLICT / unresolved]** On `/work/[slug]` the same list renders with a **different wrapper** (`{fillWidth, gap:"xl", paddingX:"l"}` — **no `marginBottom`**) and a **different card** (`RelatedProjectCard`). So the live `Projects` is *not* upstream-identical, but its exact shape is unrecoverable because it is a server component that never reaches a client bundle. `03-work.md` flags this explicitly. **Your choice:** add a `variant`/`card` prop, or write a separate `RelatedProjects.tsx`. The latter is cleaner.

Resolved spacing:

| Prop | Class | >1024px | ≤1024px | ≤768px |
|---|---|---|---|---|
| `gap="xl"` | `.g-xl` | 5rem | 4rem | 2.5rem |
| `paddingX="l"` | `.px-l` | 2.5rem | 1.5rem | 1rem |
| `marginBottom="40"` | `.mb-40` | 2.5rem (static) | | |
| page `maxWidth="m"` | inline style | 64rem | 55rem | 55rem |

### 3.5.2 `ProjectCard` — the rewritten component

**Do not copy `upstream/src/components/ProjectCard.tsx`. It is the wrong component.** Upstream's is a borderless stack with a 5:7 two-column text split; the live one is a bordered clickable panel. Recovered verbatim from webpack module `52325` **[VERIFIED]**:

```tsx
"use client";

export const ProjectCard = ({ href, images = [], title, content, description, avatars, link }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Column
      fillWidth
      className={styles.projectCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        if (!e.target.closest('[href*="://"]')) window.location.href = href;
      }}
      style={{
        cursor: "pointer",
        transition: "all 0.3s ease",
        transform: isHovered ? "translateY(-4px)" : "translateY(0px)",
        boxShadow: isHovered ? "0 20px 40px rgba(0,0,0,0.1)"
                             : "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <div className={styles.imageContainer}>
        <Carousel sizes="(max-width: 960px) 100vw, 960px"
                  items={images.map(image => ({ slide: image, alt: title }))}/>
        {avatars?.length > 0 && (
          <div className={styles.avatarOverlay}>
            <AvatarGroup avatars={avatars} size="s" reverse/>
          </div>
        )}
      </div>

      <div className={styles.contentContainer}>
        <Column gap="16" paddingX="24" paddingY="24">
          {title && <Heading as="h2" wrap="balance" variant="heading-strong-l">{title}</Heading>}
          {description?.trim() && (
            <Text wrap="balance" variant="body-default-m" onBackground="neutral-weak">
              {description}
            </Text>
          )}
          <Row gap="16" wrap align="center" horizontal="between">
            <Row gap="16" wrap>
              {content?.trim() && (
                <Button variant="secondary" size="s" suffixIcon="arrowRight"
                        onClick={e => { e.stopPropagation(); window.location.href = href; }}>
                  Read case study
                </Button>
              )}
              {link && (
                <SmartLink suffixIcon="arrowUpRightFromSquare"
                           style={{margin:"0", width:"fit-content"}}
                           href={link} onClick={e => e.stopPropagation()}>
                  <Text variant="body-default-s" onBackground="neutral-weak">View project</Text>
                </SmartLink>
              )}
            </Row>
          </Row>
        </Column>
      </div>
    </Column>
  );
};
```

Note the three conditional slots (`title &&`, `description?.trim() &&`, `content?.trim() &&`) and that `priority` is accepted by the caller but **never destructured** — it is a dead prop in both upstream and the fork, so `next/image` never gets it and **every project image lazy-loads, including the LCP one.**

`ProjectCard.module.scss`, compiled, in source order **[VERIFIED]** (upstream's file is **0 bytes** — 100% of this is custom):

```css
.projectCard {
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface);                    /* ⚠️ UNDEFINED — see below */
  border: 1px solid var(--neutral-alpha-weak);
  transition: all .3s ease;
  position: relative;
}
.projectCard:hover         { border-color: var(--neutral-alpha-medium); }
.projectCard:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }  /* ⚠️ UNDEFINED */

.imageContainer                  { position: relative; height: 400px; overflow: hidden; }
.imageContainer :global(.carousel)     { height: 100%; }                    /* ⚠️ DEAD */
.imageContainer :global(.carousel) img { width:100%; height:100%; object-fit:cover;
                                         transition: transform .3s ease; }  /* ⚠️ DEAD */
.imageContainer:hover :global(.carousel) img { transform: scale(1.02); }    /* ⚠️ DEAD */

.avatarOverlay {
  position: absolute; top: 16px; right: 16px;
  background: hsla(0,0%,100%,.9);
  backdrop-filter: blur(8px);
  padding: 8px 12px; border-radius: 12px;
  border: 1px solid var(--neutral-alpha-weak);
  box-shadow: 0 4px 12px rgba(0,0,0,.1);
}
.contentContainer { flex: 1 1; display: flex; flex-direction: column; min-height: 140px; }

@media (max-width: 768px) {
  .imageContainer   { height: 300px; }
  .avatarOverlay    { top: 12px; right: 12px; padding: 6px 10px; }
  .contentContainer { min-height: 120px; }
}
@media (prefers-color-scheme: dark) {      /* ⚠️ WRONG MECHANISM */
  .avatarOverlay { background: rgba(0,0,0,.9); border-color: var(--neutral-alpha-medium); }
}
```

**Five verified defects in this one file. Fix all of them in your build:**

1. **`var(--surface)` does not exist.** Grep across all six CSS bundles: 0 definitions. The real tokens are `--surface-background` and `--surface-border`. An unresolvable `var()` is invalid at computed-value time → **the card has no background fill at all**, only its border and box-shadow. Use `var(--surface-background)`.
2. **`var(--brand)` does not exist** either. The focus outline never renders. Use `var(--brand-solid-strong)`.
3. **The card is a `<div>` with `onClick`** — no `role`, no `tabIndex`, no `href`. Not keyboard-reachable, not announced as a link, and there is no crawlable `<a>` from the card body to `/work/<slug>`. Navigation is `window.location.href` = a **full page load**, not a client-side transition. Make the whole card an `<a>` or add `role="link" tabIndex={0}` + key handling.
4. **`@media (prefers-color-scheme: dark)` follows the OS**, not the site's `[data-theme]`. It is the **only** `prefers-color-scheme` query in the whole build; everything else themes via `[data-theme=dark|light]`. Toggle to dark on a light OS and you get a white 90%-opaque plate on a `#0A0A0A` page. Use `[data-theme="dark"] .avatarOverlay { … }`.
5. **The three `:global(.carousel)` rules match nothing.** Once UI's `Carousel` never emits a `carousel` class (its CSS-module map is exactly `{controls, fade, button, left, right}`, and `"carousel"` appears 0 times in the shipped JS). **The advertised hover image zoom does not happen.** Either pass `className="carousel"` to the Carousel or drop the rules.

Also note the image geometry **[VERIFIED, one inference]**: the carousel `Media` gets `aspectRatio="original"`, which resolves to the literal CSS `aspect-ratio: original` — **an invalid value the browser discards**. With `fill` computing to `false` and `height:100%` against an auto-height ancestor, the image lands at its intrinsic ratio. All six measured project PNGs are 1920×1440 (4:3), so at the ~944px desktop card width the image is ~708px tall inside a `height:400px; overflow:hidden` box — meaning **the carousel's indicator bar, which sits 12px below the image, is clipped out of view.** (Derived from source + measured dimensions, not from a browser screenshot.) Set a real `aspectRatio` such as `"16 / 9"` and this disappears.

### 3.5.3 The carousel

`ProjectCard` passes only `items` and `sizes`; everything else is a library default **[VERIFIED — module `9678`]**:

```js
{ items: [], fill: false, controls: true, priority: false,
  indicator: "line",              // ← segmented bars, NOT dots
  aspectRatio: "original", revealedByDefault: false,
  thumbnail: { scaling: 1, height: "80", sizes: "120px" },
  play: { auto: false, interval: 3000, controls: true } }
```

- **Autoplay is off** and `ProjectCard` never passes `play`, so the pause/play button never appears.
- **Indicator:** a full-width row of equal-flex **2px-tall fully-rounded bars**, one per slide, `gap="4"`, `paddingX="s"`. Active `var(--neutral-on-background-strong)`, inactive `var(--neutral-alpha-medium)`, cross-faded `0.3s ease`. Each bar is clickable.
- **Slide transition:** fade out → **300ms** → swap slide → **50ms** → fade in via `RevealFx speed={300}` (0.3s). Total ≈ 650ms. Re-entrant calls during a transition are dropped. The next image is imperatively preloaded (`new Image()`).
- **Swipe:** 50px horizontal threshold on touch.
- **Arrows:** invisible at rest, slide in 1rem and fade 0→1 over 0.2s on hover/focus-within. **Both the chevron buttons and the edge scrims are `m={{hide:true}}` → gone at ≤1024px.** The 12rem clickable hot zones stay in the DOM at all widths.
- `next()` wraps to slide 0; `prev()` does not wrap. But the right hot zone only renders while `active < length-1`, so wrap-around is unreachable through the UI.
- When `active === 0` the left zone is replaced by a `<Row maxWidth={12}/>` spacer rather than omitted — the gutter is always reserved so the slide stays centred.

⚠️ **[DEFECT]** The carousel's prev/next zones, chevrons and indicator bars all call their handlers **without `stopPropagation()`**. The card's click guard only bails on `[href*="://"]` (absolute URLs). **So clicking any carousel control also navigates to the project page.** Only "Read case study" and "View project" stop propagation.

## 3.6 Work detail — `src/app/work/[slug]/page.tsx`

Substantially rewritten vs upstream. Tree recovered verbatim **[VERIFIED — identical shape on all five project pages]**:

```jsx
<Column as="section" maxWidth="m" horizontal="center" gap="l">

  <Schema as="blogPosting" … />          {/* id="schema-blogPosting-/work/<slug>" */}

  <Column maxWidth="s" gap="16" horizontal="center" align="center">
    <Button id="back" data-border="rounded" href="/work"
            variant="secondary" size="m" weight="default" prefixIcon="chevronLeft">
      <Row gap="8" vertical="center" paddingLeft="4">Back</Row>
    </Button>

    <Text variant="body-default-xs" onBackground="neutral-weak" marginBottom="12">
      {formatDate(post.metadata.publishedAt)}     {/* "September 10, 2025" */}
    </Text>

    <Heading variant="display-strong-m">{post.metadata.title}</Heading>

    <Text variant="body-default-l" onBackground="neutral-weak" marginTop="16"
          align="center" style={{maxWidth:"600px"}}>
      {post.metadata.summary}
    </Text>

    <Row wrap gap="8" marginTop="16" horizontal="center">
      {tags.map((t, i) => <Tag key={i} size="l">{t}</Tag>)}
    </Row>
  </Column>

  <Row marginBottom="32" horizontal="center">
    <Row gap="16" vertical="center">
      <AvatarGroup reverse avatars={avatars} size="s"/>
      <Text variant="label-default-m" onBackground="brand-weak">
        <SmartLink href={team[0].linkedIn}>{team[0].name}</SmartLink>
      </Text>
      <Button id="view-project" data-border="rounded" href={externalUrl}
              variant="secondary" size="m" weight="default" arrowIcon
              target="_blank" rel="noopener noreferrer">
        <Row gap="8" vertical="center" paddingRight="4">View Project</Row>
      </Button>
    </Row>
  </Row>

  <Media priority aspectRatio="16 / 9" radius="m" alt="image" src={images[0]}/>

  <Column style={{margin:"auto"}} as="article" maxWidth="s">
    <CustomMDX source={post.content}/>
  </Column>

  <Column fillWidth gap="40" horizontal="center" marginTop="40">
    <Line maxWidth="40"/>
    <Heading as="h2" variant="heading-strong-xl" marginBottom="24">Related projects</Heading>
    <Column fillWidth gap="xl" paddingX="l">
      {/* 3 × RelatedProjectCard */}
    </Column>
  </Column>

  <ScrollToHash/>
</Column>
```

Diffs vs upstream, all deliberate:

| | upstream | reference site |
|---|---|---|
| Back affordance | `<SmartLink href="/work"><Text variant="label-strong-m">Projects</Text></SmartLink>` | `<Button prefixIcon="chevronLeft">Back</Button>` |
| Summary under H1 | absent | added, `body-default-l`, centred, `maxWidth:600px` |
| Tech tags | absent | added, `<Tag size="l">` row |
| External link | absent | added, "View Project" button |
| Article width | `maxWidth="xs"` (640px) | **`maxWidth="s"`** (768px) |
| Related card | `ProjectCard` | **`RelatedProjectCard`** |
| Related wrapper | `…gap="xl" marginBottom="40" paddingX="l"` | `…gap="xl" paddingX="l"` (no margin) |

**Related-projects selection**, verified against all five pages: sort desc by `publishedAt`, drop the current slug, then `slice(1, 4)`.

> **[CONFLICT — cosmetic]** `03-work.md` describes this as `range={[2]}` → `slice(1)`; `05-content.md` as `range={[2,4]}` → `slice(1,4)`. With exactly five projects both produce identical output (4 remaining → 3 shown). With more than five they diverge. **Use `range={[2,4]}`** — it is explicit and bounded.

Consequence worth naming: the *newest remaining* project is always skipped, so the newest project in the whole set never appears in any related list.

`Line maxWidth="40"` renders as a **2.5rem-wide, 1px-tall** neutral rule (`--static-space-40`), not 40rem.

### 3.6.1 `RelatedProjectCard` — new component, no upstream equivalent

```tsx
"use client";
export const RelatedProjectCard = ({ href, images = [], title, description, priority = false }) => (
  <RevealFx delay={0.1 * Number(!priority)} translateY="8" fillWidth>
    <Row fillWidth gap="xl" vertical="start" padding="l"
         border="neutral-alpha-medium" radius="l" position="relative"
         style={{
           overflow: "hidden",
           backdropFilter: "blur(var(--static-space-1))",     /* = blur(1px) */
           transition: "all 0.2s ease-in-out",
           background: "var(--surface)",                       /* ⚠️ UNDEFINED — same bug */
           boxShadow: "0 2px 8px var(--neutral-alpha-weak), 0 0 0 1px var(--neutral-alpha-medium)",
         }}
         className="group hover:shadow-lg hover:border-brand-alpha-medium cursor-pointer">

      <div style={{position:"absolute", inset:0, zIndex:0, opacity:0.3,
        background:"radial-gradient(circle at 80% 20%, var(--brand-alpha-weak) 0%, transparent 50%)"}}/>

      <Row fillWidth gap="xl" vertical="start" style={{position:"relative", zIndex:1}}>
        <Column flex={2}>
          {images.length > 0 && (
            <Media priority={priority} aspectRatio="16/9" radius="m" alt={title}
                   src={images[0]} sizes="300px"
                   style={{boxShadow:"0 4px 16px var(--neutral-alpha-weak)",
                           transition:"transform 0.2s ease"}}
                   className="group-hover:scale-[1.02]"/>       {/* ⚠️ Tailwind class, no Tailwind */}
          )}
        </Column>
        <Column flex={3} gap="m" paddingY="xs">
          <Heading as="h3" variant="heading-strong-l" wrap="balance" onBackground="neutral-strong">
            {title}
          </Heading>
          {description?.trim() && (
            <Text variant="body-default-m" onBackground="neutral-medium" style={{lineHeight:"1.6"}}>
              {description}
            </Text>
          )}
          <Button data-border="rounded" href={href} variant="secondary" size="s"
                  weight="default" suffixIcon="arrowRight" style={{width:"fit-content"}}>
            Read case study
          </Button>
        </Column>
      </Row>
    </Row>
  </RevealFx>
);
```

⚠️ **[DEFECT] `group`, `hover:shadow-lg`, `hover:border-brand-alpha-medium` and `group-hover:scale-[1.02]` are Tailwind class names, and this project has no Tailwind.** Zero matches across all six CSS bundles. They are completely inert — no hover shadow, no border change, no image zoom. The only one that survives is `cursor-pointer`, which *is* a real Once UI utility — so the card shows a pointer cursor while **not being clickable** (only the Button navigates). Fix or drop.

Also: the `Row` has **no `s={{direction:"column"}}`**, so the 2:3 image/text split does not stack on mobile — it just squeezes. Add the stack.

## 3.7 About page — `src/app/about/page.tsx`

The most content-dense page. Root **[VERIFIED]**:

```jsx
<Column maxWidth="m">
```

Exactly **three** children: the Schema script, the fixed TOC rail, and the two-rail content Row.

```
<Column maxWidth="m">
  ├─ <Schema as="webPage" …/>
  ├─ <Column left="0" position="fixed" paddingLeft="24" gap="32" s={{hide:true}}
  │          style={{top:"50%", transform:"translateY(-50%)"}}>
  │      └─ <TableOfContents structure={structure} about={about}/>
  └─ <Row fillWidth horizontal="center" s={{direction:"column"}}>
       ├─ <Column className={styles.avatar} …/>                 ← left rail, flex 3
       └─ <Column className={styles.blockAlign} flex={9} maxWidth={40}>   ← content rail
            ├─ identity header  (id="Introduction")
            ├─ intro copy + tag cloud
            ├─ h2 "Key Achievements" + items
            ├─ h2 "Work Experience"  + experiences
            ├─ h2 "Education"        + institutions
            └─ h2 "Technical Skills" + skills
```

### 3.7.1 TOC rail

Outer wrapper props, verbatim from the payload:
`{"left":"0","style":{"top":"50%","transform":"translateY(-50%)"},"position":"fixed","paddingLeft":"24","gap":"32","s":{"hide":true}}`

A rail pinned to the **left edge of the viewport, vertically centred**, outside the `maxWidth="m"` measure. `position="fixed"`, not sticky — it does not scroll with content.

`structure` is built in `page.tsx` (5 entries; upstream has 4 — the achievements section is an addition):

```tsx
const structure = [
  { title: about.intro.title,        display: about.intro.display,        items: [] },
  { title: about.achievements.title, display: about.achievements.display, items: about.achievements.items.map(i => i.title) },
  { title: about.work.title,         display: about.work.display,         items: about.work.experiences.map(e => e.company) },
  { title: about.studies.title,      display: about.studies.display,      items: about.studies.institutions.map(i => i.name) },
  { title: about.technical.title,    display: about.technical.display,    items: about.technical.skills.map(s => s.title) },
];
```

`TableOfContents` internals — **[UNVERIFIED]**, reconstructed from the upstream file. Its webpack module (`50139`) is in none of the captured JS chunks and its subtree is absent from both payload and DOM. The only corroboration is that `.about_hover__kkAOE` survives in the shipped CSS and is referenced by nothing else. Since the fork demonstrably edited `Header.tsx`, `page.tsx`, `about.module.scss` and `content.tsx`, "unchanged" is an assumption.

```tsx
"use client";
const TableOfContents = ({ structure, about }) => {
  const scrollTo = (id, offset) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset,
                      behavior: "smooth" });
  };
  if (!about.tableOfContent.display) return null;
  return (
    <Column left="0" position="fixed" paddingLeft="24" gap="32"
            style={{top:"50%", transform:"translateY(-50%)", whiteSpace:"nowrap"}}
            m={{hide:true}}>
      {structure.filter(s => s.display).map((section, i) => (
        <Column key={i} gap="12">
          <Flex cursor="interactive" className={styles.hover} gap="8" vertical="center"
                onClick={() => scrollTo(section.title, 80)}>
            <Flex height="1" minWidth="16" background="neutral-strong"/>   {/* 16px tick */}
            <Text>{section.title}</Text>
          </Flex>
          {about.tableOfContent.subItems && section.items.map((item, j) => (
            <Flex key={j} l={{hide:true}} style={{cursor:"pointer"}} className={styles.hover}
                  gap="12" paddingLeft="24" vertical="center" onClick={() => scrollTo(item, 80)}>
              <Flex height="1" minWidth="8" background="neutral-strong"/>  {/* 8px tick */}
              <Text>{item}</Text>
            </Flex>
          ))}
        </Column>
      ))}
    </Column>
  );
};
```

Behaviour that matters:

- **`subItems` is `false` on the reference**, so only the 5 section titles render. The `items` arrays are still computed and shipped over the wire, unused.
- Each row is `[16px × 1px neutral-strong rule] gap-8 [Text label]`, translating 4px right on hover over `--transition-micro-medium` (0.2s).
- Click = smooth `window.scrollTo` with an **80px offset**, targeting `document.getElementById(section.title)` — so **the anchor ids are the raw titles, spaces and all**: `Introduction`, `Key Achievements`, `Work Experience`, `Education`, `Technical Skills`. Rename a section and you silently change its anchor.
- The 80px JS offset **stacks with** the global `h1,h2,…,h6 { scroll-margin-top: var(--static-space-80) }` rule. Omit the CSS rule and you land ~80px off.
- **No scroll-spy, no active-section highlighting, no `<a href="#…">`** — these are `div`s with `onClick`. Not keyboard-operable (a11y defect A14).
- **Breakpoints:** the page wrapper says `s={{hide:true}}` (≤768px); the component's own column says `m={{hide:true}}` (≤1024px). The stricter wins → visible only above 1024px. **[The `m` half is UNVERIFIED — it lives inside the unreachable client module.]**
- **[Gotcha]** The 7 achievement titles appear in `structure[1].items` but the rendered achievement titles carry **no `id`**. Flip `subItems` to `true` and those seven sub-items scroll nowhere.

### 3.7.2 Avatar rail (left)

```tsx
<Column className={styles.avatar} position="sticky" top="64" s={{position:"relative"}}
        minWidth="160" paddingX="l" paddingBottom="xl" gap="m" flex={3} horizontal="center">
  <Avatar src={person.avatar} size="xl"/>
  <Row gap="8" vertical="center">
    <Icon onBackground="accent-weak" name="globe"/>
    {person.location}
  </Row>
  <Row wrap gap="8">
    {person.languages.map((lang, i) => <Tag key={i} size="l">{lang}</Tag>)}
  </Row>
</Column>
```

- `Avatar size="xl"` → **160×160px** (`--static-space-160`).
- The location is a **bare text child** of the `Row`, not wrapped in `Text`.
- Language `Tag`s take **no `prefixIcon`**.
- `flex={3}` against the content rail's `flex={9}` = a **3:9 (1:4) split**.
- Stickiness comes from *both* the prop and the SCSS module:
  ```css
  .avatar { position: sticky; height: fit-content; top: var(--static-space-64); }   /* 4rem */
  @media (max-width: 768px) { .avatar { top: auto } }
  ```
  Upstream has **no `.avatar` rule at all** (`className={styles.avatar}` resolves to `undefined` there) — the fork fixed that bug. Upstream also passes `fitHeight` and `xs={{style:{top:"auto"}}}`, which the live build does not; the SCSS `height: fit-content` replaces them.

### 3.7.3 Content rail (right)

```tsx
<Column className={styles.blockAlign} flex={9} maxWidth={40}>
```

`maxWidth={40}` is a **number** → inline `max-width: 40rem`. That is **640px above 768px** but only **600px at ≤768px**, because `html { font-size: var(--font-scaling-mobile) }` = 15px there. Every rem figure on the page shrinks 6.25% on mobile.

`.blockAlign { align-self: center }` applies **only** inside `@media (max-width: 768px)`.

### 3.7.4 Identity header — `id="Introduction"`

```tsx
<Column id="Introduction" fillWidth minHeight="160" vertical="center" marginBottom="32">
```
(`minHeight="160"` = 10rem; `vertical="center"` on a Column = `justify-content: center`.)

**(a) Booking pill.** The whole pill is wrapped in a `SmartLink` — a fork change; upstream puts the href on the inner `IconButton`:

```tsx
<SmartLink href={about.calendar.link}>
  <Row fitWidth border="brand-alpha-medium" background="brand-alpha-weak" radius="full"
       padding="4" gap="8" marginBottom="m" vertical="center" className={styles.blockAlign}
       style={{backdropFilter: "blur(var(--static-space-1))", cursor: "pointer"}}>
    <Icon paddingLeft="12" name="calendar" onBackground="brand-weak"/>
    <Row paddingX="8">Get in touch</Row>            {/* upstream: "Schedule a call" */}
    <IconButton data-border="rounded" variant="secondary" icon="chevronRight"/>
  </Row>
</SmartLink>
```
`--static-space-1` is a literal **`1px`** at `data-scaling="100"` — it is the one rung of the space scale that isn't a rem value. So that backdrop filter is `blur(1px)`.

**(b) Name.** `<Heading className={styles.textAlign} variant="display-strong-xl">{person.name}</Heading>`
→ `<h1 class="font-display font-strong font-xl neutral-on-background-strong about_textAlign__…" style="text-wrap:balance">`

**(c) Role.** `<Text className={styles.textAlign} variant="display-default-xs" onBackground="neutral-weak">{person.role}</Text>`

`.textAlign { text-align: center }` applies **only at ≤768px**.

**(d) Social row.**
```tsx
<Row className={styles.blockAlign} paddingTop="20" paddingBottom="8" gap="8"
     wrap horizontal="center" fitWidth data-border="rounded">
  {social.filter(i => i.essential).map(item => (
    <React.Fragment key={item.name}>
      <Row s={{hide:true}}>
        <Button href={item.link} prefixIcon={item.icon} label={item.name}
                size="m" weight="default" variant="secondary"/>
      </Row>
      <Row hide s={{hide:false}}>
        <IconButton size="l" href={item.link} icon={item.icon} variant="secondary"/>
      </Row>
    </React.Fragment>
  ))}
</Row>
```
Labelled buttons above 768px, icon-only below. **Same `hide`/`s={{hide:false}}` uncertainty as §3.2 — see that [CONFLICT] box.** Button `size="m"` here (upstream uses `"s"`).

### 3.7.5 Intro block

```tsx
<Column textVariant="body-default-l" fillWidth gap="2" marginBottom="xl">
  {about.intro.description}
  <Row wrap gap="8" paddingTop="m">
    {about.intro.tags.map((tag, i) => (
      <Tag key={`intro-${i}`} size="l" prefixIcon={tag.icon}>{tag.name}</Tag>
    ))}
  </Row>
</Column>
```

Note `gap="2"` (0.125rem) — upstream uses `gap="m"`. The tighter gap exists because paragraphs are separated by explicit `<br/>`s.

`about.intro.description` is **JSX, not a string**: N `<Text>` elements separated by `<br/>`. Each `Text` serialises to a bare `<span className="">` and inherits `body-default-l` from the parent Column's `textVariant`. The reference has 5 paragraphs / 4 breaks.

The 17-tag cloud is a **fork addition** — not in the upstream template.

### 3.7.6 Key Achievements — fork-specific section

```tsx
<Heading as="h2" id={about.achievements.title} variant="display-strong-s" marginBottom="m">
  {about.achievements.title}
</Heading>
<Column fillWidth gap="4" marginBottom="xl">
  {about.achievements.items.map((item, index) => (
    <Row key={`achievement-${index}`} fillWidth gap="s" vertical="start" paddingY="s">
      <Icon name={item.icon} size="m" onBackground="brand-strong"
            style={{marginTop:"2px", flexShrink:0}}/>
      <Column gap="2" flex={1}>
        <Text variant="heading-strong-s">{item.title}</Text>
        <Text variant="body-default-l" onBackground="neutral-weak">{item.description}</Text>
      </Column>
    </Row>
  ))}
</Column>
```

⚠️ **[DEFECT]** Every reference item uses `icon: "star"`, and **`star` is in neither the site's icon registry nor Once UI's 43 built-ins.** `Icon` logs `Icon "star" does not exist in the library.` and returns **`null`** — silently, not a crash. **All seven achievement icons on the live site render as nothing.** Register your icons (§5.4).

> **[CONFLICT]** `05-content.md` §B5 claims the achievement titles get a blue underline from `[data-once-ui] [data-gap="2"] [class*=heading-strong-s]`. But `04-tokens.md` and `07-platform.md` independently grepped for `data-once-ui` across all HTML, all RSC payloads and both JS chunks and found **zero** occurrences — so every `[data-once-ui]`-scoped rule is inert. **The underline does not happen.** The dead-CSS finding has two independent confirmations; treat B5 as superseded.

### 3.7.7 Work Experience

```tsx
<Heading as="h2" id={about.work.title} variant="display-strong-s" marginBottom="m">
  {about.work.title}
</Heading>
<Column fillWidth gap="l" marginBottom="40">
  {about.work.experiences.map((exp, index) => (
    <Column key={`${exp.company}-${exp.role}-${index}`} fillWidth>
      <Row fillWidth horizontal="between" vertical="end" marginBottom="4">
        <Text id={exp.company} variant="heading-strong-l">{exp.company}</Text>
        <Text variant="heading-default-xs" onBackground="neutral-weak">{exp.timeframe}</Text>
      </Row>
      <Text variant="body-default-s" onBackground="brand-weak" marginBottom="m">{exp.role}</Text>
      <Column as="ul" gap="16">
        {exp.achievements.map((a, i) => (
          <Text as="li" variant="body-default-m" key={`${exp.company}-${i}`}>{a}</Text>
        ))}
      </Column>
      {exp.images?.length > 0 && (
        <Row fillWidth paddingTop="m" paddingLeft="40" gap="12" wrap>
          {exp.images.map((image, i) => (
            <Row key={i} border="neutral-medium" radius="m"
                 minWidth={image.width} height={image.height}>
              <Media enlarge radius="m" sizes={String(image.width)} alt={image.alt} src={image.src}/>
            </Row>
          ))}
        </Row>
      )}
    </Column>
  ))}
</Column>
```

Anatomy of one entry:

| Element | Component + props | Emitted className |
|---|---|---|
| header row | `Row fillWidth horizontal="between" vertical="end" marginBottom="4"` | company ↔ timeframe on one baseline |
| company | `Text id={company} variant="heading-strong-l"` | `font-heading font-strong font-l` |
| timeframe | `Text variant="heading-default-xs" onBackground="neutral-weak"` | `font-heading font-default font-xs neutral-on-background-weak` |
| role | `Text variant="body-default-s" onBackground="brand-weak" marginBottom="m"` | `font-body font-default font-s brand-on-background-weak mb-m` |
| bullet list | `Column as="ul" gap="16"` | the `<ul>` **is** the flex container |
| bullet | `Text as="li" variant="body-default-m"` | real `<li>` elements |

Important details:

- **This is not visually a timeline.** No rule, no dot, no connector line. It is a plain stack separated by `gap="l"`; the timeline reading comes purely from the right-aligned timeframe.
- The company `id` is the anchor for the (disabled) TOC sub-items — spaces, parentheses and all.
- Rich text in a bullet is supported: bullets are `React.ReactNode`, so `<b>` etc. work. The reference has exactly one such bullet site-wide.
- ⚠️ **There is no list reset anywhere in the shipped CSS.** The string `list-style` does not occur in any of the six bundles. So `<Column as="ul">` keeps the UA defaults: `list-style: disc`, `padding-inline-start: 40px`, `margin-block: 1em`. **If you apply a modern CSS reset you lose the disc markers and the indent.** Decide deliberately.

### 3.7.8 Education

```tsx
<Heading as="h2" id="Education" variant="display-strong-s" marginBottom="m">Education</Heading>
<Column fillWidth gap="l" marginBottom="40">
  {about.studies.institutions.map((inst, index) => (
    <Column key={`${inst.name}-${index}`} fillWidth gap="4">
      <Text id={inst.name} variant="heading-strong-l">{inst.name}</Text>
      <Text variant="heading-default-xs" onBackground="neutral-weak">{inst.description}</Text>
    </Column>
  ))}
</Column>
```
No timeframe field, no logo, no location in the schema.

### 3.7.9 Technical Skills

```tsx
<Heading as="h2" id="Technical Skills" variant="display-strong-s" marginBottom="40">
  Technical Skills
</Heading>
<Column fillWidth gap="l">          {/* no marginBottom — last block on the page */}
  {about.technical.skills.map((skill, index) => (
    <Column key={`${skill.title}-${index}`} fillWidth gap="4">
      <Text id={skill.title} variant="heading-strong-l">{skill.title}</Text>
      <Text variant="body-default-m" onBackground="neutral-weak">{skill.description}</Text>
      {skill.tags?.length > 0 && (
        <Row wrap gap="8" paddingTop="8">
          {skill.tags.map((tag, i) => (
            <Tag key={`${skill.title}-${i}`} size="l" prefixIcon={tag.icon}>{tag.name}</Tag>
          ))}
        </Row>
      )}
    </Column>
  ))}
</Column>
```

- This heading is the **only one** with `marginBottom="40"`; the other three h2s use `marginBottom="m"`.
- ⚠️ Upstream (and the fork, verbatim) writes `key={`${skill}-${index}`}` — templating an **object**, so React keys come out as `"[object Object]-0"`. A real upstream bug. **Fix it**: use `skill.title`.

### 3.7.10 Anchor-id inventory

| id | on element |
|---|---|
| `Introduction` | the identity-header `<Column>` (not a heading) |
| `Key Achievements`, `Work Experience`, `Education`, `Technical Skills` | the four `<h2>`s |
| each company name | the company `Text` `<span>` |
| each institution name | the institution `Text` `<span>` |
| each skill title | the skill `Text` `<span>` |
| achievement titles | **none** — the gotcha in §3.7.1 |

### 3.7.11 About responsive summary

| Viewport | TOC rail | Avatar rail | Content rail | Social buttons | Text align |
|---|---|---|---|---|---|
| >1440px | visible, fixed left, v-centred | sticky `top:4rem`, `flex:3` | `flex:9`, `max-width:40rem` | labelled `Button size="m"` | left |
| 1025–1440px | visible | sticky | same | labelled | left |
| 769–1024px | **hidden** (`m-flex-hide`) | sticky | measure drops to 55rem | labelled | left |
| ≤768px | hidden | `position:relative`, stacked above content, centred | `align-self:center`, 600px | icon-only `IconButton size="l"` * | name/role centred |

\* subject to the §3.2 [CONFLICT].

## 3.8 404 page — `src/app/not-found.tsx`

```jsx
<Column as="section" fill center paddingBottom="160">
  <Text marginBottom="s" variant="display-strong-xl">404</Text>
  <Heading marginBottom="l" variant="display-default-xs">Page Not Found</Heading>
  <Text onBackground="neutral-weak">The page you are looking for does not exist.</Text>
</Column>
```
Dual-purpose: Next's real 404 handler **and** the component `RouteGuard` renders inline for disabled routes.

---

# 4. Design system — the token contract

This section is written so it can be re-implemented in a different styling system. Everything is expressed as *what the value is*, not *which Once UI prop produces it*.

## 4.1 The theming mechanism

Once UI is **not** class-based theming. Every token is a CSS custom property, and values are selected by **`data-*` attribute selectors** on `<html>`. There is no `.dark {}` class anywhere in the system.

Nothing is server-rendered onto `<html>`. A **blocking inline script in `<head>`** stamps the attributes before first paint:

```js
(function() {
  try {
    const root = document.documentElement;
    const defaultTheme = 'system';

    const config = {"brand":"cyan","accent":"red","neutral":"gray","solid":"contrast",
                    "solid-style":"flat","border":"playful","surface":"translucent",
                    "transition":"all","scaling":"100","viz-style":"gradient"};

    Object.entries(config).forEach(([k, v]) => root.setAttribute('data-' + k, v));

    const resolveTheme = (t) => (!t || t === 'system')
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : t;

    root.setAttribute('data-theme', resolveTheme(localStorage.getItem('data-theme')));

    Object.keys(config).forEach(k => {
      const v = localStorage.getItem('data-' + k);
      if (v) root.setAttribute('data-' + k, v);
    });
  } catch (e) {
    console.error('Failed to initialize theme:', e);
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
```

Five behaviours to replicate exactly:

1. It runs **before React**, which is why there is no theme flash. `<html>` needs `suppressHydrationWarning`.
2. **Persistence keys are the literal attribute names**: `localStorage["data-theme"]`, `localStorage["data-brand"]`, … Every one of the ten config keys can be independently overridden from localStorage.
3. `theme: "system"` is resolved at runtime; `data-theme` is always written as a concrete `light` or `dark` — never `system`.
4. The catch-all fallback is **`dark`**.
5. **Attributes are scoped, not global.** They are plain attribute selectors, so any subtree can override. The reference does this exactly once: `<header data-border="rounded">` while `<html>` carries `data-border="playful"`.

## 4.2 Legal attribute values

Only values with a real CSS rule are listed. The traps below are documented in the upstream config *comments* but have **no rule at all**.

| Attribute | Values with a real rule | Reference value |
|---|---|---|
| `data-theme` | `light`, `dark` | resolved at runtime |
| `data-brand` | `custom, red, orange, yellow, moss, green, emerald, aqua, cyan, blue, indigo, violet, magenta, pink` (14) | `cyan` |
| `data-accent` | same 14 | `red` |
| `data-neutral` | `custom, slate, gray, sand` (4) | `gray` |
| `data-solid` | `color, contrast, inverse` (3) | `contrast` |
| `data-solid-style` | **`plastic` only** | `flat` (= the `:root` default, no rule) |
| `data-border` | `playful, conservative, rounded` (3) — **mandatory** | `playful` (`rounded` on `<header>`) |
| `data-surface` | `translucent, filled` (2) | `translucent` |
| `data-transition` | `all, micro, macro` (3) | `all` |
| `data-scaling` | `90, 95, 105, 110` | `100` (= identity, no rule) |
| `data-viz-style` | `divergent, sequential` (2) | `gradient` ⚠️ |
| `data-cursor-interactive` | `pointer, default` | not set → `pointer` |
| `data-desktop-size` / `-tablet-size` / `-mobile-size` | `13`–`18` | not set → 16 / 16 / 15px |

> **[CORRECTED 2026-09-09]** The "Traps" list below is **wrong for the installed library.**
> It was derived from blancbo.com's compiled, tree-shaken production bundle, which only ships the
> hues that site actually uses. Checked directly against `@once-ui-system/core` **1.8.4** in
> `node_modules/@once-ui-system/core/dist/css/tokens.css` (note: it uses *unquoted* attribute
> selectors, e.g. `[data-neutral=mint]`, which is why a quoted grep finds nothing):
>
> - `data-neutral` ships **all 7**: `custom, dusk, gray, mint, rose, sand, slate`
> - `data-border` ships **all 4**: `conservative, playful, rounded, sharp`
> - `data-brand` / `data-accent` ship **all 14** each
>
> `mint`, `rose`, `dusk` and `sharp` are all safe to use. The `data-border` :root-fallback warning
> still stands as a structural note, but `sharp` itself is a real, defined value.

**Traps (as observed in the reference site's bundle — see correction above):**
- `neutral: "mint" | "rose" | "dusk"` — in the comments, **no CSS rule exists**.
- `border: "sharp"` — in the comments, **no rule**. Set it and every `--radius-*` is undefined.
- `solid: "inverse"` — implemented in CSS but **omitted from the comments**.
- **`data-border` has no `:root` fallback.** It must always be present on some ancestor or all radius tokens are undefined.

⚠️ **[DEFECT] `data-viz-style="gradient"` is doubly broken.** (a) `layout.tsx` writes `dataStyle.variant` (a *ChartVariant*: `flat|gradient|outline`) into an attribute whose CSS only implements *ChartMode* values (`divergent|sequential`), so it matches nothing. (b) Even with a legal value it still wouldn't match: those four rules are written **descendant-only** (`[data-theme=dark] [data-viz-style=divergent]`) with **no compound form**, and both attributes are stamped on the same `<html>` element. Every other paired attribute in the system ships both forms. Net effect on the reference: the categorical chart palette applies — which happens to be what `dataStyle.mode` asks for anyway. If you never render a chart, ignore this entirely.

## 4.3 Colour architecture

Three layers, resolved in order:

```
--scheme-<hue>-<step>          raw ramp, 16 hues × 15 steps, theme-independent, on :root
        ↓ selected by data-brand / data-accent / data-neutral
--function-<family>-<step>     role ramp, 7 families
        ↓ selected by data-theme (+ data-solid for brand only)
--<family>-<tier>              semantic token — what components consume
```

**16 hues:** `sand, gray, slate, red, orange, yellow, moss, green, emerald, aqua, cyan, blue, indigo, violet, magenta, pink` (+ three undefined `custom` hooks).
**15 steps per hue:** `100…1200` plus three alpha derivatives of step 600 — `600-15` (15%), `600-30` (30%), `600-50` (50%). **The ramp runs dark→light**: 100 is near-black, 1200 is near-white.

The three ramps the reference actually uses:

**`--scheme-cyan-*` → brand**
| Step | Hex | Step | Hex |
|---|---|---|---|
| 100 | `#050911` | 700 | `#17C0FD` |
| 200 | `#0A1525` | 800 | `#60E4FC` |
| 300 | `#094074` | 900 | `#82F1FC` |
| 400 | `#045B9C` | 1000 | `#B3FAFC` |
| 500 | `#0279BE` | 1100 | `#D4FBFC` |
| 600 | `#049EE2` | 1200 | `#EFFCFD` |

alphas `#049EE226` / `#049EE24D` / `#049EE280`

**`--scheme-red-*` → accent (and always → danger)**
| Step | Hex | Step | Hex |
|---|---|---|---|
| 100 | `#130507` | 700 | `#FF9689` |
| 200 | `#2A0A10` | 800 | `#FDC6BD` |
| 300 | `#830711` | 900 | `#FDD8D2` |
| 400 | `#B6020C` | 1000 | `#FDEAE6` |
| 500 | `#E90507` | 1100 | `#FCF1EF` |
| 600 | `#FF5F53` | 1200 | `#FDF9F8` |

alphas `#FF5F5326` / `#FF5F534D` / `#FF5F5380`

**`--scheme-gray-*` → neutral (and always → info)**
| Step | Hex | Step | Hex |
|---|---|---|---|
| 100 | `#0A0A0A` | 700 | `#B2B2B2` |
| 200 | `#151515` | 800 | `#D2D2D2` |
| 300 | `#3F3F3F` | 900 | `#E0E0E0` |
| 400 | `#595959` | 1000 | `#EDEDED` |
| 500 | `#757575` | 1100 | `#F3F3F3` |
| 600 | `#959595` | 1200 | `#F9F9F9` |

alphas `#95959526` / `#9595954D` / `#95959580`

**Seven families:** `brand, accent, neutral, info, warning, danger, success`. Only the first three are attribute-driven; the rest are hard-wired on `:root`:
`info → gray`, `warning → yellow`, `danger → red`, `success → green`. **On this configuration accent and danger are the same ramp — visually identical.**

**17 tiers per family:**

| Group | Tiers | Purpose |
|---|---|---|
| `background` | strong / medium / weak | large fills |
| `on-background` | strong / medium / weak | text and icons on a background fill |
| `solid` | strong / medium / weak | button and chip fills |
| `on-solid` | strong / weak | text on a solid fill (**no `-medium` exists** — see below) |
| `border` | strong / medium / weak | opaque borders |
| `alpha` | strong (50%) / medium (30%) / weak (15%) | translucent fills and borders, always from step 600 |

**Tier → step mapping**

DARK (`[data-theme=dark]`):
```
background-strong → 300      on-background-strong → static-white
background-medium → 200      on-background-medium → 900
background-weak   → 100      on-background-weak   → 700
solid-strong → 500           on-solid-strong → static-white
solid-medium → 400           on-solid-weak   → 900
solid-weak   → 300
border-strong → 400 · border-medium → 300 · border-weak → 200
alpha-strong/medium/weak → 600-50 / 600-30 / 600-15
```

LIGHT (`[data-theme=light]`):
```
background-strong → 800      on-background-strong → 100
background-medium → 1000     on-background-medium → 400
background-weak   → static-white  ← note: white, not a ramp step
solid-strong → 600           on-solid-strong → static-white
solid-medium → 500           on-solid-weak   → 1000
solid-weak   → 400
border-strong → 800 · border-medium → 900 · border-weak → 1000
alpha-strong/medium/weak → 600-50 / 600-30 / 600-15
```

**Brand solids are the exception** — those five lines are absent from the plain `[data-theme]` blocks and come only from `[data-theme][data-solid]`:

| | `solid=color` | **`solid=contrast`** (reference) | `solid=inverse` |
|---|---|---|---|
| dark `--brand-solid-strong` | brand-500 | **neutral-1000** | brand-800 |
| dark `--brand-solid-medium` | brand-400 | **static-white** | brand-700 |
| dark `--brand-solid-weak` | brand-300 | **neutral-900** | brand-600 |
| dark `--brand-on-solid-strong` | white | **static-black** | static-black |
| dark `--brand-on-solid-weak` | brand-900 | **neutral-200** | brand-200 |
| light `--brand-solid-strong` | brand-600 | **neutral-300** | brand-900 |
| light `--brand-solid-medium` | brand-500 | **static-black** | brand-800 |
| light `--brand-solid-weak` | brand-400 | **neutral-400** | brand-700 |
| light `--brand-on-solid-strong` | white | **static-white** | static-black |
| light `--brand-on-solid-weak` | brand-1000 | **neutral-1000** | brand-200 |

**This is why the reference's primary buttons are monochrome white-on-black / black-on-white despite a cyan brand.** With `solid: "contrast"`, cyan only appears in `--brand-on-background-*` (link colour), `--brand-background-strong` (the dot grid) and `--brand-alpha-*`.

⚠️ **[DEFECT]** `--<family>-on-solid-medium` is **never defined** for any family, yet the utility layer ships `.brand-on-solid-medium`, `.accent-on-solid-medium`, … Those classes set `color:` to an undefined variable and are inert.

### 4.3.1 Resolved values for this configuration

**DARK** (`brand=cyan / accent=red / neutral=gray / solid=contrast`)

| Token | Chain | Hex |
|---|---|---|
| `--page-background` | neutral-background-weak → gray-100 | **`#0A0A0A`** |
| `--surface-background` | static-black-medium (translucent) | `#0000004D` |
| `--surface-border` | neutral-alpha-medium | `#9595954D` |
| `--backdrop-filter` | translucent | `blur(1rem)` |
| `--neutral-on-background-strong` | static-white | **`#ffffff`** ← body text |
| `--neutral-on-background-weak` | gray-700 | **`#B2B2B2`** ← muted text |
| `--brand-on-background-medium` | cyan-900 | **`#82F1FC`** ← link colour |
| `--brand-background-strong` | cyan-300 | `#094074` ← the background dots |
| `--brand-solid-strong` | gray-1000 | `#EDEDED` ← focus ring |
| `--brand-alpha-weak / -medium / -strong` | cyan-600-* | `#049EE226` / `#049EE24D` / `#049EE280` |
| `--neutral-alpha-weak / -medium / -strong` | gray-600-* | `#95959526` / `#9595954D` / `#95959580` |
| `--accent-background-strong` | red-300 | `#830711` |

**LIGHT**

| Token | Chain | Hex |
|---|---|---|
| `--page-background` | static-white | **`#ffffff`** |
| `--surface-background` | static-white-medium | `#ffffff4D` |
| `--neutral-on-background-strong` | gray-100 | **`#0A0A0A`** ← body text |
| `--neutral-on-background-weak` | gray-500 | **`#757575`** ← muted text |
| `--brand-on-background-medium` | cyan-400 | **`#045B9C`** ← link colour |
| `--brand-background-strong` | cyan-800 | `#60E4FC` ← dots (theme-dependent!) |
| `--brand-solid-strong` | gray-300 | `#3F3F3F` |
| alphas | identical to dark | |

**Static colours** (5 tokens, `:root`, theme-independent):
```css
--static-transparent: #00000000;
--static-white:        #ffffff;   --static-white-medium: #ffffff4D;
--static-black:        #000000;   --static-black-medium: #0000004D;
```

**Surface tokens** (`data-surface`):
```css
:root { --backdrop-filter: none;
        --surface-border: var(--static-transparent);
        --surface-background: var(--neutral-background-medium); }
[data-surface=translucent]                { --backdrop-filter: blur(1rem); }
[data-surface=translucent][data-theme=light] { --surface-background: var(--static-white-medium);
                                               --surface-border: var(--neutral-alpha-medium); }
[data-surface=translucent][data-theme=dark]  { --surface-background: var(--static-black-medium);
                                               --surface-border: var(--neutral-alpha-medium); }
[data-surface=filled][data-theme=light]      { --surface-background: var(--neutral-background-weak);
                                               --surface-border: var(--neutral-border-medium); }
[data-surface=filled][data-theme=dark]       { --surface-background: var(--neutral-background-medium);
                                               --surface-border: var(--static-transparent); }
```
Each rule is duplicated in a descendant form so a nested `data-theme` island still resolves.

## 4.4 Spacing scale

**Static space** — 18 rungs, `--static-space-<n>` where `<n>` is the px value at a 16px root:

```
0: 0        1: 1px ⚠️   2: 0.125rem  4: 0.25rem   8: 0.5rem
12: 0.75rem 16: 1rem    20: 1.25rem  24: 1.5rem   32: 2rem
40: 2.5rem  48: 3rem    56: 3.5rem   64: 4rem     80: 5rem
104: 6.5rem 128: 8rem   160: 10rem
```

⚠️ **`--static-space-1` is a literal `1px`** — the one rung that is not a rem value. (Under `data-scaling` it becomes `calc(0.0625rem * f)`, a unit change, not just a scale.)

⚠️ `--static-space-28` and `--static-space-36` are **referenced by component CSS but never defined**.

**Responsive space** — redefined at 1024px and 768px. This is what shapes the whole layout rhythm:

| Token | ≥1025px | ≤1024px | ≤768px |
|---|---|---|---|
| `--responsive-space-xl` | 5rem | 4rem | 2.5rem |
| `--responsive-space-l` | 2.5rem | 1.5rem | 1rem |
| `--responsive-space-m` | 1.5rem | 1rem | 0.75rem |
| `--responsive-space-s` | 1rem | 0.75rem | 0.5rem |
| `--responsive-space-xs` | 0.75rem | 0.5rem | 0.25rem |

**Static widths** (11) and **heights** (9):
```
width:  2400:150rem  1600:100rem  1440:90rem  1200:75rem  1024:64rem  880:55rem
        768:48rem    640:40rem    560:35rem   400:25rem   320:20rem
height: 560:35rem  480:30rem  400:25rem  360:22.5rem  320:20rem
        280:17.5rem  240:15rem  220:13.75rem  160:10rem
```

**Responsive widths** (used by `maxWidth`):

| Token | ≥1025px | ≤1024px |
|---|---|---|
| `xl` | 90rem | 64rem |
| `l` | 75rem | 64rem |
| **`m`** | **64rem** | **55rem** |
| `s` | 48rem | 48rem |
| `xs` | 40rem | 40rem |

**Responsive heights:**

| Token | ≥1025px | ≤1024px | ≤768px |
|---|---|---|---|
| `xl` | 35rem | 30rem | 20rem |
| `l` | 30rem | 25rem | 17.5rem |
| `m` | 25rem | 22.5rem | 15rem |
| `s` | 22.5rem | 17.5rem | 13.75rem |
| `xs` | 17.5rem | 15rem | 10rem |

**`data-scaling`** rewrites every `--static-space-*` (except `-0`), every `--static-width-*` (except `-640`) and every `--static-height-*` as `calc(base * factor)` for 90/95/105/110. There is **no `[data-scaling="100"]` rule** — 100 simply matches nothing, so the bare `:root` values apply.

## 4.5 Breakpoints

**Three, all max-width. There are no min-width queries anywhere in the compiled CSS.**

| Prop tier | Media query | Utility prefix |
|---|---|---|
| `l={{…}}` | `@media (max-width: 1440px)` | `.l-*` |
| `m={{…}}` | `@media (max-width: 1024px)` | `.m-*` |
| `s={{…}}` | `@media (max-width: 768px)` | `.s-*` |

The class builder is literally:
```js
r && "flex-hide", s?.hide && "l-flex-hide", c?.hide && "m-flex-hide", u?.hide && "s-flex-hide"
```

Only two other media queries exist in the entire build: one `@media (hover: hover)` (an unused `TiltFx` rule) and one `@media (prefers-color-scheme: dark)` (the `ProjectCard` avatar overlay defect).

The JS layout provider additionally knows `xs: 480` and `xl: Infinity` (`DEFAULT_BREAKPOINTS = {xs:480, s:768, m:1024, l:1440, xl:Infinity}`) but **no `xs-` CSS utilities are emitted.**

⚠️ **Name collision:** `.m-16` is `margin: var(--static-space-16)` while `.m-flex-column` is the *medium-breakpoint* utility. And the t-shirt margins `.m-xs .m-s .m-m .m-l .m-xl` also exist. The only reliable rule: an `m-`-prefixed class is a breakpoint utility **iff** its remainder is a known responsive utility name (`flex-*`, `grid-*`, `justify-*`, `align-*`, `position-*`, `top/right/bottom/left-N`, `center`, `overflow-*`, `columns-N`).

## 4.6 Typography

### Fonts

| Slot | CSS var | Reference typeface | Loader | Weights |
|---|---|---|---|---|
| heading / display | `--font-heading` | **Cal Sans** (`calSans`) | `next/font/local`, TTF | **400 only** |
| body | `--font-body` | **Outfit** (`outfitBody`) | `next/font/local`, variable TTF | 100–900 |
| label | `--font-label` | **Outfit** (`outfitLabel`, *same file*) | `next/font/local` | 100–900 |
| code | `--font-code` | **Geist Mono** | `next/font/google`, 6 woff2 subsets | 100–900 |

Upstream uses Geist for heading/body/label and Geist Mono for code. **All three text faces are replacements.**

Every face ships a size-adjusted `local("Arial")` fallback (`ascent-override`, `descent-override`, `size-adjust`) — the signature of `next/font`'s automatic fallback metrics. All four variable classes go on `<html>` together.

⚠️ **There is no `--font-display` token.** `.font-display` resolves to `var(--font-heading)`. Since Cal Sans is a **single-weight 400 face**, `display-default` (300) and `display-strong` (600) both render at 400 — synthesised or ignored by the browser.

⚠️ **Perf:** the two local faces ship as **TTF, not WOFF2** — 212 KB of critical-path font bytes where WOFF2 would be roughly 60–90 KB. **Convert to WOFF2 in your build.**

Three preloads (Outfit is shared, only the Latin Geist Mono subset is marked for preload):
`43d7760973689375-s.p.ttf` (Outfit, 110 572 B), `584cbb255ad680e5-s.p.ttf` (Cal Sans, 101 592 B), `f5271587012faf78-s.p.woff2` (Geist Mono latin, 29 972 B).

### Root font size

```css
:root { --font-scaling-desktop: 16px; --font-scaling-tablet: 16px; --font-scaling-mobile: 15px; }
html { font-size: var(--font-scaling-desktop); font-family: var(--font-body);
       font-weight: var(--font-weight-normal); color: var(--neutral-on-background-strong); }
@media (max-width: 1024px) { html { font-size: var(--font-scaling-tablet); } }
@media (max-width:  768px) { html { font-size: var(--font-scaling-mobile);  } }
```
**Every rem figure in this document shrinks 6.25% at ≤768px.**

### Weight tokens

```
thin 100 · extraLight 200 · light 300 · normal 400 · medium 500 · semiBold 600 · bold 700 · extraBold 800

body-default 400    body-strong 700
label-default 400   label-strong 600
code-default 400    code-strong 700
heading-default 400 heading-strong 600
display-default 300 display-strong 600      ← display-default is the only non-400 default
```

### Type scale (base / desktop)

| Variant | Size | Line-height |
|---|---|---|
| display xl | **5rem** | 5rem |
| display l | 4rem | 4.25rem |
| display m | 3rem | 3.25rem |
| display s | 2.5rem | 3rem |
| display xs | 2rem | 2.5rem |
| heading xl | 1.5rem | 2rem |
| heading l | 1.33rem | 1.75rem |
| heading m | 1.25rem | 1.5rem |
| heading s | 1.125rem | 1.5rem |
| heading xs | 1rem | 1.25rem |
| body xl | 1.25rem | 1.75rem |
| body l | 1.125rem | 1.5rem |
| body m | 1rem | 1.5rem |
| body s | 0.875rem | 1.125rem |
| body xs | 0.75rem | 1rem |
| label l | 1rem | 1.25rem |
| label m | 0.925rem | 1.25rem |
| label s | 0.825rem | 1rem |

There is **no separate `code` size ramp** — `.font-code.font-{l,m,s}` reuse the *label* sizes.

**Responsive overrides** — only display and the three largest headings shrink:

`@media (max-width: 1024px)`
```
display-xl 3.5rem/3.75rem · display-l 3.25rem/3.5rem · display-m 2.75rem/3rem
display-s 2.25rem/2.5rem  · display-xs 1.75rem/2rem
heading-xl 1.33rem/1.75rem · heading-l 1.25rem/1.5rem · heading-m 1.125rem/1.25rem
```
`@media (max-width: 768px)`
```
display-xl 2.75rem/3rem · display-l 2.5rem/3rem · display-m 2.25rem/2.5rem · display-s 2rem/2.5rem
```
(`display-xs` and all heading sizes keep their 1024px values below 768px.)

**Multipliers:** `--font-size-{heading,body,label}-multiplier` and matching line-height multipliers, all `1`. **There is no `--font-size-display-multiplier`** — display classes multiply by the *heading* multiplier.

### Class API

Composable, three-part:
```
family:  .font-display  .font-heading  .font-body  .font-label  .font-code
weight:  .font-default  .font-strong
size:    .font-xl  .font-l  .font-m  .font-s  .font-xs      (label/code: only l/m/s)
```
Selectors are `.font-body.font-s` **or** `.font-body > .font-s`, so a wrapper can carry the family and children the size. **A bare `.font-xl` does nothing** — the family class must be on the same element or its parent.

Display-only baked-in tracking: `display xl −0.05em, l −0.04em, m −0.03em, s −0.02em, xs none`.

Variant → className mapping (this is exactly what `Heading`/`Text` compile):

| `variant` prop | className |
|---|---|
| `display-strong-xl` | `font-display font-strong font-xl` (+ `neutral-on-background-strong` by default) |
| `display-default-xs` | `font-display font-default font-xs` |
| `display-strong-s` | `font-display font-strong font-s` |
| `heading-strong-xl` / `-l` / `-s` | `font-heading font-strong font-{xl,l,s}` |
| `heading-default-xl` / `-xs` | `font-heading font-default font-{xl,xs}` |
| `body-default-l` / `-m` / `-s` / `-xs` | `font-body font-default font-{l,m,s,xs}` |
| `label-default-s` | `font-label font-default font-s` |
| `onBackground="neutral-weak"` | `+ neutral-on-background-weak` |
| `onBackground="brand-weak"` | `+ brand-on-background-weak` |

`Heading` also emits `style={{textWrap: "balance"}}` when `wrap="balance"`.

## 4.7 Radius

16 tokens per style: `xs, s, m, l, xl` each with base / `-nest-4` / `-nest-8`, plus `full`.
(`-nest-N` = the radius an outer container needs so an inner element with the base radius and N px of padding stays concentric.)

| Token | **`playful`** (global) | `conservative` | **`rounded`** (the `<header>`) |
|---|---|---|---|
| `--radius-xs` | 0.25rem | 0.125rem | 1rem |
| `--radius-xs-nest-4` | 0.375rem | 0.25rem | 1.25rem |
| `--radius-xs-nest-8` | 0.5rem | 0.375rem | 1.5rem |
| `--radius-s` | 0.5rem | 0.25rem | 1.25rem |
| `--radius-s-nest-4` | 0.75rem | 0.375rem | 1.5rem |
| `--radius-s-nest-8` | 1rem | 0.5rem | 2rem |
| `--radius-m` | 0.75rem | 0.375rem | 1.25rem |
| **`--radius-m-nest-4`** | **1rem** | 0.5rem | **1.5rem** ← the nav pill |
| `--radius-m-nest-8` | 1.25rem | 0.625rem | 1.875rem |
| `--radius-l` | 1rem | 0.625rem | 1.75rem |
| `--radius-l-nest-4` | 1.25rem | 0.875rem | 2rem |
| `--radius-l-nest-8` | 1.75rem | 1.125rem | 2.5rem |
| `--radius-xl` | 1.25rem | 0.75rem | 2rem |
| `--radius-xl-nest-4` | 1.5rem | 1rem | 2.25rem |
| `--radius-xl-nest-8` | 1.875rem | 1.25rem | 2.75rem |
| `--radius-full` | 999rem | 999rem | 999rem |

## 4.8 Shadows, transitions, solid style

**Shadows** — five tokens on `:root`, theme-independent, all pure-black rgba. **They do not invert in light mode.**
```css
--shadow-xs: 0 0 1px rgba(0,0,0,.12), 0 1px 2px  rgba(0,0,0,.08), 0 2px  4px  rgba(0,0,0,.08);
--shadow-s:  0 0 2px rgba(0,0,0,.12), 0 1px 4px  rgba(0,0,0,.08), 0 4px  8px  rgba(0,0,0,.08);
--shadow-m:  0 0 2px rgba(0,0,0,.12), 0 2px 4px  rgba(0,0,0,.08), 0 8px  8px  rgba(0,0,0,.08);
--shadow-l:  0 2px 4px rgba(0,0,0,.12), 0 8px 12px rgba(0,0,0,.08), 0 8px  16px rgba(0,0,0,.08);
--shadow-xl: 0 4px 4px rgba(0,0,0,.12), 0 8px 12px rgba(0,0,0,.08), 0 24px 24px rgba(0,0,0,.08);
```
The header pill uses `--shadow-l`.

**Transitions** — two independent groups; `data-transition="all"` activates both.

| Token | Property | Duration | Easing |
|---|---|---|---|
| `--transition-micro-short` | all | 0.1s | ease-in-out |
| **`--transition-micro-medium`** | all | **0.2s** | ease-in-out |
| `--transition-micro-long` | all | 0.4s | ease-in-out |
| `--transition-macro-short` | all | 0.15s | ease-in-out |
| **`--transition-macro-medium`** | all | **0.3s** | ease-in-out |
| `--transition-macro-long` | all | 0.6s | ease-in-out |

**There is exactly one easing curve in the entire system: `ease-in-out`. No cubic-bezier tokens exist.** The only custom timing function that actually runs anywhere on the site is the spinner's `cubic-bezier(.5,.2,.7,.5)`.

**Solid style:**
```css
:root { --solid-inset-distance: 0; --solid-inset-size: 0; --solid-border-width: 0; }
[data-solid-style=plastic] { --solid-inset-distance: -1rem; --solid-inset-size: 1rem;
                             --solid-border-width: 1px; }
```
The reference is `flat`, so all three geometry tokens are `0` — buttons have no plastic inset ring and no 1px border.

## 4.9 Global base rules — copy these verbatim

```css
* { box-sizing: border-box; scroll-behavior: smooth; }
h1,h2,h3,h4,h5,h6,p { margin: 0; }
h1,h2,h3,h4,h5,h6 { scroll-margin-top: var(--static-space-80); }   /* 5rem — stacks with the TOC's JS offset */
img { user-select: none; }
::selection { background: var(--neutral-on-background-medium); color: var(--neutral-background-strong); }

a:not(.button) {
  color: var(--brand-on-background-medium);
  text-decoration: none;
  transition: var(--transition-micro-medium);
  text-decoration-thickness: 1px;
  text-underline-offset: .25em;
  text-decoration-color: var(--neutral-border-strong) !important;
}
a:not(.button):hover { text-decoration: none; color: var(--brand-on-background-strong); }

::-webkit-scrollbar { width: var(--static-space-8); height: var(--static-space-8); }
::-webkit-scrollbar, ::-webkit-scrollbar-track { background: var(--static-transparent); }
::-webkit-scrollbar-thumb { background: var(--neutral-alpha-medium);
                            transition: var(--transition-micro-medium); }
::-webkit-scrollbar-thumb:hover { background: var(--neutral-alpha-strong); }

.focus-ring:focus-visible { outline: var(--static-space-2) solid var(--brand-solid-strong);
                            outline-offset: 2px; }
```
Note the focus ring uses `--brand-solid-strong`, which under `solid=contrast` is **grey**, not cyan.

There are actually **15** `::selection` rules; 14 are context-scoped (2 per family) and flip the selection colours inside a coloured region. The unscoped one is emitted last so it wins wherever no ancestor carries a colour utility.

⚠️ **No `color-scheme` property is declared anywhere**, so native scrollbars and form controls stay light in dark mode. **Add `color-scheme: dark` / `light` in your build.**

## 4.10 The reference site's `custom.css` — and why most of it is dead

This is the only hand-written global stylesheet in the app besides CSS modules. Reproduce it *knowingly* or not at all.

```css
/* RULE 1 — FIRES, very broadly */
.font-heading, [class*=display], [class*=heading], h1,h2,h3,h4,h5,h6 {
  font-family: var(--font-heading) !important;
  font-feature-settings: "kern" 1, "liga" 1, "liga", "clig";
  font-variant-ligatures: common-ligatures;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
  font-weight: 400;                       /* NOT !important — wins on source order only */
  letter-spacing: .06em !important;
}

/* RULES 2–9 — ALL DEAD: no element anywhere carries data-once-ui */
[data-once-ui] [class*=display], [data-once-ui] [class*=heading] { … }
[data-once-ui] [class*=display] { line-height: 1.1 !important; }
[data-once-ui] [class*=heading-default-xl] { line-height: 1.4 !important; }
@media (max-width: 768px) { …three more dead rules… }
[data-once-ui] [class*=display-strong-xl] { letter-spacing: .08em !important; }
[data-once-ui] [data-gap="2"] [class*=heading-strong-s] { …underline… }

/* RULE 10 — the bare-element half FIRES */
[data-once-ui] [class*=body], [data-once-ui] [class*=label],
body, div:not([class*=heading]):not([class*=display]), p, span {
  font-family: var(--font-body) !important;
}

/* RULE 11 — LIVE, used only on project detail pages */
.blue-underline { text-decoration: underline; text-decoration-color: var(--brand-500, #5071cc);
                  text-underline-offset: .2em; text-decoration-thickness: 2px;
                  transition: text-decoration-color .2s ease; }
.blue-underline:hover { text-decoration-color: var(--brand-600, #6f94f1); }
```

**Four verified defects:**

1. **`[data-once-ui]` never matches.** Zero occurrences in all four captured HTML documents, all four RSC payloads, and both JS chunks — including the Once UI core chunk that defines every provider. The sheet was written against an older Once UI that stamped the attribute on the root. **Seven of the eleven rules are inert.**
2. **`--brand-500` / `--brand-600` do not exist** in any bundle. The underline rules always fall back to the hardcoded literals **`#5071cc` / `#6f94f1`** — lifted from the *commented-out* example palette in upstream's `custom.css`, where they are named `--scheme-brand-500/600` (different prefix, so even uncommenting wouldn't help). **That is why a class called `blue-underline` paints blue on a cyan-branded site**, and it is genuinely visible on the project detail pages (61 occurrences across five pages).
3. **`[class*=display]` collides with the layout utilities.** Once UI's flex classes are literally `display-flex`, `display-inline-flex`, `display-grid` — 41 + 8 occurrences on the home page. **`<html>` itself is `class="display-flex …"` and so is `<body>`**, so the root element takes `letter-spacing: .06em !important`, and because letter-spacing inherits, **the +0.06em tracking leaks into every piece of text on the page including body copy.** If you replicate this faithfully, that global tracking bleed is part of the look. It is also almost certainly unintentional.
4. **The class names it targets are Once UI v1.** `heading-default-xl`, `heading-strong-s`, `display-strong-xl` are v1 names; v2 emits composable `font-heading font-strong font-xl` triples. Those substring selectors match nothing even ignoring the `[data-once-ui]` prefix.

**Recommendation:** write your own minimal `custom.css` — the ligature/smoothing block from rule 1 scoped properly, plus `color-scheme`, plus a `prefers-reduced-motion` block (§7.11). Drop everything else.

## 4.11 Background-effect tokens

The `Background` component emits **inline custom properties** consumed by three CSS classes:

```css
.Background_dots { background-image: radial-gradient(var(--dots-color) 1px, var(--static-transparent) 1px);
                   background-size: var(--dots-size) var(--dots-size); }
.Background_gradient { background: radial-gradient(ellipse var(--gradient-width) var(--gradient-height)
                         at var(--gradient-position-x) var(--gradient-position-y),
                         var(--gradient-color-start), var(--gradient-color-end));
                       width:400%; height:400%; left:-150%; top:-150%;
                       transform: rotate(var(--gradient-tilt)); transform-origin: center; }
.Mask_mask { mask-size: 100% 100%;
             mask-image: radial-gradient(var(--mask-radius) at var(--mask-position-x) var(--mask-position-y),
                                          black 0, transparent 100%); }
.Fade_mask { backdrop-filter: blur(.5rem);
             background: linear-gradient(var(--gradient-direction), var(--base-color), transparent);
             mask-image: linear-gradient(var(--gradient-direction), black 20%, transparent 100%);
             mask-size: 100% 100%; }
```

Note the module is `Mask`, not `Background_mask`, and **there is no `Background_grid` class at all** — the grid layer is built from inline `backgroundImage`/`backgroundSize`.

Two remaps inside the component you need if you re-implement it:
- gradient `x`/`y` (0–100) are remapped into **37.5%–62.5%**
- gradient `width`/`height` are **divided by 4** (so `50` → `12.5%`)

## 4.12 Utility layer inventory

For reference if you port to another system. Numeric scale = the 18 static rungs; t-shirt scale = `xs s m l xl`.

| Family | Numeric | Responsive |
|---|---|---|
| margin | `.m-N .mt-N .mr-N .mb-N .ml-N .mx-N .my-N` | `.m-xs … .my-xl` |
| padding | `.p-N .pt-N .pr-N .pb-N .pl-N .px-N .py-N` | `.p-xs … .py-xl` |
| gap | `.g-N` | `.g-xs … .g-xl` |

⚠️ Every numeric family has all 18 rungs **except `.mx-*`, which is missing `48` and `56`.**

Also: `.g-horizontal--1` / `.g-vertical--1` (negative-1px gaps for hairline-joined groups), `.display-flex .display-inline-flex .display-grid`, `.flex-row .flex-column` (+ `-reverse`), `.flex-wrap`, `.flex-N`, `.columns-1…12`, `.justify-*` and `.align-*` (`start center end between around even stretch`), `.position-*`, `.top-N .right-N .bottom-N .left-N`, `.center`, `.fill .fill-width .fill-height .fit .fit-width .fit-height .min-width-0 .min-height-0`, `.overflow-{auto,hidden,scroll}` (+ `-x-`/`-y-`), `.z-index--1` and `.z-index-0…10`, `.opacity-N` (tens), `.cursor-*`, `.border-{1,2,4,6,8}` and per-edge forms, the full colour matrix (7 families × 7 tier groups × 3 strengths), `.page-background .surface-background .surface-border .overlay-background`, `.shadow-*`, `.transition-*`, `.focus-ring`, `.truncate`, `.text-decoration-none`, `.reset-button-styles`, `.pointer-events-*`.

**There are no `.max-width-*` / `.max-height-*` utilities** — those are always inline styles.

---

# 5. Component inventory

Every component you need to build, grouped by scope. "From library" means Once UI ships it (Route A) or you build/adopt it (Route B — see §10).

## 5.1 Layout & chrome (build these)

### `Providers` — `src/components/Providers.tsx` (`"use client"`)
No props. Nests `LayoutProvider > ThemeProvider > DataThemeProvider > ToastProvider > IconProvider > children`. Passes every `style` key to `ThemeProvider` **except `theme`**.

### `Header` — `src/components/Header.tsx` (`"use client"`)
```ts
// no props
```
Reads `usePathname()` for the selected state. Renders two `Fade` scrims + a three-cell sticky bar (location / nav pill / clock). Companion `Header.module.scss`:
```scss
@use "./breakpoints.scss" as breakpoints;
@media (max-width: breakpoints.$s) {
  .position { top: auto; bottom: var(--static-space-24); }
}
```

### `TimeDisplay` — same file, default export
```ts
type TimeDisplayProps = { timeZone: string; locale?: string /* default "en-GB" */ };
```
`setInterval(…, 1000)`, cleared on unmount/prop change.

### `ThemeToggle` — `src/components/ThemeToggle.tsx` (`"use client"`)
No props.
```tsx
const { theme, setTheme } = useTheme();
const [currentTheme, setCurrentTheme] = useState("light");
useEffect(() => setCurrentTheme(document.documentElement.getAttribute("data-theme") || "light"), []);
useEffect(() => setCurrentTheme(document.documentElement.getAttribute("data-theme") || "light"), [theme]);
const icon      = currentTheme === "dark"  ? "light" : "dark";
const nextTheme = currentTheme === "light" ? "dark"  : "light";
return <ToggleButton prefixIcon={icon} onClick={() => setTheme(nextTheme)}
                     aria-label={`Switch to ${nextTheme} mode`}/>;
```
It reads the **DOM attribute**, not the provider value, because the inline head script is the real source of truth. ⚠️ **[DEFECT A9]** the `useState("light")` seed means the SSR markup always says "Switch to dark mode" regardless of the resolved theme; it self-corrects after hydration. Seed from the attribute or render the label only after mount.

### `Footer` — `src/components/Footer.tsx` (server component)
No props. Companion module: `@media (max-width: 768px) { .mobile { text-align: center } }`.

### `RouteGuard` — `src/components/RouteGuard.tsx` (`"use client"`)
```ts
{ children: React.ReactNode }
```
State: `isRouteEnabled, isPasswordRequired, password, isAuthenticated, error, loading` (initially `true`).

```ts
const checkRouteEnabled = () => {
  if (!pathname) return false;
  if (pathname in routes) return routes[pathname];
  for (const route of ["/blog", "/work"]) {          // only these two are treated as dynamic parents
    if (pathname.startsWith(route) && routes[route]) return true;
  }
  return false;
};
```
Render branches in order: `loading` → `<Flex fillWidth paddingY="128" horizontal="center"><Spinner/></Flex>`; `!isRouteEnabled` → `<NotFound/>`; `isPasswordRequired && !isAuthenticated` → the password form; otherwise `children`.

**Security note:** this is a client-side guard only. Page content is still built on the server and shipped in the flight payload, so anyone can read a "protected" page. Real protection needs middleware. **Strong recommendation: drop this component entirely (§12).**

### `ScrollToHash` — `src/components/ScrollToHash.tsx` (`"use client"`)
No props, renders `null`. A `useEffect` keyed on `useRouter()` reads `window.location.hash` and `scrollIntoView({behavior:"smooth"})`. Mounted **only** on `/work/[slug]`.

## 5.2 Shared / content components (build these)

### `ProjectCard` — `src/components/ProjectCard.tsx` (`"use client"`)
```ts
interface ProjectCardProps {
  href: string;
  priority?: boolean;      // ⚠️ accepted but never destructured — dead in both upstream and the fork
  images: string[];
  title: string;
  content: string;         // ⚠️ full MDX body; only used as a truthiness check. Pass a boolean.
  description: string;
  avatars: { src: string }[];
  link: string;
}
```
Full implementation in §3.5.2, plus five defects to fix.

### `RelatedProjectCard` — `src/components/RelatedProjectCard.tsx` (`"use client"`)
```ts
interface RelatedProjectCardProps {
  href: string;
  images?: string[];       // only images[0] is used
  title: string;
  description?: string;
  priority?: boolean;      // drives both <Media priority> and the RevealFx delay
}
```
Implementation in §3.6.1. Note its prop set **omits** `content`, `avatars` and `link`.

### `Projects` — `src/components/work/Projects.tsx` (server component)
```ts
interface ProjectsProps {
  range?: [number, number?];   // 1-indexed, inclusive on both ends
  exclude?: string[];
}
```
Implementation in §3.5.1. Add a `card` or `variant` prop, or split out a `RelatedProjects.tsx`.

### `TableOfContents` — `src/components/about/TableOfContents.tsx` (`"use client"`)
```ts
interface TableOfContentsProps {
  structure: { title: string; display: boolean; items: string[] }[];
  about: { tableOfContent: { display: boolean; subItems: boolean } };
}
```
Implementation in §3.7.1 — **[UNVERIFIED]**, reconstructed from upstream. Companion `about.module.scss`:
```scss
@use "../breakpoints.scss" as breakpoints;
.hover  { transition: var(--transition-micro-medium);
          &:hover { transform: translateX(var(--static-space-4)); } }
.avatar { position: sticky; height: fit-content; top: var(--static-space-64); }
@media (max-width: 768px) {
  .avatar     { top: auto; }
  .textAlign  { text-align: center; }
  .blockAlign { align-self: center; }
}
```

### `Mailchimp` — `src/components/Mailchimp.tsx` (`"use client"`)
```ts
props: React.ComponentProps<typeof Column>   // spreads every Column prop, so <Mailchimp marginBottom="l"/> works
```
Early return: `if (newsletter.display === false) return null;`. Implementation in §3.4.4.

### `CustomMDX` — `src/components/mdx.tsx` (server)
```ts
type CustomMDXProps = MDXRemoteProps & { components?: typeof components };
```
See §6.5.

### `breakpoints.scss` — `src/components/breakpoints.scss`
```scss
$s: 768px;  $m: 1024px;  $l: 1440px;
@mixin s { @media (max-width: #{$s}) { @content; } }
@mixin m { @media (max-width: #{$m}) { @content; } }
@mixin l { @media (max-width: #{$l}) { @content; } }
```

## 5.3 Library primitives consumed (Route A: from `@once-ui-system/core`)

Grouped by what they do. Props listed are only those the reference actually uses.

**Layout:** `Flex`, `Row`, `Column`, `Grid`
`fillWidth fillHeight fill fitWidth fitHeight | gap padding{,X,Y,Top,Right,Bottom,Left} margin* | horizontal vertical align wrap | maxWidth minWidth height minHeight maxHeight | position top right bottom left zIndex | background onBackground border radius shadow overflow | flex | as | hide s m l | className style | cursor | textVariant | suppressHydrationWarning`

**Typography:** `Heading` (`as variant wrap align id marginBottom marginTop className`), `Text` (`as variant onBackground wrap align marginX id paddingX className style`), `InlineCode`, `CodeBlock`, `List`, `ListItem`, `Line` (`vert height maxHeight background maxWidth`)

**Controls:** `Button` (`id href variant size weight prefixIcon suffixIcon arrowIcon fillWidth type disabled target rel data-border onClick style`), `IconButton` (`href icon tooltip size variant data-border`), `ToggleButton` (`prefixIcon href label selected onClick aria-label`), `Input` (`id name type placeholder required disabled value errorMessage formNoValidate onChange onBlur`), `PasswordInput`, `Switch`, `Chip`

**Media & display:** `Avatar` (`src size style marginRight`), `AvatarGroup` (`avatars size reverse`), `Media` (`src alt priority aspectRatio radius sizes border enlarge fillWidth style className`), `Carousel` (`items sizes indicator controls aspectRatio play thumbnail`), `Badge` (`background onBackground paddingX paddingY textVariant arrow href effect`), `Tag` (`size variant prefixIcon suffixIcon`), `Card`, `Spinner`, `Skeleton`

**Effects:** `Background` (`mask gradient dots grid lines top position`), `Mask` (`cursor x y radius`), `Fade` (`to base height bottom position fillWidth zIndex hide s`), `RevealFx` (`translateY delay speed trigger fill position revealedByDefault`), `SmartLink` (`href unstyled suffixIcon style onClick`)

**Meta:** `Schema` (`as baseURL title description path image author datePublished dateModified`), `Meta.generate({title, description, baseURL, path, image})`

**Providers/hooks:** `LayoutProvider`, `ThemeProvider`, `DataThemeProvider`, `ToastProvider`, `IconProvider`, `useTheme()`, `useToast()`, `useLayout()`

**Shipped but never used on the reference** (dead weight in the ~1MB bundle): `Kbar, MegaMenu, ContextMenu, DatePicker, DateRangePicker, OTPInput, Dialog, Toaster, StylePanel, StyleOverlay, UserMenu, CompareImage, LogoCloud, MasonryGrid, GlitchFx, HoloFx, TiltFx, Particle, AutoScroll, Accordion, AccordionGroup, Table, Feedback, MediaUpload, Pulse, ScrollToTop, HeadingNav`, plus ~115 `recharts` references for charts nothing renders.

## 5.4 Icon registry — `src/resources/icons.ts`

```ts
export const iconLibrary: Record<string, IconType> = { /* string key → react-icons component */ };
export type IconLibrary = typeof iconLibrary;
export type IconName = keyof IconLibrary;
```

**How it resolves:** `IconProvider` does `{...onceUiDefaults, ...yourLibrary}` — a merge, not a replace.

**Once UI's 43 built-ins** (free, no registration needed):
`chevronUp, chevronDown, chevronRight, chevronLeft, refresh, light, dark, help, info, warning, danger, checkbox, check, copy, eyeDropper, clipboard, person, close, link, arrowUpRight, minus, plus, calendar, eye, eyeOff, search, security, sparkle, computer, minimize, maximize, smiley, paw, food, ball, world, gift, symbol, flag, wordmark, enter, play, pause`

**Upstream's 32** (`react-icons/hi2` + `/pi` + `/si` + `/fa6`):
`arrowUpRight, arrowRight, email, globe, openLink, calendar, eye, eyeOff, arrowUpRightFromSquare, document, rocket, home, person, grid, book, gallery, javascript, nextjs, supabase, figma, discord, github, linkedin, x, twitter, threads, instagram, facebook, pinterest, whatsapp, reddit, telegram`

**The 15 the reference site references but never registered — all render `null`:**
`star, react, typescript, nodejs, nestjs, aws, kubernetes, postgresql, graphql, terraform, mongodb, redis, ai, blockchain, solidity`

⚠️ `Icon` warns to console (`Icon "x" does not exist in the library.`) and returns `null`. Silent, not a crash. **Register every icon you name in your content, and add a build-time assertion.** Tech logos live in `react-icons/si`.

Icon size scale: `xs 16px · s 20px · m 24px · l 32px · xl 40px` (as `font-size: var(--static-space-N)`). Default `size="m"`, `decorative: true` → `aria-hidden="true"`.

Icon provenance on the reference: nav icons (`home`, `person`, `grid`, `book`, `gallery`) are **Phosphor duotone** (`viewBox 0 0 256 256`); `email`, `arrowRight`, `arrowUpRight`, `arrowUpRightFromSquare`, `calendar`, `globe`, `rocket`, `document` are **Heroicons** (`viewBox 0 0 24 24`); socials are **Font Awesome 6**.

## 5.5 Components to delete rather than build

`HeadingLink` (local one is dead — `mdx.tsx` imports Once UI's), `Posts`, `Post`, `ShareSection`, `GalleryView`, and the password-gate branch of `RouteGuard`.

---

# 6. Content model

Everything you write lives in **two places**: `src/resources/content.tsx` (structured data + copy) and `src/app/work/projects/*.mdx` (case studies). Nothing else contains copy.

## 6.1 The TypeScript shape

`src/types/content.types.ts` — upstream's 246 lines, **plus the two extensions the reference added**:

```ts
import { IconName } from "@/resources/icons";
import { zones } from "tzdata";

export type IANATimeZone = Extract<keyof typeof zones, string>;

export type Person = {
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  avatar: string;              // e.g. "/images/avatar.webp"
  email: string;
  location: IANATimeZone;      // ⚠️ DOUBLE DUTY: printed as literal text AND used as the clock timezone
  languages?: string[];
  locale?: string;             // BCP 47; drives <html lang>. Defaults to "en" if omitted.
};

export type Newsletter = {
  display: boolean;
  title: React.ReactNode;
  description: React.ReactNode;
};

export type Social = Array<{
  name: string;
  icon: IconName;              // must exist in iconLibrary — the type enforces it
  link: string;
  essential?: boolean;         // true → also rendered on /about. Footer renders ALL entries.
}>;

export interface BasePageConfig {
  path: `/${string}` | string;
  label: string;               // nav label
  title: string;               // <title> + og:title
  description: string;         // meta description + og:description
  image?: `/images/${string}` | string;
}

export interface Home extends BasePageConfig {
  image: `/images/${string}` | string;      // required here — the only route with a static OG image
  headline: React.ReactNode;
  featured: { display: boolean; title: React.ReactNode; href: string };
  subline: React.ReactNode;
}

export interface About extends BasePageConfig {
  tableOfContent: { display: boolean; subItems: boolean };
  avatar: { display: boolean };
  calendar: { display: boolean; link: string };

  intro: {
    display: boolean;
    title: string;             // ⚠️ ALSO the DOM anchor id
    description: React.ReactNode;
    tags: Array<{ name: string; icon: string }>;      // ← FORK ADDITION
  };

  achievements: {                                      // ← FORK ADDITION (whole section)
    display: boolean;
    title: string;
    items: Array<{ icon: string; title: string; description: string }>;
  };

  work: {
    display: boolean;
    title: string;
    experiences: Array<{
      company: string;         // ⚠️ ALSO the DOM anchor id
      timeframe: string;       // free text, e.g. "October 2025 - Present"
      role: string;
      achievements: React.ReactNode[];                 // JSX allowed — <b>, <a>, etc.
      images?: Array<{ src: string; alt: string; width: number; height: number }>;
    }>;
  };

  studies: {
    display: boolean;
    title: string;
    institutions: Array<{ name: string; description: React.ReactNode }>;
  };

  technical: {
    display: boolean;
    title: string;
    skills: Array<{
      title: string;           // ⚠️ ALSO the DOM anchor id
      description?: React.ReactNode;
      tags?: Array<{ name: string; icon?: string }>;
      images?: Array<{ src: string; alt: string; width: number; height: number }>;
    }>;
  };
}

export interface Work extends BasePageConfig {}
```

Two things to know about the `images` shape in `work.experiences` and `technical.skills`: `width`/`height` are **ratio numbers, not pixels** (upstream defaults use 16/9) and are fed to `minWidth={image.width} height={image.height}` on the wrapping `Row`, i.e. they end up as rem-ish Once UI sizing values. The reference site leaves every one of these arrays empty, so the code path is untested there.

## 6.2 Config — `src/resources/once-ui.config.ts`

```ts
const baseURL = "https://<your-domain>";

const routes = { "/": true, "/about": true, "/work": true };   // drop the two you deleted

const display = { location: true, time: true, themeSwitcher: true };

const fonts = { heading, body, label, code };   // four next/font instances

const style = {
  theme: "system",        // ⚠️ read by NOTHING — see §3.1
  neutral: "gray",        // sand | gray | slate | custom
  brand: "cyan",          // 13 hues + custom
  accent: "red",
  solid: "contrast",      // color | contrast | inverse
  solidStyle: "flat",     // flat | plastic
  border: "playful",      // rounded | playful | conservative  (NOT "sharp")
  surface: "translucent", // filled | translucent
  transition: "all",      // all | micro | macro
  scaling: "100",         // 90 | 95 | 100 | 105 | 110
};

const dataStyle = { variant: "gradient", mode: "categorical", height: 24,
                    axis: { stroke: "var(--neutral-alpha-weak)" },
                    tick: { fill: "var(--neutral-on-background-weak)", fontSize: 11, line: false } };

const effects = {
  mask:     { cursor: false, x: 50, y: 0, radius: 100 },
  gradient: { display: false, opacity: 100, x: 50, y: 60, width: 100, height: 50, tilt: 0,
              colorStart: "accent-background-strong", colorEnd: "page-background" },
  dots:     { display: true, opacity: 40, size: "2", color: "brand-background-strong" },
  grid:     { display: false, opacity: 100, color: "neutral-alpha-medium",
              width: "0.25rem", height: "0.25rem" },
  lines:    { display: false, opacity: 100, color: "neutral-alpha-weak",
              size: "16", thickness: 1, angle: 45 },
};

// Delete if you drop the newsletter; otherwise replace `action` with a real endpoint.
const mailchimp = { action: "<real endpoint>", effects: { /* the richer stack, §3.4.4 */ } };
```

**Delete these three from upstream — all are exported, typed, and read by nothing:** `schema`, `sameAs`, `socialSharing` (the last dies with the blog). Also delete `protectedRoutes` if you drop `RouteGuard`.

## 6.3 Content you must supply — checklist

This is the only section with intentional TODOs. Fill each line.

### 6.3.1 Identity — `person`
- [ ] `firstName`, `lastName`, `name`
- [ ] `role` — one line. It appears in `<title>`, under the h1 on `/about`, and in the JSON-LD `jobTitle`.
- [ ] `avatar` — path under `/public/images/`. **Ship WebP.** Used at 32px (hero button), 24px (card overlay) and 160px (about rail), so **source it at ≥320px square**.
- [ ] `email`
- [ ] `location` — a valid IANA timezone id (`Europe/Bucharest`, `Europe/London`, …). ⚠️ **This string is printed verbatim in the header.** If "Europe/Bucharest" in the header bothers you, split the field: keep the tz id for the clock and add a separate `locationLabel` for display.
- [ ] `languages` — array of strings, rendered as `Tag`s
- [ ] `locale` — optional; drives `<html lang>`

### 6.3.2 Social — `social`
- [ ] LinkedIn `{ name, icon: "linkedin", link, essential: true }`
- [ ] GitHub `{ name, icon: "github", link, essential: true }`
- [ ] Email `{ name: "Email", icon: "email", link: \`mailto:${person.email}\`, essential: true }`
- [ ] any others (X, Bluesky, …) — **register the icon first**, and set `essential: false` if you only want them in the footer

### 6.3.3 Home — `home`
- [ ] `title` — the `<title>` and `og:title`. Reference pattern: `"<Name> | <Role>"`.
- [ ] `description` — 150–160 chars, the meta description
- [ ] `image` — a **static** OG card at `/images/og/home.png`. ⚠️ Make it **1200×630 and under ~300 KB**. The reference uses a 1920×1440 / 1.7 MB PNG, which is the wrong aspect ratio for crawlers and over WhatsApp's preview limit.
- [ ] `headline` — JSX. 2 lines with a `<br/>` between reads well at `display-strong-xl`.
- [ ] `subline` — JSX. The reference is ~430 chars across 8 hard-broken lines with one blank line. Anything from 2 to 8 lines works; the `Text` is `heading-default-xl` at 1.5rem, so keep lines short.
- [ ] `featured.title` — JSX: `<strong>{project name}</strong>` + vertical `Line` + `<Text>{label}</Text>`
- [ ] `featured.href` — the reference links the badge to `/work`, **not** to the featured project. Linking to `/work/<slug>` is more useful.
- [ ] `label` — `"Home"`. Never rendered (the nav item is icon-only) but keep it for consistency.

### 6.3.4 About — `about`
- [ ] `title` (`"About – <Name>"`), `description`, `label` (the nav text)
- [ ] `calendar.link` — a Cal.com / Calendly URL, or set `calendar.display: false`
- [ ] `intro.description` — JSX, N `<Text>` paragraphs separated by `<br/>`. The reference has 5 paragraphs, 60–350 chars each.
- [ ] `intro.tags` — the tech cloud. Reference has 17. **Every `icon` must be registered.**
- [ ] `achievements.items` — reference has 7, each `{icon, title (2–4 words), description (~180–250 chars, no trailing period)}`
- [ ] `work.experiences` — reference has 10 with 4–7 bullets each (51 total). Each: `company`, `timeframe`, `role`, `achievements[]`.
- [ ] `studies.institutions` — reference has 1: `{name, description}`. No timeframe field exists in the schema; put it in `description` or extend the type.
- [ ] `technical.skills` — reference has 5 groups, 3–5 tags each (17 total): `{title, description, tags[]}`

### 6.3.5 Work — `work`
- [ ] `title` (also the `/work` `<h1>`), `description`, `label` (nav text)

### 6.3.6 Newsletter — `newsletter`
- [ ] Decide: keep (and wire a real provider), or `display: false`, or delete the component. See §11 Q5.
- [ ] `title`, `description` if keeping

### 6.3.7 Projects — one `.mdx` per case study
- [ ] Decide how many. **Three good ones beat eight thin ones.**
- [ ] Per project: slug (= filename), `title`, `publishedAt`, `summary`, `images[]`, `team[]`, tech-tag list, external URL, body
- [ ] Screenshots at `/public/images/projects/<slug>/N.png`. ⚠️ **Compress them.** The reference ships 1920×1440 PNGs at 0.9–4.5 MB each; the largest single file is 4.55 MB. Export WebP at ~1600px wide.
- [ ] An OG image strategy — see §8.4

### 6.3.8 Assets
- [ ] `/public/favicon.ico`
- [ ] `/public/images/avatar.webp`
- [ ] `/public/images/og/home.png` (1200×630)
- [ ] `/public/manifest.json`
- [ ] Font files (WOFF2) if using `next/font/local`

## 6.4 MDX pipeline

**Two independent MDX mechanisms exist in the template; only one is used.**

1. `@next/mdx` + `@mdx-js/loader` are wired in `next.config.mjs` with `pageExtensions: ["ts","tsx","md","mdx"]`. That would let you author routes as `page.mdx`. **No such file exists.** The project `.mdx` files are named after their slugs, so App Router doesn't treat them as routes and the loader never touches them. You can drop this wiring.
2. **`next-mdx-remote/rsc`** is the real pipeline: files are read off disk as raw strings and compiled at render time on the server. `transpilePackages: ["next-mdx-remote"]` exists for this.

### Reading files — `src/utils/utils.ts`

```ts
type Team = { name: string; role: string; avatar: string; linkedIn: string };

type Metadata = {
  title: string;
  subtitle?: string;
  publishedAt: string;      // required, no default — the sort key
  summary: string;
  image?: string;
  images: string[];
  tag?: string;
  team: Team[];
  link?: string;
};

function getMDXFiles(dir: string) {
  if (!fs.existsSync(dir)) notFound();                    // ⚠️ throws outside a request scope
  return fs.readdirSync(dir).filter(f => path.extname(f) === ".mdx");
}

function readMDXFile(filePath: string) {
  const { data, content } = matter(fs.readFileSync(filePath, "utf-8"));
  return { metadata: { title: data.title || "", subtitle: data.subtitle || "",
                       publishedAt: data.publishedAt, summary: data.summary || "",
                       image: data.image || "", images: data.images || [],
                       tag: data.tag || [], team: data.team || [], link: data.link || "" },
           content };
}

export function getPosts(customPath = ["", "", "", ""]) {
  return getMDXData(path.join(process.cwd(), ...customPath));
}
```

Key facts:
- **The slug is the filename** minus `.mdx`. There is no `slug` frontmatter field.
- Paths resolve against `process.cwd()`, so **the `.mdx` sources must exist in the deployed filesystem at runtime** for any non-prerendered path. They are read with `fs`, not bundled.
- `notFound()` on a missing *directory* is brittle — it is exactly what breaks `sitemap.ts`. **Fix it: return `[]` instead.**
- ⚠️ `tag: data.tag || []` produces `[]` (truthy) for untagged posts, so `{post.metadata.tag && …}` renders an empty element. **Fix it.**

### Frontmatter — the shape to write

```yaml
---
title: "Project Name"
publishedAt: "2025-09-10"          # required — sort key, formatDate, datePublished, sitemap lastModified
summary: "One or two sentences. Doubles as the card description AND the meta description."
images:
  - "/images/projects/<slug>/1.png"   # images[0] is BOTH the detail-page hero and carousel slide 1
  - "/images/projects/<slug>/2.png"
team:
  - name: "Your Name"
    role: "Lead Engineer"             # ⚠️ never rendered anywhere on the reference
    avatar: "/images/avatar.webp"
    linkedIn: "https://www.linkedin.com/in/you"
link: "https://project-url.com"       # the ProjectCard "View project" link
---
```

> **[UNVERIFIED]** The reference site's tech-tag array and its external "View Project" URL use frontmatter keys that could **not** be recovered — `/work/[slug]` is a server component, so only its output survives. What is known: the tag list and the URL exist per project, and the URL is **not** `metadata.link` (because every card receives `link: ""`). Any of `technologies` / `techStack` / `tags` and `url` / `projectUrl` / `website` fit the evidence. **Just pick your own names and extend the `Metadata` type** — there is nothing to copy here.
>
> Related: on the reference every `ProjectCard` gets `link=""` while the detail page renders a real external URL through the same `metadata` object. The only consistent explanation is that `Projects.tsx` hardcodes `link=""`. Don't replicate that; wire it through.

## 6.5 `mdx.tsx` — the element mapping

Imports from the library: `Heading, HeadingLink, Text, InlineCode, CodeBlock, Accordion, AccordionGroup, Table, Feedback, Button, Card, Grid, Row, Column, Icon, Media, SmartLink, List, ListItem, Line`.

```ts
const components = {
  p:  createParagraph,
  h1: createHeading("h1"), h2: createHeading("h2"), h3: createHeading("h3"),
  h4: createHeading("h4"), h5: createHeading("h5"), h6: createHeading("h6"),
  img: createImage,
  a: CustomLink,
  code: createInlineCode,
  pre: createCodeBlock,
  ol: createList("ol"), ul: createList("ul"), li: createListItem,
  hr: createHR,
  // exposed for direct use inside .mdx:
  Heading, Text, CodeBlock, InlineCode, Accordion, AccordionGroup, Table, Feedback,
  Button, Card, Grid, Row, Column, Icon, Media, SmartLink,
};

export function CustomMDX(props) {
  return <MDXRemote options={{ blockJS: false }} {...props}
                    components={{ ...components, ...(props.components || {}) }}/>;
}
```

`List`, `ListItem` and `Line` are used internally but **not** exposed to MDX authors.

Helper behaviour:
- `CustomLink` — `/`-prefixed → `SmartLink`; `#`-prefixed → plain `<a>`; otherwise `<a target="_blank" rel="noopener noreferrer">`
- `createImage` → `<Media marginTop enlarge radius="m" border="neutral-alpha-medium" sizes="(max-width: 960px) 100vw, 960px"/>`; logs and returns `null` if `!src`
- `slugify(str)` — replaces `&` with `" and "`, runs `transliteration`'s slugify (`lowercase`, `-` separator), collapses `--+`. **This is the anchor-id algorithm for every MDX heading.**
- `createHeading(as)` → `<HeadingLink marginTop="24" marginBottom="12" as={as} id={slugify(children)}/>` (Once UI's `HeadingLink`, not the local one)
- `createHR` → `<Row fillWidth horizontal="center"><Line maxWidth="40"/></Row>`

**Reference-site deltas from upstream in this file** (adopt or not, deliberately):

| Helper | upstream | reference |
|---|---|---|
| `createParagraph` | `variant="body-default-m" marginTop="8" marginBottom="12"` | `variant="body-default-l" marginTop="12" marginBottom="16"` |
| `createImage` | `marginTop="8" marginBottom="16"` | `marginTop="16" marginBottom="24"` **+ `fillWidth`** |
| `createListItem` | `marginTop="4" marginBottom="8" style={{lineHeight:"175%"}}` | unchanged |
| `createHeading` | `marginTop="24" marginBottom="12"` | unchanged |

Paragraphs render as `font-body font-default font-l neutral-on-background-medium mt-12 mb-16` with inline `line-height: 175%`.

### Custom MDX components the reference adds

Two, and only two, across all five case studies (`<Highlight>` ×91, `<BlueUnderline>` ×61):

```tsx
// Highlight — inline emphasis on metrics, product names, tech names
const Highlight = ({ children }) => (
  <Text variant="body-default-l" onBackground="brand-strong"
        style={{ fontWeight: "600", padding: "2px 6px", borderRadius: "4px",
                 backgroundColor: "var(--brand-alpha-weak)" }}>
    {children}
  </Text>
);

// BlueUnderline — always used inside **bold** in "Third Party Integrations" bullet lists
const BlueUnderline = ({ children }) => (
  <Text variant="body-default-l" className="blue-underline" style={{ fontWeight: "600" }}>
    {children}
  </Text>
);
```
`BlueUnderline` depends on the global `.blue-underline` class in `custom.css`. Without that stylesheet it renders as plain bold text. And as noted in §4.10, the colour it paints (`#5071cc`) exists in no token ramp. **If you build this, use a real brand token.**

## 6.6 Case-study body structure

All five reference case studies share one H2 skeleton — a good template:

```
## Overview                      — one paragraph, what it is and what you built
## Third Party Integrations      — H3 sub-sections, each a bulleted list of services
## Challenges and Learnings      — one H3 per challenge, prose
## Outcome                       — interleaved screenshots + H3 + prose, ending with a summary
```

Per-file H3 counts on the reference: 12–15. Body length 5.4–6.6 KB. Only one file uses a `---` rule.

---

# 7. Motion & effects spec

## 7.1 The token layer

Recap of §4.8: six transition tokens, two durations you will actually use (`micro-medium` 0.2s, `macro-medium` 0.3s), **one easing curve — `ease-in-out` — across the entire system.**

## 7.2 `RevealFx` — the only entrance animation

```js
const RevealFx = forwardRef(({ children, speed = "medium", delay = 0,
                               revealedByDefault = false, translateY, trigger, ... }, ref) => {
  const [isRevealed, setIsRevealed]   = useState(revealedByDefault);
  const [maskRemoved, setMaskRemoved] = useState(false);

  const duration = typeof speed === "number" ? speed
                 : speed === "fast" ? 1000 : speed === "slow" ? 3000 : 2000;

  useEffect(() => {
    const t = setTimeout(() => {
      setIsRevealed(true);
      setTimeout(() => setMaskRemoved(true), duration);
    }, delay * 1000);                        // ← delay is SECONDS, a setTimeout gate,
    return () => clearTimeout(t);            //    not a CSS transition-delay
  }, [delay]);

  useEffect(() => {                          // external re-trigger, used by Carousel
    if (trigger !== undefined) { setIsRevealed(trigger); setMaskRemoved(false); … }
  }, [trigger]);

  const style = {
    transitionDuration: `${duration / 1000}s`,
    transform: isRevealed ? "translateY(0)"
             : `translateY(${typeof translateY === "number" ? translateY + "rem"
                           : typeof translateY === "string" ? `var(--static-space-${translateY})`
                           : undefined})`,
  };
  // maskRemoved ? className=revealedNoMask : className=`revealFx ${isRevealed ? revealed : hidden}`
});
```

CSS:
```css
.revealFx { mask-size: 400% 100%;
            transition: all ease-in-out;        /* duration supplied inline */
            mask-image: linear-gradient(90deg, black 0, black 25%, transparent 50%); }
.revealFx.hidden   { mask-position: 100% 0; filter: blur(1rem); }
.revealFx.revealed { mask-position: 0 0;    filter: blur(0);    }
.hiddenNoMask   { transition: all ease-in-out; filter: blur(.5rem); opacity: 0; }
.revealedNoMask { transition: all ease-in-out; filter: blur(0);     opacity: 1; }
```

**Net effect:** a left-to-right mask wipe (mask-position 100% → 0 across a 400%-wide gradient) plus `blur(1rem) → blur(0)` plus an optional upward `translateY`, all over the same duration, `ease-in-out`.

Facts that matter:
- Defaults: `speed="medium"` = **2000ms**; `fast` = 1000; `slow` = 3000; a **number** = milliseconds.
- `translateY` as a **string** → `var(--static-space-N)`; as a **number** → `Nrem`.
- After the reveal completes the mask element is swapped for a plain opacity/blur node, dropping `mask-image` from the compositor.
- `RevealFx` always forces `fillWidth` on its wrapper.
- ⚠️ **[DEFECT]** With `translateY` unset it emits the literal `transform: translateY(undefined)` — invalid, silently dropped. Guard it.
- ⚠️ **[DEFECT]** `.hiddenNoMask` / `.revealedNoMask` declare `transition: all ease-in-out` **with no duration**, which parses as 0s. Those two variants are instant.

## 7.3 Reveal choreography on the home page

| Block | `translateY` | resolved offset | `delay` | duration |
|---|---|---|---|---|
| Badge | — | none | 0 | 2s |
| H1 | `"4"` | 0.25rem / 4px | 0 | 2s |
| Subline | `"8"` | 0.5rem / 8px | **0.2s** | 2s |
| CTA button | — | none | **0.4s** | 2s |
| Featured project block | `"16"` | 1rem / 16px | **0.6s** | 2s |
| Layout background | — | none | 0 | 2s |

Total: hero motion completes at **t ≈ 2.6s after hydration** — and because the tree is behind `RouteGuard`, that clock starts *after* the spinner clears, not at first paint.

**`/about`, `/work` and `/work/[slug]` have zero page-level `RevealFx`.** The only instance on those routes is the layout background wrapper.

**There is no `IntersectionObserver` anywhere in app code.** All reveals are time-based on mount. **Nothing on this site animates on scroll.**

> See the [CONFLICT] in §3.4 about whether the delay-0.6 reveal wraps one card or all five. Under the two-block reading it wraps one; under the single-block reading the whole card list is blurred for the first 600ms and takes 2.6s to resolve — a much larger visual event.

## 7.4 Card hover

All 0.3s `ease`, applied by React inline style:

| Property | Rest | Hover |
|---|---|---|
| `transform` | `translateY(0px)` | `translateY(-4px)` |
| `box-shadow` | `0 4px 20px rgba(0,0,0,.05)` | `0 20px 40px rgba(0,0,0,.1)` |
| `border-color` (from CSS) | `--neutral-alpha-weak` | `--neutral-alpha-medium` |

The `scale(1.02)` image zoom in the stylesheet **never fires** — see defect 5 in §3.5.2.

## 7.5 Badge shine

`Badge` defaults `effect = true`, so this is on unless you pass `effect={false}`:

```css
.animation { position: relative; overflow: hidden; }
.animation:before {
  content: ""; opacity: 0; border-radius: var(--radius-full);
  position: absolute; width: 100%; height: 100%;
  background: linear-gradient(120deg, transparent 20%, var(--brand-alpha-medium) 50%, transparent 80%);
  transform: skewX(-20deg);
  animation: shineDefault 9s ease-in-out infinite;
}
.animation:hover:before { animation: shineHover 3s ease-in-out infinite; }

@keyframes shineDefault { 0%{left:-100%} 1%{left:-100%;opacity:1} 15%{left:100%;opacity:1}
                          16%{opacity:0} to{left:-100%} }
@keyframes shineHover   { 0%{left:-100%} 1%{left:-100%;opacity:1} 45%{left:100%;opacity:1}
                          46%{opacity:0} to{left:-100%} }
```
Idle: a skewed brand-tinted sheen sweeps in the first 15% of a **9s** loop (~1.35s visible, then 7.65s dark). Hover: **3s** loop with a 45% sweep — roughly 3× faster repeat.

## 7.6 Carousel motion

- **Slide change:** 300ms fade-out → swap → 50ms gap → `RevealFx speed={300}` fade-in. Perceived total ≈ **650ms**. Re-entrant calls dropped. Next image preloaded imperatively.
- **Indicator:** inline `transition: background 0.3s ease` between `--neutral-alpha-medium` and `--neutral-on-background-strong`.
- **Arrows:** `transition="micro-medium"` (0.2s). At rest `opacity: 0` and `translateX(∓1rem)`; on `:hover`/`:focus-within` of the control layer → `opacity: 1`, `translateX(0)`. The edge scrims go `opacity: 0 → .5`. `animation-delay: .2s` on the button.
- **Swipe:** 50px horizontal threshold.
- **Autoplay:** off, and the play/pause control never renders.

## 7.7 Every other hover / focus transition

| Element | Transition | State change |
|---|---|---|
| `Button` (all variants) | `micro-medium` 0.2s | `:focus,:hover{z-index:1}`; secondary hover → `background: var(--neutral-alpha-weak)`; ghost hover → `color: var(--neutral-on-background-strong)` |
| `ToggleButton` (nav, theme) | 0.2s | hover/focus → `background` + `border-color` = `--neutral-alpha-weak`; `.selected` → `--neutral-alpha-medium` |
| `Arrow` (Button `arrowIcon`) | 0.2s | inactive `width: 0; visibility: hidden` → active `width: var(--static-space-16)`, heads `width: var(--static-space-8)` rotating ±45° |
| About TOC rows | 0.2s | `:hover { transform: translateX(var(--static-space-4)) }` = 4px right |
| `HeadingLink` (MDX headings) | none declared | hover → copy-anchor `IconButton` `opacity: 0 → 1` (rest `scale(.875)`), heading gains `text-decoration-line: underline` |
| `.blue-underline` | `text-decoration-color .2s ease` | `#5071cc → #6f94f1` |
| Tooltips (`Icon`, `IconButton`) | — | **400ms hover dwell** before showing; positioned `top`, offset `calc(100% + var(--static-space-2))`, `translateX(-50%)` |

## 7.8 The one cursor-tracking effect

`mailchimp.effects.mask.cursor === true` (the layout mask is `false`), so on the newsletter card the radial mask follows the pointer.

```js
// Mask, verbatim
useEffect(() => {                                    // raw pointer, relative to the box
  if (!cursor) return;
  const onMove = e => { const r = boxRef.current.getBoundingClientRect();
                        setMousePosition({ x: e.clientX - r.left, y: e.clientY - r.top }); };
  document.addEventListener("mousemove", onMove);    // ← on DOCUMENT, fires everywhere
  return () => document.removeEventListener("mousemove", onMove);
}, [cursor]);

useEffect(() => {                                    // rAF easing, 5% of remaining distance per frame
  if (!cursor) return;
  let raf; const tick = () => {
    setSmoothPosition(p => ({ x: Math.round(p.x + 0.05*(mousePosition.x - p.x)),
                              y: Math.round(p.y + 0.05*(mousePosition.y - p.y)) }));
    raf = requestAnimationFrame(tick); };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}, [mousePosition, cursor]);
```

`radius: 100` → `--mask-radius: 100vh`. Smoothing reaches ~63% of the way in 20 frames (~0.33s at 60fps).

⚠️ **Cost:** this is a `setState` inside a `requestAnimationFrame` loop running **continuously while the home page is open**, re-rendering the Mask subtree every frame. It is the only always-on JS animation on the site. **If you keep the newsletter block, set `mask.cursor: false`.**

## 7.9 Background effect layers

| Effect | `/` | `/about` | `/work` | `/work/[slug]` |
|---|---|---|---|---|
| Global dots (2px pitch, `brand-background-strong`, opacity .4, radial mask 100vh at 50%/0%) | ✅ | ✅ | ✅ | ✅ |
| Global gradient / grid / lines | ❌ | ❌ | ❌ | ❌ |
| Newsletter gradient (accent-red radial, opacity .9) + dots (.2) + **cursor mask** | ✅ | ❌ | ❌ | ❌ |
| Header `Fade` blur strip (80px, top desktop / bottom mobile) | ✅ | ✅ | ✅ | ✅ |
| `[data-surface=translucent]` → `--backdrop-filter: blur(1rem)` on `background="surface"` | ✅ | ✅ | ✅ | ✅ |

The global background is **cyan dots at 2px pitch, 40% opacity, radially masked from the top-centre over 100vh** — and nothing else. `--dots-color` is `--brand-background-strong`, which is theme-dependent (`#094074` dark / `#60E4FC` light), so the dot grid changes shade with the theme.

> **[CONFLICT — minor]** `01-home.md` says two `Fade` scrims exist in source (top/desktop and bottom/mobile) and the mobile one is absent from SSR because the server renders at breakpoint `l`. `07-platform.md` §11.1 C4 confirms only one `Fade` is in the delivered HTML on all nine captured pages and says it "could not explain the discrepancy from the available bytes". Same observation, different confidence. This is the same underlying uncertainty as §3.2 — verify in a browser.

## 7.10 Spinner

The only motion visible before hydration.
```css
.spinner { animation: spin 1.5s infinite; border-color: currentColor transparent transparent; }
@keyframes spin {
  0%  { transform: rotate(0deg);   animation-timing-function: cubic-bezier(.5,.2,.7,.5); opacity: 0 }
  80% { opacity: 1 }
  to  { transform: rotate(1turn);  animation-timing-function: cubic-bezier(.5,.2,.7,.5); opacity: 0 }
}
.Spinner_m { width: var(--static-space-24); height: var(--static-space-24); padding: 3px }
```
Size m = 24px. That `cubic-bezier(.5,.2,.7,.5)` is the **only non-`ease`/`ease-in-out` timing function that actually runs anywhere on the site.**

## 7.11 Scroll behaviour and `prefers-reduced-motion`

```css
* { scroll-behavior: smooth; }                          /* on *, not html — unusual but harmless */
h1,h2,h3,h4,h5,h6 { scroll-margin-top: var(--static-space-80); }
```
Plus `ScrollToHash` on project pages and the TOC's 80px-offset `window.scrollTo` on `/about`.

⚠️ **[DEFECT — the most actionable a11y gap]** `prefers-reduced-motion` appears **zero times** in all six stylesheets and nowhere in the app JS. The 2s blur-and-wipe hero reveal, the 9s badge sheen and the 1.5s spinner all run regardless of the user's OS setting.

**Add this. It is three lines:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important; scroll-behavior: auto !important;
  }
}
```
And gate `RevealFx` with `revealedByDefault={useReducedMotion()}` so the mask never engages.

## 7.12 Motion that ships but never runs

The Once UI CSS bundle carries **22 `@keyframes`**; only **three** are reachable (`Badge_shineDefault`, `Badge_shineHover`, `Spinner_spin`). The other 19 are dead weight, as are `HoloFx`, `TiltFx`, `GlitchFx`, `LetterFx`, `AutoScroll`, `Particle` and `MasonryGrid` in the JS bundle.

## 7.13 One more real motion system: the MDX lightbox

On `/work/[slug]` only. Every MDX image is rendered with `enlarge: true` (22 instances across the five reference case studies), always with the identical prop set:
`{marginTop:"16", marginBottom:"24", enlarge:true, radius:"m", border:"neutral-alpha-medium", sizes:"(max-width: 960px) 100vw, 960px", fillWidth:true}`.

Clicking one animates the image with an inline `transition: all 0.3s ease-in-out` and a computed `translate(...) scale(0.9 × min(vw/w, vh/h))`, sets `document.body.style.overflow = "hidden"`, and renders a full-viewport overlay:
```jsx
<Flex center position="fixed" background="overlay" top="0" left="0" zIndex={9}
      opacity={100} cursor="interactive" transition="macro-medium"
      style={{backdropFilter:"blur(0.5rem)", width:"100vw", height:"100vh"}}/>
```
Dismissed by click, **Escape**, or **any wheel event**.

---

# 8. SEO, metadata & PWA

## 8.1 Shared `<head>`, emitted from `layout.tsx`

Order matters — this is the exact sequence:

```html
<meta charSet="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<link rel="preload" as="font" crossorigin type="font/woff2" href="…"/>   ×3
<link rel="stylesheet" data-precedence="next" href="…"/>                  ×6
<!-- script preloads + async chunk tags -->
<meta name="next-size-adjust" content=""/>

<!-- the ten site-added tags — upstream has none of these -->
<link rel="manifest" href="/manifest.json"/>
<meta name="theme-color" content="#00D4AA"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-status-bar-style" content="default"/>
<meta name="apple-mobile-web-app-title" content="<Your Name>"/>
<link rel="apple-touch-icon" href="/images/og/home.png"/>
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"/>
<meta name="author" content="<Your Name>"/>
<meta name="language" content="English"/>
<meta name="revisit-after" content="7 days"/>

<script id="theme-init">…</script>
<!-- per-route metadata -->
<link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="16x16"/>
```

⚠️ `revisit-after` and `language` are legacy no-ops ignored by every major engine. Harmless; drop them.
⚠️ `#00D4AA` is a hand-picked teal that **exists in no CSS bundle and matches no token** — the cyan ramp's step 600 is `#049EE2`. Pick a theme-color that matches your actual brand token.

## 8.2 Per-route metadata

Every route exports:
```ts
export async function generateMetadata() {
  return Meta.generate({ title, description, baseURL, path, image });
}
```

`Meta.generate` emits exactly: `<title>`, `meta description`, `og:title`, `og:description`, `og:url`, `og:image`, `og:image:alt` (mirrors the title), `og:type` (`website`), `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`, `twitter:image`.

| Route | title pattern | image |
|---|---|---|
| `/` | `<Name> \| <Role>` | **static** `/images/og/home.png` |
| `/about` | `About – <Name>` | `/api/og/generate?title=<encoded>` |
| `/work` | `Past Projects – <Name>` | `/api/og/generate?title=<encoded>` |
| `/work/[slug]` | the project title (⚠️ **no site-name suffix** on the reference — inconsistent) | `/api/og/generate?title=<encoded>` |

**Absent from every page on the reference** — decide which of these you want:
`<link rel="canonical">` · `og:site_name` · `og:locale` · `og:image:width/height/type` · `twitter:site` / `twitter:creator` · `hreflang` · `<link rel="alternate" type="application/rss+xml">` · `preconnect`/`dns-prefetch` · any `X-Robots-Tag`.

⚠️ **[DEFECT]** `work/[slug]`'s `generateMetadata` builds its OG fallback **without** `encodeURIComponent` while the `<Schema>` in the same file *does* encode it. Fix.

## 8.3 JSON-LD

Two blocks on `/`, one on every other route.

**Home block 1 — a hand-written `Person`** (not part of the template; injected as a raw `<script type="application/ld+json">` and the **first** child of the page `Column`):

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "…", "jobTitle": "…", "description": "…",
  "url": "https://<domain>", "email": "…", "image": "https://<domain>/images/avatar.webp",
  "address": { "@type": "PostalAddress", "addressLocality": "…", "addressCountry": "…" },
  "knowsAbout": [ /* the reference has 27 topic strings */ ],
  "sameAs": [ "https://linkedin.com/in/…", "https://github.com/…" ],
  "worksFor": { "@type": "Organization", "name": "…" },
  "hasOccupation": { "@type": "Occupation", "name": "…", "description": "…" }
}
```
Note the reference uses a **third distinct bio string** here, different from both `home.description` and `about.description` — and reuses it as the manifest `description`.

**All other blocks** come from `<Schema>`:
```json
{ "@context":"https://schema.org", "@type":"WebPage" | "BlogPosting",
  "url":"…", "sameAs":[], "headline":"…", "description":"…", "image":"…",
  "datePublished":"…", "dateModified":"…",          /* BlogPosting only */
  "author": { "@type":"Person", "name":"…", "url":"<baseURL>/about",
              "image": { "@type":"ImageObject", "url":"<baseURL><avatar>" } } }
```

Producing call:
```tsx
<Schema as="webPage" baseURL={baseURL} title={x.title} description={x.description}
        path={x.path} image={`/api/og/generate?title=${encodeURIComponent(x.title)}`}
        author={{ name: person.name, url: `${baseURL}${about.path}`,
                  image: `${baseURL}${person.avatar}` }}/>
```

⚠️ **[DEFECT]** On the home page the reference passes an **already-absolute** URL as `image` to a component that prepends `baseURL`, producing `"image": "https://blancbo.com/https://blancbo.com/images/og/home.png"`. **Pass a path, not a URL.**

⚠️ `"sameAs": []` on every `Schema` block. The `sameAs` config looks up social entries by name and is never consumed anyway. Either populate it or delete the config.

⚠️ **All JSON-LD is client-rendered** (it lives inside the `RouteGuard`-gated subtree), so non-JS crawlers see none of it. If structured data matters to you, that alone justifies removing `RouteGuard` (§12).

⚠️ `/work/[slug]` declares `og:type: website` while its JSON-LD is `BlogPosting`. Make them agree.

## 8.4 OG image generation — `/api/og/generate`

```tsx
export const runtime = "nodejs";
// GET ?title=  (default "Portfolio")
// → new ImageResponse(<jsx/>, { width: 1280, height: 720, fonts: [{ name, data, style }] })
```

The JSX uses flat inline styles only (Satori supports a CSS subset):
- outer `div`: `display:flex; width:100%; height:100%; padding:6rem; background:#151515`
- inner `div`: `flex-direction:column; justify-content:center; gap:4rem; color:white`
- title `span`: `padding:1rem; font-size:6rem; line-height:8rem; letter-spacing:-.05em; text-wrap:balance; overflow:hidden`
- byline row (`gap:5rem`): a 12rem circular avatar `<img src={baseURL + person.avatar}>` + a column with the name at `4.5rem` and the role at `2.5rem / opacity .6`

⚠️ **[DEFECT — this route returns HTTP 500 on the reference site.** `HEAD` deceptively returns `200 image/png`; `GET` returns the Next `/500` page (verified 3/3 with a browser UA, `facebookexternalhit`, and plain curl). **Every `og:image` on `/about`, `/work` and all five project pages is therefore broken.** The likely cause is `loadGoogleFont()` fetching `fonts.googleapis.com` at request time:

```ts
async function loadGoogleFont(font: string) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${font}`)).text();
  const m = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
  if (m) { const r = await fetch(m[1]); if (r.status === 200) return await r.arrayBuffer(); }
  throw new Error("failed to load font data");
}
```

**Fix it by reading a font file from disk instead of fetching Google at request time**, and add `export const revalidate` / cache headers. Or skip the dynamic route entirely and ship one static OG card per route.

`#151515` here matches the manifest `background_color` — that correspondence is real and worth keeping.

## 8.5 `robots.txt`

The reference serves (customised from upstream, which emits only `User-Agent: *` + `Sitemap:`):
```
User-Agent: *
Allow: /
Crawl-delay: 1

Host: https://<domain>
Sitemap: https://<domain>/sitemap.xml
```
⚠️ `Host:` is not a field Next's `MetadataRoute.Robots` type supports, which hints this is a hand-written `public/robots.txt` rather than `app/robots.ts`. Either is fine — just **do not advertise a sitemap that 404s.**

## 8.6 `sitemap.xml`

```ts
export default async function sitemap() {
  const works = getPosts(["src","app","work","projects"]).map(p => ({
    url: `${baseURL}/work/${p.slug}`, lastModified: p.metadata.publishedAt }));
  const active = Object.keys(routes).filter(r => routes[r]);
  const staticRoutes = active.map(r => ({
    url: `${baseURL}${r !== "/" ? r : ""}`,
    lastModified: new Date().toISOString().split("T")[0] }));
  return [...staticRoutes, ...works];
}
```
⚠️ **[DEFECT]** On the reference this returns **HTTP 404 with a 0-byte body**, because upstream's version also enumerates `["src","app","blog","posts"]` and `getMDXFiles` calls `notFound()` on a missing directory. **Remove the blog enumeration and make `getPosts` return `[]` for a missing directory.**

## 8.7 `public/manifest.json`

Served as a static file (not `app/manifest.ts`).

```json
{
  "name": "<Name> | <Role>",
  "short_name": "<Name>",
  "description": "<the long bio string>",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#151515",
  "theme_color": "#00D4AA",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "en-US",
  "categories": ["developer", "portfolio", "technology", "software"],
  "keywords": [ /* the reference has 17 */ ],
  "icons": [
    { "src": "/favicon.ico",        "sizes": "any",     "type": "image/x-icon" },
    { "src": "/images/og/home.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

`#151515` is exactly `--scheme-gray-200` = `--neutral-background-medium` in dark, so it is token-consistent even though the actual page background is `#0A0A0A` (`gray-100`).

⚠️ **[DEFECT]** The reference declares the second icon as `512x512` but points it at a **1920×1440, 1.76 MB PNG**. Not square, not 512, and ~1.7 MB for a home-screen icon. The same file is the `apple-touch-icon`. **Ship real 192/512 square PNGs.**

## 8.8 SEO defect checklist — fix all of these in your build

| # | Defect | Fix |
|---|---|---|
| 1 | `/api/og/generate` 500s | read the font from disk; add caching |
| 2 | `/sitemap.xml` 404s while robots advertises it | drop the blog enumeration; `getPosts` returns `[]` |
| 3 | No `<link rel="canonical">` anywhere | add `alternates.canonical` per route |
| 4 | Home JSON-LD `image` double-prefixed with baseURL | pass a path, not a URL |
| 5 | All JSON-LD client-rendered | remove `RouteGuard` |
| 6 | `apple-touch-icon` + maskable icon = 1.7 MB non-square PNG | real 192/512 icons |
| 7 | `og:image` for `/` is 4:3 / 1.7 MB, no width/height declared | 1200×630, <300 KB, declare dimensions |
| 8 | `/work/[slug]` `og:type=website` vs `BlogPosting` JSON-LD; title drops the site suffix | make them agree |
| 9 | `revisit-after`, `language` are no-ops | drop |
| 10 | `routes` config lists deleted routes; `protectedRoutes` points at a nonexistent slug | clean up |
| 11 | `/api/rss` 404s, nothing links to a feed | delete the route or ship a feed + `<link rel="alternate">` |

---

# 9. Build phases

Twelve phases, 0–11. Each is independently shippable and ordered so the site is **viewable end-to-end from Phase 2**. Sizes are rough working estimates for one person who knows React, assuming **Route A** (§10); Route B estimates are in §10.2.

---

## Phase 0 — Scaffold, cleanup & tooling

**Goal:** the existing upstream checkout becomes *your* project — renamed, pinned, pruned, versioned, and building clean.

> **Read this first.** The directory already holds an unmodified Magic Portfolio v2.3.0 checkout with `node_modules` installed. That means **if you take Route A, most of this phase is deletion, not creation** — and it also means you are currently one `git init` away from having no undo. Do that first.
>
> If you take **Route B**, do not build on top of this tree. Move it aside (`mv src src.upstream-reference`, keep it as a read-only reference for the component behaviour documented in §3), and scaffold fresh with `create-next-app` + `tailwindcss@4` + `shadcn init`. The `src.upstream-reference/` copy is genuinely useful to keep around while you port.

**Deliverables (Route A)**
- **`git init` + an initial commit of the pristine upstream tree, before touching anything.** That single commit is what lets you diff your changes against stock forever after — the most useful thing you can do in the next five minutes.
- `.gitignore` — the template already ships a good one (`.next`, `node_modules`, `.vercel`, `next-env.d.ts`); confirm it covers `.env*.local`
- Delete the stale `.next/` build
- **Rewrite `package.json`**: your own `name`, `version: "0.1.0"`, `"private": true`; drop the dead `"export": "next export"` script; add `"typecheck": "tsc --noEmit"`; add `{ "engines": { "node": ">=20.9" } }`
- **Pin `@once-ui-system/core` to an exact version** (currently `latest` — see §1.3) and re-run `pnpm install` so the lockfile reflects the pin
- Delete what you're not shipping (§2.3): `src/app/{blog,gallery}/`, `src/components/{blog,gallery}/`, `src/app/api/{rss,og/fetch,og/proxy,authenticate,check-auth}/`, the three demo `.mdx` projects, `src/components/HeadingLink.tsx`, `src/components/ThemeToggle.module.scss`, `src/components/work/Projects.module.scss`
- **Immediately fix the two things that deletion breaks**: `src/app/sitemap.ts` (drop the blog enumeration) and `src/utils/utils.ts` (`getMDXFiles` should return `[]`, not call `notFound()`, on a missing directory)
- Confirm `next.config.mjs` and `tsconfig.json` match §Phase 0's config below; drop the `@next/mdx` wrapper (§6.4) and its two dependencies
- `public/` — clear out the demo images (`avatar.jpg`, `gallery/`, `projects/project-01/`, `trademarks/`), keep the directory shape
- `package.json`: `{ "engines": { "node": ">=20.9" } }`, scripts `dev / build / start / lint / typecheck`
- `next.config.mjs`:
  ```js
  const nextConfig = {
    pageExtensions: ["ts", "tsx", "md", "mdx"],
    transpilePackages: ["next-mdx-remote"],
    sassOptions: { compiler: "modern", silenceDeprecations: ["legacy-js-api"] },
  };
  export default nextConfig;   // drop the @next/mdx wrapper — see §6.4
  ```
- `tsconfig.json` with `"paths": { "@/*": ["./src/*"] }`, `strict: true`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`
- Biome or ESLint + Prettier, your call
- Directory skeleton: `src/{app,components,resources,types,utils}`, `public/{images,images/og,images/projects}`
- A single `src/app/page.tsx` returning `<h1>ok</h1>` and a minimal `layout.tsx`

**Files touched:** `package.json`, `pnpm-lock.yaml`, `next.config.mjs`, `tsconfig.json`, `.gitignore`, `src/app/sitemap.ts`, `src/utils/utils.ts`, plus a lot of `rm -rf`

**Acceptance:** the repo has an initial commit of pristine upstream plus a second commit with your cleanup; `pnpm dev` serves `/`, `/about`, `/work` with no console errors; `/blog` and `/gallery` 404; `pnpm build` succeeds; `curl -s localhost:3000/sitemap.xml` returns valid XML rather than a 404; `pnpm typecheck` is clean.

**Size:** ~1 hour (Route A, given the existing checkout) / ~1.5 hours (Route B, fresh scaffold).

---

## Phase 1 — Design system foundation

**Goal:** the token contract is live and the theme switches, before any page exists.

**Deliverables**
- Import order in `layout.tsx`, exactly: `@once-ui-system/core/css/styles.css` → `.../css/tokens.css` → `@/resources/custom.css`
- `src/resources/once-ui.config.ts` with `style`, `dataStyle`, `effects`, `display`, `routes`, `baseURL` (§6.2)
- The blocking `theme-init` script in `<head>` (§4.1), `suppressHydrationWarning` on `<html>`
- `src/components/Providers.tsx` — the five-level provider stack (§3.1)
- Four `next/font` instances → four CSS variables on `<html>`. **Convert local faces to WOFF2** (§4.6).
- `src/resources/custom.css` — your own minimal sheet: ligature/smoothing block, `color-scheme`, `prefers-reduced-motion`. **Do not copy the reference's dead `[data-once-ui]` rules** (§4.10).
- `src/components/breakpoints.scss`

**Files touched:** `src/app/layout.tsx`, `src/components/Providers.tsx`, `src/resources/once-ui.config.ts`, `src/resources/custom.css`, `src/components/breakpoints.scss`, `public/fonts/*`

**Acceptance:** DevTools shows all eleven `data-*` attributes on `<html>` before paint; `localStorage.setItem("data-theme","dark")` + reload flips the theme with no flash; `getComputedStyle(document.documentElement).getPropertyValue("--page-background")` returns `#0A0A0A` in dark and `#ffffff` in light; all four `--font-*` variables resolve.

**Size:** ~half a day.

---

## Phase 2 — Layout shell & chrome  ← **the site is viewable end-to-end here**

**Goal:** header, footer, background effects, and all three routes present as stubs.

**Deliverables**
- Full `layout.tsx` body structure (§3.1): background `RevealFx` + `Background` → top spacer → `Header` → `padding="l"` content shell → `Footer`
- `Header.tsx` + `Header.module.scss` (§3.2) — sticky top, bottom-docked at ≤768px. **Resolve the §3.2 [CONFLICT] now, in a real browser at 375px**, and implement whichever responsive approach actually works.
- `TimeDisplay`, `ThemeToggle` (§5.1) — fix the SSR `aria-label` defect
- `Footer.tsx` + `Footer.module.scss` (§3.3), including the 80px mobile spacer
- `not-found.tsx` (§3.8)
- Route stubs: `/about`, `/work` each rendering a heading
- **Decision point:** build `RouteGuard` or not (§12). Recommendation: **not**.

**Files touched:** `src/app/layout.tsx`, `src/app/not-found.tsx`, `src/app/about/page.tsx`, `src/app/work/page.tsx`, `src/components/{Header,Footer,ThemeToggle}.tsx` + modules, `src/components/index.ts`

**Acceptance:** all three routes navigate via the nav pill; the selected item is highlighted; the theme toggle works; at ≤768px the header docks to the bottom and the footer is not covered; the cyan dot grid renders behind everything and changes shade with the theme; there is **no spinner** on first paint (if you dropped `RouteGuard`).

**Size:** ~1 day.

---

## Phase 3 — Content model

**Goal:** every string in the site comes from one typed place.

**Deliverables**
- `src/types/content.types.ts` (§6.1) including the two fork extensions
- `src/resources/content.tsx` with **your** `person`, `social`, `home`, `about`, `work` (+ `newsletter` if keeping)
- `src/resources/icons.ts` — register every icon you name (§5.4). Add a build-time assertion that every `icon` string in `content.tsx` exists in the merged library.
- `src/resources/index.ts` barrel
- `src/utils/utils.ts` (`getPosts`, with the `notFound()` and `tag` bugs fixed) and `src/utils/formatDate.ts`
- Wire `person.name` / `person.role` into the Phase 2 stubs so the chrome shows real data

**Files touched:** `src/types/*`, `src/resources/*`, `src/utils/*`

**Acceptance:** `pnpm typecheck` clean with strict mode; no string literals remain in any component; the header shows your location and a live clock; the footer shows your name, year and social icons; every icon renders (no `does not exist in the library` warnings in the console).

**Size:** ~half a day for the plumbing, **plus however long your copy takes**. The copy is the real work — see §6.3.

---

## Phase 4 — Home page

**Goal:** the hero and its CTA, statically, with no motion yet.

**Deliverables**
- `src/app/page.tsx` root `Column maxWidth="m" gap="xl" paddingY="12" horizontal="center"`
- Hero: badge → h1 (`display-strong-xl`) → subline (`heading-default-xl`, `neutral-weak`) → avatar CTA button (§3.4.1). Wrap each in a plain `<div>` for now; `RevealFx` comes in Phase 8.
- Pass `arrow={false}` to the `Badge` unless you want the animated arrow
- **Decision:** keep or drop the newsletter block (§11 Q5). If keeping, build `Mailchimp.tsx` with a **real** submit handler and `mask.cursor: false`.

**Files touched:** `src/app/page.tsx`, optionally `src/components/Mailchimp.tsx`

**Acceptance:** `/` renders the hero at all three breakpoints with correct type sizes (80/56/44px h1); the CTA links to `/about` with a 32px circular avatar; nothing overflows horizontally at 375px.

**Size:** ~half a day.

---

## Phase 5 — Work index & project cards

**Goal:** `/work` lists real projects from real MDX.

**Deliverables**
- One or two placeholder `.mdx` files in `src/app/work/projects/` with full frontmatter
- `src/components/work/Projects.tsx` (§3.5.1) — with a `card` prop, or a separate `RelatedProjects.tsx`
- `src/components/ProjectCard.tsx` + `ProjectCard.module.scss` (§3.5.2) — **with all five defects fixed**:
  1. `var(--surface-background)` not `var(--surface)`
  2. `var(--brand-solid-strong)` not `var(--brand)`
  3. wrap the card in a real `<a>` (or `role="link" tabIndex={0}` + Enter/Space handling)
  4. `[data-theme="dark"]` not `@media (prefers-color-scheme: dark)`
  5. drop or fix the `:global(.carousel)` rules; give `Media` a real `aspectRatio` (e.g. `"16 / 9"`)
- Also: pass a **boolean** for `content`, not the whole MDX body; forward `priority` to `Media` so the first card's image is eager; add `stopPropagation` to the carousel handlers
- `/work` page (§3.5)

**Files touched:** `src/app/work/page.tsx`, `src/components/work/Projects.tsx`, `src/components/{ProjectCard,RelatedProjectCard}.tsx` + modules, `src/app/work/projects/*.mdx`

**Acceptance:** `/work` lists all projects newest-first; each card shows carousel, title, description and a working "Read case study" link; the card is keyboard-focusable and activates with Enter; hovering lifts it 4px; DevTools shows a real background colour on the card; the carousel indicator bar is visible; clicking a carousel arrow does **not** navigate.

**Size:** ~1–1.5 days.

---

## Phase 6 — Project detail & MDX pipeline

**Goal:** case studies render.

**Deliverables**
- `src/app/work/[slug]/page.tsx` (§3.6) with `generateStaticParams`, `generateMetadata`, `notFound()` for unknown slugs — **a real 404, not a soft one**
- `src/components/mdx.tsx` (§6.5) with your paragraph/image overrides
- Custom MDX components (`Highlight`, or whatever you want) registered in the map
- `src/components/RelatedProjectCard.tsx` (§3.6.1) — **fix the Tailwind-class defect and add `s={{direction:"column"}}`**
- `src/components/ScrollToHash.tsx`
- Write one real case study end to end using the §6.6 skeleton

**Files touched:** `src/app/work/[slug]/page.tsx`, `src/components/mdx.tsx`, `src/components/RelatedProjectCard.tsx`, `src/components/ScrollToHash.tsx`, `src/app/work/projects/*.mdx`

**Acceptance:** every slug builds statically; an unknown slug returns HTTP **404**; MDX headings get slugified ids and copy-anchor buttons; images open the lightbox and close on Escape; the related list shows the right 3 projects; `pnpm build` output lists one static page per project.

**Size:** ~1 day for the plumbing; the case studies themselves are content work (5–7 KB of prose each on the reference).

---

## Phase 7 — About page

**Goal:** the CV, the densest page.

**Deliverables**
- `src/app/about/page.tsx` (§3.7) — all six content blocks in order
- `src/components/about/TableOfContents.tsx` + `about.module.scss` (§3.7.1)
- The `structure` array builder, including the achievements entry
- Fix the `key={`${skill}-${index}`}` bug (use `skill.title`)
- Give achievement titles `id`s if you ever plan to enable `subItems`

**Files touched:** `src/app/about/page.tsx`, `src/components/about/*`

**Acceptance:** the TOC scrolls smoothly to each section with the correct 80px offset; the avatar rail sticks at `top: 4rem` and stops sticking at ≤768px; the two-rail layout stacks at ≤768px; the TOC hides at ≤1024px; every anchor id matches its section title exactly; all icons render.

**Size:** ~1 day.

---

## Phase 8 — Motion & effects

**Goal:** the site feels alive, without hurting anyone.

**Deliverables**
- Wrap the four hero blocks in `RevealFx` with the §7.3 ladder (translateY `–`/`4`/`8`/`–`, delays `0/0/0.2/0.4`), and the featured project block at `translateY="16" delay={0.6}`
- Guard the `translateY(undefined)` defect
- Card hover choreography (§7.4)
- Carousel timing (§7.6) if not already default
- **`prefers-reduced-motion` support (§7.11)** — the CSS block *and* `revealedByDefault` on every `RevealFx`
- Decide on the `Badge` shine (`effect` prop)
- If keeping the newsletter: set `mask.cursor: false` to kill the always-on rAF loop

**Files touched:** `src/app/page.tsx`, `src/resources/custom.css`, `src/components/ProjectCard.tsx`

**Acceptance:** hero elements stagger in over ~1s (consider 2s → 1s; 2.6s is a long time to wait for a headline); with "Reduce motion" enabled in OS settings **everything appears instantly**; no `requestAnimationFrame` loop runs when idle (check the Performance panel).

**Size:** ~half a day.

---

## Phase 9 — SEO, metadata & PWA

**Goal:** the site is correctly indexed and shareable.

**Deliverables**
- `generateMetadata` on all four route types (§8.2), **with `canonical`**
- `<Schema>` blocks per route (§8.3) — pass **paths**, not absolute URLs
- The hand-written `Person` JSON-LD on `/` if you want it
- The ten `<head>` tags (minus `revisit-after` and `language`), with a `theme-color` that matches a real token
- `src/app/api/og/generate/route.tsx` — **load the font from disk**, not from Google at request time. Verify with `curl` that GET returns a PNG.
- `src/app/sitemap.ts` — work projects + active routes only
- `public/robots.txt` or `app/robots.ts` — do not advertise a sitemap that doesn't exist
- `public/manifest.json` + **real 192/512 square icons** + `favicon.ico`
- A 1200×630 static OG card under 300 KB

**Files touched:** every `page.tsx`, `src/app/{sitemap.ts,robots.ts}`, `src/app/api/og/generate/route.tsx`, `public/{manifest.json,favicon.ico,images/og/*}`

**Acceptance:** `curl -s localhost:3000/sitemap.xml | head` returns valid XML listing every route and project; `curl -sI localhost:3000/api/og/generate?title=Test` returns `200 image/png` **and `curl -s … | file -` says PNG**; every route has a canonical link; Google's Rich Results Test parses the JSON-LD; a Slack/LinkedIn paste renders a card.

**Size:** ~half a day.

---

## Phase 10 — Accessibility & performance

**Goal:** close the gaps the reference site left open.

**Deliverables — a11y**
- Add a `<main>` landmark around `{children}`
- Add a skip-to-content link
- Wrap the header nav group in `<nav aria-label="Main">`; add `aria-current="page"` to the selected item
- Give the home icon link an accessible name (it has none at any viewport on the reference)
- Make `ProjectCard` a real link (already done in Phase 5) and the TOC rows real `<a href="#…">` or `<button>`s
- Give carousel controls `role="button"`/`tabIndex` and the indicators `role="tab"` + `aria-label`
- Add `color-scheme: dark` / `light` so native scrollbars and form controls follow the theme
- Fix the `ThemeToggle` SSR `aria-label`
- Run axe / Lighthouse and clear the criticals

**Deliverables — perf**
- Convert fonts to WOFF2 (~212 KB → ~70 KB)
- Compress project images: WebP at ~1600px wide (the reference ships 0.9–4.5 MB PNGs)
- Set `priority` on the first card's image and the detail-page hero
- Add long-lived cache headers for `/public` images
- Enable AVIF: `images: { formats: ["image/avif", "image/webp"] }` in `next.config.mjs`
- Add security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`)

**Files touched:** `src/app/layout.tsx`, `next.config.mjs`, `src/components/*`, `public/images/**`

**Acceptance:** axe reports zero criticals on all four route types; Lighthouse a11y ≥ 95; keyboard-only navigation reaches every interactive element with a visible focus ring; LCP < 2.5s on a throttled 4G profile.

**Size:** ~1 day.

---

## Phase 11 — Deploy & polish

**Goal:** it's live at a domain you own.

**Deliverables**
- Vercel project, `main` → production
- `baseURL` set to the real domain (env or config)
- Custom domain + DNS + HTTPS
- Preview deploys on PRs
- Optional: privacy-friendly analytics (§11 Q6)
- A README with local-dev instructions
- Verify: OG cards, sitemap, robots, manifest install, dark/light on a real phone, keyboard nav

**Files touched:** `README.md`, `vercel.json` if needed, `src/resources/once-ui.config.ts`

**Acceptance:** the production URL serves all routes; `curl -sI <domain>/sitemap.xml` is 200; a WhatsApp/LinkedIn share renders a card; Lighthouse on production ≥ 90 across the board.

**Size:** ~2–3 hours plus DNS propagation.

---

## Phase summary

| Phase | Goal | Size | Shippable on its own? |
|---|---|---|---|
| 0 | Scaffold & tooling | 1h | yes (empty app) |
| 1 | Design system foundation | 0.5d | yes (themed blank page) |
| 2 | Layout shell & chrome | 1d | **yes — site viewable end-to-end** |
| 3 | Content model | 0.5d + copy | yes |
| 4 | Home page | 0.5d | yes |
| 5 | Work index & cards | 1–1.5d | yes |
| 6 | Project detail & MDX | 1d + writing | yes |
| 7 | About page | 1d | yes |
| 8 | Motion & effects | 0.5d | yes |
| 9 | SEO, metadata, PWA | 0.5d | yes |
| 10 | A11y & performance | 1d | yes |
| 11 | Deploy | 0.3d | yes |
| | **Total engineering** | **~8–9 days** | |

Content is a separate track and is usually the long pole: the reference site's `about` object alone carries 51 work bullets, 7 achievements, 5 skill groups and 5 intro paragraphs, plus ~30 KB of case-study prose.

---

# 10. Stack decision appendix

Two honest routes to the same structure. Neither is obviously right; they trade different things.

## 10.1 Route A — the Magic Portfolio stack, exactly

`Next 16 + React 19 + TypeScript + @once-ui-system/core + next-mdx-remote + SCSS modules`

### What you get for free

- **The entire token system** — 16 colour ramps × 15 steps, 7 semantic families × 17 tiers, light/dark, `data-*` theming, 3 radius ramps, spacing, type scale, shadows, transitions. This is genuinely a lot of design work you don't do. §4 is essentially a description of what ships in one npm package.
- **~40 components**, of which you need maybe 25: `Row/Column/Flex/Grid`, `Heading/Text`, `Button/IconButton/ToggleButton`, `Avatar/AvatarGroup`, `Media` (a `next/image` wrapper with lightbox), **`Carousel`** (with swipe, preload, keyboard, line indicator), `Badge`, `Tag`, `Line`, `Fade`, **`RevealFx`**, **`Background`/`Mask`** (the dot grid and cursor mask), `SmartLink`, `Spinner`, `Input`, `Schema`, `Meta`.
- **The theme switcher**, working, flash-free, persisted.
- **The whole reference structure is a `git clone` away.** You start from a working site and delete/replace, rather than composing from nothing.
- Responsive props (`s`/`m`/`l`) with no media queries to write.

### What you must build by hand

- `ProjectCard` + its SCSS module (the upstream one is the wrong component and its stylesheet is a 0-byte file)
- `RelatedProjectCard`
- The `/about` achievements section, the intro tag cloud, and the `structure` array change
- The `/work/[slug]` tag row, "View Project" button, "Back" button, related section
- The PWA head block, `manifest.json`, a working OG route, a working sitemap
- Your own `custom.css` (the reference's is ~60% dead code)
- **All eleven SEO fixes and all twelve a11y fixes in §8.8 / §10.4**
- Icon registrations (15 missing on the reference)

### Costs you inherit

- **~965 KB raw / 257 KB brotli** of Once UI JS on every page, most of it unused: ~115 `recharts` references, `Kbar`, `MegaMenu`, `DatePicker`, `OTPInput`, `Dialog`, `Toaster`, `MasonryGrid`, `GlitchFx`, `HoloFx`, `TiltFx`, `Particle`, `CodeBlock`, `Table`, `Accordion`… **It is one barrel export; tree-shaking does not help much.** Shared total per page is ~1.56 MB raw.
- **A vendored design system you don't control.** Upstream pins it to `latest`. Its bugs become your bugs: the undefined `--brand-on-solid-medium`, the descendant-only `data-viz-style` rules, the `.hiddenNoMask` zero-duration transition, `translateY(undefined)`, the `Mailchimp` debounce that never debounces.
- **A prop dialect to learn.** `align` means text-align. `horizontal`/`vertical` swap meaning between Row and Column. `maxWidth="m"` is a token but `maxWidth={40}` is rem. Spacing props take two different scales. It is coherent, but it is not CSS and it is not Tailwind, and there is little community knowledge to search.
- **CC BY-NC 4.0 on the template.** Non-commercial, attribution required. A personal portfolio is fine; the footer attribution question is real (§11 Q7).

### Effort per phase (Route A)

| Phase | Estimate | Note |
|---|---|---|
| 0 Scaffold | 1h | or `degit` the template and delete |
| 1 Design system | **0.5d** | mostly config — the tokens already exist |
| 2 Shell & chrome | 1d | Header is the fiddly part |
| 3 Content model | 0.5d | + copy |
| 4 Home | 0.5d | |
| 5 Work + cards | 1–1.5d | `Carousel` is free; the card fixes are the work |
| 6 Detail + MDX | 1d | `next-mdx-remote` + the component map is largely copy-paste |
| 7 About | 1d | |
| 8 Motion | **0.5d** | `RevealFx` is free |
| 9 SEO/PWA | 0.5d | `Meta`/`Schema` are free; the OG route needs fixing |
| 10 A11y/perf | 1d | |
| 11 Deploy | 0.3d | |
| **Total** | **~8–9 days** | |

### Long-term maintenance

**Better than you'd expect on design velocity, worse on control.** Adding a section is a few typed props. But a Once UI major bump can move class names, prop semantics or token names under you, and you cannot patch the library without forking it. If Once UI goes quiet, you are maintaining a 1 MB vendored dependency yourself. The reference site already ships against it with five undefined-token bugs nobody caught.

---

## 10.2 Route B — Next 16 + Tailwind v4 (+ shadcn/ui where useful)

Same structure, same token *contract*, different implementation. Port §4's tokens into Tailwind v4's `@theme` CSS variables.

### What you get for free

- **Tailwind v4** with `@theme` — CSS custom properties are already Tailwind's native token model in v4, so the Once UI contract ports almost 1:1. Arbitrary values (`max-w-[40rem]`) cover the gaps.
- **shadcn/ui** for `Button`, `Input`, `Badge`, `Avatar`, `Tooltip`, `Dialog`, `Toast` — **copied into your repo**, so you own and can edit them. No vendored black box.
- **`next-themes`** gives you `data-theme` switching, `system` resolution, localStorage persistence and a flash-free inline script in ~5 lines. It is a direct replacement for the hand-rolled `theme-init` script.
- Enormous community knowledge, and every LLM knows Tailwind cold.
- **Dramatically smaller JS.** Tailwind ships zero runtime. Your page JS is React + your components + whatever primitives you pull in — realistically **60–120 KB** of app JS instead of ~1 MB of vendor.

### What you must build by hand

This is the honest list, and it is the whole argument:

| Component | Effort | Substitute |
|---|---|---|
| **`Carousel`** (swipe, preload, line indicator, hover arrows, 300/50ms transition) | **~1 day** | `embla-carousel-react` gets you 80% |
| **`RevealFx`** (mask-wipe + blur + translateY + delay ladder) | ~0.5 day | ~40 lines of CSS + a hook, or `framer-motion` |
| **`Background`/`Mask`** (dot grid + radial mask + optional cursor tracking) | ~0.5 day | a `radial-gradient` background + a `mask-image`. Genuinely simple. |
| **`Media`** (`next/image` wrapper + lightbox) | ~0.5 day | `next/image` + `yet-another-react-lightbox` |
| **`Schema` / `Meta.generate`** | ~2h | Next's native `metadata` export + a hand-written JSON-LD helper. Arguably *better* — you'd fix the double-prefix bug by construction. |
| **`AvatarGroup`, `Tag`, `Line`, `Fade`, `ToggleButton`, `Spinner`** | ~0.5 day total | trivial in Tailwind |
| **`Row`/`Column`/`Grid` prop API** | — | **you don't** — use `flex`/`grid` utilities directly. This is a *simplification*, not a loss. |
| **The token layer** | ~0.5 day | the mapping table in §10.5 |
| **Responsive prop system** | — | **you don't** — `md:`/`lg:` prefixes already exist and are min-width, which is the better default anyway |

The one thing with no cheap substitute is the **`Carousel`**, and only because the reference uses a genuinely nice one.

### Costs

- **~3 extra days of component work** before you're at parity.
- You are responsible for accessibility on every primitive you write (shadcn helps a lot — it's Radix underneath, so focus management and ARIA come with it).
- The mapping in §10.5 is mechanical but it is a real translation step, and Once UI's *semantic tier* naming (`brand-on-background-medium`) does not map to Tailwind's *scale* naming (`brand-600`) without a decision. §10.5 keeps the semantic names, which is the right call.

### Effort per phase (Route B)

| Phase | Estimate | Δ vs Route A |
|---|---|---|
| 0 Scaffold | 1h | ~same (`create-next-app` + `tailwindcss@4` + `shadcn init`) |
| 1 Design system | **1.5d** | **+1d** — port the token table, wire `next-themes`, set up `@theme` |
| 2 Shell & chrome | **1.5d** | **+0.5d** — hand-write the sticky/bottom-dock header and the fade scrims |
| 3 Content model | 0.5d | same — it's plain TypeScript |
| 4 Home | 0.5d | same |
| 5 Work + cards | **2.5d** | **+1d** — build the carousel |
| 6 Detail + MDX | **1.5d** | **+0.5d** — MDX component map + lightbox |
| 7 About | 1d | same |
| 8 Motion | **1d** | **+0.5d** — write `RevealFx` yourself |
| 9 SEO/PWA | **1d** | **+0.5d** — native metadata + hand-written JSON-LD |
| 10 A11y/perf | **0.5d** | **−0.5d** — shadcn/Radix ships accessible; no 1 MB bundle to apologise for |
| 11 Deploy | 0.3d | same |
| **Total** | **~11–12 days** | **+3 days** |

### Long-term maintenance

**Worse initially, better forever.** Every component is in your repo, in a language every tool understands. A Tailwind major is a documented codemod; a Once UI major is a spelunking expedition. Shadcn components are yours to edit — no forking, no patch-package. When you want the card to do something unusual, you edit the card.

The counter-argument is real too: three extra days is three extra days, and Route A's components are *good*. The `Carousel` and `RevealFx` are nicer than what most people write in an afternoon.

---

## 10.3 How to choose

**Pick Route A if:** you want to be live this week, the reference site's look is close to what you want, and you're comfortable owning a large vendored dependency you didn't choose.

**Pick Route B if:** you intend to keep this site for years and evolve it, you want the page weight to be small, you already know Tailwind, or you want every component to be editable. Also pick B if you'd otherwise spend the "saved" days learning a prop dialect you'll use on exactly one project.

**A pragmatic third option:** clone the template (Route A), get it live in a week, and treat Route B as a possible rewrite once your content exists. The content model in §6 is **stack-independent plain TypeScript** — it ports unchanged. That is the real asset; the components are replaceable.

---

## 10.4 Fix list that applies to both routes

Whichever route you take, these are not optional:

**SEO/correctness:** the eleven items in §8.8.
**Accessibility:** add `<main>`; add a skip link; wrap nav in `<nav>` with `aria-current`; name the home icon link; make cards real links; make TOC rows real links/buttons; give carousel controls roles and labels; add `color-scheme`; fix the theme-toggle SSR label; **add `prefers-reduced-motion`**; theme the card overlay with `[data-theme]` not `prefers-color-scheme`; give the card a working focus ring.
**Performance:** WOFF2 fonts; compressed WebP images; `priority` on the LCP image; long-lived cache headers on `/public`; enable AVIF.
**Correctness:** don't ship the whole MDX body as a card prop; `stopPropagation` on carousel controls; a real 404 for unknown slugs; a real form handler or no form.

---

## 10.5 Once UI → Tailwind v4 token mapping (for Route B)

Put this in `src/app/globals.css`. Tailwind v4's `@theme` block turns each entry into both a CSS variable and a utility.

```css
@import "tailwindcss";

/* ---------- 1. Raw ramps: theme-independent, plain :root ---------- */
:root {
  /* cyan → brand */
  --scheme-cyan-100:#050911; --scheme-cyan-200:#0A1525; --scheme-cyan-300:#094074;
  --scheme-cyan-400:#045B9C; --scheme-cyan-500:#0279BE; --scheme-cyan-600:#049EE2;
  --scheme-cyan-700:#17C0FD; --scheme-cyan-800:#60E4FC; --scheme-cyan-900:#82F1FC;
  --scheme-cyan-1000:#B3FAFC; --scheme-cyan-1100:#D4FBFC; --scheme-cyan-1200:#EFFCFD;
  --scheme-cyan-600-15:#049EE226; --scheme-cyan-600-30:#049EE24D; --scheme-cyan-600-50:#049EE280;

  /* gray → neutral */
  --scheme-gray-100:#0A0A0A; --scheme-gray-200:#151515; --scheme-gray-300:#3F3F3F;
  --scheme-gray-400:#595959; --scheme-gray-500:#757575; --scheme-gray-600:#959595;
  --scheme-gray-700:#B2B2B2; --scheme-gray-800:#D2D2D2; --scheme-gray-900:#E0E0E0;
  --scheme-gray-1000:#EDEDED; --scheme-gray-1100:#F3F3F3; --scheme-gray-1200:#F9F9F9;
  --scheme-gray-600-15:#95959526; --scheme-gray-600-30:#9595954D; --scheme-gray-600-50:#95959580;

  /* red → accent (add the other 13 hues only if you'll switch brand at runtime) */
  --scheme-red-100:#130507; --scheme-red-300:#830711; --scheme-red-500:#E90507;
  --scheme-red-600:#FF5F53; --scheme-red-800:#FDC6BD; --scheme-red-1000:#FDEAE6;
  --scheme-red-600-15:#FF5F5326; --scheme-red-600-30:#FF5F534D; --scheme-red-600-50:#FF5F5380;

  --static-white:#ffffff; --static-black:#000000;
  --static-white-medium:#ffffff4D; --static-black-medium:#0000004D;
  --static-transparent:#00000000;
}

/* ---------- 2. Semantic tiers, switched by data-theme (next-themes writes this) ---------- */
:root, [data-theme="light"] {
  color-scheme: light;
  --color-page:                    var(--static-white);
  --color-surface:                 var(--static-white-medium);
  --color-surface-border:          var(--scheme-gray-600-30);
  --color-neutral-bg-strong:       var(--scheme-gray-800);
  --color-neutral-bg-medium:       var(--scheme-gray-1000);
  --color-neutral-bg-weak:         var(--static-white);
  --color-neutral-on-bg-strong:    var(--scheme-gray-100);
  --color-neutral-on-bg-medium:    var(--scheme-gray-400);
  --color-neutral-on-bg-weak:      var(--scheme-gray-500);
  --color-neutral-border-strong:   var(--scheme-gray-800);
  --color-neutral-border-medium:   var(--scheme-gray-900);
  --color-neutral-border-weak:     var(--scheme-gray-1000);
  --color-neutral-alpha-strong:    var(--scheme-gray-600-50);
  --color-neutral-alpha-medium:    var(--scheme-gray-600-30);
  --color-neutral-alpha-weak:      var(--scheme-gray-600-15);
  --color-brand-bg-strong:         var(--scheme-cyan-800);
  --color-brand-on-bg-strong:      var(--scheme-cyan-100);
  --color-brand-on-bg-medium:      var(--scheme-cyan-400);   /* link colour */
  --color-brand-on-bg-weak:        var(--scheme-cyan-500);
  --color-brand-alpha-strong:      var(--scheme-cyan-600-50);
  --color-brand-alpha-medium:      var(--scheme-cyan-600-30);
  --color-brand-alpha-weak:        var(--scheme-cyan-600-15);
  --color-brand-solid-strong:      var(--scheme-gray-300);   /* solid=contrast */
  --color-brand-on-solid-strong:   var(--static-white);
  --color-accent-bg-strong:        var(--scheme-red-800);
}
[data-theme="dark"] {
  color-scheme: dark;
  --color-page:                    var(--scheme-gray-100);
  --color-surface:                 var(--static-black-medium);
  --color-surface-border:          var(--scheme-gray-600-30);
  --color-neutral-bg-strong:       var(--scheme-gray-300);
  --color-neutral-bg-medium:       var(--scheme-gray-200);
  --color-neutral-bg-weak:         var(--scheme-gray-100);
  --color-neutral-on-bg-strong:    var(--static-white);
  --color-neutral-on-bg-medium:    var(--scheme-gray-900);
  --color-neutral-on-bg-weak:      var(--scheme-gray-700);
  --color-neutral-border-strong:   var(--scheme-gray-400);
  --color-neutral-border-medium:   var(--scheme-gray-300);
  --color-neutral-border-weak:     var(--scheme-gray-200);
  --color-neutral-alpha-strong:    var(--scheme-gray-600-50);
  --color-neutral-alpha-medium:    var(--scheme-gray-600-30);
  --color-neutral-alpha-weak:      var(--scheme-gray-600-15);
  --color-brand-bg-strong:         var(--scheme-cyan-300);
  --color-brand-on-bg-strong:      var(--static-white);
  --color-brand-on-bg-medium:      var(--scheme-cyan-900);   /* link colour */
  --color-brand-on-bg-weak:        var(--scheme-cyan-700);
  --color-brand-alpha-strong:      var(--scheme-cyan-600-50);
  --color-brand-alpha-medium:      var(--scheme-cyan-600-30);
  --color-brand-alpha-weak:        var(--scheme-cyan-600-15);
  --color-brand-solid-strong:      var(--scheme-gray-1000);
  --color-brand-on-solid-strong:   var(--static-black);
  --color-accent-bg-strong:        var(--scheme-red-300);
}

/* ---------- 3. Expose them to Tailwind ---------- */
@theme inline {
  --color-page: var(--color-page);
  --color-surface: var(--color-surface);
  --color-neutral-strong: var(--color-neutral-on-bg-strong);
  --color-neutral-medium: var(--color-neutral-on-bg-medium);
  --color-neutral-weak:   var(--color-neutral-on-bg-weak);
  --color-brand-strong:   var(--color-brand-on-bg-strong);
  --color-brand-medium:   var(--color-brand-on-bg-medium);
  --color-brand-weak:     var(--color-brand-on-bg-weak);
  /* …and the alpha/border/solid tiers you actually use */

  --font-display: var(--font-heading);
  --font-heading: "Cal Sans", ui-sans-serif, system-ui, sans-serif;
  --font-body:    "Outfit", ui-sans-serif, system-ui, sans-serif;
  --font-mono:    "Geist Mono", ui-monospace, monospace;

  --radius-xs: 0.25rem;  --radius-sm: 0.5rem;  --radius-md: 0.75rem;
  --radius-lg: 1rem;     --radius-xl: 1.25rem; --radius-full: 999rem;

  --shadow-xs: 0 0 1px rgb(0 0 0/.12), 0 1px 2px rgb(0 0 0/.08), 0 2px 4px rgb(0 0 0/.08);
  --shadow-sm: 0 0 2px rgb(0 0 0/.12), 0 1px 4px rgb(0 0 0/.08), 0 4px 8px rgb(0 0 0/.08);
  --shadow-md: 0 0 2px rgb(0 0 0/.12), 0 2px 4px rgb(0 0 0/.08), 0 8px 8px rgb(0 0 0/.08);
  --shadow-lg: 0 2px 4px rgb(0 0 0/.12), 0 8px 12px rgb(0 0 0/.08), 0 8px 16px rgb(0 0 0/.08);
  --shadow-xl: 0 4px 4px rgb(0 0 0/.12), 0 8px 12px rgb(0 0 0/.08), 0 24px 24px rgb(0 0 0/.08);

  --ease-standard: cubic-bezier(.4,0,.2,1);   /* or keep ease-in-out for fidelity */
}
```

### Mapping table

| Once UI | Tailwind v4 | Utility |
|---|---|---|
| `background="page"` | `--color-page` | `bg-page` |
| `background="surface"` + `--backdrop-filter` | `--color-surface` | `bg-surface backdrop-blur-2xl` |
| `onBackground="neutral-strong"` | `--color-neutral-strong` | `text-neutral-strong` |
| `onBackground="neutral-weak"` | `--color-neutral-weak` | `text-neutral-weak` |
| `onBackground="brand-medium"` | `--color-brand-medium` | `text-brand-medium` |
| `border="neutral-alpha-weak"` | `--color-neutral-alpha-weak` | `border border-neutral-alpha-weak` |
| `background="brand-alpha-weak"` | `--color-brand-alpha-weak` | `bg-brand-alpha-weak` |
| `radius="m"` (playful, 0.75rem) | `--radius-md` | `rounded-md` |
| `radius="l"` (1rem) | `--radius-lg` | `rounded-lg` |
| `radius="full"` | `--radius-full` | `rounded-full` |
| `data-border="rounded"` scope | a `.rounded-scope` class overriding `--radius-*` | scoped variable override |
| `shadow="l"` | `--shadow-lg` | `shadow-lg` |
| `gap="16"` (1rem) | Tailwind's 4-unit spacing | `gap-4` |
| `gap="24"` (1.5rem) | | `gap-6` |
| `gap="40"` (2.5rem) | | `gap-10` |
| `gap="80"` (5rem) | | `gap-20` |
| `gap="m"` (1.5/1/0.75rem) | responsive | `gap-3 md:gap-4 lg:gap-6` |
| `gap="l"` (2.5/1.5/1rem) | | `gap-4 md:gap-6 lg:gap-10` |
| `gap="xl"` (5/4/2.5rem) | | `gap-10 md:gap-16 lg:gap-20` |
| `padding="l"` | | `p-4 md:p-6 lg:p-10` |
| `maxWidth="m"` (64/55rem) | | `max-w-[55rem] lg:max-w-[64rem]` |
| `maxWidth="s"` (48rem) | | `max-w-3xl` (48rem exactly) |
| `maxWidth="xs"` (40rem) | | `max-w-[40rem]` |
| `maxWidth={40}` | | `max-w-[40rem]` |
| `variant="display-strong-xl"` | | `font-display font-semibold text-[2.75rem] md:text-[3.5rem] lg:text-[5rem] leading-none tracking-[-0.05em]` — **or** define a `.text-display-xl` component class |
| `variant="display-strong-s"` | | `text-[2rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold` |
| `variant="heading-strong-xl"` | | `font-heading font-semibold text-2xl leading-8` |
| `variant="heading-strong-l"` | | `text-[1.33rem] leading-7 font-semibold` |
| `variant="body-default-l"` | | `text-lg leading-6` |
| `variant="body-default-m"` | | `text-base leading-6` |
| `variant="body-default-s"` | | `text-sm leading-[1.125rem]` |
| `variant="label-default-s"` | | `font-body text-[0.825rem] leading-4` |
| `transition="micro-medium"` | | `transition-all duration-200 ease-in-out` |
| `transition="macro-medium"` | | `transition-all duration-300 ease-in-out` |
| `s={{hide:true}}` (≤768px) | **min-width** inversion | `hidden md:flex` (Tailwind `md` = 768px min) |
| `m={{hide:true}}` (≤1024px) | | `hidden lg:flex` (`lg` = 1024px min) |
| `s={{direction:"column"}}` | | `flex-col md:flex-row` |
| `horizontal="center"` on Row | | `justify-center` |
| `horizontal="center"` on Column | | `items-center` |
| `align="center"` | | `text-center` |
| `fillWidth` | | `w-full` |
| `fill` | | `w-full h-full` |
| `fitWidth` | | `w-fit` |
| `flex={3}` / `flex={9}` | | `flex-[3]` / `flex-[9]` — or just `basis-1/4` / `basis-3/4` |

**One deliberate semantic change:** Once UI's breakpoints are **max-width** (`s={{hide:true}}` = "hide at 768px and below"). Tailwind's are **min-width** (`md:` = "768px and up"). The table above inverts them. That inversion is a genuine improvement — mobile-first is easier to reason about — but it means you cannot mechanically transliterate; you have to think about each one.

**Two things that don't map, and are simpler in Tailwind anyway:**
- The **dot-grid background**: `bg-[radial-gradient(var(--color-brand-bg-strong)_1px,transparent_1px)] bg-[length:0.125rem_0.125rem] opacity-40` plus `[mask-image:radial-gradient(100vh_at_50%_0%,black,transparent)]`. Three utilities, no component.
- The **`Fade` scrim**: `bg-gradient-to-b from-page to-transparent backdrop-blur-[0.5rem] [mask-image:linear-gradient(black_20%,transparent)]`.

---

# 11. Open questions for Razvan

Answer these before Phase 3; several change what you build.

### Q1 — What is the site actually for?
The reference is optimised for *hiring managers and consulting leads*: a "hire me" headline, a case-study-heavy `/work`, a booking link, a 51-bullet CV. If your goal is different (attracting collaborators, showcasing OSS, writing), the section weights change. Specifically: an "available for work" badge and a booking pill only earn their place if you want inbound.

### Q2 — How many projects, and how deep?
The reference has 5 projects with 5–7 KB case studies each and 22 screenshots. Options:
- **5+ deep case studies** — matches the reference; a lot of writing and a lot of image work.
- **3 deep ones** — my recommendation. `/work` looks fine with three cards; three good case studies beat eight thin ones.
- **Cards only, no detail pages** — halves the work (skip Phase 6 entirely) but loses the substance that makes a portfolio persuasive. If you go this way, drop the "Read case study" button and make the card link to the live project.

### Q3 — Enable `/blog` and/or `/gallery`?
Both exist, fully built, in the upstream template. The reference deleted both.
- **`/blog`** costs you: the index page, `[slug]` page, `Posts`, `Post`, `ShareSection`, an RSS route, plus a `Latest from the blog` strip on the home page. It also brings a `HeadingNav` auto-TOC on post pages, which is nice. **Only enable it if you will actually write.** An empty blog is worse than none. Note the reference's `sitemap.ts` and `robots.txt` are broken *specifically because* the blog was deleted carelessly — if you keep it, keep it wired.
- **`/gallery`** is a `MasonryGrid` of `<Media enlarge>` — genuinely cheap (one component, one config array). Worth it if you have photography or design work; pointless otherwise.
- **My default:** ship without both. Adding `/blog` later is a contained change.

### Q4 — Domain, and what goes in `baseURL`?
`baseURL` is consumed by every `Meta.generate`, every `<Schema>`, `sitemap.ts`, `robots.ts` and the OG image route. Getting it wrong breaks all of them at once.
- What domain? (Buy it in Phase 0 so DNS has time to propagate.)
- Read it from an env var (`NEXT_PUBLIC_SITE_URL`) or hardcode it? Env var means preview deploys can self-reference correctly.

### Q5 — Newsletter: keep, wire, or drop?
The reference ships a **form that submits nowhere** and fakes a 1-second success. Three options:
- **Drop it** — delete `Mailchimp.tsx` and the `newsletter` config. Simplest, and honest.
- **Wire it** — Buttondown / ConvertKit / Resend Audiences / a real Mailchimp embed. ~2 hours including the double-opt-in flow. Also replace the stale hidden list IDs.
- **Keep the fake** — don't. It collects an email address and tells the user they're subscribed. That is a dark pattern regardless of intent.

If you keep it, set `mask.cursor: false` to kill the always-on `requestAnimationFrame` loop (§7.8).

### Q6 — Analytics?
The reference has **none at all**. If you want numbers:
- **Vercel Analytics** — one package, zero config, no cookie banner needed in most jurisdictions.
- **Plausible / Umami** — self-hostable, privacy-first, ~1 KB script.
- **None** — a perfectly defensible choice for a portfolio, and it's the reference's choice.

Decide before Phase 11; retrofitting a consent banner is annoying.

### Q7 — Attribution and licence
The upstream template is **CC BY-NC 4.0: attribution required, non-commercial**. Its footer ships `/ Build your portfolio with Once UI` and its source comment says attribution is required without a Pro licence. **The reference site removed it.** Your options: keep the attribution, buy a Pro licence, or take Route B and write your own components (which sidesteps the question entirely — that is a real point in Route B's favour).

### Q8 — Route A or Route B?
See §10. If you're unsure, Route A gets you live faster and the content model ports to B unchanged later.

### Q9 — Keep `RouteGuard`?
See §12. Short version: it makes every page a client-rendered spinner, hides all your structured data from crawlers, and its only feature (password protection) is not real security. **Recommendation: delete it.**

### Q10 — The location string
`person.location` is printed verbatim in the header *and* used as the clock timezone, so the reference literally displays `Europe/Bucharest`. Do you want that, or a separate display label (`Bucharest, RO`) alongside the tz id?

### Q11 — Headshot and screenshots
- Do you have a usable headshot? It appears at 32px, 24px and 160px, so source at ≥320px square, exported as WebP.
- Do you have permission to screenshot the work you want to show? Client and employer work often isn't yours to publish. This is worth checking *before* you write the case studies.

### Q12 — CV / résumé
The `/about` page is a full CV. Do you also want a downloadable PDF? If so, decide whether it's hand-maintained or generated from the same `about` object — the latter is a nice half-day project once `content.tsx` exists.

---

# 12. Appendix A — Recommended deviations from the reference

Things the reference does that you should deliberately do differently. Each is a defect verified in the shipped bytes, not a taste call.

| # | Reference behaviour | Recommendation | Why |
|---|---|---|---|
| 1 | **`RouteGuard` gates every page behind a client-side spinner** | **Delete it.** Render pages as server components. | First paint is a spinner on every route; all JSON-LD is invisible to non-JS crawlers; the LCP element is a loading indicator; the password feature isn't real security (content ships in the flight payload regardless). Deleting it costs nothing you want. |
| 2 | Unknown `/work/<slug>` returns **HTTP 200** with 404 UI | Call `notFound()` → real 404 | Soft 404s hurt indexing and confuse tooling. |
| 3 | `ProjectCard` is a `<div>` with `onClick` + `window.location.href` | Real `<a>`, client-side navigation | Not keyboard reachable, no crawlable link to your case studies, full page reload on every click. |
| 4 | `var(--surface)`, `var(--brand)`, `--brand-500`, `--brand-600` — all undefined | Use `--surface-background`, `--brand-solid-strong`, real brand tokens | Cards paint no background; focus rings never render; a class named `blue-underline` paints `#5071cc` on a cyan site. |
| 5 | `@media (prefers-color-scheme: dark)` on the card overlay | `[data-theme="dark"]` | The only `prefers-color-scheme` query in the build; desyncs from the theme toggle. |
| 6 | No `prefers-reduced-motion` handling anywhere | Add the block in §7.11 | 2s blur-wipes and a 9s infinite sheen run regardless of OS settings. |
| 7 | Entire MDX body passed as a `ProjectCard` prop | Pass a boolean | 30.5 KB of prose shipped to every home-page visitor for a truthiness check. |
| 8 | `priority` never forwarded to `next/image` | Forward it | The LCP image lazy-loads. |
| 9 | Carousel controls don't `stopPropagation` | Add it | Clicking "next slide" navigates away from the page. |
| 10 | `aspectRatio="original"` → invalid CSS | Use a real ratio (`"16 / 9"`) | The image overflows its 400px box and clips the indicator out of view. |
| 11 | `custom.css` `[class*=display]` matches `display-flex` on `<html>` | Scope properly | A `letter-spacing: .06em !important` on the root element that inherits into all body copy. Almost certainly unintentional. |
| 12 | `[data-once-ui]`-scoped rules | Delete them | Seven of eleven rules in `custom.css` match nothing. |
| 13 | `/api/og/generate` fetches Google Fonts at request time | Read the font from disk | The route 500s in production; every OG image on the site is broken. |
| 14 | `sitemap.ts` enumerates a deleted directory | Fix `getPosts` to return `[]` | `/sitemap.xml` 404s while `robots.txt` advertises it. |
| 15 | Fonts shipped as TTF | Convert to WOFF2 | 212 KB → ~70 KB of critical-path bytes. |
| 16 | Project images 0.9–4.5 MB PNGs | WebP at ~1600px | The largest single asset is 4.55 MB. |
| 17 | `apple-touch-icon` / maskable icon = 1920×1440 1.7 MB PNG declared as 512×512 | Real square icons | |
| 18 | No `<main>`, no `<nav>`, no skip link, no `aria-current` | Add them | Four landmark-level a11y failures. |
| 19 | No `color-scheme` property | Add it | Native scrollbars and form controls stay light in dark mode. |
| 20 | Newsletter form fakes success | Wire it or delete it | It tells users they subscribed when nothing happened. |
| 21 | `key={`${skill}-${index}`}` on an object | Use `skill.title` | React keys come out as `"[object Object]-0"`. |
| 22 | 15 icon names referenced but never registered | Register them + assert at build time | Seven achievement icons render as nothing, silently. |
| 23 | Dead config: `routes` lists deleted routes, `protectedRoutes` points at a nonexistent slug, `style.theme` read by nothing, `schema`/`sameAs`/`socialSharing` exported and unused | Delete | Misleading to future-you. |
| 24 | Hero reveal completes at t ≈ 2.6s **after hydration** | Shorten to ~1s | Two and a half seconds is a long time to wait for a headline, especially behind a spinner. |

---

# 13. Appendix B — Source conflicts and evidence gaps

Consolidated from the inline callouts, for auditing.

## Direct conflicts between source writeups

| # | Question | Reading A | Reading B | Resolution |
|---|---|---|---|---|
| 1 | **Does the home page have one project block or two?** (§3.4) | Two `Projects` calls — `range=[1,1]` in a `RevealFx`, `range=[2]` bare (`01`, `03`, `05`) | One `RevealFx` containing one `Column` with all five cards (`07` §11.1 C2) | **Two.** The `priority` distribution `true,true,true,false,false` can only arise from two calls with restarting index counters, and `07`'s own C3 confirms that distribution. |
| 2 | **Does the mobile header keep About/Work links?** (§3.2) | Yes — Once UI's `Flex` returns `null` via a JS breakpoint check and re-mounts at `s` (`01` §7, corrected) | No — `hide:true` emits unconditional `flex-hide` and `s:{hide:false}` emits nothing; `flex-show` is never emitted by any component (`07` §11.1 C5) | **Unresolved.** Both cite real greps of different parts of the bundle. Neither captured a hydrated DOM at a narrow viewport. **Verify in a browser; don't reproduce the pattern.** |
| 3 | **Two `Fade` scrims or one?** (§7.9) | Two in source; the mobile one is absent from SSR because the server renders at breakpoint `l` (`01`) | One in all nine captured HTML files; discrepancy unexplained (`07` C4) | Same underlying uncertainty as #2. |
| 4 | **Related-projects range** (§3.6) | `range={[2]}` → `slice(1)` (`03`) | `range={[2,4]}` → `slice(1,4)` (`05`) | **Identical output with 5 projects.** Use `[2,4]` — explicit and bounded. |
| 5 | **Are the achievement titles underlined?** (§3.7.6) | Yes, via `[data-once-ui] [data-gap="2"] [class*=heading-strong-s]` (`05` B5) | No — `data-once-ui` appears zero times anywhere (`04` §13.3, `07` §6.3) | **No.** Two independent greps beat one inference. |
| 6 | **How were `/blog` and `/gallery` disabled?** (§1.5) | Via `routes[…] = false` (`06` main body; its own V.11 says unverifiable) | Folders deleted + `Header.tsx` edited; `routes` still all `true` (`03`, `05`, live 404s) | **Folders deleted.** Confirmed by HTTP status and a read of the minified `Header`. |

## Flagged as unverifiable by the source writeups

| Item | Why | Impact on your build |
|---|---|---|
| `TableOfContents` internals (§3.7.1) | Client component; its webpack module is in none of the captured chunks, and its subtree is in neither the payload nor the DOM. Reconstructed from upstream. | Low — you're writing your own copy of it anyway. The 80px offset, the tick widths and the `m={{hide:true}}` breakpoint are all assumptions. |
| Frontmatter key names for tech tags and the external project URL (§6.4) | `/work/[slug]` is a server component; only its output survives. | None — pick your own names. |
| `team[].role` | Never rendered anywhere on the reference. | None. |
| `home.label` | The home nav item is icon-only, so the string is never rendered and was minified away. | None — `"Home"` is the stock value. |
| `blog` / `gallery` content object values | Proven to still exist in `content.tsx` via minifier residue, but their string literals were dropped. | None if you skip those routes. |
| Which `next/font/local` source paths the fonts came from | Only the hashed `/_next/static/media/*.ttf` URLs survive the build. | None. |
| Whether `data-border="rounded"` on `<header>` is a prop or a literal attribute | Not determinable from built HTML. | None — either works. |
| The exact `@once-ui-system/core` version deployed | `package.json` pins `latest`; no version string in the minified bundle. | Low — pin your own. |
| The intrinsic dimensions of 16 of the 22 project images | Only six were downloaded (all 1920×1440 PNG). | None. |
| `@once-ui-system/core` component prop *type signatures* | No `node_modules` in the clone. Every prop in this document is documented **as used**, not as declared. | Low — check the library's own types once installed. |
| Whether `Projects.tsx` was given a prop or split into two components | Server component, never in a client bundle. | None — you're choosing. |
| The post-hydration DOM of any client component | No browser was driven. Everything about hydrated markup comes from the flight payload plus the de-minified sources — exact for server components, prop-level-exact for client ones. | **Moderate.** This is the root of conflicts #2 and #3. |

## Live-behaviour claims measured from one edge region only

All HTTP-tagged figures (response headers, cache matrix, `age`, bundle byte counts, `/api/og/generate` 500, `/sitemap.xml` 404, the `/_next/image` format negotiation) were measured once, from `fra1`, on 2026-09-08. They were consistent with locally captured artifacts wherever a local check was possible, but re-measure anything you plan to depend on.

---

*End of specification.*
