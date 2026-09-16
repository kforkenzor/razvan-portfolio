import type {
  About,
  Home,
  Ownership,
  Person,
  PresentationSite,
  Project,
  Social,
  Work,
} from "@/types";
import { Line, Row, Text } from "@once-ui-system/core";

/* ==========================================================================
 * SKELETON — Razvan Calota
 *
 * Positioning: full-stack TypeScript engineer. Broad net, deliberately.
 *
 * Rules this file obeys (content-spec.md §6, OWNERSHIP.md):
 *   1. No invented number, metric, outcome, date, employer or job title.
 *      Every slot that needs one and does not have one is marked TODO(razvan).
 *   2. Only three repos have measured ownership. Everything here traces to
 *      OWNERSHIP.md, which was measured with `git log HEAD` on 2026-09-08.
 *   3. yt-admin-dashboard (2/175) and portal-backend (0/22) are NOT his work
 *      and appear nowhere in this file.
 *
 * Grep `TODO(razvan)` for every slot still waiting on him.
 * ========================================================================== */

/* --------------------------------------------------------------------------
 * Ownership blocks — verbatim from OWNERSHIP.md. Do not edit without re-measuring.
 * -------------------------------------------------------------------------- */

const shortFormOwnership: Ownership = {
  myCommits: 16,
  totalCommits: 16,
  contributors: 1,
  window: "2026-08-24 → 2026-08-25",
  note: "Sole author. Agent-assisted implementation — the defensible claim is architecture and direction, not line count.",
};

const newsletterOwnership: Ownership = {
  myCommits: 70,
  totalCommits: 1068,
  contributors: 6,
  window: "2024-08-10 → 2026-05-21",
  pairedWith: "coworker, from 2025-07-01",
  note: "59 of 522 commits in the paired window; 0.6% of non-generated source additions. Contributor, not owner.",
};

/* --------------------------------------------------------------------------
 * Identity
 * -------------------------------------------------------------------------- */

const person: Person = {
  firstName: "Razvan",
  lastName: "Calota",
  name: "Razvan Calota",
  role: "Full-Stack TypeScript Engineer",
  // Supplied 2026-09-09. Source was 692x692; this is a 400x400 head-and-shoulders
  // crop, because Once UI renders Avatar as a circle and the original was framed
  // as a full torso shot. The uncropped original is at /images/profile-full.jpeg.
  // Next.js serves this as WebP/AVIF automatically - no manual conversion needed.
  avatar: "/images/avatar.jpeg",
  email: "calotarazvan27@gmail.com",
  // Drives the header clock only. Never printed — see `displayLocation`.
  location: "Europe/Bucharest",
  displayLocation: "Bucharest, RO",
  // TODO(razvan): list the languages you actually want shown. Left empty rather
  // than guessed; an empty array renders nothing.
  // TODO(razvan): confirm. Inferred from Bucharest + a Romanian-language LinkedIn profile.
  languages: ["Romanian", "English"],
  locale: "en",
};

const social: Social = [
  // An empty `link` renders nothing — that is deliberate. A broken profile link
  // is worse than a missing one, and guessing a handle would be inventing a fact.
  {
    name: "GitHub",
    icon: "github",
    // TODO(razvan): your GitHub profile URL. OWNERSHIP.md sees the handle
    // `kforkenzor` in commit trailers, but that is not confirmed as your public profile.
    link: "",
    essential: true,
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/razvan-calota-63492424a/",
    essential: true,
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
    essential: true,
  },
];

/* --------------------------------------------------------------------------
 * Home
 * -------------------------------------------------------------------------- */

const home: Home = {
  path: "/",
  // Empty on purpose: Meta.generate falls back to /api/og/generate, which draws
  // the card from `person` at request time. That is the right default for a
  // skeleton — a stale hand-made image is worse than a generated one.
  // TODO(razvan): optional. If you want a hand-made preview card, put a
  // 1200x630 file under /public/images/og/ and name it here (SPEC.md §8.8 #7).
  image: "",
  label: "Home",
  title: `${person.name} — ${person.role}`,
  description: `Portfolio of ${person.name}, ${person.role.toLowerCase()}.`,
  headline: <>Full-stack TypeScript, from the screen to the schema</>,
  featured: {
    display: true,
    title: (
      <Row gap="8" vertical="center">
        <strong className="ml-4">AI Newsletter Delivery &amp; Operations Platform</strong>
        <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          Featured Project
        </Text>
      </Row>
    ),
    href: "/work/yt-newsletter-backend",
  },
  subline: (
    <>
      I'm {person.firstName}. I build the interfaces people actually use — React and Next.js —
      and the TypeScript services, workers and schemas that sit behind them.
    </>
  ),
};

