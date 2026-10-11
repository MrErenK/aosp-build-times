import type { Metadata } from "next";
import { createBuild } from "@/lib/actions";
import BuildFormFields from "@/components/build-form-fields";
import { Button, LinkButton } from "@/components/button";
import { NavLink } from "@/components/link";
import { pageMetadata, siteTitle } from "@/lib/seo";

const ERROR_MESSAGES: Record<string, string> = {
  missing: "Please provide at least the ROM name and the build time.",
  rate: "You're submitting too quickly. Please wait a moment and try again.",
};

export const metadata: Metadata = pageMetadata({
  title: siteTitle("Submit a build"),
  description:
    "Record how long a ROM build took on your server and compare it against the community.",
  canonical: "/submit",
});

export default async function SubmitPage({
  searchParams,
}: PageProps<"/submit">) {
  const params = await searchParams;
  const errorKey = typeof params?.error === "string" ? params.error : "";
  const errorMessage = ERROR_MESSAGES[errorKey];

  return (
    <div className="mx-auto w-full max-w-3xl px-2 py-3 sm:px-3 sm:py-4">
      <NavLink href="/">back to builds</NavLink>

      <div className="mt-3 border-b border-line pb-3">
        <p className="text-xs text-muted">CONTRIBUTE / NEW ENTRY</p>
        <h1 className="mt-1 text-lg font-bold uppercase tracking-wider">
          submit a build
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-muted-strong">
          Record how long a ROM build took on your server. Only the ROM name and
          clean build time are required.
        </p>
      </div>

      {errorMessage ? (
        <p className="mt-3 flex items-center gap-1.5 border border-line bg-surface px-2 py-1.5 text-xs">
          <span aria-hidden className="font-bold">
            [!]
          </span>
          {errorMessage}
        </p>
      ) : null}

      <form action={createBuild} className="mt-3 flex flex-col gap-4">
        <BuildFormFields />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="solid">
            submit build
          </Button>
          <LinkButton href="/">cancel</LinkButton>
        </div>
      </form>
    </div>
  );
}
