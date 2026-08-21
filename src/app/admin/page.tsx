import Link from "next/link";
import { redirect } from "next/navigation";
import { adminDeleteBuild, adminLogout } from "@/lib/admin-actions";
import { isAdmin } from "@/lib/admin-auth";
import { getBuilds } from "@/lib/db";
import { formatNetworkSpeed, type BuildRecord } from "@/lib/types";
import DeleteBuildButton from "@/components/delete-build-button";

const MESSAGES: Record<string, string> = {
  updated: "Entry updated.",
  deleted: "Entry deleted.",
};

const ERROR_MESSAGES: Record<string, string> = {
  notfound: "That entry no longer exists.",
};

export const metadata = { title: "Admin - ROM Build Bench" };

function summary(build: BuildRecord): string {
  return (
    [
      build.cpuModel,
      build.cpuCores ? `${build.cpuCores} cores` : null,
      build.memoryGb ? `${build.memoryGb} GB RAM` : null,
      build.hostingProvider,
      formatNetworkSpeed(build),
    ]
      .filter(Boolean)
      .join(" · ") || "No details"
  );
}

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  if (!(await isAdmin())) redirect("/admin/login");

  const params = await searchParams;
  const builds = await getBuilds();
  const doneKey = typeof params?.done === "string" ? params.done : "";
  const errorKey = typeof params?.error === "string" ? params.error : "";
  const banner = MESSAGES[doneKey] ?? ERROR_MESSAGES[errorKey];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="animate-fade-in-up mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
          <p className="mt-2 text-muted">
            {builds.length} {builds.length === 1 ? "entry" : "entries"} in the
            database.
          </p>
        </div>
        <form action={adminLogout}>
          <button
            type="submit"
            className="h-10 rounded-md border px-4 text-sm font-medium transition-colors hover:bg-card"
          >
            Sign out
          </button>
        </form>
      </div>

      {banner ? (
        <div className="animate-fade-in-up mb-6 rounded-md border bg-card px-4 py-3 text-sm">
          {banner}
        </div>
      ) : null}

      {builds.length === 0 ? (
        <div className="rounded-lg border bg-card px-6 py-16 text-center text-muted">
          No builds submitted yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          {builds.map((build) => (
            <div
              key={build.id}
              className="grid grid-cols-1 gap-4 border-b px-5 py-4 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-medium">
                    {build.romName || "(no name)"}
                  </span>
                  <span className="text-sm text-muted">
                    {build.romVersion}
                    {build.androidVersion !== null
                      ? ` · Android ${build.androidVersion}`
                      : ""}
                  </span>
                </div>
                <div className="mt-1 truncate text-sm text-muted">
                  {summary(build)}
                </div>
                <div className="mt-1 font-mono text-xs text-muted">
                  {build.buildMinutes} min clean
                  {build.dirtyBuildMinutes !== null
                    ? ` · ${build.dirtyBuildMinutes} min dirty`
                    : ""}
                  {build.kernelBuildMinutes !== null
                    ? ` · kernel ${build.kernelBuildMinutes} min`
                    : ""}
                  {" · "}
                  {new Date(build.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/${build.id}`}
                  className="h-9 rounded-md border px-3 text-sm font-medium leading-9 transition-colors hover:bg-background"
                >
                  Edit
                </Link>
                <form action={adminDeleteBuild}>
                  <input type="hidden" name="id" value={build.id} />
                  <DeleteBuildButton className="h-9 rounded-md border px-3 text-sm font-medium transition-colors hover:bg-background" />
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
