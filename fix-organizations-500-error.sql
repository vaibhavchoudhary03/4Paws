-- Fix for 500 error when fetching organizations
-- This script addresses the most common causes of 500 errors

-- 1. First, let's check if the organizations table exists and has data
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename = 'organizations';

-- 2. Check if there are any organizations in the table
SELECT COUNT(*) as total_organizations FROM organizations;

-- 3. Check the structure of the organizations table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'organizations' 
ORDER BY ordinal_position;

-- 4. Drop ALL existing policies on organizations table
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Anyone can view organizations for signup" ON organizations;
DROP POLICY IF EXISTS "Enable read access for all users" ON organizations;

-- 5. Disable RLS completely on organizations table
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- 6. Test if we can read from the table without RLS
SELECT id, name, description, created_at FROM organizations ORDER BY name;

-- 7. Re-enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- 8. Create a very simple policy that allows everyone to read
CREATE POLICY "Allow public read access to organizations" ON organizations
    FOR SELECT 
    USING (true);

-- 9. Test the policy
SELECT id, name, description FROM organizations ORDER BY name;

-- 10. Check if there are any constraints or issues
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'organizations'::regclass;
