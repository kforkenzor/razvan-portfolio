import type {
  DataStyleConfig,
  DisplayConfig,
  EffectsConfig,
  FontsConfig,
  RoutesConfig,
  StyleConfig,
} from "@/types";

/**
 * Absolute origin used for canonical URLs, OG tags and JSON-LD.
 *
 * Resolution order, first usable value wins:
 *
 *   1. NEXT_PUBLIC_SITE_URL — the real domain, set per deploy environment.
 *   2. NEXT_PUBLIC_VERCEL_URL — injected per-deployment by Vercel, so preview
 *      builds self-reference their own URL instead of advertising production.
 *   3. http://localhost:3000, for local dev.
 *
 * "Usable" is doing real work here. An env var that is *defined but empty* is
 * the default state of a Vercel project whose variable was imported from
 * `.env.example` and never filled in, and `??` does not catch `""`. An empty
 * baseURL reaches Once UI's `Meta.generate`, which does
 * `new URL(base.startsWith("https://") ? base : \`https://${base}\`)` — that is
 * `new URL("https://")`, which throws ERR_INVALID_URL and fails the build while
 * prerendering `/`. So every candidate is trimmed, rejected when blank, given a
 * scheme when it lacks one (Vercel supplies bare hostnames), and parsed before
 * it is trusted.
 *
 * TODO(razvan): set NEXT_PUBLIC_SITE_URL to the real domain once it exists.
 */
function resolveBaseURL(): string {
  // Written as literal `process.env.X` member expressions so the bundler can
  // inline them for the client. Do not refactor into dynamic lookups.
  const candidates = [process.env.NEXT_PUBLIC_SITE_URL, process.env.NEXT_PUBLIC_VERCEL_URL];

  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) continue;

    const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      const { origin, hostname } = new URL(withScheme);
      // `new URL("https://")` throws, but guard the empty-host case anyway.
      if (hostname) return origin;
    } catch {
      // Unparseable: fall through to the next candidate.
    }
  }

  return "http://localhost:3000";
}

const baseURL: string = resolveBaseURL();

const routes: RoutesConfig = {
  "/": true,
  "/about": true,
  "/work": true,
};

const display: DisplayConfig = {
  location: true,
  time: true,
  themeSwitcher: true,
};

// Import and set font for each variant
import { Geist } from "next/font/google";
import { Geist_Mono } from "next/font/google";

const heading = Geist({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const body = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const label = Geist({
  variable: "--font-label",
  subsets: ["latin"],
  display: "swap",
});

const code = Geist_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
});

const fonts: FontsConfig = {
  heading: heading,
  body: body,
  label: label,
  code: code,
};

// default customization applied to the HTML in the main layout.tsx
const style: StyleConfig = {
  theme: "light", // dark | light | system
  neutral: "sand", // sand | gray | slate | mint | rose | dusk | custom (all 7 verified in 1.8.4)
  brand: "emerald", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan | custom
  accent: "moss", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan | custom
  solid: "contrast", // color | contrast | inverse ("inverse" works but is undocumented upstream)
  solidStyle: "flat", // flat | plastic
  border: "playful", // rounded | playful | conservative | sharp (all 4 verified in 1.8.4)
  surface: "translucent", // filled | translucent
  transition: "all", // all | micro | macro
  scaling: "100", // 90 | 95 | 100 | 105 | 110
};

const dataStyle: DataStyleConfig = {
  variant: "gradient", // flat | gradient | outline
  mode: "categorical", // categorical | divergent | sequential
  height: 24, // default chart height
  axis: {
    stroke: "var(--neutral-alpha-weak)",
  },
  tick: {
    fill: "var(--neutral-on-background-weak)",
    fontSize: 11,
    line: false,
  },
};

const effects: EffectsConfig = {
  mask: {
    cursor: false,
    x: 50,
    y: 0,
    radius: 100,
  },
  gradient: {
    display: false,
    opacity: 100,
    x: 50,
    y: 60,
    width: 100,
    height: 50,
    tilt: 0,
    colorStart: "accent-background-strong",
    colorEnd: "page-background",
  },
  dots: {
    display: true,
    opacity: 40,
    size: "2",
    color: "brand-background-strong",
  },
  grid: {
    display: false,
    opacity: 100,
    color: "neutral-alpha-medium",
    width: "0.25rem",
    height: "0.25rem",
  },
  lines: {
    display: false,
    opacity: 100,
    color: "neutral-alpha-weak",
    size: "16",
    thickness: 1,
    angle: 45,
  },
};

/* SPEC.md §12 #23 — the template also exported `schema` and `sameAs` here, and
   nothing read either one. `schema` duplicated `person` and `home` field for
   field; `sameAs` restated the `social` array. Both are gone. The JSON-LD that
   actually ships derives its author and profile links straight from
   `content.tsx`, in src/utils/seo.ts, so there is one source of truth. */

export { display, routes, baseURL, fonts, style, effects, dataStyle };
