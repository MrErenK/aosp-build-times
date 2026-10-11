import Link from "next/link";
import { cn } from "@/lib/cn";

const slot =
  "inline-flex items-center px-1 py-1 text-xs font-bold uppercase tracking-wider";

function PageSlot({
  href,
  children,
}: {
  href: string | null;
  children: React.ReactNode;
}) {
  if (!href) {
    return (
      <span className={cn(slot, "text-muted")}>
        <span aria-hidden>[</span>
        {children}
        <span aria-hidden>]</span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        slot,
        "transition-colors duration-75 invert-hover",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground",
      )}
    >
      <span aria-hidden>[</span>
      {children}
      <span aria-hidden>]</span>
    </Link>
  );
}

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

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line px-2 py-2 sm:px-3"
    >
      <p className="text-xs text-muted">
        <span aria-hidden>:: </span>
        <span>page </span>
        <span className="tabular-nums text-foreground">{page}</span>
        <span className="tabular-nums"> / {pageCount}</span>
      </p>

      <div className="flex items-center gap-1">
        <PageSlot href={page > 1 ? href(1) : null}>first</PageSlot>
        <PageSlot href={page > 1 ? href(page - 1) : null}>prev</PageSlot>
        <PageSlot href={page < pageCount ? href(page + 1) : null}>next</PageSlot>
        <PageSlot href={page < pageCount ? href(pageCount) : null}>last</PageSlot>
      </div>
    </nav>
  );
}
