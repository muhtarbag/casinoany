/**
 * Notification Management Type Definitions
 * Centralized types for notification system
 */

export interface NotificationFormFields {
  email_label: string;
  phone_label: string;
  submit_text: string;
  success_message: string;
  privacy_text: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  notification_type: string;
  target_url: string | null;
  button_text: string | null;
  button_url: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  display_pages: string[];
  user_segments: string[];
  display_frequency: string;
  priority: number;
  background_color: string | null;
  text_color: string | null;
  trigger_type?: string | null;
  trigger_conditions?: Record<string, any>;
  created_at: string;
  updated_at?: string;
  form_fields?: NotificationFormFields | null;
}

export interface NotificationFormData {
  title: string;
  content: string;
  image_url: string;
  notification_type: string;
  target_url: string;
  button_text: string;
  button_url: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  display_pages: string[];
  user_segments: string[];
  display_frequency: string;
  priority: number;
  background_color: string;
  text_color: string;
  trigger_type: string;
  trigger_conditions: Record<string, any>;
  form_fields: NotificationFormFields;
}

export interface NotificationStats {
  totalViews: number;
  totalClicks: number;
  totalDismissed: number;
  clickThroughRate: number;
  dismissRate: number;
}

export interface NotificationViewData {
  id: string;
  notification_id: string;
  viewed_at: string;
  clicked: boolean;
  dismissed: boolean;
  user_id: string | null;
  session_id: string | null;
}

export type NotificationType = 'popup' | 'banner' | 'toast' | 'form';
export type DisplayFrequency = 'once' | 'once_per_session' | 'always';
export type TriggerType = 'instant' | 'time_on_page' | 'scroll_depth' | 'exit_intent';
export type UserSegment = 'all' | 'new_visitor' | 'returning_visitor' | 'registered' | 'anonymous';
