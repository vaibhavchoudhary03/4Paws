-- Comprehensive 4Paws Demo Data
-- This creates the full dataset matching the original Replit code

-- Clear existing data (optional - remove if you want to keep existing data)
-- DELETE FROM volunteer_activities;
-- DELETE FROM fosters;
-- DELETE FROM adoptions;
-- DELETE FROM medical_records;
-- DELETE FROM animals;
-- DELETE FROM users WHERE id != '00000000-0000-0000-0000-000000000001';

-- Create comprehensive people data (30+ people with different roles)
INSERT INTO users (id, email, first_name, last_name, role, organization_id, is_active, profile) VALUES
-- Staff/Admin users
('00000000-0000-0000-0000-000000000002', 'staff@demo.4paws.org', 'Staff', 'User', 'admin', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 123-4567", "address": "123 Shelter Lane, Pet City, PC 12345"}'),
('00000000-0000-0000-0000-000000000003', 'manager@demo.4paws.org', 'Sarah', 'Manager', 'admin', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 123-4568", "address": "456 Shelter Ave, Pet City, PC 12345"}'),
('00000000-0000-0000-0000-000000000004', 'vet@demo.4paws.org', 'Dr. Smith', 'Veterinarian', 'staff', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 123-4569", "address": "789 Vet St, Pet City, PC 12345"}'),

-- Foster families (10)
('00000000-0000-0000-0000-000000000005', 'foster1@demo.4paws.org', 'Jennifer', 'Johnson', 'foster', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 234-5678", "address": "101 Foster Lane, Pet City, PC 12345", "maxCapacity": 2, "available": true}'),
('00000000-0000-0000-0000-000000000006', 'foster2@demo.4paws.org', 'Michael', 'Davis', 'foster', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 234-5679", "address": "102 Foster Lane, Pet City, PC 12345", "maxCapacity": 1, "available": true}'),
('00000000-0000-0000-0000-000000000007', 'foster3@demo.4paws.org', 'Lisa', 'Wilson', 'foster', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 234-5680", "address": "103 Foster Lane, Pet City, PC 12345", "maxCapacity": 3, "available": true}'),
('00000000-0000-0000-0000-000000000008', 'foster4@demo.4paws.org', 'Robert', 'Brown', 'foster', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 234-5681", "address": "104 Foster Lane, Pet City, PC 12345", "maxCapacity": 2, "available": false}'),
('00000000-0000-0000-0000-000000000009', 'foster5@demo.4paws.org', 'Emily', 'Garcia', 'foster', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 234-5682", "address": "105 Foster Lane, Pet City, PC 12345", "maxCapacity": 1, "available": true}'),
('00000000-0000-0000-0000-000000000010', 'foster6@demo.4paws.org', 'David', 'Martinez', 'foster', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 234-5683", "address": "106 Foster Lane, Pet City, PC 12345", "maxCapacity": 2, "available": true}'),
('00000000-0000-0000-0000-000000000011', 'foster7@demo.4paws.org', 'Jessica', 'Anderson', 'foster', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 234-5684", "address": "107 Foster Lane, Pet City, PC 12345", "maxCapacity": 1, "available": false}'),
('00000000-0000-0000-0000-000000000012', 'foster8@demo.4paws.org', 'Christopher', 'Taylor', 'foster', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 234-5685", "address": "108 Foster Lane, Pet City, PC 12345", "maxCapacity": 3, "available": true}'),
('00000000-0000-0000-0000-000000000013', 'foster9@demo.4paws.org', 'Amanda', 'Thomas', 'foster', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 234-5686", "address": "109 Foster Lane, Pet City, PC 12345", "maxCapacity": 2, "available": true}'),
('00000000-0000-0000-0000-000000000014', 'foster10@demo.4paws.org', 'Matthew', 'Jackson', 'foster', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 234-5687", "address": "110 Foster Lane, Pet City, PC 12345", "maxCapacity": 1, "available": true}'),

-- Volunteers (10)
('00000000-0000-0000-0000-000000000015', 'volunteer1@demo.4paws.org', 'Ashley', 'White', 'volunteer', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 345-6789", "address": "201 Volunteer St, Pet City, PC 12345", "hours": 15}'),
('00000000-0000-0000-0000-000000000016', 'volunteer2@demo.4paws.org', 'Daniel', 'Harris', 'volunteer', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 345-6790", "address": "202 Volunteer St, Pet City, PC 12345", "hours": 20}'),
('00000000-0000-0000-0000-000000000017', 'volunteer3@demo.4paws.org', 'Michelle', 'Martin', 'volunteer', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 345-6791", "address": "203 Volunteer St, Pet City, PC 12345", "hours": 12}'),
('00000000-0000-0000-0000-000000000018', 'volunteer4@demo.4paws.org', 'Kevin', 'Thompson', 'volunteer', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 345-6792", "address": "204 Volunteer St, Pet City, PC 12345", "hours": 25}'),
('00000000-0000-0000-0000-000000000019', 'volunteer5@demo.4paws.org', 'Rachel', 'Garcia', 'volunteer', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 345-6793", "address": "205 Volunteer St, Pet City, PC 12345", "hours": 18}'),
('00000000-0000-0000-0000-000000000020', 'volunteer6@demo.4paws.org', 'Brandon', 'Martinez', 'volunteer', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 345-6794", "address": "206 Volunteer St, Pet City, PC 12345", "hours": 22}'),
('00000000-0000-0000-0000-000000000021', 'volunteer7@demo.4paws.org', 'Stephanie', 'Robinson', 'volunteer', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 345-6795", "address": "207 Volunteer St, Pet City, PC 12345", "hours": 16}'),
('00000000-0000-0000-0000-000000000022', 'volunteer8@demo.4paws.org', 'Tyler', 'Clark', 'volunteer', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 345-6796", "address": "208 Volunteer St, Pet City, PC 12345", "hours": 30}'),
('00000000-0000-0000-0000-000000000023', 'volunteer9@demo.4paws.org', 'Nicole', 'Rodriguez', 'volunteer', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 345-6797", "address": "209 Volunteer St, Pet City, PC 12345", "hours": 14}'),
('00000000-0000-0000-0000-000000000024', 'volunteer10@demo.4paws.org', 'Ryan', 'Lewis', 'volunteer', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 345-6798", "address": "210 Volunteer St, Pet City, PC 12345", "hours": 28}'),

-- Adopters (10)
('00000000-0000-0000-0000-000000000025', 'adopter1@demo.4paws.org', 'Sarah', 'Johnson', 'adopter', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 456-7890", "address": "301 Adopter Ave, Pet City, PC 12345"}'),
('00000000-0000-0000-0000-000000000026', 'adopter2@demo.4paws.org', 'Mike', 'Davis', 'adopter', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 456-7891", "address": "302 Adopter Ave, Pet City, PC 12345"}'),
('00000000-0000-0000-0000-000000000027', 'adopter3@demo.4paws.org', 'Lisa', 'Wilson', 'adopter', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 456-7892", "address": "303 Adopter Ave, Pet City, PC 12345"}'),
('00000000-0000-0000-0000-000000000028', 'adopter4@demo.4paws.org', 'John', 'Smith', 'adopter', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 456-7893", "address": "304 Adopter Ave, Pet City, PC 12345"}'),
('00000000-0000-0000-0000-000000000029', 'adopter5@demo.4paws.org', 'Emily', 'Brown', 'adopter', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 456-7894", "address": "305 Adopter Ave, Pet City, PC 12345"}'),
('00000000-0000-0000-0000-000000000030', 'adopter6@demo.4paws.org', 'David', 'Lee', 'adopter', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 456-7895", "address": "306 Adopter Ave, Pet City, PC 12345"}'),
('00000000-0000-0000-0000-000000000031', 'adopter7@demo.4paws.org', 'Maria', 'Garcia', 'adopter', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 456-7896", "address": "307 Adopter Ave, Pet City, PC 12345"}'),
('00000000-0000-0000-0000-000000000032', 'adopter8@demo.4paws.org', 'Tom', 'Anderson', 'adopter', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 456-7897", "address": "308 Adopter Ave, Pet City, PC 12345"}'),
('00000000-0000-0000-0000-000000000033', 'adopter9@demo.4paws.org', 'Jennifer', 'Taylor', 'adopter', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 456-7898", "address": "309 Adopter Ave, Pet City, PC 12345"}'),
('00000000-0000-0000-0000-000000000034', 'adopter10@demo.4paws.org', 'Mark', 'Wilson', 'adopter', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 456-7899", "address": "310 Adopter Ave, Pet City, PC 12345"}'),

-- Donors (5)
('00000000-0000-0000-0000-000000000035', 'donor1@demo.4paws.org', 'Patricia', 'Moore', 'donor', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 567-8901", "address": "401 Donor Dr, Pet City, PC 12345", "totalDonated": 5000}'),
('00000000-0000-0000-0000-000000000036', 'donor2@demo.4paws.org', 'James', 'Jackson', 'donor', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 567-8902", "address": "402 Donor Dr, Pet City, PC 12345", "totalDonated": 2500}'),
('00000000-0000-0000-0000-000000000037', 'donor3@demo.4paws.org', 'Linda', 'White', 'donor', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 567-8903", "address": "403 Donor Dr, Pet City, PC 12345", "totalDonated": 7500}'),
('00000000-0000-0000-0000-000000000038', 'donor4@demo.4paws.org', 'William', 'Harris', 'donor', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 567-8904", "address": "404 Donor Dr, Pet City, PC 12345", "totalDonated": 3000}'),
('00000000-0000-0000-0000-000000000039', 'donor5@demo.4paws.org', 'Barbara', 'Martin', 'donor', '00000000-0000-0000-0000-000000000001', true, '{"phone": "(555) 567-8905", "address": "405 Donor Dr, Pet City, PC 12345", "totalDonated": 10000}')
ON CONFLICT (id) DO NOTHING;

-- Create comprehensive animal data (50 animals)
INSERT INTO animals (id, organization_id, name, species, breed, age, gender, color, size, weight, status, intake_date, description, photos, is_spayed_neutered, is_vaccinated) VALUES
-- Dogs (25 animals)
('550e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000001', 'Buddy', 'dog', 'Labrador Mix', 36, 'male', 'Golden', 'large', 65, 'available', '2025-07-01', 'Friendly and playful dog. Great with families!', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000001', 'Luna', 'dog', 'German Shepherd', 24, 'female', 'Black and Tan', 'large', 55, 'fostered', '2025-07-15', 'Loyal and protective German Shepherd, great with kids', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440003', '00000000-0000-0000-0000-000000000001', 'Max', 'dog', 'Beagle', 18, 'male', 'Brown and White', 'medium', 30, 'available', '2025-06-20', 'Energetic beagle who loves to play', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, false),
('550e8400-e29b-41d4-a716-446655440004', '00000000-0000-0000-0000-000000000001', 'Bella', 'dog', 'Bulldog', 48, 'female', 'Brindle', 'medium', 45, 'fostered', '2025-06-10', 'Gentle bulldog who loves attention', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440005', '00000000-0000-0000-0000-000000000001', 'Charlie', 'dog', 'Golden Retriever', 30, 'male', 'Golden', 'large', 70, 'available', '2025-07-05', 'Friendly golden retriever, great with kids', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440006', '00000000-0000-0000-0000-000000000001', 'Lucy', 'dog', 'Husky Mix', 36, 'female', 'Gray and White', 'large', 50, 'fostered', '2025-06-25', 'Beautiful husky mix, needs active family', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440007', '00000000-0000-0000-0000-000000000001', 'Cooper', 'dog', 'Terrier Mix', 24, 'male', 'Black', 'medium', 25, 'available', '2025-07-10', 'Playful terrier mix, great with other dogs', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, false),
('550e8400-e29b-41d4-a716-446655440008', '00000000-0000-0000-0000-000000000001', 'Daisy', 'dog', 'Labrador Mix', 42, 'female', 'Yellow', 'large', 60, 'fostered', '2025-06-15', 'Sweet lab mix, loves water and fetch', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440009', '00000000-0000-0000-0000-000000000001', 'Rocky', 'dog', 'German Shepherd', 60, 'male', 'Black and Tan', 'large', 80, 'available', '2025-05-20', 'Senior German Shepherd, gentle and calm', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440010', '00000000-0000-0000-0000-000000000001', 'Molly', 'dog', 'Beagle', 30, 'female', 'Brown and White', 'medium', 28, 'fostered', '2025-07-20', 'Friendly beagle, great with children', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440011', '00000000-0000-0000-0000-000000000001', 'Bear', 'dog', 'Golden Retriever', 36, 'male', 'Golden', 'large', 75, 'available', '2025-06-30', 'Gentle giant who loves everyone he meets', '["https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440012', '00000000-0000-0000-0000-000000000001', 'Sadie', 'dog', 'Bulldog', 24, 'female', 'White', 'medium', 40, 'fostered', '2025-07-12', 'Sweet bulldog, loves to cuddle', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, false),
('550e8400-e29b-41d4-a716-446655440013', '00000000-0000-0000-0000-000000000001', 'Duke', 'dog', 'Husky Mix', 18, 'male', 'Gray and White', 'large', 45, 'available', '2025-07-25', 'Energetic husky mix, needs lots of exercise', '["https://images.unsplash.com/photo-1547407139-3c921a71905c?w=400"]', true, false),
('550e8400-e29b-41d4-a716-446655440014', '00000000-0000-0000-0000-000000000001', 'Sophie', 'dog', 'Terrier Mix', 48, 'female', 'Brown', 'medium', 22, 'fostered', '2025-06-05', 'Senior terrier mix, calm and loving', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440015', '00000000-0000-0000-0000-000000000001', 'Zeus', 'dog', 'Labrador Mix', 30, 'male', 'Black', 'large', 70, 'available', '2025-07-08', 'Strong lab mix, great with families', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440016', '00000000-0000-0000-0000-000000000001', 'Chloe', 'dog', 'German Shepherd', 24, 'female', 'Black and Tan', 'large', 55, 'fostered', '2025-07-18', 'Intelligent German Shepherd, needs training', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440017', '00000000-0000-0000-0000-000000000001', 'Oliver', 'dog', 'Beagle', 36, 'male', 'Brown and White', 'medium', 32, 'available', '2025-06-28', 'Friendly beagle, loves to sniff and explore', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440018', '00000000-0000-0000-0000-000000000001', 'Lily', 'dog', 'Bulldog', 42, 'female', 'Brindle', 'medium', 38, 'fostered', '2025-06-12', 'Sweet bulldog, great with kids', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440019', '00000000-0000-0000-0000-000000000001', 'Jack', 'dog', 'Golden Retriever', 18, 'male', 'Golden', 'large', 65, 'available', '2025-07-22', 'Young golden retriever, very playful', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, false),
('550e8400-e29b-41d4-a716-446655440020', '00000000-0000-0000-0000-000000000001', 'Zoe', 'dog', 'Husky Mix', 30, 'female', 'Gray and White', 'large', 50, 'fostered', '2025-07-02', 'Beautiful husky mix, needs active lifestyle', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440021', '00000000-0000-0000-0000-000000000001', 'Milo', 'dog', 'Terrier Mix', 24, 'male', 'Black and Brown', 'medium', 26, 'available', '2025-07-14', 'Energetic terrier mix, loves to play', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, false),
('550e8400-e29b-41d4-a716-446655440022', '00000000-0000-0000-0000-000000000001', 'Penny', 'dog', 'Labrador Mix', 36, 'female', 'Yellow', 'large', 58, 'fostered', '2025-06-18', 'Sweet lab mix, great with other pets', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440023', '00000000-0000-0000-0000-000000000001', 'Leo', 'dog', 'German Shepherd', 48, 'male', 'Black and Tan', 'large', 75, 'available', '2025-05-25', 'Senior German Shepherd, very gentle', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440024', '00000000-0000-0000-0000-000000000001', 'Rosie', 'dog', 'Beagle', 30, 'female', 'Brown and White', 'medium', 29, 'fostered', '2025-07-06', 'Friendly beagle, loves treats and walks', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440025', '00000000-0000-0000-0000-000000000001', 'Teddy', 'dog', 'Bulldog', 24, 'male', 'White and Brown', 'medium', 42, 'available', '2025-07-16', 'Cute bulldog, loves to cuddle and nap', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', true, false),

-- Cats (25 animals)
('550e8400-e29b-41d4-a716-446655440026', '00000000-0000-0000-0000-000000000001', 'Ruby', 'cat', 'Domestic Shorthair', 24, 'female', 'Orange', 'medium', 8, 'available', '2025-07-03', 'Sweet orange cat, loves to play with toys', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440027', '00000000-0000-0000-0000-000000000001', 'Tucker', 'cat', 'Tabby', 18, 'male', 'Brown Tabby', 'medium', 9, 'fostered', '2025-07-19', 'Playful tabby cat, very active', '["https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400"]', true, false),
('550e8400-e29b-41d4-a716-446655440028', '00000000-0000-0000-0000-000000000001', 'Maggie', 'cat', 'Siamese Mix', 30, 'female', 'Cream', 'medium', 7, 'available', '2025-06-22', 'Elegant Siamese mix with beautiful blue eyes', '["https://images.unsplash.com/photo-1573865526739-10639f7e6b8d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440029', '00000000-0000-0000-0000-000000000001', 'Bentley', 'cat', 'Persian', 36, 'male', 'White', 'medium', 10, 'fostered', '2025-06-08', 'Fluffy Persian cat, very calm and gentle', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440030', '00000000-0000-0000-0000-000000000001', 'Stella', 'cat', 'Calico', 24, 'female', 'Calico', 'medium', 8, 'available', '2025-07-11', 'Beautiful calico cat, very independent', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440031', '00000000-0000-0000-0000-000000000001', 'Toby', 'cat', 'Tuxedo', 18, 'male', 'Black and White', 'medium', 9, 'fostered', '2025-07-24', 'Energetic tuxedo cat who loves attention', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"]', true, false),
('550e8400-e29b-41d4-a716-446655440032', '00000000-0000-0000-0000-000000000001', 'Nala', 'cat', 'Domestic Shorthair', 30, 'female', 'Gray', 'medium', 7, 'available', '2025-06-30', 'Sweet gray cat, loves to cuddle', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440033', '00000000-0000-0000-0000-000000000001', 'Finn', 'cat', 'Tabby', 24, 'male', 'Orange Tabby', 'medium', 8, 'fostered', '2025-07-07', 'Friendly orange tabby, great with kids', '["https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440034', '00000000-0000-0000-0000-000000000001', 'Coco', 'cat', 'Siamese Mix', 36, 'female', 'Chocolate', 'medium', 6, 'available', '2025-06-15', 'Elegant chocolate Siamese mix', '["https://images.unsplash.com/photo-1573865526739-10639f7e6b8d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440035', '00000000-0000-0000-0000-000000000001', 'Winston', 'cat', 'Persian', 48, 'male', 'Gray', 'medium', 11, 'fostered', '2025-05-28', 'Senior Persian cat, very calm and loving', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440036', '00000000-0000-0000-0000-000000000001', 'Pepper', 'cat', 'Calico', 18, 'female', 'Calico', 'medium', 7, 'available', '2025-07-21', 'Playful calico cat, loves to climb', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"]', true, false),
('550e8400-e29b-41d4-a716-446655440037', '00000000-0000-0000-0000-000000000001', 'Jasper', 'cat', 'Tuxedo', 30, 'male', 'Black and White', 'medium', 9, 'fostered', '2025-07-01', 'Handsome tuxedo cat, very social', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440038', '00000000-0000-0000-0000-000000000001', 'Princess', 'cat', 'Domestic Shorthair', 24, 'female', 'Black', 'medium', 8, 'available', '2025-07-13', 'Sweet black cat, loves to be pampered', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440039', '00000000-0000-0000-0000-000000000001', 'Oscar', 'cat', 'Tabby', 36, 'male', 'Brown Tabby', 'medium', 10, 'fostered', '2025-06-25', 'Friendly tabby cat, loves to play', '["https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440040', '00000000-0000-0000-0000-000000000001', 'Abby', 'cat', 'Siamese Mix', 18, 'female', 'Cream', 'medium', 6, 'available', '2025-07-26', 'Beautiful cream Siamese mix, very vocal', '["https://images.unsplash.com/photo-1573865526739-10639f7e6b8d?w=400"]', true, false),
('550e8400-e29b-41d4-a716-446655440041', '00000000-0000-0000-0000-000000000001', 'Rex', 'cat', 'Persian', 30, 'male', 'White', 'medium', 9, 'fostered', '2025-07-04', 'Fluffy white Persian, very gentle', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440042', '00000000-0000-0000-0000-000000000001', 'Emma', 'cat', 'Calico', 24, 'female', 'Calico', 'medium', 7, 'available', '2025-07-17', 'Sweet calico cat, loves to be brushed', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440043', '00000000-0000-0000-0000-000000000001', 'Simba', 'cat', 'Tuxedo', 18, 'male', 'Black and White', 'medium', 8, 'fostered', '2025-07-23', 'Playful tuxedo cat, loves to chase toys', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"]', true, false),
('550e8400-e29b-41d4-a716-446655440044', '00000000-0000-0000-0000-000000000001', 'Angel', 'cat', 'Domestic Shorthair', 36, 'female', 'Gray and White', 'medium', 8, 'available', '2025-06-20', 'Sweet angel cat, very loving and gentle', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440045', '00000000-0000-0000-0000-000000000001', 'Murphy', 'cat', 'Tabby', 30, 'male', 'Orange Tabby', 'medium', 9, 'fostered', '2025-07-09', 'Friendly orange tabby, great with other cats', '["https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440046', '00000000-0000-0000-0000-000000000001', 'Gracie', 'cat', 'Siamese Mix', 24, 'female', 'Chocolate', 'medium', 6, 'available', '2025-07-12', 'Elegant chocolate Siamese mix, very social', '["https://images.unsplash.com/photo-1573865526739-10639f7e6b8d?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440047', '00000000-0000-0000-0000-000000000001', 'Gus', 'cat', 'Persian', 42, 'male', 'Gray', 'medium', 10, 'fostered', '2025-06-05', 'Senior Persian cat, very calm and loving', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440048', '00000000-0000-0000-0000-000000000001', 'Harley', 'cat', 'Tuxedo', 18, 'male', 'Black and White', 'medium', 9, 'available', '2025-07-11', 'Energetic young cat who loves to play', '["https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400"]', true, false),
('550e8400-e29b-41d4-a716-446655440049', '00000000-0000-0000-0000-000000000001', 'Shadow', 'cat', 'Domestic Shorthair', 30, 'female', 'Black', 'medium', 7, 'fostered', '2025-07-05', 'Sweet black cat, loves to hide and play', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"]', true, true),
('550e8400-e29b-41d4-a716-446655440050', '00000000-0000-0000-0000-000000000001', 'Misty', 'cat', 'Tuxedo', 24, 'female', 'Black and White', 'medium', 8, 'available', '2025-07-08', 'Sweet and playful tuxedo cat who loves attention', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"]', true, true)
ON CONFLICT (id) DO NOTHING;

-- Create comprehensive medical records (16 tasks - 10 due today, 6 overdue)
INSERT INTO medical_records (animal_id, type, title, description, date, veterinarian, cost, next_due_date, is_completed) VALUES
-- Tasks due today (10) - using current date
('550e8400-e29b-41d4-a716-446655440001', 'vaccination', 'Annual Vaccination', 'Rabies and DHPP vaccines due', CURRENT_DATE, 'Dr. Smith', 8500, CURRENT_DATE, false),
('550e8400-e29b-41d4-a716-446655440002', 'treatment', 'Dental Cleaning', 'Professional dental cleaning scheduled', CURRENT_DATE, 'Dr. Johnson', 15000, CURRENT_DATE, false),
('550e8400-e29b-41d4-a716-446655440003', 'exam', 'Health Checkup', 'Annual health examination', CURRENT_DATE, 'Dr. Smith', 12000, CURRENT_DATE, false),
('550e8400-e29b-41d4-a716-446655440004', 'vaccination', 'Bordetella Vaccine', 'Kennel cough prevention', CURRENT_DATE, 'Dr. Johnson', 6500, CURRENT_DATE, false),
('550e8400-e29b-41d4-a716-446655440005', 'treatment', 'Nail Trimming', 'Regular nail maintenance', CURRENT_DATE, 'Dr. Smith', 2500, CURRENT_DATE, false),
('550e8400-e29b-41d4-a716-446655440006', 'exam', 'Weight Check', 'Monthly weight monitoring', CURRENT_DATE, 'Dr. Johnson', 3000, CURRENT_DATE, false),
('550e8400-e29b-41d4-a716-446655440007', 'vaccination', 'FVRCP Vaccine', 'Cat vaccination series', CURRENT_DATE, 'Dr. Smith', 7500, CURRENT_DATE, false),
('550e8400-e29b-41d4-a716-446655440008', 'treatment', 'Flea Treatment', 'Monthly flea prevention', CURRENT_DATE, 'Dr. Johnson', 4500, CURRENT_DATE, false),
('550e8400-e29b-41d4-a716-446655440009', 'exam', 'Senior Health Check', 'Comprehensive senior exam', CURRENT_DATE, 'Dr. Smith', 18000, CURRENT_DATE, false),
('550e8400-e29b-41d4-a716-446655440010', 'vaccination', 'Rabies Booster', 'Annual rabies vaccination', CURRENT_DATE, 'Dr. Johnson', 5500, CURRENT_DATE, false),

-- Overdue tasks (6) - using past dates
('550e8400-e29b-41d4-a716-446655440011', 'vaccination', 'Overdue Vaccination', 'Rabies vaccine overdue by 3 days', CURRENT_DATE - INTERVAL '3 days', 'Dr. Smith', 8500, CURRENT_DATE - INTERVAL '3 days', false),
('550e8400-e29b-41d4-a716-446655440012', 'treatment', 'Overdue Dental', 'Dental cleaning overdue by 1 week', CURRENT_DATE - INTERVAL '7 days', 'Dr. Johnson', 15000, CURRENT_DATE - INTERVAL '7 days', false),
('550e8400-e29b-41d4-a716-446655440013', 'exam', 'Overdue Health Check', 'Health exam overdue by 5 days', CURRENT_DATE - INTERVAL '5 days', 'Dr. Smith', 12000, CURRENT_DATE - INTERVAL '5 days', false),
('550e8400-e29b-41d4-a716-446655440014', 'vaccination', 'Overdue Bordetella', 'Kennel cough vaccine overdue', CURRENT_DATE - INTERVAL '2 days', 'Dr. Johnson', 6500, CURRENT_DATE - INTERVAL '2 days', false),
('550e8400-e29b-41d4-a716-446655440015', 'treatment', 'Overdue Nail Trim', 'Nail trimming overdue by 2 weeks', CURRENT_DATE - INTERVAL '14 days', 'Dr. Smith', 2500, CURRENT_DATE - INTERVAL '14 days', false),
('550e8400-e29b-41d4-a716-446655440016', 'exam', 'Overdue Weight Check', 'Weight monitoring overdue', CURRENT_DATE - INTERVAL '1 day', 'Dr. Johnson', 3000, CURRENT_DATE - INTERVAL '1 day', false)
ON CONFLICT (id) DO NOTHING;

-- Create comprehensive foster assignments (19 animals in foster)
INSERT INTO fosters (animal_id, foster_id, start_date, status, notes) VALUES
('550e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000002', '2025-01-15', 'active', 'Luna adjusting well to foster home'),
('550e8400-e29b-41d4-a716-446655440004', '00000000-0000-0000-0000-000000000002', '2025-01-20', 'active', 'Bella loves her foster family'),
('550e8400-e29b-41d4-a716-446655440006', '00000000-0000-0000-0000-000000000002', '2025-01-10', 'active', 'Lucy needs active foster family'),
('550e8400-e29b-41d4-a716-446655440008', '00000000-0000-0000-0000-000000000002', '2025-01-25', 'active', 'Daisy thriving in foster care'),
('550e8400-e29b-41d4-a716-446655440010', '00000000-0000-0000-0000-000000000002', '2025-01-18', 'active', 'Molly great with foster kids'),
('550e8400-e29b-41d4-a716-446655440012', '00000000-0000-0000-0000-000000000002', '2025-01-22', 'active', 'Sadie loves foster cuddles'),
('550e8400-e29b-41d4-a716-446655440014', '00000000-0000-0000-0000-000000000002', '2025-01-12', 'active', 'Sophie senior cat in loving foster'),
('550e8400-e29b-41d4-a716-446655440016', '00000000-0000-0000-0000-000000000002', '2025-01-28', 'active', 'Chloe needs training in foster'),
('550e8400-e29b-41d4-a716-446655440018', '00000000-0000-0000-0000-000000000002', '2025-01-14', 'active', 'Lily great with foster kids'),
('550e8400-e29b-41d4-a716-446655440020', '00000000-0000-0000-0000-000000000002', '2025-01-08', 'active', 'Zoe active husky in foster'),
('550e8400-e29b-41d4-a716-446655440022', '00000000-0000-0000-0000-000000000002', '2025-01-16', 'active', 'Penny loves foster family'),
('550e8400-e29b-41d4-a716-446655440024', '00000000-0000-0000-0000-000000000002', '2025-01-24', 'active', 'Rosie loves foster treats'),
('550e8400-e29b-41d4-a716-446655440027', '00000000-0000-0000-0000-000000000002', '2025-01-19', 'active', 'Tucker active cat in foster'),
('550e8400-e29b-41d4-a716-446655440029', '00000000-0000-0000-0000-000000000002', '2025-01-11', 'active', 'Bentley calm Persian in foster'),
('550e8400-e29b-41d4-a716-446655440031', '00000000-0000-0000-0000-000000000002', '2025-01-26', 'active', 'Toby energetic tuxedo in foster'),
('550e8400-e29b-41d4-a716-446655440033', '00000000-0000-0000-0000-000000000002', '2025-01-17', 'active', 'Finn great with foster kids'),
('550e8400-e29b-41d4-a716-446655440035', '00000000-0000-0000-0000-000000000002', '2025-01-05', 'active', 'Winston senior cat in loving foster'),
('550e8400-e29b-41d4-a716-446655440037', '00000000-0000-0000-0000-000000000002', '2025-01-21', 'active', 'Jasper social cat in foster'),
('550e8400-e29b-41d4-a716-446655440039', '00000000-0000-0000-0000-000000000002', '2025-01-13', 'active', 'Oscar playful tabby in foster')
ON CONFLICT (id) DO NOTHING;

-- Create comprehensive adoption applications (8 applications)
INSERT INTO adoptions (animal_id, adopter_name, adopter_email, adopter_phone, status, application_date, adoption_fee, notes) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'sarah.johnson@email.com', '(555) 123-4567', 'pending', '2025-01-25', 15000, 'Interested in adopting Buddy for her family'),
('550e8400-e29b-41d4-a716-446655440003', 'Mike Davis', 'mike.davis@email.com', '(555) 234-5678', 'approved', '2025-01-20', 20000, 'Approved for adoption, picking up next week'),
('550e8400-e29b-41d4-a716-446655440005', 'Lisa Wilson', 'lisa.wilson@email.com', '(555) 345-6789', 'pending', '2025-01-22', 15000, 'First-time dog owner, needs guidance'),
('550e8400-e29b-41d4-a716-446655440007', 'John Smith', 'john.smith@email.com', '(555) 456-7890', 'review', '2025-01-28', 18000, 'Experienced dog owner, good references'),
('550e8400-e29b-41d4-a716-446655440009', 'Emily Brown', 'emily.brown@email.com', '(555) 567-8901', 'approved', '2025-01-15', 25000, 'Senior dog specialist, perfect match'),
('550e8400-e29b-41d4-a716-446655440011', 'David Lee', 'david.lee@email.com', '(555) 678-9012', 'pending', '2025-01-29', 20000, 'Active family, great for energetic dog'),
('550e8400-e29b-41d4-a716-446655440013', 'Maria Garcia', 'maria.garcia@email.com', '(555) 789-0123', 'review', '2025-01-26', 18000, 'Has experience with large dogs'),
('550e8400-e29b-41d4-a716-446655440015', 'Tom Anderson', 'tom.anderson@email.com', '(555) 890-1234', 'pending', '2025-01-27', 22000, 'Looking for family dog, has children')
ON CONFLICT (id) DO NOTHING;

-- Create comprehensive volunteer activities
INSERT INTO volunteer_activities (volunteer_id, animal_id, activity_type, description, duration, date, notes) VALUES
('00000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440001', 'walk', 'Morning walk around the shelter grounds', 30, '2025-01-30', 'Buddy was very energetic today'),
('00000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440003', 'play', 'Play session with toys in the yard', 45, '2025-01-30', 'Max loves fetch and is very gentle'),
('00000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440005', 'feed', 'Evening feeding and medication administration', 15, '2025-01-30', 'Charlie ate well and took his medication'),
('00000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440007', 'groom', 'Brushing and basic grooming session', 20, '2025-01-30', 'Cooper was very calm during grooming'),
('00000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440009', 'walk', 'Gentle walk for senior dog', 20, '2025-01-30', 'Rocky enjoyed the slow pace'),
('00000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440011', 'play', 'Interactive play with puzzle toys', 30, '2025-01-30', 'Bear solved the puzzle quickly'),
('00000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440013', 'walk', 'Training walk with basic commands', 40, '2025-01-30', 'Duke is learning sit and stay'),
('00000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440015', 'play', 'Group play session with other dogs', 60, '2025-01-30', 'Zeus is very social with other dogs'),
('00000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440017', 'feed', 'Special diet feeding for sensitive stomach', 25, '2025-01-30', 'Oliver needs special food, ate well'),
('00000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440019', 'walk', 'High-energy walk for young dog', 50, '2025-01-30', 'Jack has lots of energy, needs more exercise')
ON CONFLICT (id) DO NOTHING;
