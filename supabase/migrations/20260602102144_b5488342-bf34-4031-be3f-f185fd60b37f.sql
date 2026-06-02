
-- Lock down vinyls table writes
DROP POLICY IF EXISTS "Anyone can insert vinyls" ON public.vinyls;
DROP POLICY IF EXISTS "Anyone can update vinyls" ON public.vinyls;
DROP POLICY IF EXISTS "Anyone can delete vinyls" ON public.vinyls;
DROP POLICY IF EXISTS "Public can insert vinyls" ON public.vinyls;
DROP POLICY IF EXISTS "Public can update vinyls" ON public.vinyls;
DROP POLICY IF EXISTS "Public can delete vinyls" ON public.vinyls;

REVOKE INSERT, UPDATE, DELETE ON public.vinyls FROM anon, authenticated;

-- Lock down storage writes on vinyl-images bucket
DROP POLICY IF EXISTS "Anyone can upload vinyl images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update vinyl images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete vinyl images" ON storage.objects;
-- Keep SELECT policy "Anyone can read vinyl images" for public read via signed URL or direct download.

-- Restrict SECURITY DEFINER function
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
