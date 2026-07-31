export function EmptyState({ icon = '🗂️', title, description }: { icon?: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-12 text-center">
      <span className="mb-2 text-3xl">{icon}</span>
      <p className="font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-slate-400">{description}</p>}
    </div>
  );
}
