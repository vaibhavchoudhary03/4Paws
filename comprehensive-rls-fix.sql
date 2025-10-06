-- Comprehensive RLS Fix for Organizations Table
-- This script will fix all potential RLS issues

-- First, let's check if RLS is enabled on organizations table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'organizations';

-- Drop any existing policies that might be conflicting
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Anyone can view organizations for signup" ON organizations;

-- Disable RLS temporarily to test
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows anyone to read organizations
CREATE POLICY "Anyone can view organizations for signup" ON organizations
  FOR SELECT USING (true);

-- Test the policy by trying to select from organizations
SELECT COUNT(*) as organization_count FROM organizations;

-- Show all organizations
SELECT id, name, description FROM organizations ORDER BY name;
