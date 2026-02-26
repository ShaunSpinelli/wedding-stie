-- Add new fields to guests table
ALTER TABLE guests 
ADD COLUMN dietary_requirements TEXT,
ADD COLUMN has_plus_one BOOLEAN DEFAULT FALSE,
ADD COLUMN plus_one_name VARCHAR(255),
ADD COLUMN children_count INTEGER DEFAULT 0;
