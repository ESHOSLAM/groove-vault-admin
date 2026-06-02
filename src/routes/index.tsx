import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Disc3, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { VinylCard, type Vinyl } from "@/components/VinylCard";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ГРАМПЛАСТ — Виниловые пластинки" },
      { name: "description", content: "Магазин виниловых пластинок: рок, джаз, поп, электроника. Оригинальные издания и переиздания." },
      { property: "og:title", content: "ГРАМПЛАСТ — Виниловые пластинки" },
      { property: "og:description", content: "Магазин виниловых пластинок: рок, джаз, поп, электроника." },
    ],
  }),
  component: Index,
});

function Index() {
  const [vinyls, setVinyls] = useState<Vinyl[]>([]);
  const [genre, setGenre] = useState<string>("Все");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("vinyls").select("*").order("created_at", { ascending: false })
      .then(({ data }) => {
        setVinyls((data as Vinyl[]) ?? []);
        setLoading(false);
      });
  }, []);

  const genres = useMemo(() => {
    const set = new Set(vinyls.map((v) => v.genre));
    return ["Все", ...Array.from(set)];
  }, [vinyls]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vinyls.filter((v) => {
      if (genre !== "Все" && v.genre !== genre) return false;
      if (!q) return true;
      return (
        v.title.toLowerCase().includes(q) ||
        v.artist.toLowerCase().includes(q) ||
        v.genre.toLowerCase().includes(q)
      );
    });
  }, [vinyls, genre, query]);
  const byGenre = useMemo(() => {
    const groups: Record<string, Vinyl[]> = {};
    for (const v of vinyls) (groups[v.genre] ??= []).push(v);
    return groups;
  }, [vinyls]);

  return (
    <div className="min-h-screen bg-hero">
      <Header />



      <section id="catalog" className="container mx-auto px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-4xl tracking-wide">КАТАЛОГ</h2>
            <p className="text-muted-foreground text-sm mt-1">Все пластинки в наличии</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск..."
                className="pl-8 sm:pl-9 h-8 sm:h-9 w-32 sm:w-48 text-xs sm:text-sm rounded-full"
              />
            </div>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  genre === g
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-card/40 text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Disc3 className="h-10 w-10 text-primary vinyl-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">Пластинки скоро появятся.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((v) => <VinylCard key={v.id} v={v} />)}
          </div>
        )}
      </section>

      <section id="genres" className="container mx-auto px-4 py-14 border-t border-border/60">
        <h2 className="font-display text-4xl tracking-wide mb-8">ПО ЖАНРАМ</h2>
        <div className="space-y-14">
          {Object.entries(byGenre).map(([g, items]) => (
            <div key={g}>
              <div className="flex items-baseline justify-between mb-5">
                <h3 className="font-display text-2xl tracking-wider text-gold">{g.toUpperCase()}</h3>
                <span className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? "пластинка" : "пластинок"}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {items.slice(0, 4).map((v) => <VinylCard key={v.id} v={v} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-10 mt-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 ГРАМПЛАСТ. Виниловые пластинки с душой.
        </div>
      </footer>
    </div>
  );
}
