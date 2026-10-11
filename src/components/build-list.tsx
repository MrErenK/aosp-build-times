import {
  formatDisks,
  formatDuration,
  formatHost,
  formatMemory,
  formatNetworkSpeed,
  formatPrice,
  formatSwaps,
  type BuildRecord,
} from "@/lib/types";
import { BracketLink } from "@/components/link";
import { Table, TBody, TD, TDNumeric, TH, THead, TR } from "@/components/table";

const ABSENT = "--";

function cpu(build: BuildRecord): string {
  const parts = [
    build.cpuModel,
    build.cpuCores ? `${build.cpuCores}c` : null,
    build.cpuThreads ? `${build.cpuThreads}t` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

function kernel(build: BuildRecord): string {
  const parts = [
    build.kernelName || null,
    build.kernelBuildMinutes !== null
      ? formatDuration(build.kernelBuildMinutes)
      : null,
    build.kernelDirtyBuildMinutes !== null
      ? `${formatDuration(build.kernelDirtyBuildMinutes)} dirty`
      : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

function BuildRow({ build }: { build: BuildRecord }) {
  const network = formatNetworkSpeed(build);
  const host = [formatHost(build), formatPrice(build) || null, network || null]
    .filter(Boolean)
    .join(" · ");
  const kernelText = kernel(build);

  return (
    <TR hover className="relative">
      <TD className="font-bold" title={build.id}>
        {build.romName || "(no name)"}
        {build.romVersion ? (
          <span className="font-normal text-muted"> {build.romVersion}</span>
        ) : null}
      </TD>
      <TD className="tabular-nums">
        {build.androidVersion === null ? ABSENT : build.androidVersion}
      </TD>
      <TD className="text-muted">{host}</TD>
      <TD className="text-muted">{cpu(build) || ABSENT}</TD>
      <TD className="text-muted">{formatMemory(build) || ABSENT}</TD>
      <TD className="text-muted">
        {formatDisks(build.disks) || formatSwaps(build.swaps) || ABSENT}
      </TD>
      <TDNumeric className="text-foreground">
        {formatDuration(build.buildMinutes)}
      </TDNumeric>
      <TDNumeric>
        {build.dirtyBuildMinutes === null
          ? ABSENT
          : formatDuration(build.dirtyBuildMinutes)}
      </TDNumeric>
      <TD className="text-muted">{kernelText || ABSENT}</TD>
      <TD>
        <BracketLink
          href={`/builds/${build.id}`}
          className="after:absolute after:inset-0 after:content-['']"
        >
          details
        </BracketLink>
      </TD>
    </TR>
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
      <Table>
        <TBody>
          <TR>
            <TD className="text-muted">
              {query ? (
                <>
                  NO MATCHES FOR &ldquo;{query}&rdquo; --{" "}
                  <BracketLink href="/" className="-my-1">
                    reset
                  </BracketLink>
                </>
              ) : (
                <>
                  NOTHING STORED --{" "}
                  <BracketLink href="/submit" className="-my-1">
                    submit
                  </BracketLink>
                </>
              )}
            </TD>
          </TR>
        </TBody>
      </Table>
    );
  }

  return (
    <Table className="min-w-5xl">
      <THead>
        <TR>
          <TH className="w-44">ROM</TH>
          <TH className="w-16 text-right">ANDROID</TH>
          <TH className="w-56">HOST</TH>
          <TH className="w-56">CPU</TH>
          <TH className="w-44">MEMORY</TH>
          <TH className="w-44">DISKS</TH>
          <TH className="w-20 text-right">CLEAN</TH>
          <TH className="w-20 text-right">DIRTY</TH>
          <TH className="w-40">KERNEL</TH>
          <TH className="w-20"> </TH>
        </TR>
      </THead>
      <TBody>
        {builds.map((build) => (
          <BuildRow key={build.id} build={build} />
        ))}
      </TBody>
    </Table>
  );
}
