-- Demo data for 4Paws Animal Shelter Management System
-- This script adds sample data for testing the application

-- First, create demo users in the users table
-- Note: These users should also be created in Supabase Auth for full functionality
INSERT INTO users (id, email, first_name, last_name, role, organization_id, is_active) VALUES
('00000000-0000-0000-0000-000000000002', 'foster@demo.4paws.org', 'Foster', 'User', 'foster', '00000000-0000-0000-0000-000000000001', true),
('00000000-0000-0000-0000-000000000003', 'volunteer@demo.4paws.org', 'Volunteer', 'User', 'volunteer', '00000000-0000-0000-0000-000000000001', true),
('00000000-0000-0000-0000-000000000004', 'staff@demo.4paws.org', 'Staff', 'User', 'admin', '00000000-0000-0000-0000-000000000001', true)
ON CONFLICT (id) DO NOTHING;

-- Insert demo animals
INSERT INTO animals (id, organization_id, name, species, breed, age, gender, color, size, weight, status, intake_date, description, photos, is_spayed_neutered, is_vaccinated) VALUES
('550e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000001', 'Misty', 'cat', 'Tuxedo', 24, 'female', 'Black and White', 'medium', 8, 'foster', '2025-07-08', 'Sweet and playful tuxedo cat who loves attention', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000001', 'Shadow', 'dog', 'German Shepherd', 36, 'female', 'Black and Tan', 'large', 65, 'available', '2025-07-16', 'Loyal and protective German Shepherd, great with kids', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440003', '00000000-0000-0000-0000-000000000001', 'Harley', 'cat', 'Tuxedo', 18, 'male', 'Black and White', 'medium', 9, 'foster', '2025-07-11', 'Energetic young cat who loves to play', '["https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400"]', true, false),
('550e8400-e29b-41d4-a716-446655440004', '00000000-0000-0000-0000-000000000001', 'Bear', 'dog', 'Golden Retriever', 48, 'male', 'Golden', 'large', 75, 'available', '2025-06-20', 'Gentle giant who loves everyone he meets', '["https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440005', '00000000-0000-0000-0000-000000000001', 'Sadie', 'cat', 'Siamese', 30, 'female', 'Cream', 'medium', 7, 'available', '2025-06-15', 'Elegant Siamese with beautiful blue eyes', '["https://images.unsplash.com/photo-1573865526739-10639f7e6b8d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440006', '00000000-0000-0000-0000-000000000001', 'Duke', 'dog', 'Labrador Mix', 24, 'male', 'Chocolate', 'large', 60, 'available', '2025-07-01', 'Friendly lab mix who loves to swim', '["https://images.unsplash.com/photo-1547407139-3c921a71905c?w=400"]', true, false)
ON CONFLICT (id) DO NOTHING;

-- Insert demo medical records
INSERT INTO medical_records (animal_id, type, title, description, date, veterinarian, cost, next_due_date, is_completed) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'vaccination', 'Annual Vaccination', 'Rabies and FVRCP vaccines administered', '2025-08-01', 'Dr. Smith', 8500, '2026-08-01', true),
('550e8400-e29b-41d4-a716-446655440002', 'vaccination', 'Annual Vaccination', 'Rabies, DHPP, and Bordetella vaccines', '2025-08-05', 'Dr. Johnson', 12000, '2026-08-05', true),
('550e8400-e29b-41d4-a716-446655440003', 'treatment', 'Dental Cleaning', 'Professional dental cleaning and examination', '2025-07-15', 'Dr. Smith', 15000, null, true),
('550e8400-e29b-41d4-a716-446655440004', 'treatment', 'Hip X-ray', 'X-ray examination for hip dysplasia screening', '2025-07-20', 'Dr. Johnson', 25000, null, true),
('550e8400-e29b-41d4-a716-446655440005', 'vaccination', 'Annual Vaccination', 'Rabies and FVRCP vaccines', '2025-08-10', 'Dr. Smith', 8500, '2026-08-10', true),
('550e8400-e29b-41d4-a716-446655440006', 'treatment', 'Heartworm Test', 'Annual heartworm prevention test', '2025-07-25', 'Dr. Johnson', 7500, '2026-07-25', true)
ON CONFLICT (id) DO NOTHING;

-- Insert demo adoptions
INSERT INTO adoptions (animal_id, adopter_name, adopter_email, adopter_phone, status, application_date, adoption_fee, notes) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'sarah.johnson@email.com', '(555) 123-4567', 'pending', '2025-08-15', 15000, 'Interested in adopting Misty for her family'),
('550e8400-e29b-41d4-a716-446655440002', 'Mike Davis', 'mike.davis@email.com', '(555) 234-5678', 'approved', '2025-08-10', 20000, 'Approved for adoption, picking up next week'),
('550e8400-e29b-41d4-a716-446655440003', 'Lisa Wilson', 'lisa.wilson@email.com', '(555) 345-6789', 'pending', '2025-08-12', 15000, 'First-time cat owner, needs guidance')
ON CONFLICT (id) DO NOTHING;

-- Insert demo foster assignments
INSERT INTO fosters (animal_id, foster_id, start_date, status, notes) VALUES
('550e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000002', '2025-08-01', 'active', 'Foster family providing excellent care'),
('550e8400-e29b-41d4-a716-446655440003', '00000000-0000-0000-0000-000000000003', '2025-08-05', 'active', 'Young cat adjusting well to foster home')
ON CONFLICT (id) DO NOTHING;

-- Insert demo volunteer activities
INSERT INTO volunteer_activities (volunteer_id, animal_id, activity_type, description, duration, date, notes) VALUES
('00000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440002', 'walk', 'Morning walk around the shelter grounds', 30, '2025-08-15', 'Shadow was very energetic today'),
('00000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440004', 'play', 'Play session with toys in the yard', 45, '2025-08-15', 'Bear loves fetch and is very gentle'),
('00000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440005', 'feed', 'Evening feeding and medication administration', 15, '2025-08-15', 'Sadie ate well and took her medication')
ON CONFLICT (id) DO NOTHING;

-- Update organization with demo settings
UPDATE organizations SET settings = '{
  "theme": "orange",
  "features": ["adoptions", "fosters", "volunteers", "medical", "reports"],
  "contactInfo": {
    "email": "info@4paws-demo.org",
    "phone": "(555) 123-4567",
    "address": "123 Animal Way, Demo City, DC 12345"
  }
}' WHERE id = '00000000-0000-0000-0000-000000000001';
