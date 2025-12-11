import { ReactNode, useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
}

export const PullToRefresh = ({ children, onRefresh }: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const threshold = 80;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        setTouchStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isRefreshing || touchStartY === 0) return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStartY;

      // Only handle pull-to-refresh when at top AND pulling down significantly
      if (distance > 10 && window.scrollY === 0) {
        // Only prevent scroll when we're actively refreshing
        if (distance > 20) {
          e.preventDefault();
        }
        setPullDistance(Math.min(distance, threshold * 1.5));
      } else {
        // Reset if scrolling up or not at top
        setPullDistance(0);
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      setPullDistance(0);
      setTouchStartY(0);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, touchStartY, threshold, onRefresh]);

  const opacity = Math.min(pullDistance / threshold, 1);
  const rotation = (pullDistance / threshold) * 360;

  return (
    <div className="relative w-full">
      {/* Pull indicator */}
      <div
        className="fixed top-16 left-0 right-0 flex items-center justify-center transition-transform z-50"
        style={{
          transform: `translateY(${Math.min(pullDistance - 40, 40)}px)`,
          opacity,
          pointerEvents: 'none'
        }}
      >
        <div className="bg-primary/10 backdrop-blur-sm rounded-full p-3 shadow-lg">
          <RefreshCw
            className={cn(
              "w-6 h-6 text-primary transition-transform",
              isRefreshing && "animate-spin"
            )}
            style={{
              transform: `rotate(${isRefreshing ? 0 : rotation}deg)`
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200 w-full"
        style={{
          transform: `translateY(${isRefreshing ? 60 : 0}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
};
