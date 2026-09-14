import type { IconName } from "@/resources/icons";
import type { zones } from "tzdata";

/**
 * IANA time zone string (e.g., 'Europe/Bucharest', 'Europe/Vienna').
 * See: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 */
export type IANATimeZone = Extract<keyof typeof zones, string>; // Narrow to string keys for React usage

/**
 * An image reference used inside about-page sections.
 * `width` / `height` are RATIO numbers (e.g. 16 / 9), not pixels — they are fed
 * to `minWidth` / `height` on the wrapping Once UI `Row`.
 */
export type ContentImage = {
  /** Image source path, relative to `/public` */
  src: string;
  /** Image alt text */
  alt: string;
  /** Image width ratio */
  width: number;
  /** Image height ratio */
  height: number;
};

/**
 * A short label rendered as an Once UI `Tag`.
 */
export type ContentTag = {
  name: string;
  icon?: IconName;
};

/* -------------------------------------------------------------------------- */
/* Evidence model — content-spec.md §3 and §5                                  */
/* -------------------------------------------------------------------------- */

/**
 * How well a claim is evidenced.
 *
 * - `proven`            — read in code, file:line cited
 * - `backend-verified`  — proven in a repo a different session inspected
 * - `unverified`        — described but never inspected
 *
 * Only `proven` and `backend-verified` may render. `unverified` stays in the
 * data with a TODO. See content-spec.md §6.
 */
export type Provenance =
  /** Read line-by-line in a repo on this machine, with `ownership` measured from git. */
  | "proven"
  /** Proven in a repo a different session inspected. */
  | "backend-verified"
  /**
   * A live product Razvan owns, where the repo is not reachable from this machine.
   * The artifact is public and anyone can inspect it, but authorship is ASSERTED,
   * not measured — so a `deployed` entry must carry a live link, and must never be
   * presented as if a commit measurement backs it. Upgrade to "proven" the moment
   * the repo is available.
   */
  | "deployed"
  /**
   * A solo project whose source lives on this machine and was read directly, but which
   * has no git history to measure — typically because it has never been committed.
   * Requires `soleAuthor` evidence: zero other contributors, no remote, and a file/line
   * count taken from the working tree. Distinct from "proven" precisely because no
   * commit measurement exists; it is not a way around the gate, it is the honest shape
   * of the evidence when a repo has no history yet.
   */
  | "self-authored"
  /** Described but never inspected. Never renders. */
  | "unverified";

/**
 * Measured authorship of a codebase. Separate from {@link Provenance}:
 * provenance says the code exists, ownership says who wrote it.
 *
 * Numbers come from OWNERSHIP.md and are `git log HEAD` measurements, never estimates.
 * Anything drawn from a project with no `ownership` block must not render.
 */
/**
 * Evidence for a `self-authored` entry — the working-tree equivalent of {@link Ownership}.
 * Every field is a fact checked on this machine, not an assertion.
 */
export type SoleAuthor = {
  /** Commits on all refs. Zero means the project was never committed. */
  commits: number;
  /** Distinct commit authors. Must be 0 or 1 for this tier to apply. */
  contributors: number;
  /** Configured git remotes. */
  remotes: number;
  /** Source files in the working tree. */
  files: number;
  /** Source lines in the working tree. */
  lines: number;
  /** When the source was read, e.g. "2026-09-10". */
  inspected: string;
};

/**
 * A smaller client / presentation website — the kind that is worth showing but does not
 * carry a full case study. Rendered as a compact card in its own section, separately from
 * `Project`, so the main Projects list stays reserved for substantial engineering work.
 *
 * Goes through the same evidence gate as everything else.
 */
export type PresentationSite = {
  slug: string;
  /** Public-facing name */
  name: string;
  /** Short category label, e.g. "Hospitality" */
  category: string;
  /** One line — what it is and what is notable about it */
  summary: string;
  /** Technology tags */
  stack: string[];
  /** Screenshot paths under /public */
  images: string[];
  /** Live site, if one exists */
  href?: string;
  provenance: Provenance;
  ownership?: Ownership;
  soleAuthor?: SoleAuthor;
};

export type Ownership = {
  /** Commits authored by Razvan on HEAD */
  myCommits: number;
  /** Total commits on HEAD */
  totalCommits: number;
  /** Distinct authors on HEAD */
  contributors: number;
  /** Date window of his commits, e.g. "2026-08-24 → 2026-08-25" */
  window: string;
  /** Pairing note, e.g. "coworker, from 2025-07-01" */
  pairedWith?: string;
  /** Any caveat that must travel with the numbers */
  note?: string;
};

