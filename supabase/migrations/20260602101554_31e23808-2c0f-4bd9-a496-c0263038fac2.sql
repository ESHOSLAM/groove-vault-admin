
CREATE POLICY "Anyone can read vinyl images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vinyl-images');

CREATE POLICY "Anyone can upload vinyl images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vinyl-images');

CREATE POLICY "Anyone can update vinyl images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vinyl-images');

CREATE POLICY "Anyone can delete vinyl images"
ON storage.objects FOR DELETE
USING (bucket_id = 'vinyl-images');
