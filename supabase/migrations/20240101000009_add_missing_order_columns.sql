-- Add missing columns to orders table for Stripe integration
-- Run this in your Supabase SQL Editor

-- Add missing columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_items JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS kit_codes TEXT[] DEFAULT '{}';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing records to have required fields
UPDATE orders SET 
  email = 'legacy@example.com',
  total_amount = 0,
  order_items = '[]'::jsonb,
  status = 'completed'
WHERE email IS NULL;

-- Make email NOT NULL after setting default values
ALTER TABLE orders ALTER COLUMN email SET NOT NULL;
ALTER TABLE orders ALTER COLUMN total_amount SET NOT NULL;
ALTER TABLE orders ALTER COLUMN order_items SET NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Update RLS policies if they don't exist
DO $$
BEGIN
    -- Enable RLS if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'orders' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Create policies if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Users can view own orders'
    ) THEN
        CREATE POLICY "Users can view own orders" ON orders
          FOR SELECT USING (email = auth.jwt() ->> 'email');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Admins can view all orders'
    ) THEN
        CREATE POLICY "Admins can view all orders" ON orders
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Service role can insert orders'
    ) THEN
        CREATE POLICY "Service role can insert orders" ON orders
          FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Service role can update orders'
    ) THEN
        CREATE POLICY "Service role can update orders" ON orders
          FOR UPDATE USING (true);
    END IF;
END $$;
