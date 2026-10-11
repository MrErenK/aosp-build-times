import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { adminDeleteBuild, adminUpdateBuild } from "@/lib/admin-actions";
import { isAdmin } from "@/lib/admin-auth";
import { getBuild } from "@/lib/db";
import { formatDateTime } from "@/lib/types";
import BuildFormFields from "@/components/build-form-fields";
import DeleteBuildButton from "@/components/delete-build-button";
import FlashMessage from "@/components/flash-message";
import { Button, LinkButton } from "@/components/button";
import { NavLink } from "@/components/link";
import { SITE } from "@/lib/site";

const ERROR_MESSAGES: Record<string, string> = {
  missing: "Please provide at least the ROM name and the clean build time.",
};

export const metadata: Metadata = {
  title: `Edit entry - ${SITE.name}`,
  robots: { index: false, follow: false },
};

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
    <div className="mx-auto w-full max-w-3xl px-2 py-3 sm:px-3 sm:py-4">
      <NavLink href="/admin">back to admin</NavLink>

      <div className="mt-3 border-b border-line pb-3">
        <p className="text-xs text-muted">CONTROL / EDIT</p>
        <h1 className="mt-1 text-lg font-bold uppercase tracking-wider">
          edit entry
        </h1>
        <p className="mt-1 text-xs text-muted">
          Submitted {formatDateTime(build.createdAt)}
        </p>
      </div>

      {errorMessage ? (
        <FlashMessage message={errorMessage} param="error" />
      ) : null}

      <form action={adminUpdateBuild} className="mt-3 flex flex-col gap-4">
        <input type="hidden" name="id" value={build.id} />
        <BuildFormFields build={build} />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="solid">
            save changes
          </Button>
          <LinkButton href="/admin">cancel</LinkButton>
        </div>
      </form>

      <form action={adminDeleteBuild} className="mt-6 border-t border-line pt-4">
        <input type="hidden" name="id" value={build.id} />
        <DeleteBuildButton label="delete this entry" size="md" />
      </form>
    </div>
  );
}
