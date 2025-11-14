import { Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SiteFormProgressProps {
  currentStep: number;
  steps: string[];
}

export function SiteFormProgress({ currentStep, steps }: SiteFormProgressProps) {
  const isMobile = useIsMobile();

  return (
    <div className="w-full mb-6 sm:mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex-1 flex flex-col items-center relative">
            {/* Step Circle */}
            <div
              className={`
                w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm
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
              {index < currentStep ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : index + 1}
            </div>
            
            {/* Step Label */}
            <span
              className={`
                mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-medium text-center leading-tight
                ${index === currentStep ? 'text-primary' : 'text-muted-foreground'}
                ${isMobile ? 'max-w-[60px]' : ''}
              `}
            >
              {isMobile && step.length > 10 ? step.substring(0, 8) + '...' : step}
            </span>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  absolute top-4 sm:top-5 left-1/2 w-full h-0.5 -translate-y-1/2
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
