-- Fix orders table schema to match webhook expectations
-- Drop the existing orders table and recreate with proper structure

DROP TABLE IF EXISTS orders CASCADE;

-- Create orders table with proper structure for Stripe integration
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
  order_items JSONB NOT NULL, -- Store product details as JSON
  kit_codes TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (email = auth.jwt() ->> 'email');

-- Policy: Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: Service role can insert orders (for webhooks)
CREATE POLICY "Service role can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Policy: Service role can update orders
CREATE POLICY "Service role can update orders" ON orders
  FOR UPDATE USING (true);

-- Create index for faster lookups
CREATE INDEX idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_status ON orders(status);
