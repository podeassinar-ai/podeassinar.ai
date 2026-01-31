interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className = '' }: StepIndicatorProps) {
  return (
    <div className={`flex flex-col md:flex-row justify-between relative ${className}`}>
       {/* Connecting line (hidden on mobile, visible on md) */}
       <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-10 transform -translate-y-1/2" />
       
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <div key={step} className="flex flex-col items-center group">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300 z-10
                ${
                  isCompleted
                    ? 'bg-secondary border-secondary text-white'
                    : isCurrent
                    ? 'bg-primary border-primary text-white shadow-lg scale-110'
                    : 'bg-white border-gray-300 text-gray-400'
                }
              `}
            >
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`mt-2 text-xs uppercase tracking-wider font-semibold transition-colors
                ${
                  isCurrent
                    ? 'text-primary'
                    : isCompleted
                    ? 'text-secondary'
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