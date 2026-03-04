BEGIN;

-- Update invitation date
UPDATE invitations 
SET wedding_date = '2027-05-22' 
WHERE uid = 'shaun-manon-2027';

-- Update agenda dates
UPDATE agenda 
SET date = '2027-05-22' 
WHERE invitation_uid = 'shaun-manon-2027';

COMMIT;
