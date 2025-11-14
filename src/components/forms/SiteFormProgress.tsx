import { Check } from 'lucide-react';

interface SiteFormProgressProps {
  currentStep: number;
  steps: string[];
}

export function SiteFormProgress({ currentStep, steps }: SiteFormProgressProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex-1 flex flex-col items-center relative">
            {/* Step Circle */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                transition-all duration-300 z-10
                ${
                  index < currentStep
                    ? 'bg-success text-success-foreground'
                    : index === currentStep
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
            </div>
            
            {/* Step Label */}
            <span
              className={`
                mt-2 text-xs font-medium text-center
                ${index === currentStep ? 'text-primary' : 'text-muted-foreground'}
              `}
            >
              {step}
            </span>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2
                  transition-all duration-300
                  ${index < currentStep ? 'bg-success' : 'bg-muted'}
                `}
                style={{ zIndex: 0 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
