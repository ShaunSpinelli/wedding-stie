-- Add last_visited_at column to guests table
ALTER TABLE guests ADD COLUMN last_visited_at TIMESTAMP WITH TIME ZONE;

-- Index for querying and sorting by last_visited_at
CREATE INDEX IF NOT EXISTS idx_guests_last_visited_at ON guests(invitation_uid, last_visited_at DESC NULLS LAST);
