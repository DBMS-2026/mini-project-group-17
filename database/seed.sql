-- ============================================================
--   NexusEstate: AI-Driven PropTech with Multi-Node Lease Swap Engine
--   PostgreSQL Implementation  |  DBMS Project
--   DEFAULT SEED DATA
-- ============================================================

-- All users have the password: password123
INSERT INTO users (name, email, password_hash, role) VALUES
('Kundan', 'kd@gmail.com', '$2a$10$RkgP3gXjrG9ByP5c9wJwv.0KAASmOgtzbUvd2Bm55L9NCNZzZydDO', 'Nomad'),
('Aisha', 'aisha@example.com', '$2a$10$RkgP3gXjrG9ByP5c9wJwv.0KAASmOgtzbUvd2Bm55L9NCNZzZydDO', 'Landlord'),
('Raj', 'raj@example.com', '$2a$10$RkgP3gXjrG9ByP5c9wJwv.0KAASmOgtzbUvd2Bm55L9NCNZzZydDO', 'Nomad'),
('Priya', 'priya@example.com', '$2a$10$RkgP3gXjrG9ByP5c9wJwv.0KAASmOgtzbUvd2Bm55L9NCNZzZydDO', 'Nomad'),
('Vikram', 'vikram@example.com', '$2a$10$RkgP3gXjrG9ByP5c9wJwv.0KAASmOgtzbUvd2Bm55L9NCNZzZydDO', 'Nomad'),
('Neha', 'neha@example.com', '$2a$10$RkgP3gXjrG9ByP5c9wJwv.0KAASmOgtzbUvd2Bm55L9NCNZzZydDO', 'Nomad');

INSERT INTO properties (owner_id, city, price, title, locality, type, status, bedrooms, bathrooms, area, image, tag, is_rera, has_pool, has_gym) VALUES
(1, 'Mumbai', 85000, 'Lodha World One', 'Lower Parel', 'apartment', 'ready-to-move', 4, 4, 2500, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', 'FEATURED', true, true, true),
(2, 'Delhi', 65000, 'DLF Camellias', 'Golf Course Road', 'apartment', 'ready-to-move', 4, 5, 7400, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', 'HOT', true, true, true),
(3, 'Bangalore', 45000, 'Prestige Kingfisher', 'Ashok Nagar', 'apartment', 'ready-to-move', 3, 3, 1800, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80', 'NEW LAUNCH', true, false, true),
(4, 'Chennai', 35000, 'Brigade Valencia', 'ECR', 'villa', 'under-construction', 3, 3, 2200, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80', 'NEW ARRIVAL', true, true, false),
(5, 'Hyderabad', 55000, 'My Home Bhooja', 'HITEC City', 'apartment', 'ready-to-move', 3, 3, 2600, 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80', 'HOT', true, true, true),
(6, 'Mumbai', 95000, 'Rustomjee Crown', 'Prabhadevi', 'apartment', 'under-construction', 2, 2, 1100, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', 'NEW LAUNCH', false, true, true),
(1, 'Delhi', 45000, 'Godrej South Estate', 'Okhla', 'apartment', 'ready-to-move', 3, 3, 1500, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', 'FEATURED', true, false, true),
(2, 'Pune', 35000, 'Panchshil Towers', 'Kharadi', 'apartment', 'ready-to-move', 3, 3, 1600, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', 'HOT', true, true, true);

INSERT INTO leases (user_id, property_id, start_date, end_date) VALUES
(1, 1, '2023-01-01', '2024-12-31'),
(2, 2, '2023-06-01', '2024-05-31'),
(3, 3, '2023-08-01', '2024-07-31'),
(4, 4, '2023-09-01', '2024-08-31'),
(5, 5, '2023-10-01', '2024-09-30');

-- Swap Requests (designed to form a perfect cycle to test graph algorithm)
-- Cycle 1: Mumbai -> Delhi -> Bangalore -> Mumbai
INSERT INTO swap_requests (user_id, current_property_id, desired_city, desired_window) VALUES
(1, 1, 'Delhi', '2024-01-15'),      -- User 1 is in Mumbai, wants Delhi
(2, 2, 'Bangalore', '2024-01-15'),  -- User 2 is in Delhi, wants Bangalore
(3, 3, 'Mumbai', '2024-01-15');     -- User 3 is in Bangalore, wants Mumbai

-- Cycle 2: Chennai -> Hyderabad -> Chennai
INSERT INTO swap_requests (user_id, current_property_id, desired_city, desired_window) VALUES
(4, 4, 'Hyderabad', '2024-02-01'),  -- User 4 is in Chennai, wants Hyderabad
(5, 5, 'Chennai', '2024-02-01');    -- User 5 is in Hyderabad, wants Chennai