/* --------------------------------------------------------------------------
 * About — the CV page. Rendered from this object only, no MDX.
 * -------------------------------------------------------------------------- */

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} based in ${person.displayLocation}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  contactCta: {
    display: true,
    label: "Let's get in touch",
    /**
     * Mailto, because it is a channel Razvan already owns and it works today.
     *
     * TODO(razvan): swap for your own Cal.com / Calendly URL if you want people to book
     * a slot directly, and change `icon` to "calendar". Do NOT reuse the reference site's
     * link (cal.com/blancbo/30min) — that books time with Bogdan, not you.
     */
    link: `mailto:${person.email}`,
    icon: "email",
  },
  intro: {
    display: true,
    title: "Introduction",
    tags: [
      { name: "TypeScript", icon: "typescript" },
      { name: "React", icon: "react" },
      { name: "Next.js", icon: "nextjs" },
      { name: "NestJS", icon: "nestjs" },
    ],
    description: (
      <>
        {/* Hook — the line directly under his name. Supplied by Razvan 2026-09-10. */}
        <Text as="p">
          I build full-stack TypeScript systems — from the interfaces people use to the APIs,
          workers and data behind them.
        </Text>

        <Text as="p" onBackground="neutral-weak">
          I&rsquo;m a full-stack TypeScript engineer focused on building production systems that
          connect frontend interfaces, backend services, automation, data and AI into one working
          product. I work mostly with TypeScript, React, Next.js, Node.js, NestJS, PostgreSQL,
          Supabase, Redis and BullMQ.
        </Text>

        <Text as="p" onBackground="neutral-weak">
          Since November 2024, I&rsquo;ve been working with Eleventh House Marketing on a production
          email marketing, content and analytics platform. My work spans the operational
          dashboards used to run it, backend services and REST APIs, scheduled and queue-based
          processing, email-provider integrations, audience segmentation, deliverability,
          analytics and revenue attribution. I like building software where the interface
          doesn&rsquo;t just display what happened — it can change what the system does next.
        </Text>

        <Text as="p" onBackground="neutral-weak">
          AI is a core part of how I build. I&rsquo;ve integrated LLM workflows into production
          features for content generation, classification and marketing automation, and I also use
          advanced AI-assisted engineering workflows to break down problems, understand large
          codebases, plan implementations and move faster without giving up architectural control.
        </Text>

        <Text as="p" onBackground="neutral-weak">
          Outside client work, I design and build systems end to end. One recent project is a
          twelve-stage short-form content pipeline built with NestJS, BullMQ, Next.js, Supabase
          Postgres, Drizzle and Remotion. Each stage has its own retry and failure boundary, and
          generated content cannot be published without a mandatory human review step.
        </Text>

        <Text as="p" onBackground="neutral-weak">
          I&rsquo;m interested in teams building serious web products, automation platforms and
          AI-enabled systems where I can work across the stack, solve difficult engineering problems
          and take real ownership of what reaches production.
        </Text>
      </>
    ),
  },

  achievements: {
    display: true,
    title: "Key Achievements",
    // Cards supplied by Razvan 2026-09-10, replacing the three short-form-only cards.
    // Each still carries the measured ownership block for the project behind it, so the
    // card and its provenance render together. Cards 1 and 2 are backed by
    // yt-newsletter-backend (70 of 1,068 commits, 6 authors — see OWNERSHIP.md); the
    // gap between that measurement and the scope described is his call, recorded at the
    // matching entry in `projects`.
    // TODO(razvan): content-spec.md §4.2 wants 5–7 cards. Four exist. A fifth arrives
    // when yt-blog gets a live URL or a measurable repo.
    items: [
      {
        id: "newsletter-operations-platform",
        icon: "server",
        title: "Production Newsletter & Operations Platform",
        body: "Built and maintained a full-stack TypeScript platform spanning a Next.js operations dashboard and NestJS backend services, connecting scheduled delivery, audience segmentation, analytics, revenue attribution and configuration into one operational system.",
        projects: ["yt-newsletter-backend"],
        provenance: "proven",
        ownership: newsletterOwnership,
      },
      {
        id: "multi-provider-email",
        icon: "email",
        title: "Multi-Provider Email Infrastructure",
        body: "Worked across production sending workflows integrating Postmark, Mailgun, Mailjet, SMTP.com and Resend, including provider configuration, scheduled segmentation, webhook handling and deliverability operations.",
        projects: ["yt-newsletter-backend"],
        provenance: "proven",
        ownership: newsletterOwnership,
      },
      {
        id: "ai-engineering-automation",
        icon: "sparkles",
        title: "AI-Driven Engineering & Automation",
        body: "Integrate LLMs into production content workflows while orchestrating advanced AI-assisted engineering processes to analyze large codebases, decompose complex problems, plan implementations and accelerate delivery across the stack.",
        // Spans both codebases: the production LLM work sits in yt-newsletter-backend,
        // the AI-assisted engineering practice is most evident in the sole-authored
        // short-form platform, whose ownership block is the one shown.
        projects: ["short-form-content-platform", "yt-newsletter-backend"],
        provenance: "proven",
        ownership: shortFormOwnership,
      },
      {
        id: "twelve-stage-pipeline",
        icon: "queue",
        title: "Twelve-Stage Content Pipeline",
        body: "Architected a short-form content platform as twelve independent BullMQ processing stages with isolated retry boundaries, a mandatory human review gate and a secured Supabase Postgres data layer.",
        projects: ["short-form-content-platform"],
        provenance: "proven",
        ownership: shortFormOwnership,
      },
    ],
  },

  work: {
    display: true,
    title: "Work Experience",
    // Source: Razvan's LinkedIn Experience section, supplied 2026-09-09. Employment facts
    // (employer, title, dates, location, employment type) are his and are authoritative.
    //
    // NOTE ON THE EVIDENCE GATE: `Experience` intentionally carries no `provenance`/`ownership`
    // field, so the gate in components/about/evidence.ts does NOT filter this section. Job
    // descriptions are a person's account of their own role, not a per-commit attribution.
    // Two bullets below are nonetheless marked, because OWNERSHIP.md measured the repos behind
    // them and the commit record does not support them. Read those notes before publishing.
    experiences: [
      {
        company: "Eleventh House Marketing",
        descriptor: "Email marketing, content and analytics platform",
        location: "Remote",
        start: "Nov 2024",
        end: null,
        title: "Full-Stack Software Engineer",
        timeframe: "Nov 2024 - Present",
        role: "Full-Stack Software Engineer (Freelance)",
        bullets: [
          "Build and maintain a production email marketing, content and analytics platform in TypeScript, on Node.js, NestJS, Next.js, React, PostgreSQL, Supabase, Redis and BullMQ.",
          "Develop backend services and REST APIs for email delivery, automation, analytics, webhooks, affiliate revenue attribution and third-party integrations.",
          "Engineer asynchronous and scheduled workflows on BullMQ, Redis and cron, including queue-based processing, retries and automated daily operations.",
          "Design PostgreSQL and Supabase schemas, SQL functions, aggregations and data pipelines behind campaign, subscriber and revenue data.",
          "Integrate OpenAI and LLM workflows for structured content generation, classification, newsletter creation, subject lines and marketing copy.",
          // TODO(razvan): VERIFY BEFORE PUBLISHING. OWNERSHIP.md measures yt-admin-dashboard at
          // 2 of 175 commits yours, and 0 since 2025-07-01. This bullet describes that dashboard.
          // Keep it only if you did dashboard work that never landed under your git identity —
          // and be ready for the follow-up. Otherwise cut it or narrow it to what you shipped.
          "Build Next.js and React operational dashboards for monitoring sends, opens, clicks, bounces, revenue and domain reputation, and for managing routing rules, audience segments and warmup settings.",
          // TODO(razvan): VERIFY BEFORE PUBLISHING. The ESP-integration half is supported — your
          // "Mailjet ESP Integration" commit (2025-06-02) is real, and you configured the Postmark,
          // Mailgun and Resend consumers. The deliverability half is not: you have ZERO commits
          // touching SPF, DKIM, DMARC, warmup, Postmaster, Cloudflare or DNS. Suggested safe
          // rewrite: "Integrate email service providers and configure provider-level send routing
          // across Postmark, Mailgun, Mailjet and Resend."
          "Integrate multiple email service providers and build deliverability infrastructure around ESP routing, SPF, DKIM, DMARC, sending domains, Google Postmaster and one-click unsubscribe.",
          "Orchestrate AI-assisted engineering workflows to decompose technical problems, analyse large codebases, plan and validate implementations, and automate repetitive development work across frontend, backend and infrastructure.",
        ],
        achievements: [],
        images: [],
      },
      {
        company: "Freelance | Self-Employed",
        descriptor: "Client web and mobile applications",
        location: "Bucharest, RO - Remote",
        start: "Oct 2021",
        end: "Nov 2024",
        title: "Full-stack Developer",
        timeframe: "Oct 2021 - Nov 2024",
        role: "Full-stack Developer",
        bullets: [
          "Deliver web applications and websites for clients across frontend, backend, databases and third-party integrations - 10+ shipped.",
          "Develop full-stack applications in TypeScript on React, Next.js, Node.js and NestJS, over PostgreSQL or MongoDB depending on the project.",
          "Build reusable, responsive frontend architectures with React, Next.js, Tailwind CSS and Redux Toolkit.",
          "Design backend APIs, authentication flows, database models and application architecture for client projects.",
          "Integrate external services including Stripe payments, real-time messaging, notifications, maps, location services and media uploads.",
          "Ship mobile applications with React Native and Expo, adapting to existing codebases and to teams of varying size.",
        ],
        achievements: [],
        images: [],
      },
      {
        company: "BLV Development",
        // TODO(razvan): one-clause descriptor of what BLV Development does. Not derivable
        // from anything on this machine.
        descriptor: "TODO(razvan): what BLV Development does",
        location: "Bucharest, RO - Hybrid",
        start: "Apr 2021",
        end: "Nov 2021",
        title: "Frontend Developer",
        timeframe: "Apr 2021 - Nov 2021",
        role: "Frontend Developer",
        bullets: [
          "Built 4 websites and 1 mobile app with React, Next.js, React Native with Expo and Tailwind CSS.",
          "Created flexible application architectures with reusable, modifiable components.",
          "Built a reusable source-code library: sign-up and login flows with Yup and Formik validation, dashboard systems for task, user and product management, and boilerplates for Next.js, React, React Native and Node.js.",
          "Integrated Stripe payments and WebSockets for live messaging.",
        ],
        achievements: [],
        images: [],
      },
    ],
  },

  studies: {
    display: true,
    title: "Education",
    institutions: [
      {
        name: "Bucharest University of Economic Studies (ASE)",
        description: (
          <>
            Faculty of Cybernetics, Statistics and Economic Informatics — Economic Informatics,
            2018&ndash;2021.
          </>
        ),
      },
    ],
  },

  technical: {
    display: true,
    title: "Technical Skills",
    // Order follows the full-stack positioning, not content-spec.md §4.5's specialist
    // ordering. Sentences are §4.5's, except where OWNERSHIP.md contradicts them —
    // see the TODOs on Frontend and Email.
    skills: [
      {
        id: "frontend",
        label: "Frontend & Application Architecture",
        title: "Frontend & Application Architecture",
        // TODO(razvan): content-spec.md §4.5's sentence for this category reads:
        // "Building web applications with Next.js and React Server Components, using Server
        // Actions, Suspense streaming, edge middleware and design systems on Radix and
        // shadcn/ui." Server Actions, Suspense streaming, edge middleware, Radix and
        // shadcn/ui all trace to yt-admin-dashboard, which OWNERSHIP.md measures at 2 of
        // 175 commits — not yours. Restore any clause you can point at in a repo you wrote.
        description:
          "Building web applications with Next.js App Router and React Server Components in TypeScript, including review and operator interfaces that ship from the same monorepo as the services behind them.",
        technologies: ["TypeScript", "Next.js", "React", "React Server Components"],
        projects: ["short-form-content-platform"],
        tags: [
          { name: "Next.js", icon: "nextjs" },
          { name: "React", icon: "react" },
          { name: "TypeScript", icon: "typescript" },
        ],
        images: [],
      },
      {
        id: "backend",
        label: "Backend & API Development",
        title: "Backend & API Development",
        description:
          "Building production backend services and REST APIs with TypeScript, Node.js and NestJS, including modular architectures, DTO validation, webhook ingestion and third-party integration layers.",
        technologies: ["TypeScript", "Node.js", "NestJS", "REST", "Zod"],
        projects: ["short-form-content-platform", "yt-newsletter-backend"],
        tags: [
          { name: "TypeScript", icon: "typescript" },
          { name: "Node.js", icon: "nodejs" },
          { name: "NestJS", icon: "nestjs" },
          { name: "Zod", icon: "zod" },
        ],
        images: [],
      },
      {
        id: "databases",
        label: "Databases & Distributed Systems",
        title: "Databases & Distributed Systems",
        description:
          "Designing data around PostgreSQL, Supabase and Redis, including SQL and PL/pgSQL functions, aggregation pipelines, caching strategies and BullMQ-backed distributed job processing.",
        technologies: ["PostgreSQL", "Supabase", "Drizzle ORM", "Redis", "BullMQ"],
        projects: ["short-form-content-platform"],
        tags: [
          { name: "PostgreSQL", icon: "postgresql" },
          { name: "Supabase", icon: "supabase" },
          { name: "Drizzle", icon: "drizzle" },
          { name: "Redis", icon: "redis" },
        ],
        images: [],
      },
      {
        id: "ai",
        label: "AI & LLM Integration",
        title: "AI & LLM Integration",
        description:
          "Integrating OpenAI into production systems with Zod-validated structured outputs, from content generation and classification pipelines to streaming conversational interfaces.",
        technologies: ["OpenAI", "Zod", "MCP", "Structured outputs"],
        projects: ["short-form-content-platform", "yt-newsletter-backend"],
        tags: [
          { name: "Zod", icon: "zod" },
          { name: "MCP", icon: "sparkles" },
        ],
        images: [],
      },
      {
        id: "automation",
        label: "Automation & Platform Engineering",
        title: "Automation & Platform Engineering",
        description:
          "Building scheduled workflows, event-driven automations, multi-tenant and multi-domain architectures, CI/CD pipelines and production deployment on Linux infrastructure.",
        technologies: ["Turborepo", "pnpm", "GitHub Actions", "BullMQ", "Cron"],
        projects: ["short-form-content-platform", "yt-newsletter-backend"],
        tags: [
          { name: "Turborepo", icon: "turborepo" },
          { name: "CI/CD", icon: "check" },
        ],
        images: [],
      },
      {
        id: "email",
        label: "Email Infrastructure & Deliverability",
        title: "Email Infrastructure & Deliverability",
        // TODO(razvan): content-spec.md §4.5's sentence for this category reads:
        // "Engineering high-volume email delivery across multiple providers, with ISP-aware
        // routing, sending-domain isolation, IP warmup scheduling, DNS and authentication
        // provisioning, and reputation monitoring." OWNERSHIP.md contradicts it directly —
        // no SPF/DKIM/Cloudflare/warmup commits are yours, and the deliverability card was
        // cut for that reason. The sentence below is your measured scope. Widen it only
        // with commits to point at.
        description:
          "Integrating and configuring email service providers — Postmark, Mailgun and Resend — inside a high-volume production sending platform, covering consumer configuration, webhook ingestion and send segmentation.",
        technologies: ["Postmark", "Mailgun", "Resend"],
        projects: ["yt-newsletter-backend"],
        tags: [
          { name: "Postmark", icon: "email" },
          { name: "Mailgun", icon: "email" },
          { name: "Resend", icon: "email" },
        ],
        images: [],
      },
    ],
  },
};

