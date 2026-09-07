CREATE POLICY "own food photos read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own food photos insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own food photos update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own food photos delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1]);