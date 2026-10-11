import { cn } from "@/lib/cn";

export default function StatCard({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn("border border-line bg-surface px-2.5 py-2 sm:px-2 sm:py-1.5", className)}
    >
      <div className="text-lg font-bold tabular-nums">{value}</div>
      <div className="mt-0.5 text-xs uppercase tracking-wider text-muted">
        {label}
      </div>
    </div>
  );
}
