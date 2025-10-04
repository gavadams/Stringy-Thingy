-- Stringy-Thingy Database Schema
-- Run this in Supabase SQL Editor

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kit Codes table
CREATE TABLE kit_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  kit_type TEXT NOT NULL CHECK (kit_type IN ('starter', 'standard', 'premium')),
  max_generations INTEGER DEFAULT 3,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  purchase_date TIMESTAMPTZ,
  redeemed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generations table
CREATE TABLE generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  kit_code_id UUID REFERENCES kit_codes(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT,
  settings JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  kit_type TEXT NOT NULL,
  pegs INTEGER NOT NULL,
  lines INTEGER NOT NULL,
  frame_size TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  stripe_id TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'completed')),
  kit_codes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content table
CREATE TABLE content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for kit_codes
CREATE POLICY "Kit codes viewable by owner or admin"
  ON kit_codes FOR SELECT
  USING (
    redeemed_by = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can insert kit codes"
  ON kit_codes FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update kit codes"
  ON kit_codes FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for generations
CREATE POLICY "Users can view own generations"
  ON generations FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert own generations"
  ON generations FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for products
CREATE POLICY "Products viewable by everyone"
  ON products FOR SELECT
  USING (
    is_active = true OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (
    email = (SELECT email FROM profiles WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can manage orders"
  ON orders FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for content
CREATE POLICY "Content viewable by everyone"
  ON content FOR SELECT USING (true);

CREATE POLICY "Only admins can manage content"
  ON content FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment kit usage
CREATE OR REPLACE FUNCTION increment_kit_usage(code_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_count INTEGER;
BEGIN
  SELECT used_count, max_generations INTO current_count, max_count
  FROM kit_codes
  WHERE id = code_id AND is_active = true;
  
  IF current_count >= max_count THEN
    RETURN false;
  END IF;
  
  UPDATE kit_codes
  SET used_count = used_count + 1
  WHERE id = code_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
