interface StatCardProps {
  label: string;
  value: number;
  hint?: string;
  /** Accent border when the number needs attention */
  highlight?: boolean;
}

export function StatCard({ label, value, hint, highlight = false }: StatCardProps) {
  return (
    <div className={`p-4 rounded-md bg-card border ${highlight ? "border-brass" : "border-line"}`}>
      <p className="text-xs uppercase tracking-wider text-copy font-body">{label}</p>
      <p className="mt-1 text-3xl text-heading font-display">{value}</p>
      {hint && <p className="mt-1 text-xs text-copy/80 font-body">{hint}</p>}
    </div>
  );
}
