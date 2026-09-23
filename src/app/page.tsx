import Link from "next/link";
import { getBuilds } from "@/lib/db";
import {
  formatDisks,
  formatHost,
  formatMemory,
  formatNetworkSpeed,
  formatSwaps,
  type BuildRecord,
} from "@/lib/types";
import SubmittedToast from "@/components/submitted-toast";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-5 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}

function BuildRow({ build }: { build: BuildRecord }) {
  const network = formatNetworkSpeed(build);
  const specs = [
    build.cpuModel,
    build.cpuCores ? `${build.cpuCores} cores` : null,
    build.cpuThreads ? `${build.cpuThreads} threads` : null,
    formatMemory(build) || null,
    formatDisks(build.disks) || null,
    formatSwaps(build.swaps) || null,
    network ? `${network} network` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const hasKernel =
    build.kernelBuildMinutes !== null ||
    build.kernelDirtyBuildMinutes !== null ||
    build.kernelName !== "";

  return (
    <div className="grid grid-cols-1 gap-4 border-b px-5 py-5 transition-colors duration-150 last:border-b-0 hover:bg-background sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-medium">{build.romName}</span>
          <span className="text-sm text-muted">
            {[
              build.romVersion,
              build.androidVersion !== null
                ? `Android ${build.androidVersion}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>
        <div className="mt-1 truncate text-sm text-muted">
          {specs || "No hardware details provided"}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full border px-2 py-0.5">
            {formatHost(build)}
          </span>
          <span className="rounded-full border px-2 py-0.5">
            {build.monthlyPriceUsd !== null
              ? `$${build.monthlyPriceUsd}/mo`
              : "Price n/a"}
          </span>
          {hasKernel ? (
            <span className="rounded-full border px-2 py-0.5">
              {`Kernel${build.kernelName ? ` ${build.kernelName}` : ""}${
                build.kernelBuildMinutes !== null
                  ? `: ${formatDuration(build.kernelBuildMinutes)}`
                  : ""
              }${
                build.kernelDirtyBuildMinutes !== null
                  ? ` / ${formatDuration(build.kernelDirtyBuildMinutes)} dirty`
                  : ""
              }`}
            </span>
          ) : null}
        </div>
      </div>
      <div className="text-left sm:text-right">
        <div className="font-mono text-lg font-semibold">
          {formatDuration(build.buildMinutes)}
        </div>
        <div className="text-xs text-muted">clean build</div>
        {build.dirtyBuildMinutes !== null ? (
          <div className="mt-1 font-mono text-sm text-muted">
            {formatDuration(build.dirtyBuildMinutes)}{" "}
            <span className="font-sans text-xs">dirty</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const [builds, params] = await Promise.all([getBuilds(), searchParams]);
  const justSubmitted = params?.submitted === "1";

  const avgMinutes =
    builds.length > 0
      ? Math.round(
          builds.reduce((sum, b) => sum + b.buildMinutes, 0) / builds.length
        )
      : 0;
  const fastest =
    builds.length > 0
      ? builds.reduce(
          (min, b) => (b.buildMinutes < min ? b.buildMinutes : min),
          builds[0].buildMinutes
        )
      : 0;

  return (
    <div className="w-full px-6 py-12 lg:px-8">
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

      <section className="stagger mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Builds submitted" value={String(builds.length)} />
        <StatCard
          label="Average clean build"
          value={builds.length ? formatDuration(avgMinutes) : "-"}
        />
        <StatCard
          label="Fastest build"
          value={builds.length ? formatDuration(fastest) : "-"}
        />
      </section>

      <section className="animate-fade-in-up">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recent builds</h2>
          <Link
            href="/submit"
            className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            Add yours →
          </Link>
        </div>

        {builds.length === 0 ? (
          <div className="rounded-lg border bg-card px-6 py-16 text-center">
            <p className="text-muted">No builds yet.</p>
            <Link
              href="/submit"
              className="mt-4 inline-block rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Submit the first build
            </Link>
          </div>
        ) : (
          <div className="stagger overflow-hidden rounded-lg border bg-card">
            {builds.map((build) => (
              <BuildRow key={build.id} build={build} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
