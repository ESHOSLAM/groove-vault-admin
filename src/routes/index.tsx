import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Disc3, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { VinylCard, type Vinyl } from "@/components/VinylCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

const PAGE_SIZE = 30;

function getPageNumbers(current: number, total: number) {
  const pages: (number | string)[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("ellipsis");
    pages.push(total);
    return pages;
  }
  if (current >= total - 3) {
    pages.push(1);
    pages.push("ellipsis");
    for (let i = total - 4; i <= total; i++) pages.push(i);
    return pages;
  }
  pages.push(1);
  pages.push("ellipsis");
  for (let i = current - 1; i <= current + 1; i++) pages.push(i);
  pages.push("ellipsis");
  pages.push(total);
  return pages;
}

function Index() {
  const [vinyls, setVinyls] = useState<Vinyl[]>([]);
  const [genre, setGenre] = useState<string>("Все");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    supabase.from("vinyls").select("*").order("created_at", { ascending: false })
      .then(({ data }) => {
        setVinyls((data as Vinyl[]) ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, genre]);

  const genres = useMemo(() => {
    const set = new Set(vinyls.map((v) => v.genre).filter((g) => g.toLowerCase() !== "классика"));
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <h2 className="font-display text-4xl tracking-wide">КАТАЛОГ</h2>
              <p className="text-muted-foreground text-sm mt-1">Всего пластинок: <span className="text-foreground font-semibold">{vinyls.length}</span></p>
            </div>
            <a
              href="https://t.me/Selling_Vinil_LP"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-[#229ED9] via-[#34b3e6] to-[#229ED9] bg-[length:200%_100%] shadow-lg shadow-[#229ED9]/30 transition-all duration-300 hover:scale-105 hover:shadow-[#229ED9]/60 animate-[shimmer_3s_linear_infinite] overflow-hidden group"
              style={{ animation: "shimmer 3s linear infinite" }}
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 relative z-10" aria-hidden="true">
                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
              </svg>
              <span className="relative z-10">Мой Telegram канал</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative group">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск"
                aria-label="Поиск"
                className="pl-7 sm:pl-9 h-8 sm:h-9 w-9 focus:w-40 sm:w-48 sm:focus:w-56 text-xs sm:text-sm rounded-full transition-all duration-300"
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
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {paginated.map((v) => <VinylCard key={v.id} v={v} />)}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#catalog"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) setPage(page - 1);
                        }}
                        className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {getPageNumbers(page, totalPages).map((p, i) => {
                      if (p === "ellipsis") {
                        return (
                          <PaginationItem key={`ellipsis-${i}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      const n = p as number;
                      return (
                        <PaginationItem key={n}>
                          <PaginationLink
                            href="#catalog"
                            isActive={page === n}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(n);
                            }}
                          >
                            {n}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        href="#catalog"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < totalPages) setPage(page + 1);
                        }}
                        className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
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
          © 2026 — Виниловые пластинки г. Севастополь
        </div>
      </footer>
    </div>
  );
}
