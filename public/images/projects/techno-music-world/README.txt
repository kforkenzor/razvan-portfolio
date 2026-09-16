Screenshots for the Techno Music World case study, captured from the live site
on 2026-09-16 and resized to 1600px wide with `sips --resampleWidth 1600`.

  01-home.png     homepage — breaking-news hero
  02-music.png    /music — Discover Music, weekly top tracks and favourites
  03-events.png   /events — the festivals and events listing grid

All three are listed in the `images:` frontmatter of
src/app/work/projects/techno-music-world.mdx. images[0] (01-home.png) is the
detail-page hero, carousel slide 1, and the card thumbnail on /about.

PNG rather than WebP to match qr-advanced/, wellnessinbox/ and casa-teo/, which
are all 1600px PNGs. SPEC.md §12 #16 asks for WebP; no encoder (cwebp,
ImageMagick) is installed on this machine and sips cannot write WebP, so the
conversion is still outstanding for every project folder, not just this one.
Page weight is unaffected either way — Next.js re-encodes at serve time.
