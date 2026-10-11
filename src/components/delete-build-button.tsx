"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/button";

export default function DeleteBuildButton({
  label = "delete",
  message = "Delete this entry? This cannot be undone.",
  className,
  size = "sm",
}: {
  label?: string;
  message?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <Button
        type="submit"
        variant="outline"
        size={size}
        className={className}
        onClick={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
      >
        {label}
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="confirm delete"
            className="w-full max-w-96 border border-line bg-background"
          >
            <div className="border-b border-line bg-surface px-2 py-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider">
                confirm
              </h2>
            </div>
            <div className="flex flex-col gap-3 p-3">
              <p className="text-xs text-muted-strong">{message}</p>
              <div className="flex items-center justify-end gap-2">
                <Button
                  autoFocus
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  cancel
                </Button>
                <Button type="submit" variant="solid" size="sm">
                  {label}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
