"use client";

import { useEffect, useState } from "react";

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
    <div className="animate-fade-in-up mb-6 flex items-start justify-between gap-4 rounded-md border bg-card px-4 py-3 text-sm">
      <span>{message}</span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="text-muted transition-colors hover:text-foreground"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
