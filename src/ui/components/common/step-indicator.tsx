interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className = '' }: StepIndicatorProps) {
  return (
    <div className={`flex flex-col md:flex-row justify-between relative ${className}`}>
      {/* Connecting line (hidden on mobile, visible on md) */}
      <div className="hidden md:block absolute top-[16px] left-[40px] right-[40px] h-0.5 -z-10">
        <div className="absolute inset-0 bg-gray-200" />
        <div
          className="absolute inset-y-0 left-0 bg-success transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step} className="flex flex-col items-center group relative px-4">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300 z-10
                ${isCompleted
                  ? 'bg-success border-success text-white'
                  : isCurrent
                    ? 'bg-primary border-primary text-white shadow-glow scale-110'
                    : 'bg-white border-gray-300 text-gray-400'
                }
              `}
            >
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`mt-2 text-[10px] md:text-xs uppercase tracking-wider font-semibold transition-colors
                ${isCurrent
                  ? 'text-primary'
                  : isCompleted
                    ? 'text-success'
                    : 'text-gray-400'
                }
              `}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}