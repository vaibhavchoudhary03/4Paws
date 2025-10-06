-- Fix RLS policies for user signup process (ROBUST VERSION)
-- This handles existing policies and creates the necessary ones for signup

-- 1. Check current RLS status on users table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- 2. Drop ALL existing policies on users table (using CASCADE to handle dependencies)
DROP POLICY IF EXISTS "Users can view profiles in their organizations" ON users CASCADE;
DROP POLICY IF EXISTS "Users can update their own profile" ON users CASCADE;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users CASCADE;
DROP POLICY IF EXISTS "Users can view their own profile" ON users CASCADE;

-- 3. Create policies for users table
-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to view profiles in their organizations (for staff/admin)
CREATE POLICY "Users can view profiles in their organizations" ON users
  FOR SELECT USING (
    id IN (
      SELECT user_id 
      FROM user_memberships 
      WHERE organization_id IN (
        SELECT organization_id 
        FROM user_memberships 
        WHERE user_id = auth.uid() 
        AND status = 'active'
      )
    )
  );

-- 4. Check current RLS status on user_memberships table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_memberships';

-- 5. Drop ALL existing policies on user_memberships table
DROP POLICY IF EXISTS "Users can view memberships in their organizations" ON user_memberships CASCADE;
DROP POLICY IF EXISTS "Users can insert their own membership" ON user_memberships CASCADE;
DROP POLICY IF EXISTS "Users can view their own memberships" ON user_memberships CASCADE;

-- 6. Create policies for user_memberships table
-- Allow users to insert their own membership request during signup
CREATE POLICY "Users can insert their own membership" ON user_memberships
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own memberships
CREATE POLICY "Users can view their own memberships" ON user_memberships
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to view memberships in their organizations
CREATE POLICY "Users can view memberships in their organizations" ON user_memberships
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- 7. Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('users', 'user_memberships')
ORDER BY tablename, policyname;

-- 8. Test message
SELECT 'RLS policies updated successfully - all existing policies dropped and recreated' as status;
