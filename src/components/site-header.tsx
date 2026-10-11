"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/cn";
import ThemeToggle from "@/components/theme-toggle";

const NAV = [
  { href: "/", label: "builds" },
  { href: "/submit", label: "submit" },
] as const;

const slot =
  "inline-flex items-center px-1 py-1 text-xs font-bold uppercase tracking-wider " +
  "transition-colors duration-75 " +
  "invert-hover " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground";

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-background">
      <div className="flex flex-col gap-1 px-2 py-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-3 sm:py-2">
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-wider transition-colors duration-75 invert-hover"
        >
          {SITE.name}
        </Link>

        <nav className="flex flex-wrap items-center gap-0.5">
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
                className={cn(slot, active && "bg-invert text-invert-foreground")}
              >
                <span aria-hidden>[</span>
                {item.label}
                <span aria-hidden>]</span>
              </Link>
            );
          })}

          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noreferrer noopener"
            className={slot}
          >
            <span aria-hidden>[</span>
            source
            <span aria-hidden>]</span>
          </a>

          <ThemeToggle className="-mr-1" />
        </nav>
      </div>
    </header>
  );
}
