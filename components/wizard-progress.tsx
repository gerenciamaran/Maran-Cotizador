const STEPS = [
  { step: 1, label: "Consumo" },
  { step: 2, label: "Cliente" },
  { step: 3, label: "Cálculo" },
  { step: 4, label: "Presupuesto" },
];

export function WizardProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {STEPS.map((s, i) => (
        <div key={s.step} className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                s.step === current
                  ? "bg-blue-600 text-white"
                  : s.step < current
                  ? "bg-success text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {s.step}
            </div>
            <span
              className={`text-xs font-medium hidden sm:inline ${
                s.step === current ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-0.5 flex-1 ${s.step < current ? "bg-success" : "bg-gray-100"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
