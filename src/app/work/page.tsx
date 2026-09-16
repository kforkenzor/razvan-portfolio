import { Column, Heading } from "@once-ui-system/core";
import { presentationSites, work } from "@/resources";
import { Projects } from "@/components/work/Projects";
import {
  PRESENTATION_TITLE,
  PresentationSites,
} from "@/components/about/PresentationSites";
import { JsonLd } from "@/components";
import { ogImagePath, pageMetadata } from "@/utils/seo";

export async function generateMetadata() {
  return pageMetadata({
    title: work.title,
    description: work.description,
    image: ogImagePath(work.title),
    path: work.path,
  });
}

export default function Work() {
  return (
    <Column maxWidth={76} paddingTop="24">
      <JsonLd
        type="WebPage"
        path={work.path}
        title={work.title}
        description={work.description}
        image={ogImagePath(work.title)}
      />
      <Heading marginBottom="l" variant="heading-strong-xl" align="center">
        {work.title}
      </Heading>
      <Projects />

      {/* Presentation websites close the page, under the case studies. The component
          runs the evidence gate itself and returns null when nothing clears it, so no
          guard is needed here — an empty section cannot render a stray heading. */}
      <PresentationSites title={PRESENTATION_TITLE} sites={presentationSites} />
    </Column>
  );
}
