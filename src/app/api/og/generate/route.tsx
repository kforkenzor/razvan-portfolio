import { ImageResponse } from "next/og";

import { person } from "@/resources";

export const runtime = "nodejs";

/* ==========================================================================
 * /api/og/generate?title=… — the Open Graph card every route falls back to.
 *
 * Two defects from SPEC.md are fixed here rather than inherited:
 *
 *   §12 #13 / §8.8 #1 — upstream fetched a Google Fonts stylesheet, regexed a
 *     font URL out of it and fetched that too, on every single request. It
 *     500s in production, which is why every OG image on the reference site is
 *     broken. There is no fetch here at all: `@vercel/og` bundles
 *     Geist-Regular.ttf as its default face, which is the site's own heading
 *     font, so the `fonts` option is simply not needed.
 *
 *   §8.8 #7 — the card was 1280x720. Open Graph wants 1200x630; anything else
 *     gets letterboxed or cropped by the consumer.
 *
 * There is also no <img> here. Upstream rendered `baseURL + person.avatar`,
 * which makes generating a preview card depend on the site being able to fetch
 * itself — and resolves to the bare origin whenever `person.avatar` is empty,
 * as it is now.
 * ========================================================================== */

const WIDTH = 1200;
const HEIGHT = 630;

/** "Razvan Calota" → "RC". Falls back to the first character, then to nothing. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = url.searchParams.get("title")?.trim() || person.name;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "80px",
        background: "#0e0e0e",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: title.length > 60 ? 64 : 80,
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
          maxHeight: "360px",
          overflow: "hidden",
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        {/* TODO(razvan): once /public/images/avatar.webp exists and the site is
            deployed on a real origin, this circle can become an <img> pointed at
            the absolute avatar URL. Initials keep the card renderable with no
            network access, which is why it starts here. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "112px",
            height: "112px",
            borderRadius: "100%",
            border: "2px solid #3a3a3a",
            background: "#1a1a1a",
            fontSize: 44,
            letterSpacing: "-0.02em",
          }}
        >
          {initials(person.name)}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", fontSize: 40, letterSpacing: "-0.02em" }}>
            {person.name}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#9a9a9a" }}>{person.role}</div>
        </div>
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        // Upstream declared none, so every crawler re-rendered the card. The
        // inputs are build-time constants plus the title, so this is safe to
        // cache hard at the edge.
        "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
