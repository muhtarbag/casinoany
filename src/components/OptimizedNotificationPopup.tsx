import { memo, useCallback } from 'react';
import { NotificationPopup } from './NotificationPopup';

/**
 * Optimized Notification Popup with memoization
 * Prevents unnecessary re-renders
 */
export const OptimizedNotificationPopup = memo(() => {
  return <NotificationPopup />;
}, () => {
  // Custom comparison - always return true to prevent re-renders
  // unless parent explicitly needs to update
  return true;
});

OptimizedNotificationPopup.displayName = 'OptimizedNotificationPopup';
