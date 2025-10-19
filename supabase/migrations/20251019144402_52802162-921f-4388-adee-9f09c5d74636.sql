-- Fix infinite recursion in RLS policies

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Groups are viewable by members" ON groups;
DROP POLICY IF EXISTS "Group members are viewable by group members" ON group_members;

-- Recreate groups policies correctly
CREATE POLICY "Groups are viewable by members"
ON groups FOR SELECT
USING (
  creator_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid()
  )
);

-- Recreate group_members policies correctly
CREATE POLICY "Group members are viewable by group members"
ON group_members FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid()
  )
);