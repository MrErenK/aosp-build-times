import { SITE } from "@/lib/site";

const slot =
  "inline-flex items-center px-1 py-1 text-xs font-bold uppercase tracking-wider " +
  "transition-colors duration-75 " +
  "invert-hover " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-2 py-2 text-xs text-muted sm:px-3">
        <span className="text-foreground">
          &copy; {new Date().getFullYear()} {SITE.name}
        </span>

        <div className="flex flex-wrap items-center gap-0.5">
          <a
            href={SITE.aospUrl}
            target="_blank"
            rel="noreferrer noopener"
            className={slot}
          >
            <span aria-hidden>[</span>
            requirements
            <span aria-hidden>]</span>
          </a>
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
          <a href="#top" className={slot}>
            <span aria-hidden>[</span>
            top
            <span aria-hidden>]</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
