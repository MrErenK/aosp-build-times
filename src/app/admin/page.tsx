import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminDeleteBuild, adminLogout } from "@/lib/admin-actions";
import { isAdmin } from "@/lib/admin-auth";
import { getBuilds } from "@/lib/db";
import {
  formatDate,
  formatDisks,
  formatHost,
  formatMemory,
  formatNetworkSpeed,
  formatPrice,
  formatRepo,
  formatSwaps,
  type BuildRecord,
} from "@/lib/types";
import DeleteBuildButton from "@/components/delete-build-button";
import FlashMessage from "@/components/flash-message";
import { Button } from "@/components/button";
import { BracketLink } from "@/components/link";
import { Table, TBody, TD, TH, THead, TR } from "@/components/table";
import { SITE } from "@/lib/site";

const MESSAGES: Record<string, string> = {
  updated: "Entry updated.",
  deleted: "Entry deleted.",
};

const ERROR_MESSAGES: Record<string, string> = {
  notfound: "That entry no longer exists.",
};

export const metadata: Metadata = {
  title: `Admin - ${SITE.name}`,
  robots: { index: false, follow: false },
};

function summary(build: BuildRecord): string {
  return (
    [
      build.cpuModel,
      build.cpuCores ? `${build.cpuCores} cores` : null,
      build.cpuThreads ? `${build.cpuThreads} threads` : null,
      formatMemory(build) || null,
      formatDisks(build.disks) || null,
      formatSwaps(build.swaps) || null,
      formatRepo(build) || null,
      formatHost(build),
      formatPrice(build) || null,
      formatNetworkSpeed(build),
    ]
      .filter(Boolean)
      .join(" · ") || "No details"
  );
}

function times(build: BuildRecord): string {
  const parts = [`${build.buildMinutes} min clean`];
  if (build.dirtyBuildMinutes !== null) {
    parts.push(`${build.dirtyBuildMinutes} min dirty`);
  }
  if (build.kernelBuildMinutes !== null) {
    parts.push(`kernel ${build.kernelBuildMinutes} min`);
  }
  return parts.join(" · ");
}

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  if (!(await isAdmin())) redirect("/admin/login");

  const params = await searchParams;
  const builds = await getBuilds();
  const doneKey = typeof params?.done === "string" ? params.done : "";
  const errorKey = typeof params?.error === "string" ? params.error : "";
  const doneMessage = MESSAGES[doneKey];
  const banner = doneMessage ?? ERROR_MESSAGES[errorKey];
  const entries = builds.length === 1 ? "entry" : "entries";

  return (
    <div className="px-2 py-3 sm:px-3 sm:py-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
        <div>
          <p className="text-xs text-muted">CONTROL / BUILD DATABASE</p>
          <h1 className="mt-1 text-lg font-bold uppercase tracking-wider">
            admin
          </h1>
          <p className="mt-1 text-xs text-muted">
            {builds.length} {entries} in the database.
          </p>
        </div>
        <form action={adminLogout}>
          <Button type="submit" variant="outline" size="sm">
            sign out
          </Button>
        </form>
      </div>

      {banner ? (
        <FlashMessage message={banner} param={doneMessage ? "done" : "error"} />
      ) : null}

      <div className="mt-3">
        {builds.length === 0 ? (
          <Table>
            <TBody>
              <TR>
                <TD className="text-muted">NO BUILDS SUBMITTED YET.</TD>
              </TR>
            </TBody>
          </Table>
        ) : (
          <Table className="min-w-4xl">
            <THead>
              <TR>
                <TH className="w-48">ROM</TH>
                <TH>DETAILS</TH>
                <TH className="hidden w-56 md:table-cell">TIMES</TH>
                <TH className="hidden w-32 md:table-cell">SUBMITTED</TH>
                <TH className="w-40">ACTIONS</TH>
              </TR>
            </THead>
            <TBody>
              {builds.map((build) => (
                <TR key={build.id} hover>
                  <TD className="font-bold">
                    {build.romName || "(no name)"}
                    {build.romVersion ? (
                      <span className="font-normal text-muted">
                        {" "}
                        {build.romVersion}
                      </span>
                    ) : null}
                    {build.androidVersion !== null ? (
                      <span className="block font-normal text-muted">
                        android {build.androidVersion}
                      </span>
                    ) : null}
                  </TD>
                  <TD className="text-muted">{summary(build)}</TD>
                  <TD className="hidden tabular-nums md:table-cell">
                    {times(build)}
                  </TD>
                  <TD className="hidden tabular-nums text-muted md:table-cell">
                    {formatDate(build.createdAt)}
                  </TD>
                  <TD>
                    <div className="flex items-center gap-1">
                      <BracketLink href={`/admin/${build.id}`}>edit</BracketLink>
                      <form action={adminDeleteBuild}>
                        <input type="hidden" name="id" value={build.id} />
                        <DeleteBuildButton label="delete" />
                      </form>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
