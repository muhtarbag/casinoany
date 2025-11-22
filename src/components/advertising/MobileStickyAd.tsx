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
        className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-muted transition-colors"
        aria-label="Reklamı kapat"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Ad Container */}
      <div className="container mx-auto px-4 py-2">
        <AdBanner location="mobile_sticky" />
      </div>
    </div>
  );
}
