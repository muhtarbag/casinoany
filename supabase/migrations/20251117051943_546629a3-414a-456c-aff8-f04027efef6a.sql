-- Create public site complaints table (different from user_complaints)
CREATE TABLE IF NOT EXISTS public.site_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.betting_sites(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Anonymous complaints
  anonymous_name TEXT,
  anonymous_email TEXT,
  
  -- Complaint details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('odeme', 'bonus', 'musteri_hizmetleri', 'teknik', 'guvenlik', 'diger')),
  severity TEXT NOT NULL DEFAULT 'normal' CHECK (severity IN ('low', 'normal', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'closed')),
  
  -- Public vs private
  is_public BOOLEAN DEFAULT true,
  
  -- Engagement
  upvotes INTEGER DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create complaint responses table
CREATE TABLE IF NOT EXISTS public.complaint_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.site_complaints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  response_text TEXT NOT NULL,
  is_site_owner_response BOOLEAN DEFAULT false,
  is_official BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_complaints

-- Anyone can view public complaints
CREATE POLICY "Anyone can view public complaints"
  ON public.site_complaints
  FOR SELECT
  USING (is_public = true);

-- Users can view their own complaints
CREATE POLICY "Users can view their own complaints"
  ON public.site_complaints
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Authenticated users can create complaints
CREATE POLICY "Authenticated users can create complaints"
  ON public.site_complaints
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Anonymous users can create public complaints
CREATE POLICY "Anonymous can create public complaints"
  ON public.site_complaints
  FOR INSERT
  TO anon
  WITH CHECK (
    is_public = true 
    AND user_id IS NULL 
    AND anonymous_name IS NOT NULL 
    AND anonymous_email IS NOT NULL
  );

-- Users can update their own pending complaints
CREATE POLICY "Users can update their own pending complaints"
  ON public.site_complaints
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'open')
  WITH CHECK (user_id = auth.uid());

-- Site owners can update complaints about their sites
CREATE POLICY "Site owners can update complaints about their sites"
  ON public.site_complaints
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.site_owners
      WHERE site_owners.user_id = auth.uid()
        AND site_owners.site_id = site_complaints.site_id
        AND site_owners.status = 'approved'
    )
  );

-- Admins can manage all complaints
CREATE POLICY "Admins can manage all complaints"
  ON public.site_complaints
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for complaint_responses

-- Anyone can view responses to public complaints
CREATE POLICY "Anyone can view responses to public complaints"
  ON public.complaint_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.site_complaints
      WHERE site_complaints.id = complaint_responses.complaint_id
        AND site_complaints.is_public = true
    )
  );

-- Users can view responses to their own complaints
CREATE POLICY "Users can view responses to their complaints"
  ON public.complaint_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.site_complaints
      WHERE site_complaints.id = complaint_responses.complaint_id
        AND site_complaints.user_id = auth.uid()
    )
  );

-- Authenticated users can add responses
CREATE POLICY "Authenticated users can add responses"
  ON public.complaint_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Site owners can mark their responses as official
CREATE POLICY "Site owners can mark responses as official"
  ON public.complaint_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      is_site_owner_response = false
      OR EXISTS (
        SELECT 1 FROM public.site_owners so
        JOIN public.site_complaints sc ON sc.site_id = so.site_id
        WHERE so.user_id = auth.uid()
          AND sc.id = complaint_responses.complaint_id
          AND so.status = 'approved'
      )
    )
  );

-- Users can update their own responses
CREATE POLICY "Users can update their own responses"
  ON public.complaint_responses
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own responses
CREATE POLICY "Users can delete their own responses"
  ON public.complaint_responses
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can manage all responses
CREATE POLICY "Admins can manage all responses"
  ON public.complaint_responses
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_site_complaints_site_id ON public.site_complaints(site_id);
CREATE INDEX idx_site_complaints_user_id ON public.site_complaints(user_id);
CREATE INDEX idx_site_complaints_status ON public.site_complaints(status);
CREATE INDEX idx_site_complaints_category ON public.site_complaints(category);
CREATE INDEX idx_site_complaints_is_public ON public.site_complaints(is_public);
CREATE INDEX idx_site_complaints_created_at ON public.site_complaints(created_at DESC);

CREATE INDEX idx_complaint_responses_complaint_id ON public.complaint_responses(complaint_id);
CREATE INDEX idx_complaint_responses_user_id ON public.complaint_responses(user_id);
CREATE INDEX idx_complaint_responses_is_official ON public.complaint_responses(is_official);

-- Trigger for updated_at
CREATE TRIGGER update_site_complaints_updated_at
  BEFORE UPDATE ON public.site_complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complaint_responses_updated_at
  BEFORE UPDATE ON public.complaint_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update response count
CREATE OR REPLACE FUNCTION update_complaint_response_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.site_complaints
    SET response_count = response_count + 1
    WHERE id = NEW.complaint_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.site_complaints
    SET response_count = response_count - 1
    WHERE id = OLD.complaint_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update response count
CREATE TRIGGER update_complaint_response_count_trigger
  AFTER INSERT OR DELETE ON public.complaint_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_complaint_response_count();