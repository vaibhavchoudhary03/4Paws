-- Fix RLS policies for 4Paws database
-- Run this in your Supabase SQL Editor

-- 1. First, let's check if RLS is enabled and what policies exist
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('animals', 'medical_records', 'adoptions', 'users', 'organizations');

-- 2. Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- 3. Create basic policies to allow public read access
-- This will allow the frontend to read data without authentication

-- Animals table
DROP POLICY IF EXISTS "Allow public read access" ON animals;
CREATE POLICY "Allow public read access" ON animals FOR SELECT USING (true);

-- Medical records table  
DROP POLICY IF EXISTS "Allow public read access" ON medical_records;
CREATE POLICY "Allow public read access" ON medical_records FOR SELECT USING (true);

-- Adoptions table
DROP POLICY IF EXISTS "Allow public read access" ON adoptions;
CREATE POLICY "Allow public read access" ON adoptions FOR SELECT USING (true);

-- Users table
DROP POLICY IF EXISTS "Allow public read access" ON users;
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);

-- Organizations table
DROP POLICY IF EXISTS "Allow public read access" ON organizations;
CREATE POLICY "Allow public read access" ON organizations FOR SELECT USING (true);

-- 4. Verify the data exists
SELECT 'Animals count:' as table_name, COUNT(*) as count FROM animals
UNION ALL
SELECT 'Medical records count:', COUNT(*) FROM medical_records
UNION ALL
SELECT 'Adoptions count:', COUNT(*) FROM adoptions
UNION ALL
SELECT 'Users count:', COUNT(*) FROM users
UNION ALL
SELECT 'Organizations count:', COUNT(*) FROM organizations;
