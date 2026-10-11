import type { MetadataRoute } from "next";
import { getBuilds } from "@/lib/db";
import { SITE_ORIGIN } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const builds = await getBuilds();
  const root = `${SITE_ORIGIN}/`;

  let newest = Number.NEGATIVE_INFINITY;
  for (const build of builds) {
    const time = Date.parse(build.createdAt);
    if (Number.isFinite(time) && time > newest) newest = time;
  }
  const latest = Number.isFinite(newest) ? new Date(newest) : undefined;

  return [
    { url: root, lastModified: latest },
    { url: `${root}submit`, lastModified: latest },
    ...builds.map((build) => ({
      url: `${root}builds/${build.id}`,
      lastModified: new Date(build.createdAt),
    })),
  ];
}
