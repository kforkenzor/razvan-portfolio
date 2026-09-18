import { notFound } from "next/navigation";
import { getProjectPosts } from "@/utils/utils";
import {
  AvatarGroup,
  Column,
  Heading,
  Media,
  Text,
  SmartLink,
  Row,
  Line,
} from "@once-ui-system/core";
import { work } from "@/resources";
import { ogImagePath, pageMetadata } from "@/utils/seo";
import { ScrollToHash, CustomMDX, JsonLd } from "@/components";
import type { Metadata } from "next";
import { Projects, getProjects } from "@/components/work/Projects";

function resolveSlug(slug: string | string[] | undefined) {
  return Array.isArray(slug) ? slug.join("/") : slug || "";
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = getProjectPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  const routeParams = await params;
  const slugPath = resolveSlug(routeParams.slug);

  const post = getProjectPosts().find((post) => post.slug === slugPath);

  if (!post) return {};

  return pageMetadata({
    title: post.metadata.title,
    description: post.metadata.summary,
    // SPEC.md §8.8 #8: og:type must agree with the BlogPosting JSON-LD below.
    // Upstream left it at the "website" default on every case study.
    type: "article",
    publishedTime: post.metadata.publishedAt,
    image: post.metadata.image || ogImagePath(post.metadata.title),
    path: `${work.path}/${post.slug}`,
  });
}

export default async function Project({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}) {
  const routeParams = await params;
  const slugPath = resolveSlug(routeParams.slug);

  const post = getProjectPosts().find((post) => post.slug === slugPath);

  // SPEC.md §12 #2 — a real 404, not a soft one.
  if (!post) {
    notFound();
  }

  const team = post.metadata.team ?? [];
  // Only members with a real avatar path. `{ src: "" }` renders Once UI's generic
  // person icon, which looks like a broken image rather than an absent one.
  const avatars = team.filter((member) => member.avatar).map((member) => ({ src: member.avatar }));
  const images = post.metadata.images ?? [];

  // Only render the "Related projects" block when there is actually something
  // related. With two case studies and one excluded, an unchecked range would
  // print a heading over an empty list.
  const relatedProjects = getProjects({ exclude: [post.slug], range: [1, 3] });

  return (
    <Column as="section" maxWidth={76} horizontal="center" gap="l">
      <JsonLd
        type="BlogPosting"
        path={`${work.path}/${post.slug}`}
        title={post.metadata.title}
        description={post.metadata.summary}
        datePublished={post.metadata.publishedAt}
        dateModified={post.metadata.publishedAt}
        image={post.metadata.image || ogImagePath(post.metadata.title)}
      />
      <Column maxWidth="s" gap="16" horizontal="center" align="center">
        <SmartLink href={work.path}>
          <Text variant="label-strong-m">Projects</Text>
        </SmartLink>
        {/* No visible published date: a case study is not a dated post, and a stale
            date reads as a stale project. `publishedAt` still feeds the JSON-LD above,
            the OG metadata, the sitemap's lastModified and the /work ordering. */}
        <Heading variant="display-strong-m" marginTop="12">
          {post.metadata.title}
        </Heading>
      </Column>
      {team.length > 0 && (
        <Row marginBottom="32" horizontal="center">
          <Row gap="16" vertical="center">
            {avatars.length > 0 && <AvatarGroup reverse avatars={avatars} size="s" />}
            <Text variant="label-default-m" onBackground="brand-weak">
              {team.map((member, idx) => (
                <span key={member.name || idx}>
                  {idx > 0 && (
                    <Text as="span" onBackground="neutral-weak">
                      ,{" "}
                    </Text>
                  )}
                  {/* An empty `linkedIn` is the skeleton's default — render the name
                      as plain text rather than a link to nowhere. */}
                  {member.linkedIn ? (
                    <SmartLink href={member.linkedIn}>{member.name}</SmartLink>
                  ) : (
                    member.name
                  )}
                </span>
              ))}
            </Text>
          </Row>
        </Row>
      )}
      {/* TODO(razvan): no project screenshots exist yet, so no hero renders on either
          case study. See the images TODO in each .mdx frontmatter, and SPEC.md §11 Q11
          for the permissions check that has to happen before any of them are published. */}
      {images.length > 0 && (
        <Media priority aspectRatio="16 / 9" radius="m" alt={post.metadata.title} src={images[0]} />
      )}
      <Column style={{ margin: "auto" }} as="article" maxWidth={58}>
        <CustomMDX source={post.content} />
      </Column>
      {relatedProjects.length > 0 && (
        <Column fillWidth gap="40" horizontal="center" marginTop="40">
          <Line maxWidth="40" />
          <Heading as="h2" variant="heading-strong-xl" marginBottom="24">
            Related projects
          </Heading>
          <Projects exclude={[post.slug]} range={[1, 3]} />
        </Column>
      )}
      <ScrollToHash />
    </Column>
  );
}
