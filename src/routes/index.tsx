import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Disc3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
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

  const filtered = genre === "Все" ? vinyls : vinyls.filter((v) => v.genre === genre);
  const byGenre = useMemo(() => {
    const groups: Record<string, Vinyl[]> = {};
    for (const v of vinyls) (groups[v.genre] ??= []).push(v);
    return groups;
  }, [vinyls]);

  return (
    <div className="min-h-screen bg-hero">
      <Header />

      <section className="relative overflow-hidden border-b border-border/60">
        <div className="container mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> Коллекция 2026
            </div>
            <h1 className="mt-5 font-display text-5xl md:text-7xl leading-[0.95] tracking-wide">
              ТЁПЛЫЙ ЗВУК<br />
              <span className="text-gold">НАСТОЯЩЕГО</span> ВИНИЛА
            </h1>
            <p className="mt-5 max-w-md text-muted-foreground">
              Тщательно отобранные пластинки из эпох золотого века музыки.
              От джаза 50-х до электроники наших дней.
            </p>
            <div className="mt-7 flex gap-3">
              <Button size="lg" asChild>
                <a href="#catalog">Смотреть каталог</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#genres">По жанрам</a>
              </Button>
            </div>
          </div>
          <div className="relative h-72 md:h-96 flex items-center justify-center">
            <div className="absolute inset-0 bg-gold rounded-full blur-3xl opacity-20" />
            <div className="relative h-64 w-64 md:h-80 md:w-80 rounded-full bg-gradient-to-br from-neutral-900 to-black shadow-vinyl vinyl-spin flex items-center justify-center">
              <div className="absolute inset-4 rounded-full border border-neutral-800" />
              <div className="absolute inset-10 rounded-full border border-neutral-800" />
              <div className="absolute inset-16 rounded-full border border-neutral-800" />
              <div className="h-20 w-20 rounded-full bg-gold flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-background" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="catalog" className="container mx-auto px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-4xl tracking-wide">КАТАЛОГ</h2>
            <p className="text-muted-foreground text-sm mt-1">Все пластинки в наличии</p>
          </div>
          <div className="flex flex-wrap gap-2">
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
