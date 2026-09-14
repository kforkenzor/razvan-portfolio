import fs from "fs";
import path from "path";
import matter from "gray-matter";

type Team = {
  name: string;
  role: string;
  avatar: string;
  linkedIn: string;
};

type Metadata = {
  title: string;
  subtitle?: string;
  publishedAt: string;
  summary: string;
  image?: string;
  images: string[];
  tag?: string;
  team: Team[];
  link?: string;
};

/**
 * Returns the .mdx filenames in `dir`.
 * A missing directory is NOT an error: it yields an empty list so that
 * callers such as sitemap.ts keep working before any content exists.
 */
function getMDXFiles(dir: string) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

function readMDXFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(rawContent);

  const metadata: Metadata = {
    title: data.title || "",
    subtitle: data.subtitle || "",
    publishedAt: data.publishedAt,
    summary: data.summary || "",
    image: data.image || "",
    images: data.images || [],
    tag: data.tag || [],
    team: data.team || [],
    link: data.link || "",
  };

  return { metadata, content };
}

function getMDXData(dir: string) {
  const mdxFiles = getMDXFiles(dir);
  return mdxFiles.map((file) => {
    const { metadata, content } = readMDXFile(path.join(dir, file));
    const slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });
}

/**
 * The one directory of MDX case studies. A module-level constant built from
 * string literals, deliberately.
 *
 * Upstream's `getPosts(customPath: string[])` spread a caller-supplied array
 * into `path.join(process.cwd(), ...customPath)`, which Turbopack cannot
 * analyse statically. Its response is to trace the *entire* project into the
 * server bundle — every source file and all of `public/` — and it says so as a
 * build warning. Scoping the path here removes the warning and the bloat, and
 * costs nothing: there was only ever one caller-supplied value.
 */
const PROJECTS_DIR = path.join(process.cwd(), "src", "app", "work", "projects");

/**
 * Every case study in `src/app/work/projects/`, unsorted.
 * Returns [] when the directory does not exist, so a build with no content
 * still succeeds — that is exactly the bug behind the reference site's
 * 0-byte /sitemap.xml (SPEC.md §2.3).
 */
export function getProjectPosts() {
  return getMDXData(PROJECTS_DIR);
}

export type Post = ReturnType<typeof getProjectPosts>[number];
