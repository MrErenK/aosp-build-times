const FALLBACK_ORIGIN = "http://localhost:3000";

export const CONFIGURED_ORIGIN: string | null =
  (process.env.SITE_URL ?? "").trim().replace(/\/+$/, "") || null;

function origin(): string {
  if (CONFIGURED_ORIGIN) return CONFIGURED_ORIGIN;

  if (process.env.NODE_ENV === "production") {
    console.warn(
      `SITE_URL is not set -- canonical URLs fall back to ${FALLBACK_ORIGIN}`,
    );
  }

  return FALLBACK_ORIGIN;
}

export const SITE = {
  name: "AOSP build times",
  tagline: "android rom build times, benchmarked by the community.",
  description:
    "a community-sourced database of Android ROM build times across different server specs and hosting providers.",
  githubUrl: "https://github.com/MrErenK/aosp-build-times",
  aospUrl: "https://source.android.com/docs/setup/start/requirements",
  url: origin(),
} as const;
