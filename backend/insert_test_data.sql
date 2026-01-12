-- Insert test user (password: password123)
INSERT INTO users (email, password_hash, full_name, is_verified, is_active)
VALUES (
  'test@weareout.com',
  '$2b$10$rN5yqJzKvV3xGxJhRqDrGO7z8QxVpFKJXU9KvH9pY4MQ8Y7z8QxVp',
  'Test User',
  true,
  true
) ON CONFLICT (email) DO NOTHING;

-- Get the user ID
WITH user_data AS (
  SELECT id FROM users WHERE email = 'test@weareout.com'
)
-- Insert test inventory items
INSERT INTO inventory_items (user_id, name, category, location, quantity, unit, days_remaining, status, last_updated)
SELECT 
  user_data.id,
  items.name,
  items.category,
  items.location,
  items.quantity,
  items.unit,
  items.days_remaining,
  items.status,
  NOW()
FROM user_data
CROSS JOIN (VALUES
  ('Whole Milk', 'Dairy & Eggs', 'Fridge - Door', 0.5, 'L', 2, 'low'),
  ('Sourdough Bread', 'Bakery', 'Pantry - Shelf A', 0.5, 'loaf', 1, 'critical'),
  ('Organic Eggs', 'Dairy & Eggs', 'Fridge - Top Shelf', 6, 'eggs', 5, 'good'),
  ('Greek Yogurt', 'Dairy & Eggs', 'Fridge - Top Shelf', 2, 'cups', 4, 'good'),
  ('Butter', 'Dairy & Eggs', 'Fridge - Door', 125, 'g', 7, 'good'),
  ('Ground Coffee', 'Beverages', 'Kitchen - Counter', 150, 'g', 3, 'low'),
  ('Orange Juice', 'Beverages', 'Fridge - Door', 0.3, 'L', 2, 'low')
) AS items(name, category, location, quantity, unit, days_remaining, status)
ON CONFLICT DO NOTHING;

-- Insert test shopping list items
INSERT INTO shopping_list (user_id, item_name, category, quantity, unit, priority, notes, completed)
SELECT 
  user_data.id,
  items.item_name,
  items.category,
  items.quantity,
  items.unit,
  items.priority,
  items.notes,
  items.completed
FROM user_data
CROSS JOIN (VALUES
  ('Whole Milk', 'Dairy & Eggs', 1, 'L', 'high', 'Running low', false),
  ('Sourdough Bread', 'Bakery', 1, 'loaf', 'high', 'Almost out', false),
  ('Coffee Beans', 'Beverages', 250, 'g', 'medium', 'For the week', false)
) AS items(item_name, category, quantity, unit, priority, notes, completed)
ON CONFLICT DO NOTHING;
