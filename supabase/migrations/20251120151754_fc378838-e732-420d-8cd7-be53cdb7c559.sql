-- Süper Lig takımları tablosu
CREATE TABLE IF NOT EXISTS public.super_lig_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  logo_url TEXT,
  stadium TEXT,
  coach TEXT,
  founded_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Süper Lig puan durumu tablosu
CREATE TABLE IF NOT EXISTS public.super_lig_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.super_lig_teams(id) ON DELETE CASCADE,
  season TEXT NOT NULL DEFAULT '2024-2025',
  position INTEGER NOT NULL,
  played INTEGER NOT NULL DEFAULT 0,
  won INTEGER NOT NULL DEFAULT 0,
  drawn INTEGER NOT NULL DEFAULT 0,
  lost INTEGER NOT NULL DEFAULT 0,
  goals_for INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  goal_difference INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, season)
);

-- Süper Lig fikstür tablosu
CREATE TABLE IF NOT EXISTS public.super_lig_fixtures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season TEXT NOT NULL DEFAULT '2024-2025',
  week INTEGER NOT NULL,
  home_team_id UUID NOT NULL REFERENCES public.super_lig_teams(id) ON DELETE CASCADE,
  away_team_id UUID NOT NULL REFERENCES public.super_lig_teams(id) ON DELETE CASCADE,
  match_date TIMESTAMP WITH TIME ZONE,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, live, finished, postponed
  venue TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies - Herkese okuma izni
ALTER TABLE public.super_lig_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_lig_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_lig_fixtures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teams"
  ON public.super_lig_teams FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view standings"
  ON public.super_lig_standings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view fixtures"
  ON public.super_lig_fixtures FOR SELECT
  USING (true);

-- Admin insert/update policies
CREATE POLICY "Admins can manage teams"
  ON public.super_lig_teams FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can manage standings"
  ON public.super_lig_standings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can manage fixtures"
  ON public.super_lig_fixtures FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND status = 'approved'
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_super_lig_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_super_lig_teams_updated_at
  BEFORE UPDATE ON public.super_lig_teams
  FOR EACH ROW EXECUTE FUNCTION public.update_super_lig_updated_at();

CREATE TRIGGER update_super_lig_standings_updated_at
  BEFORE UPDATE ON public.super_lig_standings
  FOR EACH ROW EXECUTE FUNCTION public.update_super_lig_updated_at();

CREATE TRIGGER update_super_lig_fixtures_updated_at
  BEFORE UPDATE ON public.super_lig_fixtures
  FOR EACH ROW EXECUTE FUNCTION public.update_super_lig_updated_at();

-- İndeksler
CREATE INDEX idx_standings_season ON public.super_lig_standings(season);
CREATE INDEX idx_standings_position ON public.super_lig_standings(position);
CREATE INDEX idx_fixtures_season_week ON public.super_lig_fixtures(season, week);
CREATE INDEX idx_fixtures_date ON public.super_lig_fixtures(match_date);
CREATE INDEX idx_fixtures_status ON public.super_lig_fixtures(status);