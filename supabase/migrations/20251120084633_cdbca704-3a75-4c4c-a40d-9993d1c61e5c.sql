-- Add missing columns to user_notifications if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_notifications' AND column_name = 'image_url') THEN
    ALTER TABLE public.user_notifications ADD COLUMN image_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_notifications' AND column_name = 'metadata') THEN
    ALTER TABLE public.user_notifications ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create user_notification_reads table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_notification_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES public.user_notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

-- Create user_notification_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  bonus_notifications BOOLEAN NOT NULL DEFAULT true,
  campaign_notifications BOOLEAN NOT NULL DEFAULT true,
  achievement_notifications BOOLEAN NOT NULL DEFAULT true,
  interaction_notifications BOOLEAN NOT NULL DEFAULT true,
  system_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_notification_reads_user ON public.user_notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_reads_notification ON public.user_notification_reads(notification_id);

-- Enable RLS
ALTER TABLE public.user_notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for user_notification_reads
DROP POLICY IF EXISTS "Users can view their own notification reads" ON public.user_notification_reads;
DROP POLICY IF EXISTS "Users can insert their own notification reads" ON public.user_notification_reads;
DROP POLICY IF EXISTS "Admins can view all notification reads" ON public.user_notification_reads;

CREATE POLICY "Users can view their own notification reads"
  ON public.user_notification_reads
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification reads"
  ON public.user_notification_reads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all notification reads"
  ON public.user_notification_reads
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Drop and recreate policies for user_notification_preferences
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_notification_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_notification_preferences;

CREATE POLICY "Users can view their own preferences"
  ON public.user_notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_notification_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create default notification preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger (drop if exists first)
DROP TRIGGER IF EXISTS on_user_created_notification_preferences ON auth.users;
CREATE TRIGGER on_user_created_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_notification_preferences();