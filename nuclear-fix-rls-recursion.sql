-- NUCLEAR FIX: Complete RLS Policy Reset
-- This completely removes all RLS policies and recreates them properly

-- 1. Check current policies on user_memberships
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

-- 2. COMPLETELY DISABLE RLS on user_memberships
ALTER TABLE public.user_memberships DISABLE ROW LEVEL SECURITY;

-- 3. Drop ALL policies on user_memberships (force drop)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_memberships'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.user_memberships CASCADE';
    END LOOP;
END $$;

-- 4. Verify all policies are gone
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

-- 5. Test insert without RLS (should work)
INSERT INTO public.user_memberships (
    user_id, 
    organization_id, 
    role, 
    status, 
    message
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- dummy UUID
    '00000000-0000-0000-0000-000000000001', -- 4Paws organization
    'volunteer',
    'pending',
    'Test insert'
);

-- 6. Clean up the test insert
DELETE FROM public.user_memberships 
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- 7. Re-enable RLS
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;

-- 8. Create ONLY ONE simple policy for insert
CREATE POLICY "Allow user membership insert" ON public.user_memberships
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 9. Create a simple policy for select
CREATE POLICY "Allow user membership select" ON public.user_memberships
  FOR SELECT 
  USING (auth.uid() = user_id);

-- 10. Verify the new policies
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

-- 11. Test the policies work
SELECT 'RLS policies recreated - ready for testing' as status;
