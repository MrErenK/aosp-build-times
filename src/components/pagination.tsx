import Link from "next/link";

const buttonClass =
  "h-9 rounded-md border px-3 text-sm font-medium leading-9 transition-colors hover:bg-foreground/5";

const disabledClass =
  "h-9 rounded-md border px-3 text-sm font-medium leading-9 text-muted opacity-50";

export default function Pagination({
  page,
  pageCount,
  query = "",
  basePath = "/",
}: {
  page: number;
  pageCount: number;
  query?: string;
  basePath?: string;
}) {
  if (pageCount <= 1) return null;

  function href(target: number): string {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const previous = page - 1;
  const next = page + 1;

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex flex-wrap items-center justify-between gap-4"
    >
      {previous >= 1 ? (
        <Link href={href(previous)} className={buttonClass}>
          ← Newer
        </Link>
      ) : (
        <span className={disabledClass}>← Newer</span>
      )}

      <span className="text-sm text-muted">
        Page {page} of {pageCount}
      </span>

      {next <= pageCount ? (
        <Link href={href(next)} className={buttonClass}>
          Older →
        </Link>
      ) : (
        <span className={disabledClass}>Older →</span>
      )}
    </nav>
  );
}
