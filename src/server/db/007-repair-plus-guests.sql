-- Repair double-stringified JSONB in plus_guests
UPDATE guests 
SET plus_guests = plus_guests::jsonb 
WHERE jsonb_typeof(plus_guests) = 'string';
