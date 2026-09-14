import mdx from "@next/mdx";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["next-mdx-remote"],
  // No `images.remotePatterns` on purpose. The template allowed
  // https://www.google.com/**, which nothing on this site ever loaded
  // (SPEC.md §12 #23 — delete dead config).
  // TODO(razvan): add a remotePattern here only if you start rendering an image
  // from a host you do not control. Local files under /public need no entry.
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
};

export default withMDX(nextConfig);
