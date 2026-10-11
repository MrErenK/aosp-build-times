"use client";

import { useEffect, useState } from "react";

const slot =
  "inline-flex items-center px-1 py-1 text-xs font-bold uppercase tracking-wider " +
  "transition-colors duration-75 hover:bg-background hover:text-foreground " +
  "focus-visible:outline-2 focus-visible:outline-offset-1";

export default function SubmittedToast() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("submitted");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (query ? `?${query}` : ""),
    );
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-14 z-40 flex justify-center px-2 sm:px-3">
      <div
        role="status"
        className="pointer-events-auto flex items-center gap-3 border border-line bg-invert px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-invert-foreground"
      >
        <span aria-hidden>[ok]</span>
        <span>build submitted</span>
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
    </div>
  );
}
