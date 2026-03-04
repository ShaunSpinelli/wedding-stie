BEGIN;

-- Update invitation maps_embed with the new verified link
UPDATE invitations 
SET 
    maps_embed = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4963.652703232244!2d4.135236799999999!3d44.0786143!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12b441475201dd6b%3A0xc22f62b61ba66ce5!2sCOMPTOIR%20SAINT-HILAIRE!5e1!3m2!1sen!2sca!4v1772593423495!5m2!1sen!2sca'
WHERE uid = 'shaun-manon-2027';

COMMIT;
