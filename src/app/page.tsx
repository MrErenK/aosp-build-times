import Link from "next/link";
import { getBuildsPage, getBuildStats } from "@/lib/db";
import { formatDuration } from "@/lib/types";
import BuildList from "@/components/build-list";
import Pagination from "@/components/pagination";
import SearchField from "@/components/search-field";
import StatCard from "@/components/stat-card";
import SubmittedToast from "@/components/submitted-toast";

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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {justSubmitted ? <SubmittedToast /> : null}

      <section className="mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          How long does a ROM build take?
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          A community-sourced database of Android ROM build times across
          different server specs and hosting providers. Share your setup to help
          others pick the right hardware.
        </p>
      </section>

      <section className="stagger mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={query ? "Matching builds" : "Builds submitted"}
          value={String(stats.count)}
        />
        <StatCard
          label="Average clean build"
          value={
            stats.avgMinutes !== null
              ? formatDuration(Math.round(stats.avgMinutes))
              : "-"
          }
        />
        <StatCard
          label="Fastest build"
          value={
            stats.fastestMinutes !== null
              ? formatDuration(stats.fastestMinutes)
              : "-"
          }
        />
      </section>

      <section className="animate-fade-in-up">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              {query ? "Search results" : "Recent builds"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {query
                ? `${stats.count} build${stats.count === 1 ? "" : "s"} matching “${query}”.`
                : "Select a build for the full spec sheet."}
            </p>
          </div>
          <Link
            href="/submit"
            className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            Add yours →
          </Link>
        </div>

        <div className="mb-4">
          <SearchField
            placeholder="Search ROM, CPU, host, kernel…"
            initialValue={query}
          />
        </div>

        <BuildList builds={result.builds} query={query} />

        <Pagination page={result.page} pageCount={result.pageCount} query={query} />
      </section>
    </div>
  );
}
