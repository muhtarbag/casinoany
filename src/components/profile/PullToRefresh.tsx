import { ReactNode, useState, useRef, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const threshold = 80;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        setTouchStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isRefreshing || touchStartY === 0) return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStartY;

      if (distance > 0 && container.scrollTop === 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, threshold * 1.5));
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

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, touchStartY, threshold, onRefresh]);

  const opacity = Math.min(pullDistance / threshold, 1);
  const rotation = (pullDistance / threshold) * 360;

  return (
    <div ref={containerRef} className="relative h-full overflow-auto">
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-transform"
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
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${isRefreshing ? 60 : 0}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
};
