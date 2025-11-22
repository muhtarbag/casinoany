import { useState } from 'react';
import { AdBanner } from './AdBanner';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export function MobileStickyAd() {
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = useIsMobile();

  // Don't render on desktop or when not visible
  if (!isMobile || !isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed left-0 right-0 bg-background/98 backdrop-blur-sm border-t border-border/50 shadow-lg transition-all duration-300",
        isVisible ? "translate-y-0" : "translate-y-full",
        "z-[60]" // Higher than bottom nav (z-50)
      )}
      style={{ 
        bottom: '64px', // Above the 64px (h-16) bottom navigation
        maxHeight: '90px' 
      }}
    >
      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-0.5 right-3.5 z-10 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition-colors p-0"
        style={{ width: '20px', height: '20px', minWidth: '20px', minHeight: '20px' }}
        aria-label="Reklamı kapat"
      >
        <X className="text-white" style={{ width: '16px', height: '16px' }} strokeWidth={3} />
      </button>

      {/* Ad Container - Minimal padding */}
      <div className="w-full px-2 py-1.5 overflow-hidden">
        <AdBanner location="mobile_sticky" className="max-h-[80px]" />
      </div>
    </div>
  );
}
