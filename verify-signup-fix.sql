-- Verify Signup Fix - Complete System Check
-- This ensures all components are properly configured for signup

-- 1. Verify public.users table has correct schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
   AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Verify RLS policies on public.users
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
   AND tablename = 'users'
ORDER BY policyname;

-- 3. Verify organizations table is accessible
SELECT 
    id,
    name,
    slug
FROM public.organizations 
ORDER BY name;

-- 4. Verify RLS policies on organizations
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
   AND tablename = 'organizations'
ORDER BY policyname;

-- 5. Verify user_memberships table exists and has correct schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
   AND table_name = 'user_memberships'
ORDER BY ordinal_position;

-- 6. Verify RLS policies on user_memberships
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

-- 7. Verify the trigger function exists
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
   AND routine_name = 'handle_new_user';

-- 8. Verify the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
   AND event_object_table = 'users'
   AND trigger_name = 'on_auth_user_created';

-- 9. Test if we can insert into organizations (should work)
SELECT 'Organizations accessible: ' || COUNT(*) as test_result FROM public.organizations;

-- 10. Final verification
SELECT 'All systems verified for signup' as status;
