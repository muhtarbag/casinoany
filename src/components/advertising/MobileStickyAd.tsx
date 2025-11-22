import { useState, useEffect } from 'react';
import { AdBanner } from './AdBanner';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileStickyAd() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render on desktop
  if (!isMobile || !isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-sm border-t border-border/50 shadow-lg transition-transform duration-300",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
      style={{ maxHeight: '100px' }}
    >
      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute -top-2 right-2 z-10 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition-colors shadow-md"
        aria-label="Reklamı kapat"
      >
        <X className="w-3 h-3 text-white" strokeWidth={3} />
      </button>

      {/* Ad Container - Minimal padding */}
      <div className="w-full px-2 py-1 overflow-hidden">
        <AdBanner location="mobile_sticky" className="max-h-[90px]" />
      </div>
    </div>
  );
}
