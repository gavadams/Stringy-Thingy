-- Stringy-Thingy Storage Policies
-- Run this in Supabase SQL Editor after creating storage buckets

-- Storage policies for user images
CREATE POLICY "Users can upload own images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'user-images' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  );

CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'user-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Product images (public)
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Only admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Generated patterns (private)
CREATE POLICY "Users can upload own generated patterns"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'generated-patterns' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own generated patterns"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'generated-patterns' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  );

CREATE POLICY "Users can update own generated patterns"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'generated-patterns' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own generated patterns"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'generated-patterns' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
