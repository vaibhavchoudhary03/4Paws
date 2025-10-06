-- Check Supabase Auth Configuration
-- This will help identify why auth signup is being rate limited

-- 1. Check if there are any auth configuration issues
SELECT 
    key,
    value
FROM auth.config 
WHERE key IN (
    'DISABLE_SIGNUP',
    'SITE_URL', 
    'ADDITIONAL_REDIRECT_URLS',
    'JWT_SECRET',
    'JWT_EXPIRY',
    'RATE_LIMIT_HEADER',
    'RATE_LIMIT_ENABLED'
);

-- 2. Check if there are any auth users at all
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- 3. Check recent auth activity
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Check if there are any auth-related errors in logs
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
LIMIT 10;

-- 5. Check if there are any constraints on auth.users
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'auth.users'::regclass;

-- 6. Check if there are any triggers on auth.users
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
   AND event_object_schema = 'auth';

-- 7. Test if we can manually create an auth user (this will likely fail, but we'll see the error)
-- This is just for testing - don't run this in production
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--     gen_random_uuid(),
--     'test@example.com',
--     crypt('password123', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW()
-- );

-- 8. Final status
SELECT 'Auth configuration check completed' as status;
