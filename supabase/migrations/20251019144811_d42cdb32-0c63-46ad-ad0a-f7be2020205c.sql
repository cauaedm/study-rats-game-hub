-- Drop the recursive policies
DROP POLICY IF EXISTS "Groups are viewable by members" ON groups;
DROP POLICY IF EXISTS "Group members are viewable by group members" ON group_members;

-- Create security definer function to check group membership
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = _group_id
      AND user_id = _user_id
  )
$$;

-- Create security definer function to check if user is group creator
CREATE OR REPLACE FUNCTION public.is_group_creator(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.groups
    WHERE id = _group_id
      AND creator_id = _user_id
  )
$$;

-- Create non-recursive policy for groups
CREATE POLICY "Groups are viewable by members"
ON groups FOR SELECT
USING (
  creator_id = auth.uid() 
  OR public.is_group_member(id, auth.uid())
);

-- Create non-recursive policy for group_members
CREATE POLICY "Group members are viewable by group members"
ON group_members FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_group_creator(group_id, auth.uid())
  OR public.is_group_member(group_id, auth.uid())
);