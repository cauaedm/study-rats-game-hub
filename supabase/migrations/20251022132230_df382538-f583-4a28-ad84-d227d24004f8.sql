-- Add bio and goals to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS daily_goal_hours NUMERIC DEFAULT 2,
ADD COLUMN IF NOT EXISTS weekly_goal_hours NUMERIC DEFAULT 10;