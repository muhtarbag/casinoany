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
        "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-2xl transition-transform duration-300",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-1 right-1 z-10 w-4 h-4 flex items-center justify-center rounded-full bg-red-500/90 hover:bg-red-600 transition-colors shadow-sm"
        aria-label="Reklamı kapat"
      >
        <X className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
      </button>

      {/* Ad Container */}
      <div className="container mx-auto px-4 py-2">
        <AdBanner location="mobile_sticky" />
      </div>
    </div>
  );
}
