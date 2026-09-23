import Link from "next/link";
import { SITE } from "@/lib/site";

const linkClass =
  "text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline";

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
      {children}
    </h3>
  );
}

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-card/40">
      <div className="w-full px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5 font-semibold tracking-tight">
              {SITE.name}
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">{SITE.tagline}</p>
          </div>

          <div className="flex flex-col gap-2.5 text-sm">
            <ColumnTitle>Site</ColumnTitle>
            <Link href="/" className={linkClass}>
              All builds
            </Link>
            <Link href="/submit" className={linkClass}>
              Submit a build
            </Link>
          </div>

          <div className="flex flex-col gap-2.5 text-sm">
            <ColumnTitle>Project</ColumnTitle>
            <a
              href={SITE.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className={`${linkClass} inline-flex items-center gap-1.5`}
            >
              GitHub
            </a>
          </div>

          <div className="flex flex-col gap-2.5 text-sm">
            <ColumnTitle>Resources</ColumnTitle>
            <a
              href={SITE.aospUrl}
              target="_blank"
              rel="noreferrer noopener"
              className={linkClass}
            >
              AOSP build requirements
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Community-submitted data, provided as-is. Build times vary with
            source tree, ccache and thermals.
          </p>
          <p>© {new Date().getFullYear()} {SITE.name}</p>
        </div>
      </div>
    </footer>
  );
}
