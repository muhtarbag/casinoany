import { memo, useCallback } from 'react';
import { NotificationPopup } from './NotificationPopup';

/**
 * Optimized Notification Popup with memoization
 * Prevents unnecessary re-renders
 */
export const OptimizedNotificationPopup = memo(() => {
  return <NotificationPopup />;
});

OptimizedNotificationPopup.displayName = 'OptimizedNotificationPopup';
