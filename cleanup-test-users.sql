-- Cleanup Test Users
-- This will delete all test users from both auth and public tables

-- 1. First, let's see what users we have
SELECT 
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 2. See what's in public.users
SELECT 
    id,
    email,
    first_name,
    last_name,
    created_at
FROM public.users 
ORDER BY created_at DESC;

-- 3. See what's in user_memberships
SELECT 
    id,
    user_id,
    organization_id,
    status,
    created_at
FROM public.user_memberships 
ORDER BY created_at DESC;

-- 4. Delete from user_memberships first (due to foreign key constraints)
DELETE FROM public.user_memberships 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email LIKE '%test%' 
    OR email LIKE '%example%'
);

-- 5. Delete from public.users
DELETE FROM public.users 
WHERE email LIKE '%test%' 
OR email LIKE '%example%';

-- 6. Delete from auth.users (this will cascade to other tables)
DELETE FROM auth.users 
WHERE email LIKE '%test%' 
OR email LIKE '%example%';

-- 7. Verify cleanup
SELECT 'Cleanup completed' as status;
SELECT COUNT(*) as remaining_auth_users FROM auth.users;
SELECT COUNT(*) as remaining_public_users FROM public.users;
SELECT COUNT(*) as remaining_memberships FROM public.user_memberships;
