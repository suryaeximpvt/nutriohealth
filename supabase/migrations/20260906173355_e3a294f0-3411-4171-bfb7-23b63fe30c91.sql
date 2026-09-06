-- Trigger-only SECURITY DEFINER functions should not be callable via the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_subscription() FROM PUBLIC, anon, authenticated;

-- Ownership-scoped UPDATE/DELETE policies for strict-mode proof photos
DROP POLICY IF EXISTS "Users can update their own strict mode photos" ON storage.objects;
CREATE POLICY "Users can update their own strict mode photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'strict-mode-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'strict-mode-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete their own strict mode photos" ON storage.objects;
CREATE POLICY "Users can delete their own strict mode photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'strict-mode-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
