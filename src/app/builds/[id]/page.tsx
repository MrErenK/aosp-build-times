import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
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
import { SITE } from "@/lib/site";
import StatCard from "@/components/stat-card";

const loadBuild = cache(getBuild);

type Row = { label: string; value: string; hint?: string; mono?: boolean };

function DetailSection({ title, rows }: { title: string; rows: Row[] }) {
  const filled = rows.filter((row) => row.value !== "");

  return (
    <section className="animate-fade-in-up border-t py-8 first:border-t-0 first:pt-0">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </h2>
      {filled.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Not provided.</p>
      ) : (
        <dl className="mt-1">
          {filled.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-0.5 border-b py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <dt className="text-sm text-muted">{row.label}</dt>
              <dd
                className={`text-sm font-medium wrap-break-word sm:text-right ${
                  row.mono ? "font-mono" : ""
                }`}
              >
                {row.value}
                {row.hint ? (
                  <span className="ml-2 text-xs font-normal text-muted">
                    {row.hint}
                  </span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export async function generateMetadata(
  props: PageProps<"/builds/[id]">
): Promise<Metadata> {
  const { id } = await props.params;
  const build = await loadBuild(id);
  if (!build) return { title: `Build not found - ${SITE.name}` };

  const name = [build.romName, build.romVersion].filter(Boolean).join(" ");
  return {
    title: `${name} - ${SITE.name}`,
    description: `Clean build in ${formatDuration(build.buildMinutes)} on ${formatHost(
      build
    )}.`,
  };
}

export default async function BuildDetailPage(props: PageProps<"/builds/[id]">) {
  const { id } = await props.params;
  const [build, admin] = await Promise.all([loadBuild(id), isAdmin()]);
  if (!build) notFound();

  const monthly = formatMonthlyPrice(build);
  const kernel = [build.kernelName, build.kernelVersion]
    .filter(Boolean)
    .join(" ");

  const stats = [
    { label: "Clean build", value: formatDuration(build.buildMinutes) },
    build.dirtyBuildMinutes !== null
      ? {
          label: "Dirty build",
          value: formatDuration(build.dirtyBuildMinutes),
        }
      : null,
  ].filter((stat) => stat !== null);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="animate-fade-in-up">
        <Link
          href="/"
          className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          ← All builds
        </Link>
      </div>

      <div className="animate-fade-in-up mt-4 mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight wrap-break-word sm:text-3xl">
            {[build.romName, build.romVersion].filter(Boolean).join(" ")}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {[
              build.androidVersion !== null
                ? `Android ${build.androidVersion}`
                : null,
              `Submitted ${formatDate(build.createdAt)}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        {admin ? (
          <Link
            href={`/admin/${build.id}`}
            className="h-9 shrink-0 rounded-md border px-3 text-sm font-medium leading-9 transition-colors hover:bg-foreground/5"
          >
            Edit entry
          </Link>
        ) : null}
      </div>

      <div className="stagger mb-10 flex flex-wrap gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            className="flex-1 basis-40 sm:basis-56"
          />
        ))}
      </div>

      <div className="grid">
        <DetailSection
          title="ROM & source"
          rows={[
            {
              label: "Android version",
              value:
                build.androidVersion === null
                  ? ""
                  : String(build.androidVersion),
            },
            { label: "Repo sync", value: formatRepo(build) },
          ]}
        />

        <DetailSection
          title="Hardware"
          rows={[
            { label: "CPU", value: build.cpuModel },
            {
              label: "Cores",
              value: build.cpuCores === null ? "" : String(build.cpuCores),
            },
            {
              label: "Threads",
              value: build.cpuThreads === null ? "" : String(build.cpuThreads),
            },
            { label: "Memory", value: formatMemory(build) },
            { label: "Disks", value: formatDisks(build.disks) },
            { label: "Swap & zram", value: formatSwaps(build.swaps) },
          ]}
        />

        <DetailSection
          title="Server & hosting"
          rows={[
            { label: "Build host", value: formatHost(build) },
            {
              label: "Price",
              value: formatPrice(build),
              hint: monthly ? `(≈ ${monthly})` : undefined,
            },
            { label: "Network", value: formatNetworkSpeed(build) },
          ]}
        />

        <DetailSection
          title="Kernel build"
          rows={[
            { label: "Kernel", value: kernel },
            {
              label: "Clean build",
              value:
                build.kernelBuildMinutes === null
                  ? ""
                  : formatDuration(build.kernelBuildMinutes),
              mono: true,
            },
            {
              label: "Dirty build",
              value:
                build.kernelDirtyBuildMinutes === null
                  ? ""
                  : formatDuration(build.kernelDirtyBuildMinutes),
              mono: true,
            },
          ]}
        />

        {build.notes ? (
          <section className="animate-fade-in-up border-t py-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Notes
            </h2>
            <p className="mt-3 text-sm wrap-break-word whitespace-pre-line">
              {build.notes}
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
