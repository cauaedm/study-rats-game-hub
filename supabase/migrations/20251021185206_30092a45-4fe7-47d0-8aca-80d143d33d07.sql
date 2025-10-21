-- Add password column to groups table
ALTER TABLE public.groups 
ADD COLUMN password TEXT;

-- Add column to control if group is public or private
ALTER TABLE public.groups 
ADD COLUMN is_public BOOLEAN DEFAULT true;

-- Update RLS policy to allow viewing public groups
DROP POLICY IF EXISTS "Groups are viewable by members" ON public.groups;

CREATE POLICY "Groups are viewable by members or public" 
ON public.groups 
FOR SELECT 
USING (
  (creator_id = auth.uid()) 
  OR is_group_member(id, auth.uid())
  OR is_public = true
);