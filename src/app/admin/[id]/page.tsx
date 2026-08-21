import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { adminDeleteBuild, adminUpdateBuild } from "@/lib/admin-actions";
import { isAdmin } from "@/lib/admin-auth";
import { getBuild } from "@/lib/db";
import BuildFormFields from "@/components/build-form-fields";
import DeleteBuildButton from "@/components/delete-build-button";

const ERROR_MESSAGES: Record<string, string> = {
  missing: "Please provide at least the ROM name and the clean build time.",
};

export const metadata = { title: "Edit entry - ROM Build Bench" };

export default async function AdminEditPage({
  params,
  searchParams,
}: PageProps<"/admin/[id]">) {
  if (!(await isAdmin())) redirect("/admin/login");

  const { id } = await params;
  const build = await getBuild(id);
  if (!build) notFound();

  const query = await searchParams;
  const errorKey = typeof query?.error === "string" ? query.error : "";
  const errorMessage = ERROR_MESSAGES[errorKey];

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <div className="animate-fade-in-up mb-8">
        <Link
          href="/admin"
          className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to admin
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Edit entry
        </h1>
        <p className="mt-2 text-sm text-muted">
          Submitted {new Date(build.createdAt).toLocaleString()}
        </p>
      </div>

      {errorMessage ? (
        <div className="animate-fade-in-up mb-6 rounded-md border bg-card px-4 py-3 text-sm">
          {errorMessage}
        </div>
      ) : null}

      <form
        action={adminUpdateBuild}
        className="animate-fade-in-up flex flex-col gap-8"
      >
        <input type="hidden" name="id" value={build.id} />
        <BuildFormFields build={build} />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="h-10 rounded-md bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Save changes
          </button>
          <Link
            href="/admin"
            className="h-10 rounded-md border px-5 text-sm font-medium leading-10 transition-colors hover:bg-card"
          >
            Cancel
          </Link>
        </div>
      </form>

      <form action={adminDeleteBuild} className="mt-10 border-t pt-6">
        <input type="hidden" name="id" value={build.id} />
        <DeleteBuildButton
          label="Delete this entry"
          className="h-10 rounded-md border px-5 text-sm font-medium transition-colors hover:bg-card"
        />
      </form>
    </div>
  );
}
