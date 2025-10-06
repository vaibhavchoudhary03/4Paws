import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://uvmzvttewgcmutghbyoy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2bXp2dHRld2djbXV0Z2hieW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTkwMTQsImV4cCI6MjA3NDk5NTAxNH0.6vo8Z8CRG7ux-Yt1FHcOtZwuUAHGLw-mpvbPKfdlkUE';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (matching our schema)
export interface Animal {
  id: string;
  organization_id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  gender: string;
  color?: string;
  size?: string;
  weight?: number;
  microchip_id?: string;
  status: string;
  intake_date: string;
  outcome_date?: string;
  outcome_type?: string;
  photos?: string[];
  description?: string;
  behavior_notes?: string;
  medical_notes?: string;
  special_needs?: string;
  additional_notes?: string;
  is_spayed_neutered?: boolean;
  is_vaccinated?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  animal_id: string;
  type: string;
  title: string;
  description?: string;
  date: string;
  veterinarian?: string;
  cost?: number;
  next_due_date?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Adoption {
  id: string;
  animal_id: string;
  adopter_id?: string;
  adopter_name: string;
  adopter_email: string;
  adopter_phone?: string;
  status: string;
  application_date: string;
  approval_date?: string;
  adoption_date?: string;
  adoption_fee?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AdoptionApplication extends Adoption {
  animal?: {
    id: string;
    name: string;
    breed?: string;
    species: string;
    status: string;
    photos?: string[];
    age?: number;
    gender?: string;
    description?: string;
  };
  adopter?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface Foster {
  id: string;
  animal_id: string;
  foster_id: string;
  start_date: string;
  end_date?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VolunteerActivity {
  id: string;
  volunteer_id: string;
  animal_id?: string;
  activity_type: string;
  description?: string;
  duration?: number;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FosterAssignment extends Foster {
  animal?: {
    id: string;
    name: string;
    breed?: string;
    species: string;
    status: string;
    photos?: string[];
    age?: number;
    gender?: string;
    description?: string;
  };
  foster?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface VolunteerActivityWithRelations extends VolunteerActivity {
  volunteer?: {
    id: string;
    name: string;
    email: string;
  };
  animal?: {
    id: string;
    name: string;
    breed?: string;
    species: string;
    photos?: string[];
  };
}

export interface Person {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  organization_id: string;
  profile?: {
    phone?: string;
    address?: string;
    bio?: string;
    avatar?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    skills?: string[];
    availability?: string;
    notes?: string;
  };
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  organization?: {
    id: string;
    name: string;
  };
}
