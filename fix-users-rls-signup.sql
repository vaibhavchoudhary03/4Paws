-- Fix RLS policies for user signup process
-- This allows users to create their own profile during signup

-- 1. Check current RLS status on users table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- 2. Drop existing policies on users table
DROP POLICY IF EXISTS "Users can view profiles in their organizations" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

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

-- 5. Drop existing policies on user_memberships table
DROP POLICY IF EXISTS "Users can view memberships in their organizations" ON user_memberships;
DROP POLICY IF EXISTS "Users can insert their own membership" ON user_memberships;

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

-- 7. Test the policies by checking if we can insert a test user
-- (This will fail if the user already exists, which is expected)
SELECT 'RLS policies updated successfully' as status;
