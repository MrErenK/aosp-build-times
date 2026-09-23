import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminLogin } from "@/lib/admin-actions";
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth";
import { SITE } from "@/lib/site";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Wrong password.",
  rate: "Too many attempts. Please wait a few minutes and try again.",
};

export const metadata: Metadata = { title: `Admin login - ${SITE.name}` };

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  if (await isAdmin()) redirect("/admin");

  const params = await searchParams;
  const errorKey = typeof params?.error === "string" ? params.error : "";
  const errorMessage = ERROR_MESSAGES[errorKey];

  return (
    <div className="mx-auto w-full max-w-sm px-6 py-20">
      <div className="animate-fade-in-up rounded-lg border bg-card p-6">
        <h1 className="text-xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-2 text-sm text-muted">
          Enter the admin password to edit or remove submitted builds.
        </p>

        {!isAdminConfigured() ? (
          <p className="mt-4 rounded-md border px-3 py-2 text-sm text-muted">
            No admin password is set. Add{" "}
            <code className="font-mono">ADMIN_PASSWORD</code> to your{" "}
            <code className="font-mono">.env.local</code> and restart the
            server.
          </p>
        ) : (
          <>
            {errorMessage ? (
              <p className="mt-4 rounded-md border px-3 py-2 text-sm">
                {errorMessage}
              </p>
            ) : null}

            <form action={adminLogin} className="mt-5 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Password</span>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="h-10 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-foreground"
                />
              </label>
              <button
                type="submit"
                className="h-10 rounded-md bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Sign in
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
