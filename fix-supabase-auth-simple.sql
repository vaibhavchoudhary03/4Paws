-- Simple Supabase Auth Database Error Fix
-- This focuses on the core issue without accessing non-existent tables

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

-- 6. Check if there are any issues with the auth schema itself
SELECT 
    schema_name,
    schema_owner
FROM information_schema.schemata 
WHERE schema_name = 'auth';

-- 7. Check if auth.users table exists and is accessible
SELECT 
    table_name,
    table_type,
    is_insertable_into
FROM information_schema.tables 
WHERE table_schema = 'auth' 
   AND table_name = 'users';

-- 8. Check the structure of auth.users table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
   AND table_name = 'users'
ORDER BY ordinal_position;

-- 9. Final status
SELECT 'Database error investigation completed' as status;
