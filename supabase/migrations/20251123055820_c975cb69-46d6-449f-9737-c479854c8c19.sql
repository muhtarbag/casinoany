-- Remove favorite_game_providers column from profiles table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS favorite_game_providers;