/**
 * A Key Achievements card. Title is a noun phrase of 3–5 words; `body` is one
 * sentence carrying at least one anchor (a number, a named technology, a named system).
 */
export type Achievement = {
  /** Stable id, also usable as a DOM anchor */
  id: string;
  /** Optional leading icon — must exist in `src/resources/icons.ts` */
  icon?: IconName;
  /** Noun phrase, 3–5 words */
  title: string;
  /** One sentence, must contain an anchor */
  body: string;
  /** Slugs of the projects backing this card. Must be non-empty. */
  projects: string[];
  provenance: Provenance;
  /** Required before the card may render — see content-spec.md §3 */
  ownership?: Ownership;
};

/**
 * One row of the Technical Skills section.
 * `description` is one sentence, 20–30 words, naming 3–6 real technologies.
 * `projects` MUST be non-empty (content-spec.md §6) — a category with no backing
 * project is deleted, not softened.
 */
export type SkillCategory = {
  id: string;
  label: string;
  description: string;
  technologies: string[];
  projects: string[];
};

/**
 * A Technical Skills row as the /about page consumes it: a {@link SkillCategory}
 * plus the presentational fields the renderer reads.
 */
export type Skill = SkillCategory & {
  /** Rendered heading. ⚠️ ALSO the DOM anchor id. Mirrors `label`. */
  title: string;
  /** Rendered as Once UI `Tag`s under the description */
  tags?: ContentTag[];
  images?: ContentImage[];
};

/**
 * One employment entry (content-spec.md §4.3 / §5).
 */
export type Experience = {
  /** Employer name. ⚠️ ALSO the DOM anchor id on /about. */
  company: string;
  /** One-clause product descriptor, e.g. "Fintech Mortgage Platform" */
  descriptor: string;
  location: string;
  /** e.g. "October 2025" */
  start: string;
  /** `null` means "Present" */
  end: string | null;
  /** Job title */
  title: string;
  /** First bullet is context (what the company does, what he owned, team shape); the rest are verb-first */
  bullets: string[];
};

/**
 * An employment entry as the /about page consumes it: an {@link Experience}
 * plus the presentational fields the renderer reads.
 */
export type ExperienceEntry = Experience & {
  /** Free text rendered on the right, e.g. "October 2025 - Present" */
  timeframe: string;
  /** Rendered role line. Mirrors `title`. */
  role: string;
  /** Rendered bullet list. Mirrors `bullets`, but JSX is allowed. */
  achievements: React.ReactNode[];
  images?: ContentImage[];
};

/**
 * A Selected Projects entry (content-spec.md §4.4).
 *
 * This section exists because his codebases are not his employers' work in the
 * same way the reference site's are — burying them inside job bullets wastes the
 * evidence. An entry with `provenance: 'unverified'` or no `ownership` must not render.
 */
export type Project = {
  /** URL-safe id, also the MDX case-study slug when one exists */
  slug: string;
  /** Public-facing project name */
  name: string;
  /** One line */
  summary: string;
  /** 2–4 sentences */
  description: string;
  /** What he did on it */
  role: string;
  /** Team shape, e.g. "Solo" or "Six authors; paired from July 2025" */
  teamShape: string;
  /** Technology tags */
  stack: string[];
  /** 3–4 highlights, verb-first, one anchor each */
  highlights: string[];
  /** Outbound links (repo, live site, case study) */
  links: Array<{ label: string; href: string }>;
  /** Working-tree evidence, required when provenance is "self-authored" */
  soleAuthor?: SoleAuthor;
  /** Measured authorship. Absent ⇒ the entry must not render. */
  ownership?: Ownership;
  provenance: Provenance;
};

/* -------------------------------------------------------------------------- */
/* Identity                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Represents a person featured in the portfolio.
 */
export type Person = {
  /** First name of the person */
  firstName: string;
  /** Last name of the person */
  lastName: string;
  /** The name you want to display, allows variations like nicknames */
  name: string;
  /** Role or job title */
  role: string;
  /** Path to avatar image */
  avatar: string;
  /** Email address */
  email: string;
  /**
   * IANA time zone id. Drives the header clock ONLY.
   *
   * Upstream printed this string verbatim in the header, which renders as
   * "Europe/Bucharest". `displayLocation` exists so the id never reaches the page.
   */
  location: IANATimeZone;
  /** Human-readable location printed in the header and on /about, e.g. "Bucharest, RO" */
  displayLocation: string;
  /** Languages spoken */
  languages?: string[];
  /**
   * BCP 47 language tag for the HTML lang attribute (e.g., 'en', 'ja', 'zh-TW').
   * Defaults to 'en' if not set.
   * See: https://www.iana.org/assignments/language-subtag-registry
   */
  locale?: string;
};

