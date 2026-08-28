export function TableCount({ count, label }: { count: number; label: string }) {
  return (
    <p className="mb-3 text-lg text-brand-400">
      <span className="font-medium tabular-nums">
        {count.toLocaleString()}
      </span>{" "}
      <span className="font-sans text-sm">{label}</span>
    </p>
  );
}
