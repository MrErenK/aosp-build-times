"use client";

import { useEffect, useState } from "react";

const slot =
  "inline-flex items-center px-1 py-1 text-xs font-bold uppercase tracking-wider " +
  "transition-colors duration-75 invert-hover " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground";

export default function FlashMessage({
  message,
  param,
}: {
  message: string;
  param: string;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete(param);
    window.history.replaceState(null, "", url.pathname + url.search);
  }, [param]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="mb-4 flex items-center justify-between gap-3 border border-line bg-surface px-2 py-1.5 text-xs"
    >
      <span>
        <span aria-hidden className="font-bold">
          [i]{" "}
        </span>
        {message}
      </span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className={slot}
        aria-label="Dismiss"
      >
        <span aria-hidden>[</span>
        x
        <span aria-hidden>]</span>
      </button>
    </div>
  );
}
