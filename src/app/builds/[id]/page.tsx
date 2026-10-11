import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getBuild } from "@/lib/db";
import {
  formatDate,
  formatDisks,
  formatDuration,
  formatHost,
  formatMemory,
  formatMonthlyPrice,
  formatNetworkSpeed,
  formatPrice,
  formatRepo,
  formatSwaps,
} from "@/lib/types";
import { pageMetadata, siteTitle } from "@/lib/seo";
import StatCard from "@/components/stat-card";
import { Panel, SpecList } from "@/components/panel";
import { BracketLink, NavLink } from "@/components/link";

const loadBuild = cache(getBuild);
const ABSENT = "--";

export async function generateMetadata(
  props: PageProps<"/builds/[id]">
): Promise<Metadata> {
  const { id } = await props.params;
  const build = await loadBuild(id);
  if (!build) {
    return {
      title: siteTitle("Build not found"),
      robots: { index: false, follow: false },
    };
  }

  const name = [build.romName, build.romVersion].filter(Boolean).join(" ");
  return pageMetadata({
    title: siteTitle(name),
    description: `Clean build in ${formatDuration(build.buildMinutes)} on ${formatHost(
      build
    )}.`,
    canonical: `/builds/${build.id}`,
  });
}

export default async function BuildDetailPage(props: PageProps<"/builds/[id]">) {
  const { id } = await props.params;
  const [build, admin] = await Promise.all([loadBuild(id), isAdmin()]);
  if (!build) notFound();

  const monthly = formatMonthlyPrice(build);
  const kernelName = [build.kernelName, build.kernelVersion]
    .filter(Boolean)
    .join(" ");

  const stats = [
    { label: "clean build", value: formatDuration(build.buildMinutes) },
    build.dirtyBuildMinutes !== null
      ? {
          label: "dirty build",
          value: formatDuration(build.dirtyBuildMinutes),
        }
      : null,
    { label: "android", value: build.androidVersion === null ? ABSENT : String(build.androidVersion) },
  ].filter((stat) => stat !== null);

  const price = formatPrice(build);

  return (
    <div className="mx-auto w-full max-w-4xl px-2 py-3 sm:px-3 sm:py-4">
      <BracketLink href="/">all builds</BracketLink>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
        <div className="min-w-0">
          <p className="text-xs text-muted">BUILD :: {build.id}</p>
          <h1 className="mt-1 text-lg font-bold uppercase tracking-wider wrap-break-word">
            {[build.romName, build.romVersion].filter(Boolean).join(" ")}
          </h1>
          <p className="mt-1 text-xs text-muted">
            Submitted {formatDate(build.createdAt)}
          </p>
        </div>
        {admin ? (
          <NavLink href={`/admin/${build.id}`}>edit entry</NavLink>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            className="flex-1 basis-40 sm:basis-52"
          />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="ROM & source">
          <SpecList
            items={[
              {
                term: "android version",
                value:
                  build.androidVersion === null
                    ? ABSENT
                    : String(build.androidVersion),
              },
              { term: "repo sync", value: formatRepo(build) || ABSENT },
            ]}
          />
        </Panel>

        <Panel title="Server & hosting">
          <SpecList
            items={[
              { term: "build host", value: formatHost(build) },
              {
                term: "price",
                value: (
                  <>
                    {price || ABSENT}
                    {monthly ? (
                      <span className="text-muted"> (≈ {monthly})</span>
                    ) : null}
                  </>
                ),
              },
              {
                term: "network",
                value: formatNetworkSpeed(build) || ABSENT,
              },
            ]}
          />
        </Panel>

        <Panel title="Hardware">
          <SpecList
            items={[
              { term: "cpu", value: build.cpuModel || ABSENT },
              {
                term: "cores",
                value:
                  build.cpuCores === null ? ABSENT : String(build.cpuCores),
              },
              {
                term: "threads",
                value:
                  build.cpuThreads === null ? ABSENT : String(build.cpuThreads),
              },
              { term: "memory", value: formatMemory(build) || ABSENT },
              { term: "disks", value: formatDisks(build.disks) || ABSENT },
              { term: "swap & zram", value: formatSwaps(build.swaps) || ABSENT },
            ]}
          />
        </Panel>

        <Panel title="Kernel build">
          <SpecList
            items={[
              { term: "kernel", value: kernelName || ABSENT },
              {
                term: "clean build",
                value:
                  build.kernelBuildMinutes === null
                    ? ABSENT
                    : formatDuration(build.kernelBuildMinutes),
              },
              {
                term: "dirty build",
                value:
                  build.kernelDirtyBuildMinutes === null
                    ? ABSENT
                    : formatDuration(build.kernelDirtyBuildMinutes),
              },
            ]}
          />
        </Panel>
      </div>

      {build.notes ? (
        <Panel title="Notes" className="mt-3">
          <p className="text-xs whitespace-pre-line wrap-break-word">
            {build.notes}
          </p>
        </Panel>
      ) : null}
    </div>
  );
}
