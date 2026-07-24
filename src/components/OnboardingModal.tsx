import { useState } from "react";

const STEPS = [
  {
    image: `${import.meta.env.BASE_URL}onboarding/target-shape.png`,
    title: "Define the target shape",
    body: "Open Target shape, set W × H × D, then click cells in the 3D view to sculpt the volume you want to fill.",
  },
  {
    image: `${import.meta.env.BASE_URL}onboarding/edit-piece.png`,
    title: "Design your pieces",
    body: "Select each piece in the sidebar and click cells to build its shape. Up to 7 pieces - piece volume must match the target.",
  },
  {
    image: `${import.meta.env.BASE_URL}onboarding/solution.png`,
    title: "Solve and explore",
    body: "Press Solve, then browse solutions, orbit the view, and use Explode to see how the pieces fit together.",
  },
] as const;

interface Props {
  onClose: () => void;
}

export function OnboardingModal({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm animate-fade-in"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        className="glass w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300/80">
            Quick start · Step {step + 1} of {STEPS.length}
          </p>
          <h2 id="onboarding-title" className="mt-1 text-lg font-bold text-slate-100">
            {current.title}
          </h2>
        </div>

        <div className="bg-black/20 p-3">
          <img
            src={current.image}
            alt=""
            className="mx-auto max-h-52 w-full rounded-xl border border-white/10 object-contain"
          />
        </div>

        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed text-slate-300">{current.body}</p>

          <div className="mt-4 flex items-center justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-5 bg-indigo-400" : "w-1.5 bg-slate-600"
                }`}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              className="btn btn-ghost !px-3 text-xs text-slate-400"
              onClick={onClose}
            >
              Skip
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost !px-4"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Back
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary !px-5"
                onClick={() => (isLast ? onClose() : setStep((s) => s + 1))}
              >
                {isLast ? "Get started" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
