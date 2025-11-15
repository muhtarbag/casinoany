import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  mobileChildren?: ReactNode;
  className?: string;
  mobileClassName?: string;
}

export function ResponsiveContainer({
  children,
  mobileChildren,
  className,
  mobileClassName,
}: ResponsiveContainerProps) {
  const isMobile = useIsMobile();

  if (isMobile && mobileChildren) {
    return (
      <div className={cn('lg:hidden', mobileClassName)}>
        {mobileChildren}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className={cn(className, mobileClassName)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn('hidden lg:block', className)}>
      {children}
    </div>
  );
}
