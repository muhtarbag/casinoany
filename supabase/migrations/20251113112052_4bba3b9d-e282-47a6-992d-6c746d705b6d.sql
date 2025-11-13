-- Rol tipi oluştur
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Kullanıcı rolleri tablosu (ÖNCE OLUŞTUR)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- RLS aktif et
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi rollerini görebilir
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Security definer function - rol kontrolü için
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Adminler tüm rolleri görebilir
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Bahis siteleri tablosu
CREATE TABLE public.betting_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
  bonus TEXT,
  features TEXT[],
  affiliate_link TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  telegram TEXT,
  twitter TEXT,
  instagram TEXT,
  facebook TEXT,
  youtube TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS aktif et
ALTER TABLE public.betting_sites ENABLE ROW LEVEL SECURITY;

-- Herkes aktif siteleri görebilir
CREATE POLICY "Anyone can view active sites"
ON public.betting_sites
FOR SELECT
USING (is_active = true);

-- Sadece adminler site ekleyebilir
CREATE POLICY "Admins can insert sites"
ON public.betting_sites
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Sadece adminler site güncelleyebilir
CREATE POLICY "Admins can update sites"
ON public.betting_sites
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Sadece adminler site silebilir
CREATE POLICY "Admins can delete sites"
ON public.betting_sites
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp güncelleyici trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger ekle
CREATE TRIGGER update_betting_sites_updated_at
BEFORE UPDATE ON public.betting_sites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket oluştur (logolar için)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-logos', 'site-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'site-logos');

CREATE POLICY "Admins can upload logos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'site-logos' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update logos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'site-logos' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete logos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'site-logos' AND
  public.has_role(auth.uid(), 'admin')
);