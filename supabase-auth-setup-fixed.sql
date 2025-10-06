-- ============================================================================
-- SUPABASE AUTH SETUP FOR 4PAWS - FIXED VERSION
-- ============================================================================
-- This script sets up the database schema and RLS policies for multi-tenant
-- authentication with organization-based access control.
-- 
-- IMPORTANT: This version matches the actual database schema from packages/db/src/schema.ts
-- ============================================================================

-- ============================================================================
-- 1. CREATE AUTH-RELATED TABLES
-- ============================================================================

-- Create organizations table if not exists
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table if not exists (simplified for auth integration)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_memberships table for multi-tenant access
CREATE TABLE IF NOT EXISTS user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'staff', 'volunteer', 'foster', 'readonly')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'denied')),
  message TEXT,
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- ============================================================================
-- 2. UPDATE EXISTING TABLES TO ADD MISSING COLUMNS
-- ============================================================================

-- Add organization_id to animals table if it doesn't exist
ALTER TABLE animals ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Add organization_id to medical_records table if it doesn't exist
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Add organization_id to adoptions table if it doesn't exist
ALTER TABLE adoptions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Add organization_id to fosters table if it doesn't exist
ALTER TABLE fosters ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Add organization_id to volunteer_activities table if it doesn't exist
ALTER TABLE volunteer_activities ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Add additional_notes to animals table if it doesn't exist
ALTER TABLE animals ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- ============================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_activities ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view profiles in their organizations" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view memberships in their organizations" ON user_memberships;
DROP POLICY IF EXISTS "Admins can manage memberships" ON user_memberships;
DROP POLICY IF EXISTS "Users can view animals in their organizations" ON animals;
DROP POLICY IF EXISTS "Staff can manage animals" ON animals;
DROP POLICY IF EXISTS "Users can view medical records in their organizations" ON medical_records;
DROP POLICY IF EXISTS "Staff can manage medical records" ON medical_records;
DROP POLICY IF EXISTS "Users can view adoptions in their organizations" ON adoptions;
DROP POLICY IF EXISTS "Staff can manage adoptions" ON adoptions;
DROP POLICY IF EXISTS "Users can view fosters in their organizations" ON fosters;
DROP POLICY IF EXISTS "Staff can manage fosters" ON fosters;
DROP POLICY IF EXISTS "Users can view volunteer activities in their organizations" ON volunteer_activities;
DROP POLICY IF EXISTS "Users can manage their own volunteer activities" ON volunteer_activities;

-- Organizations: Users can only see organizations they belong to
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id 
      FROM user_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Users: Users can view their own profile and profiles of users in their organizations
CREATE POLICY "Users can view profiles in their organizations" ON users
  FOR SELECT USING (
    id = auth.uid() OR
    id IN (
      SELECT um2.user_id 
      FROM user_memberships um1
      JOIN user_memberships um2 ON um1.organization_id = um2.organization_id
      WHERE um1.user_id = auth.uid() 
      AND um1.status = 'active'
      AND um2.status = 'active'
    )
  );

-- Users: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- User Memberships: Users can view memberships in their organizations
CREATE POLICY "Users can view memberships in their organizations" ON user_memberships
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- User Memberships: Admins can manage memberships in their organizations
CREATE POLICY "Admins can manage memberships" ON user_memberships
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role = 'admin'
    )
  );

-- Animals: Users can only see animals in their organizations
CREATE POLICY "Users can view animals in their organizations" ON animals
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Animals: Staff and admins can manage animals
CREATE POLICY "Staff can manage animals" ON animals
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role IN ('admin', 'staff')
    )
  );

-- Medical Records: Users can view medical records for animals in their organizations
CREATE POLICY "Users can view medical records in their organizations" ON medical_records
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Medical Records: Staff can manage medical records
CREATE POLICY "Staff can manage medical records" ON medical_records
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role IN ('admin', 'staff')
    )
  );

-- Adoptions: Users can view adoptions in their organizations
CREATE POLICY "Users can view adoptions in their organizations" ON adoptions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Adoptions: Staff can manage adoptions
CREATE POLICY "Staff can manage adoptions" ON adoptions
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role IN ('admin', 'staff')
    )
  );

-- Fosters: Users can view fosters in their organizations
CREATE POLICY "Users can view fosters in their organizations" ON fosters
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Fosters: Staff can manage fosters
CREATE POLICY "Staff can manage fosters" ON fosters
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role IN ('admin', 'staff')
    )
  );

-- Volunteer Activities: Users can view volunteer activities in their organizations
CREATE POLICY "Users can view volunteer activities in their organizations" ON volunteer_activities
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Volunteer Activities: Users can manage their own activities
CREATE POLICY "Users can manage their own volunteer activities" ON volunteer_activities
  FOR ALL USING (
    user_id = auth.uid() AND
    organization_id IN (
      SELECT organization_id 
      FROM user_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- ============================================================================
-- 5. CREATE FUNCTIONS
-- ============================================================================

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 6. INSERT SAMPLE ORGANIZATIONS
-- ============================================================================

INSERT INTO organizations (id, name, slug, settings) VALUES
  ('00000000-0000-0000-0000-000000000001', '4Paws Demo Shelter', '4paws-demo', '{"theme": "orange", "features": ["animals", "medical", "adoptions", "fosters", "volunteers"]}'),
  ('00000000-0000-0000-0000-000000000002', 'Happy Tails Rescue', 'happy-tails', '{"theme": "blue", "features": ["animals", "medical", "adoptions"]}'),
  ('00000000-0000-0000-0000-000000000003', 'Paws & Hearts', 'paws-hearts', '{"theme": "green", "features": ["animals", "medical", "adoptions", "fosters"]}')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_organization_id ON user_memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_status ON user_memberships(status);
CREATE INDEX IF NOT EXISTS idx_animals_organization_id ON animals(organization_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_organization_id ON medical_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_adoptions_organization_id ON adoptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_fosters_organization_id ON fosters(organization_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_activities_organization_id ON volunteer_activities(organization_id);

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================================
-- 9. UPDATE EXISTING DATA (if any)
-- ============================================================================

-- Set default organization for existing animals (if any)
UPDATE animals 
SET organization_id = '00000000-0000-0000-0000-000000000001' 
WHERE organization_id IS NULL;

-- Set default organization for existing medical records (if any)
UPDATE medical_records 
SET organization_id = '00000000-0000-0000-0000-000000000001' 
WHERE organization_id IS NULL;

-- Set default organization for existing adoptions (if any)
UPDATE adoptions 
SET organization_id = '00000000-0000-0000-0000-000000000001' 
WHERE organization_id IS NULL;

-- Set default organization for existing fosters (if any)
UPDATE fosters 
SET organization_id = '00000000-0000-0000-0000-000000000001' 
WHERE organization_id IS NULL;

-- Set default organization for existing volunteer activities (if any)
UPDATE volunteer_activities 
SET organization_id = '00000000-0000-0000-0000-000000000001' 
WHERE organization_id IS NULL;