/* --------------------------------------------------------------------------
 * Projects — content-spec.md §4.4
 *
 * The gate: an entry with `provenance: 'unverified'` or no `ownership` must not
 * render. yt-blog is in this array precisely so it is not forgotten, and precisely
 * so it does not ship.
 * -------------------------------------------------------------------------- */

const projects: Project[] = [
  {
    slug: "yt-blog",
    name: "Multi-Brand Content & AI Platform",
    summary:
      "A multi-domain publishing platform combining server-rendered content, headless CMS workflows, technical SEO and an authenticated streaming AI assistant.",
    description:
      "Built a Next.js 14 platform using React Server Components and TypeScript, designed to serve multiple brands from a shared application architecture. Content is managed through Sanity and incrementally revalidated through signed webhooks, while Supabase provides server-side authentication. The platform also includes an edge-streamed AI assistant, dynamic social assets, structured SEO data and secure redirect and unsubscribe flows.",
    role: "Full-Stack Developer \u00b7 Next.js platform",
    teamShape: "Solo",
    stack: [
      "TypeScript",
      "React",
      "Next.js",
      "Tailwind CSS",
      "Sanity",
      "Supabase",
      "Vercel AI SDK",
      "Technical SEO",
    ],
    highlights: [
      "Architected multi-domain tenancy across middleware, Server Components and application context, allowing brand-specific content and configuration from a shared codebase.",
      "Built a streaming AI assistant using the Vercel AI SDK, OpenAI and edge-runtime streaming with Supabase-authenticated access.",
      "Integrated Sanity CMS with GROQ queries and webhook-driven cache revalidation for fast, independently managed publishing workflows.",
      "Built the technical SEO layer with typed JSON-LD, dynamic metadata, RSS, programmatic sitemaps and dynamically generated Open Graph images.",
      "Hardened the unsubscribe flow after email security scanners were auto-unsubscribing recipients: GET requests now only reach a confirmation screen, and the mutation runs solely on an explicit POST.",
    ],
    // Confirmed 2026-09-10: this codebase IS wellnessinbox.com. src/middleware.ts:6-11
    // declares DOMAIN_CONFIG with "home-services.wellnessinbox.com" as a tenant, and
    // "wellnessinbox" appears across five source files. Every technical claim above was
    // read out of that source: middleware.ts:23-33 (host -> domainInfo cookie routing),
    // api/chat/route.ts (runtime = "edge" assistant), lib/sanity/ (GROQ + revalidate),
    // utils/supabase/server.ts (SSR auth), lib/og-image.ts (HMAC-signed OG endpoint),
    // api/unsubscribe/[id]/route.ts (GET hardening).
    // ~/Downloads/yt-blog-main has no .git, so authorship still cannot be MEASURED -
    // hence "deployed" and not "proven". The live site is the evidence.
    links: [
      { label: "Visit wellnessinbox.com", href: "https://www.wellnessinbox.com/" },
    ],
    provenance: "deployed",
  },
  {
    slug: "qr-advanced",
    name: "QR Advanced",
    summary:
      "A dynamic QR platform where the destination is a routing decision made at scan time, not a value baked into the print run.",
    description:
      "A static QR code commits you to one destination the moment it is printed. QR Advanced puts a routing layer behind the code instead: the same printed symbol resolves differently by country, device, or schedule, and the destination can be changed after the campaign is in the wild. Around that sit campaign management, a landing page builder, and scan analytics with conversion tracking. Built as a Next.js application on Vercel, with a marketing site of twenty-plus routes covering six feature areas and six industry solutions.",
    role: "Sole developer",
    teamShape: "Solo \u2014 my own product",
    stack: [
      "TypeScript",
      "React",
      "Next.js",
      "Vercel",
    ],
    highlights: [
      "Made the QR destination a runtime routing decision, so a printed code can be repointed without reprinting.",
      "Built rule-based routing on country, device type and schedule, with A/B splitting on the paid tiers.",
      "Shipped scan analytics with conversion tracking and per-tier retention windows.",
      "Structured four pricing tiers around dynamic scan volume rather than code count, so the free tier stays genuinely usable.",
    ],
    links: [{ label: "Visit qradvanced.com", href: "https://qradvanced.com/" }],
    provenance: "deployed",
  },
  {
    slug: "yt-newsletter-backend",
    name: "AI Newsletter Delivery & Operations Platform",
    summary:
      "A production email platform that turns content into targeted newsletters, delivers them across multiple providers, measures engagement and revenue, and feeds those results back into the next send.",
    description:
      "Built and maintained a TypeScript full-stack system spanning a NestJS delivery engine and a Next.js operations dashboard. The platform handles scheduled campaigns, audience segmentation, multi-provider email delivery, webhook ingestion, deliverability monitoring, affiliate revenue attribution and AI-assisted content workflows. The dashboard closes the loop by turning send, engagement and revenue data into routing, segmentation and warmup decisions that directly control future sends.",
    role: "Full-Stack Software Engineer \u00b7 Production platform \u00b7 Backend + operations dashboard",
    teamShape: "Six authors; paired from July 2025",
    stack: [
      "TypeScript",
      "Next.js",
      "NestJS",
      "PostgreSQL",
      "Supabase",
      "BullMQ",
      "Redis",
      "OpenAI",
    ],
    highlights: [
      "Integrated and maintained multiple email providers including Postmark, Mailgun, Mailjet, SMTP.com and Resend, covering send consumers, provider configuration and migration workflows.",
      "Built scheduled newsletter and recipient-segmentation workflows across brands, audience segments and provider-specific sending configurations.",
      "Developed operational tooling for ESP routing, ISP segmentation, sending-domain configuration, warmup controls and deliverability monitoring.",
      "Integrated affiliate networks, advertising data, webhooks and revenue-attribution workflows to connect campaign activity with downstream revenue.",
      "Built and maintained analytics surfaces for sends, opens, clicks, bounces, complaints, revenue and domain reputation, with configuration changes feeding directly back into the sending system.",
    ],
    // The sending engine and the ops dashboard are private client codebases. WellnessInbox
    // is the public surface the platform sends for, so it is the one part that can be shown.
    links: [
      { label: "See it live: wellnessinbox.com", href: "https://www.wellnessinbox.com/" },
    ],
    ownership: newsletterOwnership,
    provenance: "proven",
    // NOTE (2026-09-10): copy supplied by Razvan, replacing the narrower measured-scope
    // version. He has seen OWNERSHIP.md and chose this framing; it is his CV and his call.
    // Recorded here so the gap is visible to whoever edits next, not to re-litigate it:
    //   - Highlight 3 (ESP routing, sending-domain config, warmup, deliverability monitoring):
    //     zero commits of his touch SPF, DKIM, DMARC, warmup, Postmaster, Cloudflare or DNS.
    //   - Highlight 5 (analytics surfaces) and "a Next.js operations dashboard" in the
    //     description: that is yt-admin-dashboard, measured at 2 of 175 commits, 0 since
    //     July 2025.
    // The `ownership` block above still renders "70 of 1,068 commits - 6 authors" beside
    // this copy, so the page does not overstate silently.
  },
  {
    slug: "short-form-content-platform",
    name: "Short-Form Content Platform",
    summary:
      "An AI-assisted production pipeline that transforms source video into reviewed and published short-form content through twelve independently managed processing stages.",
    description:
      "Designed and built a pnpm/Turborepo platform consisting of a NestJS API, a twelve-stage BullMQ processing pipeline, a Next.js review interface, Remotion rendering and an MCP tool layer for scoring and content selection. Each production stage has its own retry and failure boundary, while a mandatory human approval gate separates generated output from publication. Data is stored in Supabase Postgres through Drizzle with row-level security enforced across the schema. Designed and architected independently, using agent-assisted engineering to accelerate implementation.",
    role: "Sole author & architect \u00b7 AI-assisted development",
    teamShape: "Solo",
    stack: [
      "TypeScript",
      "Next.js",
      "NestJS",
      "BullMQ",
      "Drizzle ORM",
      "Supabase",
      "Remotion",
      "Turborepo",
      "Zod",
      "MCP",
    ],
    highlights: [
      "Architected the content workflow as twelve independent BullMQ processors, isolating retries and failures at each stage rather than treating production as one monolithic job.",
      "Built a mandatory human review gate between rendering and publication so generated assets cannot ship without approval.",
      "Designed the Drizzle/Postgres data layer with row-level security on every table, backed by CI assertions that prevent unsecured schemas from being merged.",
      "Exposed scoring, deduplication and daily content selection through MCP tools, keeping decision logic reusable outside the worker pipeline.",
      "Structured the platform as a monorepo spanning API, workers, review UI, rendering and automation while using AI-assisted engineering throughout implementation.",
    ],
    // TODO(razvan): repo and demo links (~/Documents/autmated content creation is private).
    links: [],
    ownership: shortFormOwnership,
    provenance: "proven",
  },
  {
    slug: "techno-music-world",
    name: "Techno Music World",
    summary:
      "A global techno discovery platform \u2014 events, artists, news, editorial and a glossary \u2014 published from a headless CMS and wired for music-specific structured data.",
    description:
      "A Next.js content platform for the global techno scene. Six content sections \u2014 events, artists, music, news, articles and a glossary \u2014 are authored in Sanity and server-rendered, each with its own route tree. The structured-data layer is the unusual part: rather than generic Article markup, pages emit music-domain schema.org types so that artists, releases and listings are machine-readable to search engines.",
    // TODO(razvan): your role. You told me this was a partial contribution, not the whole
    // build, and nothing in the served HTML can tell me which parts were yours. Name the
    // areas you actually owned and this becomes a real sentence. Until then it is a
    // placeholder, not a claim.
    role: "TODO(razvan): the specific areas you built",
    teamShape: "TODO(razvan): shared codebase \u2014 contribution scope not yet stated",
    // Verified 2026-09-16 by reading the served HTML of https://technomusicworld.com/:
    // `/_next/static/` and `/_next/image?url=` (Next.js), 394 `cdn.sanity.io` references
    // against project `wn8y9ec7` (Sanity), Tailwind utility classes including custom
    // `text-theme-*` tokens, self-hosted Atiga woff2 faces, and JSON-LD carrying
    // MusicGroup, MusicRecording, ItemList, SearchAction, Organization and WebSite.
    // TypeScript is NOT listed: it is likely, but a served page cannot prove it.
    stack: ["React", "Next.js", "Sanity", "Tailwind CSS", "Structured Data"],
    // TODO(razvan): highlights are claims about YOUR work, so they cannot be written from
    // the outside of a site you partly contributed to. Three or four, verb-first, one
    // concrete anchor each, scoped to what you did rather than what the platform does.
    highlights: [],
    links: [{ label: "Visit technomusicworld.com", href: "https://technomusicworld.com/" }],
    // "deployed" because the live site is the only evidence reachable from here \u2014 there is
    // no repo on this machine to measure. Note the type's own warning: authorship under
    // this provenance is ASSERTED, not measured. For a partial contribution that is a
    // weaker footing than it is for a solo product, which is exactly why `role` and
    // `highlights` above stay empty rather than being filled in with plausible guesses.
    // Upgrade to "proven" the moment the repo is reachable.
    provenance: "deployed",
  },
];

