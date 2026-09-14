import { getProjectPosts, type Post } from "@/utils/utils";
import { Column, Text } from "@once-ui-system/core";
import { ProjectCard } from "@/components";

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
}

/**
 * Newest-first list of case studies read from src/app/work/projects/*.mdx.
 *
 * `range` is 1-indexed and inclusive of its start: [1, 3] is the first three.
 */
export function getProjects({ range, exclude }: ProjectsProps = {}): Post[] {
  let allProjects = getProjectPosts();

  // Exclude by slug (exact match)
  if (exclude && exclude.length > 0) {
    allProjects = allProjects.filter((post) => !exclude.includes(post.slug));
  }

  const sortedProjects = allProjects.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  return range
    ? sortedProjects.slice(range[0] - 1, range[1] ?? sortedProjects.length)
    : sortedProjects;
}

export function Projects({ range, exclude }: ProjectsProps) {
  const displayedProjects = getProjects({ range, exclude });

  // A skeleton with no .mdx files yet must still render something coherent
  // rather than an empty <Column> with a stray bottom margin.
  if (displayedProjects.length === 0) {
    return (
      <Column fillWidth paddingX="l" marginBottom="40">
        <Text variant="body-default-m" onBackground="neutral-weak">
          {/* TODO(razvan): remove this fallback once the project list is stable. */}
          No case studies yet.
        </Text>
      </Column>
    );
  }

  return (
    <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
      {displayedProjects.map((post, index) => (
        <ProjectCard
          priority={index < 2}
          key={post.slug}
          href={`/work/${post.slug}`}
          images={post.metadata.images}
          title={post.metadata.title}
          description={post.metadata.summary}
          /* SPEC.md §12 #7: pass a boolean, not the whole MDX body. The card only
             needs to know whether a case study exists; shipping the prose into the
             flight payload for a truthiness check costs every visitor real bytes. */
          hasCaseStudy={post.content.trim().length > 0}
          /* Only real avatars. An empty string would render Once UI's generic
             person icon, which reads as a missing image rather than as "no photo". */
          avatars={
            post.metadata.team
              ?.filter((member) => member.avatar)
              .map((member) => ({ src: member.avatar })) ?? []
          }
          link={post.metadata.link || ""}
        />
      ))}
    </Column>
  );
}
