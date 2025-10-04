-- Test Data for Stringy-Thingy
-- Run this in Supabase SQL Editor for testing

-- 1. Sample Product
INSERT INTO products (
  name,
  description,
  price,
  kit_type,
  pegs,
  lines,
  frame_size,
  images,
  is_active,
  stock
) VALUES (
  'Starter String Art Kit',
  'Perfect for beginners! Create beautiful geometric patterns with this complete starter kit.',
  29.99,
  'starter',
  64,
  3,
  '8x8 inches',
  ARRAY['https://example.com/starter-kit-1.jpg', 'https://example.com/starter-kit-2.jpg'],
  true,
  50
);

-- 2. Sample Kit Code (for testing redemption)
INSERT INTO kit_codes (
  code,
  kit_type,
  max_generations,
  used_count,
  is_active,
  purchase_date
) VALUES (
  'STARTER-2024-001',
  'starter',
  3,
  0,
  true,
  NOW()
);

-- 3. Sample Kit Code (already redeemed - for testing used codes)
INSERT INTO kit_codes (
  code,
  kit_type,
  max_generations,
  used_count,
  is_active,
  purchase_date
) VALUES (
  'STARTER-2024-002',
  'starter',
  3,
  2,
  true,
  NOW() - INTERVAL '7 days'
);

-- 4. Sample Content for CMS
INSERT INTO content (
  key,
  content,
  updated_at
) VALUES (
  'homepage_hero',
  '{
    "title": "Create Beautiful String Art",
    "subtitle": "Transform your ideas into stunning geometric patterns",
    "cta_text": "Get Started",
    "cta_link": "/shop"
  }',
  NOW()
);

-- 5. Sample Order
INSERT INTO orders (
  email,
  stripe_id,
  product_id,
  quantity,
  total,
  status,
  kit_codes
) VALUES (
  'test@example.com',
  'pi_test_123456789',
  (SELECT id FROM products WHERE name = 'Starter String Art Kit' LIMIT 1),
  1,
  29.99,
  'paid',
  ARRAY['STARTER-2024-001']
);

-- 6. Create a test admin user profile (you'll need to create the auth user first)
-- This is just the profile record - the auth user needs to be created in Supabase Auth
INSERT INTO profiles (
  id,
  email,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  'admin@stringythingy.com',
  'admin'
);

-- 7. Sample generation (for testing user generations)
INSERT INTO generations (
  user_id,
  kit_code_id,
  image_url,
  settings,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  (SELECT id FROM kit_codes WHERE code = 'STARTER-2024-001' LIMIT 1),
  'https://example.com/generated-pattern.jpg',
  '{
    "image_url": "https://example.com/uploaded-image.jpg",
    "pattern_type": "geometric",
    "complexity": "medium",
    "colors": ["#ff6b6b", "#4ecdc4", "#45b7d1"]
  }',
  NOW() - INTERVAL '2 days'
);

-- Test queries to verify data
SELECT 'Products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'Kit Codes', COUNT(*) FROM kit_codes
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Content', COUNT(*) FROM content
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'Generations', COUNT(*) FROM generations;
