-- Disable Email Confirmations for Development
-- This allows users to sign up without email confirmation

-- 1. Check current auth configuration
SELECT 'Checking auth configuration...' as status;

-- 2. Since we can't access auth.config directly, we need to check Supabase Dashboard
-- Go to: Authentication → Settings → Email Confirmations
-- Turn OFF "Enable email confirmations"

-- 3. Alternative: Check if there are any auth-related settings we can modify
SELECT 'Please check Supabase Dashboard for email confirmation settings' as instruction;

-- 4. For now, let's verify that auth users are being created
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
        ELSE 'Pending Confirmation'
    END as status
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Check if we can manually confirm a user (for testing)
-- This is just for testing - don't run this in production
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW()
-- WHERE email = 'your-test-email@example.com';

-- 6. Final status
SELECT 'Email confirmation check completed' as status;
