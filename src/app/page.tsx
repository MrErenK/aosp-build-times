import type { Metadata } from "next";
import { getBuildsPage, getBuildStats } from "@/lib/db";
import { formatDuration } from "@/lib/types";
import BuildList from "@/components/build-list";
import Pagination from "@/components/pagination";
import SearchField from "@/components/search-field";
import StatCard from "@/components/stat-card";
import SubmittedToast from "@/components/submitted-toast";
import { NavLink } from "@/components/link";
import { JsonLd } from "@/components/json-ld";
import { buildsJsonLd, pageMetadata, siteTitle } from "@/lib/seo";
import { SITE } from "@/lib/site";

export async function generateMetadata({
  searchParams,
}: PageProps<"/">): Promise<Metadata> {
  const params = await searchParams;
  const raw = params?.q;
  const query = (Array.isArray(raw) ? raw[0] : raw ?? "").trim();

  if (query) {
    return pageMetadata({
      title: siteTitle(`Search: ${query}`),
      description: `Recorded Android ROM build times matching “${query}”.`,
      robots: { index: false, follow: true },
    });
  }

  return pageMetadata({
    title: SITE.name,
    description: SITE.description,
    canonical: "/",
  });
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const rawQuery = params?.q;
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery ?? "").trim();
  const rawPage = params?.page;
  const requestedPage = Number.parseInt(
    Array.isArray(rawPage) ? rawPage[0] : rawPage ?? "1",
    10
  );
  const page = Number.isNaN(requestedPage) ? 1 : requestedPage;
  const justSubmitted = params?.submitted === "1";

  const [stats, result] = await Promise.all([
    getBuildStats(query),
    getBuildsPage({ query, page }),
  ]);

  const matched = stats.count === 1 ? "match" : "matches";
  const jsonLd = buildsJsonLd({ builds: result.builds, website: !query });

  return (
    <div>
      {justSubmitted ? <SubmittedToast /> : null}

      <div className="border-b border-line px-2 py-3 sm:px-3 sm:py-4">
        <p className="text-xs text-muted">
          COMMUNITY DATABASE / ANDROID ROM BUILD TIMES
        </p>
        <h1 className="mt-1 text-lg font-bold uppercase tracking-wider">
          how long does a rom build take?
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-muted-strong">
          A community-sourced database of Android ROM build times across different
          server specs and hosting providers. Share your setup to help others pick
          the right hardware.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 border-b border-line px-2 py-3 sm:grid-cols-3 sm:px-3">
        <StatCard
          label={query ? "matching builds" : "builds submitted"}
          value={String(stats.count)}
        />
        <StatCard
          label="average clean build"
          value={
            stats.avgMinutes !== null
              ? formatDuration(Math.round(stats.avgMinutes))
              : "--"
          }
        />
        <StatCard
          label="fastest build"
          value={
            stats.fastestMinutes !== null
              ? formatDuration(stats.fastestMinutes)
              : "--"
          }
        />
      </div>

      <div className="border-b border-line bg-surface px-2 py-2 sm:px-3">
        <SearchField
          placeholder="search rom, cpu, host, kernel…"
          initialValue={query}
        />
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-2 py-1.5 sm:px-3">
        <h2 className="text-xs font-bold uppercase tracking-wider">
          {query ? "search results" : "recent builds"}
        </h2>
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
          <span className="tabular-nums text-foreground">{stats.count}</span>
          <span>
            {query ? `${matched} for “${query}”` : "builds recorded"}
          </span>
          <NavLink href="/submit">add yours</NavLink>
        </p>
      </div>

      <div className="px-2 py-3 sm:px-3">
        <BuildList builds={result.builds} query={query} />
      </div>

      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        query={query}
      />

      {jsonLd ? <JsonLd data={jsonLd} /> : null}
    </div>
  );
}
