-- Fix medical records dates to show proper overdue vs due today
-- This will update the existing medical records with proper dates

-- Update some records to be due today
UPDATE medical_records 
SET next_due_date = CURRENT_DATE
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440007',
  '550e8400-e29b-41d4-a716-446655440008',
  '550e8400-e29b-41d4-a716-446655440009',
  '550e8400-e29b-41d4-a716-446655440010'
);

-- Update some records to be overdue (past dates)
UPDATE medical_records 
SET next_due_date = CURRENT_DATE - INTERVAL '3 days'
WHERE id = '550e8400-e29b-41d4-a716-446655440011';

UPDATE medical_records 
SET next_due_date = CURRENT_DATE - INTERVAL '7 days'
WHERE id = '550e8400-e29b-41d4-a716-446655440012';

UPDATE medical_records 
SET next_due_date = CURRENT_DATE - INTERVAL '5 days'
WHERE id = '550e8400-e29b-41d4-a716-446655440013';

UPDATE medical_records 
SET next_due_date = CURRENT_DATE - INTERVAL '2 days'
WHERE id = '550e8400-e29b-41d4-a716-446655440014';

UPDATE medical_records 
SET next_due_date = CURRENT_DATE - INTERVAL '14 days'
WHERE id = '550e8400-e29b-41d4-a716-446655440015';

UPDATE medical_records 
SET next_due_date = CURRENT_DATE - INTERVAL '1 day'
WHERE id = '550e8400-e29b-41d4-a716-446655440016';

-- Show the results
SELECT 
  id,
  title,
  type,
  next_due_date,
  CASE 
    WHEN next_due_date < CURRENT_DATE THEN 'OVERDUE'
    WHEN next_due_date = CURRENT_DATE THEN 'DUE TODAY'
    ELSE 'FUTURE'
  END as status
FROM medical_records 
WHERE is_completed = false
ORDER BY next_due_date ASC;
