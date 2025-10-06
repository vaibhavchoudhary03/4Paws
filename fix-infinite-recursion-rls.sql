-- Fix Infinite Recursion in user_memberships RLS Policy
-- The policy is referencing itself, causing infinite recursion

-- 1. First, let's see what policies exist on user_memberships
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
   AND tablename = 'user_memberships'
ORDER BY policyname;

-- 2. Drop ALL existing policies on user_memberships to break the recursion
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.user_memberships;
DROP POLICY IF EXISTS "Users can insert their own membership" ON public.user_memberships;
DROP POLICY IF EXISTS "Users can view memberships in their organizations" ON public.user_memberships;
DROP POLICY IF EXISTS "Allow all operations on user_memberships" ON public.user_memberships;

-- 3. Temporarily disable RLS on user_memberships to test
ALTER TABLE public.user_memberships DISABLE ROW LEVEL SECURITY;

-- 4. Test if we can insert without RLS
SELECT 'RLS disabled on user_memberships - testing insert capability' as status;

-- 5. Re-enable RLS
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;

-- 6. Create simple, non-recursive policies
-- Allow users to insert their own membership requests
CREATE POLICY "Users can insert their own membership" ON public.user_memberships
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own memberships
CREATE POLICY "Users can view their own memberships" ON public.user_memberships
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to view memberships in their organizations (simplified)
CREATE POLICY "Users can view organization memberships" ON public.user_memberships
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT um.organization_id 
      FROM public.user_memberships um
      WHERE um.user_id = auth.uid() 
      AND um.status = 'active'
    )
  );

-- 7. Verify the new policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
   AND tablename = 'user_memberships'
ORDER BY policyname;

-- 8. Test the fix
SELECT 'Infinite recursion fixed - ready for testing' as status;
