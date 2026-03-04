-- Add language field to guests table
ALTER TABLE guests 
ADD COLUMN language VARCHAR(2) DEFAULT 'en' CHECK (language IN ('en', 'fr'));
