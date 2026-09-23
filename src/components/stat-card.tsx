export default function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 transition-transform duration-200 hover:-translate-y-0.5 sm:p-5">
      <div className="text-xl font-semibold tracking-tight sm:text-2xl">
        {value}
      </div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}
