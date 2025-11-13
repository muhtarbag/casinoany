-- Create AI analysis history table
CREATE TABLE public.ai_analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  analysis_type TEXT NOT NULL, -- 'seo', 'content', 'keyword'
  score INTEGER NOT NULL,
  summary TEXT NOT NULL,
  seo_data JSONB,
  serp_data JSONB,
  technical_data JSONB,
  content_data JSONB,
  ux_data JSONB,
  actions JSONB,
  provider TEXT NOT NULL, -- 'openai' or 'lovable-ai' or 'perplexity'
  metadata JSONB
);

-- Create index for faster queries
CREATE INDEX idx_ai_analysis_created_at ON public.ai_analysis_history(created_at DESC);
CREATE INDEX idx_ai_analysis_type ON public.ai_analysis_history(analysis_type);

-- Enable RLS
ALTER TABLE public.ai_analysis_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all analysis history"
  ON public.ai_analysis_history
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert analysis history"
  ON public.ai_analysis_history
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create content optimization suggestions table
CREATE TABLE public.content_optimization_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL, -- 'keyword', 'meta', 'structure', 'readability'
  current_value TEXT,
  suggested_value TEXT NOT NULL,
  reason TEXT NOT NULL,
  impact TEXT NOT NULL, -- 'high', 'medium', 'low'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'applied'
  applied_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Create index
CREATE INDEX idx_content_opt_post_id ON public.content_optimization_suggestions(post_id);
CREATE INDEX idx_content_opt_status ON public.content_optimization_suggestions(status);

-- Enable RLS
ALTER TABLE public.content_optimization_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage content suggestions"
  ON public.content_optimization_suggestions
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create SEO keywords tracking table
CREATE TABLE public.seo_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  difficulty INTEGER, -- 0-100
  current_rank INTEGER,
  target_rank INTEGER,
  related_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'tracking', -- 'tracking', 'won', 'lost'
  metadata JSONB
);

-- Create index
CREATE INDEX idx_seo_keywords_keyword ON public.seo_keywords(keyword);
CREATE INDEX idx_seo_keywords_status ON public.seo_keywords(status);

-- Enable RLS
ALTER TABLE public.seo_keywords ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage keywords"
  ON public.seo_keywords
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create automated changes log table
CREATE TABLE public.ai_automated_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  change_type TEXT NOT NULL, -- 'meta_tag', 'content', 'schema', 'keyword'
  target_type TEXT NOT NULL, -- 'blog_post', 'site', 'page'
  target_id UUID,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT NOT NULL,
  reason TEXT NOT NULL,
  approved_by UUID,
  applied_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'applied'
  metadata JSONB
);

-- Create index
CREATE INDEX idx_ai_changes_target ON public.ai_automated_changes(target_type, target_id);
CREATE INDEX idx_ai_changes_status ON public.ai_automated_changes(status);

-- Enable RLS
ALTER TABLE public.ai_automated_changes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage automated changes"
  ON public.ai_automated_changes
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));