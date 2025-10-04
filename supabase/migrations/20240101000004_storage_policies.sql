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