/**
 * Social link configuration.
 */
export type Social = Array<{
  /** Name of the social platform */
  name: string;
  /** Icon for the social platform
   * The icons are a part of "src/resources/icons.ts" file.
   * If you need a different icon, import it there and reference it everywhere else
   */
  icon: IconName;
  /**
   * The link to the social platform.
   *
   * The link is not validated by code, make sure it's correct.
   * An empty string is rendered by nothing — that is how an unknown handle is
   * carried without shipping a broken link.
   */
  link: string;
  /** Whether this social link is essential and should be displayed on the about page */
  essential?: boolean;
}>;

/* -------------------------------------------------------------------------- */
/* Pages                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Base interface for page configuration with common properties.
 */
export interface BasePageConfig {
  /** Path to the page
   *
   * The path should be relative to the public directory
   */
  path: `/${string}` | string;
  /** Label for navigation or display */
  label: string;
  /** Title of the page */
  title: string;
  /** Description for SEO and metadata */
  description: string;
  /** OG Image should be put inside `public/images` folder */
  image?: `/images/${string}` | string;
}

/**
 * Home page configuration.
 */
export interface Home extends BasePageConfig {
  /** The image to be displayed in metadata
   *
   * The image needs to be put inside `/public/images/` directory
   */
  image: `/images/${string}` | string;
  /** The headline of the home page */
  headline: React.ReactNode;
  /** Featured badge, which appears above the headline */
  featured: {
    display: boolean;
    title: React.ReactNode;
    href: string;
  };
  /** The sub text which appears below the headline */
  subline: React.ReactNode;
}

/**
 * About page configuration.
 * @description The /about route is a full CV rendered from this object only — no MDX.
 */
export interface About extends BasePageConfig {
  /** Table of contents configuration */
  tableOfContent: {
    /** Whether to display the table of contents */
    display: boolean;
    /** Whether to show sub-items in the table of contents */
    subItems: boolean;
  };
  /** Avatar section configuration */
  avatar: {
    /** Whether to display the avatar */
    display: boolean;
  };
  /** The "get in touch" pill under the avatar */
  contactCta: {
    /** Whether to display it */
    display: boolean;
    /** Button text */
    label: string;
    /** Destination — a mailto:, or a Cal.com / Calendly URL */
    link: string;
    /** Leading icon; must be registered in src/resources/icons.ts */
    icon: IconName;
  };
  /** Introduction section — five paragraphs, content-spec.md §4.1 */
  intro: {
    /** Whether to display the introduction */
    display: boolean;
    /** Title of the introduction section. ⚠️ ALSO the DOM anchor id. */
    title: string;
    /** Description of the introduction section */
    description: React.ReactNode;
    /** Optional stack tags rendered under the intro */
    tags?: ContentTag[];
  };
  /** Key Achievements section — content-spec.md §4.2 */
  achievements: {
    display: boolean;
    /** ⚠️ ALSO the DOM anchor id. */
    title: string;
    items: Achievement[];
  };
  /** Work experience section */
  work: {
    /** Whether to display work experience */
    display: boolean;
    /** Title for the work experience section. ⚠️ ALSO the DOM anchor id. */
    title: string;
    /** List of work experiences */
    experiences: ExperienceEntry[];
  };
  /** Studies/education section */
  studies: {
    /** Whether to display studies section */
    display: boolean;
    /** Title for the studies section. ⚠️ ALSO the DOM anchor id. */
    title: string;
    /** List of institutions attended */
    institutions: Array<{
      /** Institution name. ⚠️ ALSO the DOM anchor id. */
      name: string;
      /** Description of studies */
      description: React.ReactNode;
    }>;
  };
  /** Technical skills section — content-spec.md §4.5 */
  technical: {
    /** Whether to display technical skills section */
    display: boolean;
    /** Title for the technical skills section. ⚠️ ALSO the DOM anchor id. */
    title: string;
    /** List of skill categories */
    skills: Skill[];
  };
}

/**
 * Work/projects page configuration.
 * @description Configuration for the Work/Projects page, including metadata and navigation label.
 */
export interface Work extends BasePageConfig {}
