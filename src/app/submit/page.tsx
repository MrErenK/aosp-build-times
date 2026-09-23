import Link from "next/link";
import { createBuild } from "@/lib/actions";
import BuildFormFields from "@/components/build-form-fields";

const ERROR_MESSAGES: Record<string, string> = {
  missing: "Please provide at least the ROM name and the build time.",
  rate: "You're submitting too quickly. Please wait a moment and try again.",
};

export default async function SubmitPage({
  searchParams,
}: PageProps<"/submit">) {
  const params = await searchParams;
  const errorKey = typeof params?.error === "string" ? params.error : "";
  const errorMessage = ERROR_MESSAGES[errorKey];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 animate-fade-in-up">
        <Link
          href="/"
          className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to builds
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Submit a build
        </h1>
        <p className="mt-2 text-muted">
          Record how long a ROM build took on your server. Only the ROM name and
          clean build time are required.
        </p>
      </div>

      {errorMessage ? (
        <div className="animate-fade-in-up mb-6 rounded-md border bg-card px-4 py-3 text-sm">
          {errorMessage}
        </div>
      ) : null}

      <form
        action={createBuild}
        className="animate-fade-in-up flex flex-col gap-8"
      >
        <BuildFormFields />

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="h-10 rounded-md bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Submit build
          </button>
          <Link
            href="/"
            className="h-10 rounded-md border px-5 text-sm font-medium leading-10 transition-colors hover:bg-card"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
