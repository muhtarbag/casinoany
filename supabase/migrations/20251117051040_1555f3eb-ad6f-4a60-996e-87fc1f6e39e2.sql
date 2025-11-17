-- Create user favorite sites table
CREATE TABLE IF NOT EXISTS public.user_favorite_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.betting_sites(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, site_id)
);

-- Create user site memberships table
CREATE TABLE IF NOT EXISTS public.user_site_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.betting_sites(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  registration_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user complaints table
CREATE TABLE IF NOT EXISTS public.user_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.betting_sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  complaint_type TEXT NOT NULL CHECK (complaint_type IN ('payment', 'bonus', 'support', 'technical', 'other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'rejected')),
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create user bonus tracking table
CREATE TABLE IF NOT EXISTS public.user_bonus_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.betting_sites(id) ON DELETE CASCADE,
  bonus_type TEXT NOT NULL,
  bonus_amount NUMERIC NOT NULL,
  wagering_requirement TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'cancelled')),
  received_date DATE NOT NULL,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  bonus_alerts BOOLEAN DEFAULT true,
  site_updates BOOLEAN DEFAULT true,
  complaint_updates BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_favorite_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_site_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bonus_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_favorite_sites
CREATE POLICY "Users can manage their own favorites"
  ON public.user_favorite_sites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own favorites"
  ON public.user_favorite_sites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_site_memberships
CREATE POLICY "Users can manage their own memberships"
  ON public.user_site_memberships
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_complaints
CREATE POLICY "Users can view their own complaints"
  ON public.user_complaints
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create complaints"
  ON public.user_complaints
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending complaints"
  ON public.user_complaints
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all complaints"
  ON public.user_complaints
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update complaints"
  ON public.user_complaints
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_bonus_tracking
CREATE POLICY "Users can manage their own bonus tracking"
  ON public.user_bonus_tracking
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notification preferences
CREATE POLICY "Users can manage their own notification preferences"
  ON public.user_notification_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_favorite_sites_user_id ON public.user_favorite_sites(user_id);
CREATE INDEX idx_user_favorite_sites_site_id ON public.user_favorite_sites(site_id);
CREATE INDEX idx_user_site_memberships_user_id ON public.user_site_memberships(user_id);
CREATE INDEX idx_user_site_memberships_site_id ON public.user_site_memberships(site_id);
CREATE INDEX idx_user_complaints_user_id ON public.user_complaints(user_id);
CREATE INDEX idx_user_complaints_site_id ON public.user_complaints(site_id);
CREATE INDEX idx_user_complaints_status ON public.user_complaints(status);
CREATE INDEX idx_user_bonus_tracking_user_id ON public.user_bonus_tracking(user_id);
CREATE INDEX idx_user_bonus_tracking_site_id ON public.user_bonus_tracking(site_id);
CREATE INDEX idx_user_bonus_tracking_status ON public.user_bonus_tracking(status);

-- Trigger for updated_at
CREATE TRIGGER update_user_site_memberships_updated_at
  BEFORE UPDATE ON public.user_site_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_complaints_updated_at
  BEFORE UPDATE ON public.user_complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_bonus_tracking_updated_at
  BEFORE UPDATE ON public.user_bonus_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_notification_preferences_updated_at
  BEFORE UPDATE ON public.user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();