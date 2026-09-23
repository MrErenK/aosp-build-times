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
      className={`rounded-lg border bg-card p-4 transition-transform duration-200 hover:-translate-y-0.5 sm:p-5 ${className}`}
    >
      <div className="text-xl font-semibold tracking-tight sm:text-2xl">
        {value}
      </div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}
