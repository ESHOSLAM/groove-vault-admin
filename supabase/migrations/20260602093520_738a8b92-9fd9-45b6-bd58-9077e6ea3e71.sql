DROP POLICY IF EXISTS "Admins can insert vinyls" ON public.vinyls;
DROP POLICY IF EXISTS "Admins can update vinyls" ON public.vinyls;
DROP POLICY IF EXISTS "Admins can delete vinyls" ON public.vinyls;

CREATE POLICY "Public can insert vinyls" ON public.vinyls FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update vinyls" ON public.vinyls FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete vinyls" ON public.vinyls FOR DELETE TO anon, authenticated USING (true);

GRANT INSERT, UPDATE, DELETE ON public.vinyls TO anon;