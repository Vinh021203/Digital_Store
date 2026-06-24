-- Add customizable profile header text color.
-- Run once in Supabase SQL Editor.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_text_color TEXT DEFAULT '#0f172a';

COMMENT ON COLUMN public.profiles.profile_text_color IS
'Hex color used for profile name and meta text over the cover banner.';
