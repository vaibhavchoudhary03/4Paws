-- 4Paws Animal Shelter Management System Database Schema
-- This script sets up the complete database schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (Multi-tenant)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Users (with Supabase auth integration)
CREATE TABLE users (
  id UUID PRIMARY KEY, -- This will match Supabase auth.users.id
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL DEFAULT 'volunteer', -- admin, staff, volunteer, foster, readonly
  organization_id UUID NOT NULL REFERENCES organizations(id),
  profile JSONB,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Animals
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  species VARCHAR(50) NOT NULL, -- dog, cat, etc.
  breed VARCHAR(100),
  age INTEGER, -- in months
  gender VARCHAR(20) NOT NULL, -- male, female, unknown
  color VARCHAR(100),
  size VARCHAR(20), -- small, medium, large
  weight INTEGER, -- in pounds
  microchip_id VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'intake', -- intake, available, adopted, foster, medical_hold, deceased
  intake_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  outcome_date TIMESTAMP WITH TIME ZONE,
  outcome_type VARCHAR(50), -- adoption, transfer, return_to_owner, deceased
  photos JSONB,
  description TEXT,
  behavior_notes TEXT,
  medical_notes TEXT,
  special_needs TEXT,
  is_spayed_neutered BOOLEAN DEFAULT FALSE,
  is_vaccinated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Medical Records
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID NOT NULL REFERENCES animals(id),
  type VARCHAR(50) NOT NULL, -- vaccination, treatment, surgery, checkup
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  veterinarian VARCHAR(255),
  cost INTEGER, -- in cents
  next_due_date TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Adoptions
CREATE TABLE adoptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID NOT NULL REFERENCES animals(id),
  adopter_id UUID REFERENCES users(id),
  adopter_name VARCHAR(255) NOT NULL,
  adopter_email VARCHAR(255) NOT NULL,
  adopter_phone VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, completed
  application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  approval_date TIMESTAMP WITH TIME ZONE,
  adoption_date TIMESTAMP WITH TIME ZONE,
  adoption_fee INTEGER, -- in cents
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Fosters
CREATE TABLE fosters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID NOT NULL REFERENCES animals(id),
  foster_id UUID NOT NULL REFERENCES users(id),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, completed, terminated
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Volunteer Activities
CREATE TABLE volunteer_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volunteer_id UUID NOT NULL REFERENCES users(id),
  animal_id UUID REFERENCES animals(id),
  activity_type VARCHAR(50) NOT NULL, -- walk, feed, play, clean, other
  description TEXT,
  duration INTEGER, -- in minutes
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- intake, outcome, medical, custom
  query JSONB NOT NULL, -- The query parameters
  created_by UUID NOT NULL REFERENCES users(id),
  is_public BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_animals_organization_id ON animals(organization_id);
CREATE INDEX idx_animals_status ON animals(status);
CREATE INDEX idx_animals_species ON animals(species);
CREATE INDEX idx_medical_records_animal_id ON medical_records(animal_id);
CREATE INDEX idx_adoptions_animal_id ON adoptions(animal_id);
CREATE INDEX idx_adoptions_status ON adoptions(status);
CREATE INDEX idx_fosters_animal_id ON fosters(animal_id);
CREATE INDEX idx_fosters_foster_id ON fosters(foster_id);
CREATE INDEX idx_volunteer_activities_volunteer_id ON volunteer_activities(volunteer_id);
CREATE INDEX idx_volunteer_activities_date ON volunteer_activities(date);
CREATE INDEX idx_reports_organization_id ON reports(organization_id);

-- Enable Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - you can expand these)
CREATE POLICY "Users can view their organization's data" ON organizations
  FOR SELECT USING (true);

CREATE POLICY "Users can view users in their organization" ON users
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can view animals in their organization" ON animals
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Insert a sample organization
INSERT INTO organizations (id, name, slug, settings) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '4Paws Animal Shelter',
  '4paws-shelter',
  '{"theme": "orange", "features": ["adoptions", "fosters", "volunteers", "medical"]}'
);
