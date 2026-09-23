"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";
import ThemeToggle from "@/components/theme-toggle";

const NAV = [
  { href: "/", label: "Builds" },
  { href: "/submit", label: "Submit" },
] as const;

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-2.91-.88-2.91-2.9 0-.86.31-1.56.82-2.11-.08-.2-.36-1 .08-2.08 0 0 .61-.2 2.01.75a6.8 6.8 0 0 1 1.83-.25c.62 0 1.25.08 1.83.25 1.4-.95 2.01-.75 2.01-.75.44 1.08.16 1.88.08 2.08.51.55.82 1.25.82 2.11 0 2.03-1.13 2.7-2.92 2.9.3.26.56.76.56 1.54 0 1.1-.01 1.99-.01 2.26 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/70 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6 md:h-16 md:flex-nowrap md:gap-6 md:py-0 lg:px-8">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5 font-semibold tracking-tight"
        >
          <span className="min-w-0">{SITE.name}</span>
        </Link>

        <nav className="order-last flex w-full items-center gap-1 text-sm md:order-none md:ml-auto md:w-auto">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/" || pathname.startsWith("/builds")
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-2.5 py-1.5 transition-colors sm:px-3 ${
                  active
                    ? "bg-card font-medium text-foreground"
                    : "text-muted hover:bg-card hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub repository"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-card hover:text-foreground"
          >
            <GithubIcon className="h-4 w-4" />
          </a>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
