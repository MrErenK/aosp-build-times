import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { formatHost, type BuildRecord } from "@/lib/types";

export const SITE_ORIGIN = SITE.url;

export function siteTitle(page: string): string {
  return `${page} -- ${SITE.name}`;
}

type PageSeo = {
  title: string;
  description: string;
  canonical?: string | null;
  robots?: Metadata["robots"];
};

export function pageMetadata(seo: PageSeo): Metadata {
  const openGraph: NonNullable<Metadata["openGraph"]> = {
    type: "website",
    siteName: SITE.name,
    locale: "en",
    title: seo.title,
    description: seo.description,
  };

  const metadata: Metadata = {
    title: seo.title,
    description: seo.description,
    openGraph,
    twitter: {
      card: "summary",
      title: seo.title,
      description: seo.description,
    },
  };

  if (seo.canonical) {
    metadata.alternates = { canonical: seo.canonical };
    openGraph.url = seo.canonical;
  }

  if (seo.robots) metadata.robots = seo.robots;

  return metadata;
}

function buildNode(build: BuildRecord): Record<string, unknown> {
  const rom = [build.romName, build.romVersion].filter(Boolean).join(" ");

  const node: Record<string, unknown> = {
    "@type": "CreativeWork",
    name: `${rom} on ${formatHost(build)}`,
    url: `${SITE_ORIGIN}/builds/${build.id}`,
    dateCreated: build.createdAt,
    about: {
      "@type": "SoftwareApplication",
      name: rom,
      applicationCategory: "MobileApplication",
      operatingSystem:
        build.androidVersion === null ? "Android" : `Android ${build.androidVersion}`,
    },
  };

  return node;
}

function websiteNode(): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#website`,
    url: `${SITE_ORIGIN}/`,
    name: SITE.name,
    description: SITE.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_ORIGIN}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildsJsonLd(input: {
  builds: readonly BuildRecord[];
  website: boolean;
}): Record<string, unknown> | null {
  const graph: Record<string, unknown>[] = [];

  if (input.website) graph.push(websiteNode());

  if (input.builds.length > 0) {
    graph.push({
      "@type": "ItemList",
      numberOfItems: input.builds.length,
      itemListElement: input.builds.map((build, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: buildNode(build),
      })),
    });
  }

  if (graph.length === 0) return null;

  return { "@context": "https://schema.org", "@graph": graph };
}
