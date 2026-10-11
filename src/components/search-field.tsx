"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/input";

const DEBOUNCE_MS = 300;

const slot =
  "inline-flex items-center px-1 py-1 text-xs font-bold uppercase tracking-wider " +
  "transition-colors duration-75 invert-hover " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground";

export default function SearchField({
  param = "q",
  placeholder = "search builds",
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
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor="search"
          className="text-xs uppercase tracking-wider text-muted"
        >
          search
        </label>
        <span aria-live="polite" className="text-xs text-muted">
          {pending ? "[updating]" : ""}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Input
          id="search"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          className="flex-1"
        />
        {value ? (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Clear search"
            className={slot}
          >
            <span aria-hidden>[</span>
            clear
            <span aria-hidden>]</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
