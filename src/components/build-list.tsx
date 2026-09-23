import Link from "next/link";
import {
  formatDisks,
  formatDuration,
  formatHost,
  formatMemory,
  formatNetworkSpeed,
  formatPrice,
  formatRepo,
  formatSwaps,
  type BuildRecord,
} from "@/lib/types";

function BuildRow({ build }: { build: BuildRecord }) {
  const network = formatNetworkSpeed(build);
  const specs = [
    build.cpuModel,
    build.cpuCores ? `${build.cpuCores} cores` : null,
    build.cpuThreads ? `${build.cpuThreads} threads` : null,
    formatMemory(build) || null,
    formatDisks(build.disks) || null,
    formatSwaps(build.swaps) || null,
    formatRepo(build) || null,
    network ? `${network} network` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const hasKernel =
    build.kernelBuildMinutes !== null ||
    build.kernelDirtyBuildMinutes !== null ||
    build.kernelName !== "";

  return (
    <Link
      href={`/builds/${build.id}`}
      className="group grid grid-cols-1 gap-4 border-b px-4 py-5 transition-colors duration-150 last:border-b-0 hover:bg-foreground/5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-5"
    >
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
        <div className="mt-1 text-sm wrap-break-word text-muted">
          {specs || "No hardware details provided"}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full border px-2 py-0.5">
            {formatHost(build)}
          </span>
          <span className="rounded-full border px-2 py-0.5">
            {formatPrice(build) || "Price n/a"}
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
      <div className="flex items-end justify-between gap-4 border-t pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
        <div>
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
        <span
          aria-hidden="true"
          className="text-muted transition-transform duration-150 group-hover:translate-x-0.5 sm:hidden"
        >
          →
        </span>
      </div>
    </Link>
  );
}

export default function BuildList({
  builds,
  query = "",
}: {
  builds: BuildRecord[];
  query?: string;
}) {
  if (builds.length === 0) {
    return (
      <div className="rounded-lg border bg-card px-6 py-16 text-center">
        {query ? (
          <p className="text-muted">No builds match “{query}”.</p>
        ) : (
          <>
            <p className="text-muted">No builds yet.</p>
            <Link
              href="/submit"
              className="mt-4 inline-block rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Submit the first build
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="stagger overflow-hidden rounded-lg border bg-card">
      {builds.map((build) => (
        <BuildRow key={build.id} build={build} />
      ))}
    </div>
  );
}
