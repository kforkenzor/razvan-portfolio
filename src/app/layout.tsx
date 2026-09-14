import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import classNames from "classnames";

import {
  Background,
  Column,
  Flex,
  type Opacity,
  RevealFx,
  type SpacingToken,
} from "@once-ui-system/core";
import { Footer, Header, Providers } from "@/components";
import { effects, fonts, style, dataStyle, home, person } from "@/resources";
import { pageMetadata } from "@/utils/seo";

/**
 * Site-wide metadata defaults. Every page overrides title, description,
 * canonical and OG image; this is what `not-found.tsx` and anything else
 * without its own `generateMetadata` inherits.
 *
 * TODO(razvan): the favicon is still the template's. `src/app/favicon.ico` is a
 * 120x120 PNG with an .ico extension — Next serves it as `image/x-icon` at
 * `sizes="120x120"`, which is not a real icon size. Replace it with a proper
 * multi-size .ico, or delete it and add `icon.png` / `apple-icon.png` (Next's
 * file conventions) alongside this file.
 *
 * TODO(razvan): optional — no `public/manifest.json` and no PWA icons exist
 * (SPEC.md §8.7). Skip unless you actually want installability; the reference
 * site's manifest declared a 1.7 MB non-square PNG as a 512x512 icon, so there
 * is nothing worth copying from it.
 */
export async function generateMetadata() {
  return pageMetadata({
    title: home.title,
    description: home.description,
    path: home.path,
    image: home.image,
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Flex
      suppressHydrationWarning
      as="html"
      lang={person.locale ?? "en"}
      fillWidth
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
      )}
    >
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const root = document.documentElement;
                  // Reads style.theme from once-ui.config.ts. Upstream hardcoded 'system'
                  // here, which silently ignored the config field.
                  const defaultTheme = '${style.theme}';
                  
                  // Set defaults from config
                  const config = ${JSON.stringify({
                    brand: style.brand,
                    accent: style.accent,
                    neutral: style.neutral,
                    solid: style.solid,
                    "solid-style": style.solidStyle,
                    border: style.border,
                    surface: style.surface,
                    transition: style.transition,
                    scaling: style.scaling,
                    "viz-style": dataStyle.variant,
                  })};
                  
                  // Apply default values
                  Object.entries(config).forEach(([key, value]) => {
                    root.setAttribute('data-' + key, value);
                  });
                  
                  // Resolve theme
                  const resolveTheme = (themeValue) => {
                    if (!themeValue || themeValue === 'system') {
                      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                    return themeValue;
                  };
                  
                  // Apply the saved theme, falling back to the configured default.
                  //
                  // SEEDING IS LOAD-BEARING. Setting data-theme alone is not enough:
                  // Once UI's getInitialTheme() deliberately ignores the DOM attribute
                  // and returns "system" whenever localStorage is empty. ThemeProvider's
                  // mount effect then resolves "system" against prefers-color-scheme and
                  // overwrites whatever this script set - so a visitor on a dark OS got
                  // dark no matter what style.theme said.
                  //
                  // Writing the default into localStorage on the first visit makes it
                  // look like a deliberate choice, so every downstream layer agrees.
                  // The toggle still works: it is a normal write to the same key.
                  // (Do NOT "fix" this by passing theme= to ThemeProvider - that is
                  // forced mode and it silently disables the toggle.)
                  let savedTheme = localStorage.getItem('data-theme');
                  if (!savedTheme && defaultTheme !== 'system') {
                    localStorage.setItem('data-theme', defaultTheme);
                    savedTheme = defaultTheme;
                  }
                  const resolvedTheme = resolveTheme(savedTheme || defaultTheme);
                  root.setAttribute('data-theme', resolvedTheme);
                  
                  // Apply any saved style overrides
                  const styleKeys = Object.keys(config);
                  styleKeys.forEach(key => {
                    const value = localStorage.getItem('data-' + key);
                    if (value) {
                      root.setAttribute('data-' + key, value);
                    }
                  });
                } catch (e) {
                  console.error('Failed to initialize theme:', e);
                  var fb = '${style.theme}';
                  if (!fb || fb === 'system') {
                    fb = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', fb);
                }
              })();
            `,
          }}
        />
      </head>
      <Providers>
        <Column
          as="body"
          background="page"
          fillWidth
          style={{ minHeight: "100vh" }}
          margin="0"
          padding="0"
          horizontal="center"
        >
          <RevealFx fill position="absolute">
            <Background
              mask={{
                x: effects.mask.x,
                y: effects.mask.y,
                radius: effects.mask.radius,
                cursor: effects.mask.cursor,
              }}
              gradient={{
                display: effects.gradient.display,
                opacity: effects.gradient.opacity as Opacity,
                x: effects.gradient.x,
                y: effects.gradient.y,
                width: effects.gradient.width,
                height: effects.gradient.height,
                tilt: effects.gradient.tilt,
                colorStart: effects.gradient.colorStart,
                colorEnd: effects.gradient.colorEnd,
              }}
              dots={{
                display: effects.dots.display,
                opacity: effects.dots.opacity as Opacity,
                size: effects.dots.size as SpacingToken,
                color: effects.dots.color,
              }}
              grid={{
                display: effects.grid.display,
                opacity: effects.grid.opacity as Opacity,
                color: effects.grid.color,
                width: effects.grid.width,
                height: effects.grid.height,
              }}
              lines={{
                display: effects.lines.display,
                opacity: effects.lines.opacity as Opacity,
                size: effects.lines.size as SpacingToken,
                thickness: effects.lines.thickness,
                angle: effects.lines.angle,
                color: effects.lines.color,
              }}
            />
          </RevealFx>
          {/* SPEC.md §12 #18. The reference ships no skip link, no <main> and no
              <nav>; a keyboard user has to tab the whole header on every route.
              Styles live in custom.css so the link stays off-screen until focused. */}
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <Flex fillWidth minHeight="16" s={{ hide: true }} />
          <Header />
          <Flex
            as="main"
            id="main-content"
            zIndex={0}
            fillWidth
            padding="l"
            horizontal="center"
            flex={1}
          >
            <Flex horizontal="center" fillWidth minHeight="0">
              {children}
            </Flex>
          </Flex>
          <Footer />
        </Column>
      </Providers>
    </Flex>
  );
}
