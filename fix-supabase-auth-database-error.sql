-- Fix Supabase Auth Database Error
-- This addresses the 500 error when creating auth users

-- 1. Check if there are any triggers on auth.users that might be failing
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
   OR event_object_schema = 'auth';

-- 2. Check if there are any constraints on auth.users that might be failing
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'auth.users'::regclass;

-- 3. Check if there are any RLS policies on auth.users (there shouldn't be)
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE schemaname = 'auth';

-- 4. Check if the public.users table has any constraints that might conflict
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- 5. Check if there are any foreign key constraints that might be failing
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND (tc.table_name = 'users' OR ccu.table_name = 'users');

-- 6. Temporarily disable any triggers on auth.users (if they exist)
-- This is a safety measure to prevent triggers from interfering
DO $$
BEGIN
    -- Check if there are any triggers and disable them temporarily
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE event_object_table = 'users' 
        AND event_object_schema = 'auth'
    ) THEN
        RAISE NOTICE 'Triggers found on auth.users - they may be causing the issue';
    ELSE
        RAISE NOTICE 'No triggers found on auth.users';
    END IF;
END $$;

-- 7. Check if there are any issues with the auth schema itself
SELECT 
    schema_name,
    schema_owner
FROM information_schema.schemata 
WHERE schema_name = 'auth';

-- 8. Test if we can manually insert into auth.users (this will likely fail, but we'll see the error)
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

-- 9. Check Supabase Auth configuration
SELECT 
    key,
    value
FROM auth.config 
WHERE key IN (
    'DISABLE_SIGNUP',
    'SITE_URL', 
    'ADDITIONAL_REDIRECT_URLS',
    'JWT_SECRET',
    'JWT_EXPIRY'
);

-- 10. Final status
SELECT 'Database error investigation completed' as status;
