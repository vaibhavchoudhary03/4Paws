-- Check Supabase Auth settings and configuration
-- This will help identify if there are any auth-related issues

-- 1. Check if auth.users table exists and has data
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- 2. Check if there are any recent signup attempts
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check if there are any auth-related errors in the logs
-- (This might not work depending on your Supabase plan)
SELECT 
    timestamp,
    level,
    message,
    metadata
FROM logs 
WHERE message ILIKE '%auth%' 
   OR message ILIKE '%signup%'
   OR message ILIKE '%user%'
ORDER BY timestamp DESC 
LIMIT 10;

-- 4. Check the current auth configuration
SELECT 
    key,
    value
FROM auth.config 
WHERE key IN ('DISABLE_SIGNUP', 'SITE_URL', 'ADDITIONAL_REDIRECT_URLS');

-- 5. Check if there are any RLS policies on auth.users (there shouldn't be)
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE schemaname = 'auth' 
   OR tablename = 'users';

-- 6. Test message
SELECT 'Auth configuration check completed' as status;
