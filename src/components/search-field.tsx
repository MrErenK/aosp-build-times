"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const DEBOUNCE_MS = 300;

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="h-4 w-4 shrink-0"
    >
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5 14 14" />
    </svg>
  );
}

export default function SearchField({
  param = "q",
  placeholder = "Search builds",
  initialValue = "",
}: {
  param?: string;
  placeholder?: string;
  initialValue?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();
  const pushed = useRef(initialValue);

  const current = searchParams.get(param) ?? "";

  useEffect(() => {
    if (current === pushed.current) return;
    pushed.current = current;
    setValue(current);
  }, [current]);

  useEffect(() => {
    if (value === current) return;

    const timer = setTimeout(() => {
      pushed.current = value;
      const params = new URLSearchParams(searchParams);
      if (value) params.set(param, value);
      else params.delete(param);
      params.delete("page");
      const qs = params.toString();

      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, current, param, pathname, router, searchParams]);

  return (
    <div className="flex h-10 items-center gap-2 rounded-md border bg-background px-3 text-muted transition-colors focus-within:border-foreground">
      <SearchIcon />
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        enterKeyHint="search"
        className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted sm:text-sm"
      />
      {pending ? <span className="shrink-0 text-xs">Searching…</span> : null}
      {value ? (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="shrink-0 transition-colors hover:text-foreground"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}
