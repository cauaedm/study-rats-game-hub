-- Create storage bucket for study photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('study-photos', 'study-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create study_posts table for photo-based study sessions
CREATE TABLE IF NOT EXISTS public.study_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_posts ENABLE ROW LEVEL SECURITY;

-- Policies for study_posts
CREATE POLICY "Users can view their own posts"
  ON public.study_posts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view posts from group members"
  ON public.study_posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm1
      WHERE gm1.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.group_members gm2
        WHERE gm2.group_id = gm1.group_id
        AND gm2.user_id = public.study_posts.user_id
      )
    )
  );

CREATE POLICY "Users can create their own posts"
  ON public.study_posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.study_posts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.study_posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Storage policies for study photos
CREATE POLICY "Users can view study photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'study-photos');

CREATE POLICY "Users can upload their own study photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'study-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own study photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'study-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own study photos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'study-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );