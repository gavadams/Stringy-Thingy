-- Sample data for testing Stringy-Thingy

-- Insert a sample product
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

-- Insert a sample kit code
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

-- Insert sample content for CMS
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

INSERT INTO content (
  key,
  content,
  updated_at
) VALUES (
  'how_it_works',
  '{
    "steps": [
      {
        "title": "Choose Your Kit",
        "description": "Select from our range of string art kits",
        "icon": "shopping-cart"
      },
      {
        "title": "Upload Your Image",
        "description": "Upload any image to generate your pattern",
        "icon": "upload"
      },
      {
        "title": "Follow the Pattern",
        "description": "Use our detailed instructions to create your art",
        "icon": "scissors"
      }
    ]
  }',
  NOW()
);

-- Insert a sample order (for testing order management)
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

-- Update the kit code to link it to the order
UPDATE kit_codes 
SET redeemed_by = NULL, purchase_date = NOW()
WHERE code = 'STARTER-2024-001';
