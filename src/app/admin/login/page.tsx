import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminLogin } from "@/lib/admin-actions";
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth";
import { Button } from "@/components/button";
import { Field, Input } from "@/components/input";
import { Panel } from "@/components/panel";
import { SITE } from "@/lib/site";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Wrong password.",
  rate: "Too many attempts. Please wait a few minutes and try again.",
};

export const metadata: Metadata = {
  title: `Admin login - ${SITE.name}`,
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  if (await isAdmin()) redirect("/admin");

  const params = await searchParams;
  const errorKey = typeof params?.error === "string" ? params.error : "";
  const errorMessage = ERROR_MESSAGES[errorKey];

  return (
    <div className="mx-auto w-full max-w-sm px-2 py-10 sm:px-3 sm:py-12">
      <p className="text-xs text-muted">CONTROL / ACCESS</p>
      <h1 className="mt-1 text-lg font-bold uppercase tracking-wider">admin</h1>
      <p className="mt-1 text-xs text-muted-strong">
        Enter the admin password to edit or remove submitted builds.
      </p>

      <Panel title="sign in" className="mt-3">
        {!isAdminConfigured() ? (
          <p className="text-xs text-muted">
            No admin password is set. Add{" "}
            <code className="bg-surface px-1">ADMIN_PASSWORD</code> to your{" "}
            <code className="bg-surface px-1">.env.local</code> and restart the
            server.
          </p>
        ) : (
          <>
            {errorMessage ? (
              <p className="mb-2 flex items-center gap-1.5 border border-line bg-surface px-2 py-1.5 text-xs">
                <span aria-hidden className="font-bold">
                  [!]
                </span>
                {errorMessage}
              </p>
            ) : null}

            <form action={adminLogin} className="flex flex-col gap-2">
              <Field label="Password" htmlFor="password">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>
              <Button type="submit" variant="solid" className="w-fit">
                sign in
              </Button>
            </form>
          </>
        )}
      </Panel>
    </div>
  );
}
