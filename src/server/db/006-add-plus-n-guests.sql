-- Add plus_guests_allowed and plus_guests columns
ALTER TABLE guests 
ADD COLUMN plus_guests_allowed INTEGER DEFAULT 0,
ADD COLUMN plus_guests JSONB DEFAULT '[]';

-- Migrate existing data
UPDATE guests SET plus_guests_allowed = 1 WHERE has_plus_one = TRUE;
UPDATE guests SET plus_guests = jsonb_build_array(plus_one_name) WHERE has_plus_one = TRUE AND plus_one_name IS NOT NULL AND plus_one_name != '';
