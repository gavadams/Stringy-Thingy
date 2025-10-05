-- Add shipping and billing address columns to orders table
-- These are essential for order fulfillment and shipping

-- Add shipping address columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address JSONB;

-- Add customer name for shipping labels
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Add phone number for shipping
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add shipping method and tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- Add order notes for special instructions
ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Create index for shipping queries
CREATE INDEX IF NOT EXISTS idx_orders_shipping_address ON orders USING GIN (shipping_address);
CREATE INDEX IF NOT EXISTS idx_orders_billing_address ON orders USING GIN (billing_address);

-- Add comment to document the purpose
COMMENT ON COLUMN orders.shipping_address IS 'Customer shipping address from Stripe checkout';
COMMENT ON COLUMN orders.billing_address IS 'Customer billing address from Stripe checkout';
COMMENT ON COLUMN orders.customer_name IS 'Customer full name for shipping labels';
COMMENT ON COLUMN orders.phone IS 'Customer phone number for shipping';
COMMENT ON COLUMN orders.shipping_method IS 'Shipping method selected (standard, express, etc.)';
COMMENT ON COLUMN orders.tracking_number IS 'Shipping tracking number when order is shipped';
COMMENT ON COLUMN orders.special_instructions IS 'Special shipping instructions from customer';
