-- Add new profile fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS favorite_team TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS favorite_game_providers TEXT[];

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.city IS 'User city (Turkish provinces)';
COMMENT ON COLUMN public.profiles.district IS 'User district';
COMMENT ON COLUMN public.profiles.favorite_team IS 'Favorite Turkish Super League team';
COMMENT ON COLUMN public.profiles.interests IS 'User interests: Spor Bahisleri, Casino, Slot Oyunları, Esports, Poker';
COMMENT ON COLUMN public.profiles.favorite_game_providers IS 'Favorite game providers: Pragmatic, Evolution, EGT, Amusnet, etc.';