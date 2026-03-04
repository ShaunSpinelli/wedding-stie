BEGIN;

-- Insert invitation for Shaun & Manon
-- Note: UID is 'shaun-manon-2027'
INSERT INTO invitations (
    uid,
    title,
    description,
    groom_name,
    bride_name,
    parent_groom,
    parent_bride,
    wedding_date,
    time,
    location,
    address,
    maps_url,
    maps_embed,
    og_image,
    favicon
) VALUES (
    'shaun-manon-2027',
    'The Wedding of Shaun & Manon',
    'We are getting married and invite you to celebrate this special moment with us.',
    'Shaun',
    'Manon',
    'Mr. Groom & Mrs. Groom',
    'Mr. Bride & Mrs. Bride',
    '2027-06-20',
    '4:00 PM - Late',
    'The French Countryside',
    '123 Provence Lane, France',
    'https://goo.gl/maps/abcdef',
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0000000000005!2d106.8270733147699!3d-6.175392995514422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f4f1b6d7b1e7%3A0x2e69f4f1b6d7b1e7!2sMonumen%20Nasional!5e0!3m2!1sid!2sid!4v1633666820004!5m2!1sid!2sid',
    '/images/og-image.jpg',
    '/images/favicon.ico'
);

-- Insert agenda (Ceremony and Reception)
INSERT INTO agenda (invitation_uid, title, date, start_time, end_time, location, address, order_index) VALUES
('shaun-manon-2027', 'Wedding Ceremony', '2027-06-20', '15:30', '17:00', 'Under the Oak Tree', '123 Provence Lane, France', 1),
('shaun-manon-2027', 'Cocktail Hour', '2027-06-20', '17:00', '19:00', 'The Courtyard', '123 Provence Lane, France', 2),
('shaun-manon-2027', 'Dinner & Dancing', '2027-06-20', '19:00', '02:00', 'The Main Barn', '123 Provence Lane, France', 3);

COMMIT;
