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
    <section className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </h2>
        {right}
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
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1">
        <button
          className="h-7 w-7 rounded-lg text-slate-300 transition-colors hover:bg-white/10"
          onClick={() => onChange(clamp(value - 1))}
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-bold tabular-nums text-slate-100">
          {value}
        </span>
        <button
          className="h-7 w-7 rounded-lg text-slate-300 transition-colors hover:bg-white/10"
          onClick={() => onChange(clamp(value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}
