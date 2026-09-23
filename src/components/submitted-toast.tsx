"use client";

import { useEffect, useState } from "react";

export default function SubmittedToast() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("submitted");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (query ? `?${query}` : "")
    );
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-20 flex justify-center px-6">
      <div
        role="status"
        className="animate-toast-in pointer-events-auto flex items-center gap-3 rounded-md border bg-card px-4 py-3 text-sm shadow-sm"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-foreground" />
        Thanks! Your build has been added to the database.
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="ml-2 text-muted transition-colors hover:text-foreground"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