/* --------------------------------------------------------------------------
 * Presentation websites — content-spec.md §1
 *
 * Smaller client sites, shown as compact cards rather than full case studies. Kept
 * separate from `projects` on purpose: mixing a brochure site in with the platform
 * work flattens both. Same evidence gate applies.
 * -------------------------------------------------------------------------- */

const presentationSites: PresentationSite[] = [
  {
    slug: "casa-teo",
    name: "Casa Teo Mahmudia",
    category: "Hospitality",
    summary:
      "A bilingual guesthouse site for a Danube Delta property, where every Romanian page and its English twin are generated from one shared route table — so the two languages cannot drift apart.",
    stack: ["TypeScript", "React", "Vite", "Tailwind CSS v4", "NestJS", "Supabase"],
    images: [
      "/images/projects/casa-teo/1.png",
      "/images/projects/casa-teo/2.png",
      "/images/projects/casa-teo/3.png",
    ],
    // 0 commits, 0 remotes, 0 other authors, source read on this machine 2026-09-10.
    soleAuthor: {
      commits: 0,
      contributors: 0,
      remotes: 0,
      files: 109,
      lines: 6227,
      inspected: "2026-09-10",
    },
    provenance: "self-authored",
  },
];

/* --------------------------------------------------------------------------
 * Work route — the Projects index at /work
 * -------------------------------------------------------------------------- */

const work: Work = {
  path: "/work",
  label: "Work",
  title: `Projects – ${person.name}`,
  description: `Projects by ${person.name}, each with its measured ownership recorded alongside it.`,
  // Case studies are MDX files in src/app/work/projects/ — one per slug in
  // `projects` above, minus anything the evidence gate drops. Two exist:
  // short-form-content-platform.mdx and yt-newsletter-backend.mdx, both
  // skeletons whose section bodies are TODO(razvan) markers.
  // TODO(razvan): add one .mdx per new project. The filename IS the route slug.
};

export { person, social, home, about, projects, presentationSites, work };
