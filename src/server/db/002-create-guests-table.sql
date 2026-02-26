-- Create guests table
CREATE TABLE guests (
    id SERIAL PRIMARY KEY,
    invitation_uid VARCHAR(50) NOT NULL REFERENCES invitations(uid) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    attending VARCHAR(20) DEFAULT 'MAYBE' CHECK (attending IN ('ATTENDING', 'NOT_ATTENDING', 'MAYBE')),
    country VARCHAR(100),
    features TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster filtering by invitation
CREATE INDEX idx_guests_invitation_uid ON guests(invitation_uid);

-- Trigger for updated_at
CREATE TRIGGER update_guests_updated_at
    BEFORE UPDATE ON guests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
