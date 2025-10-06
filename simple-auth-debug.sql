-- Simple Auth Debug - Check what we can actually access
-- This focuses on tables that definitely exist

-- 1. Check if there are any auth users at all
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- 2. Check recent auth activity
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check if there are any constraints on auth.users
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'auth.users'::regclass;

-- 4. Check if there are any triggers on auth.users
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
   AND event_object_schema = 'auth';

-- 5. Check if there are any RLS policies on auth.users (there shouldn't be)
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE schemaname = 'auth';

-- 6. Check the structure of auth.users table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
   AND table_name = 'users'
ORDER BY ordinal_position;

-- 7. Test if we can read from auth.users
SELECT 'Auth users table accessible' as status;

-- 8. Check if there are any recent failed signup attempts in logs
-- (This might not work depending on your Supabase plan)
SELECT 
    timestamp,
    level,
    message,
    metadata
FROM logs 
WHERE message ILIKE '%auth%' 
   OR message ILIKE '%signup%'
   OR message ILIKE '%rate%'
   OR message ILIKE '%limit%'
ORDER BY timestamp DESC 
LIMIT 5;
