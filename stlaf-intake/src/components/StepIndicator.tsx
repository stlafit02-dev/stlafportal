interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = ["1. CLIENT INFO", "2. SERVICES WANTED", "3. DETAILS & BOOKING"];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="step-indicator">
      <div className="step-bars">
        {STEPS.map((_, i) => (
          <div key={i} className={`step-bar ${i + 1 <= currentStep ? "step-bar-active" : ""}`} />
        ))}
      </div>
      <div className="step-labels">
        {STEPS.map((label, i) => (
          <span key={label} className={i + 1 === currentStep ? "step-label-active" : ""}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}