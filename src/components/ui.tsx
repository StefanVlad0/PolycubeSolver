import type { ReactNode } from "react";

export function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="glass rounded-2xl p-3">
      <div className="mb-2 flex min-w-0 items-center justify-between gap-2">
        <h2 className="shrink-0 text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </h2>
        {right && <div className="shrink-0">{right}</div>}
      </div>
      {children}
    </section>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/5"
    >
      <span>
        <span className="block text-sm font-medium text-slate-200">{label}</span>
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-gradient-to-r from-indigo-500 to-cyan-400" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function NumberStepper({
  label,
  value,
  min = 1,
  max = 8,
  onChange,
  compact = false,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  compact?: boolean;
}) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  if (compact) {
    return (
      <div className="min-w-0">
        <span className="mb-0.5 block text-center text-[10px] font-semibold text-slate-500">
          {label}
        </span>
        <div className="flex items-center justify-center rounded-lg bg-white/5 p-0.5">
          <button
            type="button"
            className="grid h-6 w-6 shrink-0 place-items-center rounded text-xs text-slate-300 transition-colors hover:bg-white/10"
            onClick={() => onChange(clamp(value - 1))}
            aria-label={`Decrease ${label}`}
          >
            −
          </button>
          <span className="w-5 shrink-0 text-center text-xs font-bold tabular-nums text-slate-100">
            {value}
          </span>
          <button
            type="button"
            className="grid h-6 w-6 shrink-0 place-items-center rounded text-xs text-slate-300 transition-colors hover:bg-white/10"
            onClick={() => onChange(clamp(value + 1))}
            aria-label={`Increase ${label}`}
          >
            +
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1">
        <button
          type="button"
          className="h-7 w-7 rounded-lg text-slate-300 transition-colors hover:bg-white/10"
          onClick={() => onChange(clamp(value - 1))}
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-bold tabular-nums text-slate-100">
          {value}
        </span>
        <button
          type="button"
          className="h-7 w-7 rounded-lg text-slate-300 transition-colors hover:bg-white/10"
          onClick={() => onChange(clamp(value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}
