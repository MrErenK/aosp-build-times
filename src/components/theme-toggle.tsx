"use client";

import { Button } from "@/components/button";

export default function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={toggle}
      className={className}
      aria-label="Toggle colour theme"
    >
      <span aria-hidden className="dark:hidden">
        [light]
      </span>
      <span aria-hidden className="hidden dark:inline">
        [dark]
      </span>
    </Button>
  );
}
