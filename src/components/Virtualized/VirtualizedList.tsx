/**
 * Optimized Virtualized List Component
 * Uses React Virtual for efficient rendering of large lists
 */

import { memo, useRef, ReactElement } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactElement;
  estimateSize?: number;
  overscan?: number;
  className?: string;
  itemClassName?: string;
}

function VirtualizedListComponent<T>({
  items,
  renderItem,
  estimateSize = 100,
  overscan = 5,
  className = '',
  itemClassName = ''
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div 
      ref={parentRef} 
      className={className}
      style={{
        height: '100%',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              className={itemClassName}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Memoized version with generic type support
export const VirtualizedList = memo(VirtualizedListComponent) as typeof VirtualizedListComponent;
