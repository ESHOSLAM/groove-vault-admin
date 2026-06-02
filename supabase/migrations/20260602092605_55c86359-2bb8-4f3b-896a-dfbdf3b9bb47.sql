
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Vinyls
CREATE TABLE public.vinyls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT NOT NULL,
  year INT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  condition TEXT DEFAULT 'NM',
  description TEXT,
  image_url TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.vinyls TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vinyls TO authenticated;
GRANT ALL ON public.vinyls TO service_role;
ALTER TABLE public.vinyls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vinyls" ON public.vinyls
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert vinyls" ON public.vinyls
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update vinyls" ON public.vinyls
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vinyls" ON public.vinyls
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER vinyls_updated_at BEFORE UPDATE ON public.vinyls
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-assign admin role to the first user, user role to everyone else
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed sample vinyls
INSERT INTO public.vinyls (title, artist, genre, year, price, description, image_url) VALUES
('The Dark Side of the Moon', 'Pink Floyd', 'Rock', 1973, 4500, 'Культовый альбом прогрессивного рока', 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=800'),
('Kind of Blue', 'Miles Davis', 'Jazz', 1959, 5200, 'Шедевр модального джаза', 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=800'),
('Thriller', 'Michael Jackson', 'Pop', 1982, 3800, 'Самый продаваемый альбом всех времён', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'),
('Abbey Road', 'The Beatles', 'Rock', 1969, 4900, 'Легендарный альбом ливерпульской четвёрки', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800'),
('Random Access Memories', 'Daft Punk', 'Electronic', 2013, 4200, 'Современная классика электронной музыки', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'),
('Blue Train', 'John Coltrane', 'Jazz', 1957, 4700, 'Шедевр хард-бопа', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800'),
('Nevermind', 'Nirvana', 'Rock', 1991, 3500, 'Манифест поколения гранжа', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800'),
('Discovery', 'Daft Punk', 'Electronic', 2001, 3900, 'Французский хаус классика', 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800'),
('Back in Black', 'AC/DC', 'Rock', 1980, 3200, 'Хард-рок эталон', 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=800'),
('A Love Supreme', 'John Coltrane', 'Jazz', 1965, 5500, 'Духовное джазовое произведение', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'),
('Rumours', 'Fleetwood Mac', 'Rock', 1977, 3700, 'Один из бестселлеров всех времён', 'https://images.unsplash.com/photo-1490109498949-50058beb45c5?w=800'),
('Bad', 'Michael Jackson', 'Pop', 1987, 3300, 'Король поп-музыки во всей красе', 'https://images.unsplash.com/photo-1485561222814-e6c50477491b?w=800');
