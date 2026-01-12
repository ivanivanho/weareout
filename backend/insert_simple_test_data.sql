-- Get the test user ID (or insert if not exists)
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Insert or get test user
    INSERT INTO users (email, password_hash, full_name, is_verified, is_active)
    VALUES (
        'test@weareout.com',
        '$2b$10$rN5yqJzKvV3xGxJhRqDrGO7z8QxVpFKJXU9KvH9pY4MQ8Y7z8QxVp',
        'Test User',
        true,
        true
    ) ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id INTO test_user_id;
    
    IF test_user_id IS NULL THEN
        SELECT id INTO test_user_id FROM users WHERE email = 'test@weareout.com';
    END IF;
    
    -- Insert test items
    INSERT INTO items (user_id, name, category, location, quantity, unit, status, low_stock_threshold)
    VALUES
        (test_user_id, 'Whole Milk', 'Dairy & Eggs', 'Fridge - Door', 0.5, 'L', 'low_stock', 1),
        (test_user_id, 'Sourdough Bread', 'Bakery', 'Pantry - Shelf A', 0.5, 'loaf', 'out_of_stock', 1),
        (test_user_id, 'Organic Eggs', 'Dairy & Eggs', 'Fridge - Top Shelf', 6, 'eggs', 'in_stock', 3),
        (test_user_id, 'Greek Yogurt', 'Dairy & Eggs', 'Fridge - Top Shelf', 2, 'cups', 'in_stock', 1),
        (test_user_id, 'Butter', 'Dairy & Eggs', 'Fridge - Door', 125, 'g', 'in_stock', 50),
        (test_user_id, 'Ground Coffee', 'Beverages', 'Kitchen - Counter', 150, 'g', 'low_stock', 200),
        (test_user_id, 'Orange Juice', 'Beverages', 'Fridge - Door', 0.3, 'L', 'low_stock', 1)
    ON CONFLICT DO NOTHING;
END $$;
