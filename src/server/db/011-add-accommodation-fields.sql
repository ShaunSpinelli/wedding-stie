-- Add accommodation response fields to guests table
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS staying_onsite VARCHAR(20),
ADD COLUMN IF NOT EXISTS staying_extra_night VARCHAR(20);
