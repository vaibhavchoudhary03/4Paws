-- Check and fix RLS policies for 4Paws database
-- This script will help troubleshoot data access issues

-- 1. Check if RLS is enabled on tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('animals', 'medical_records', 'adoptions', 'users', 'organizations');

-- 2. Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- 3. Temporarily disable RLS for testing (run this if needed)
-- ALTER TABLE animals DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE medical_records DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE adoptions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- 4. Or create basic policies to allow access (better approach)
-- Allow public read access to all tables for now
CREATE POLICY "Allow public read access" ON animals FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON medical_records FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON adoptions FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON organizations FOR SELECT USING (true);

-- 5. Check if the data actually exists
SELECT COUNT(*) as animal_count FROM animals;
SELECT COUNT(*) as medical_count FROM medical_records;
SELECT COUNT(*) as adoption_count FROM adoptions;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as org_count FROM organizations;
