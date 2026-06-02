import { Disc3, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export type Vinyl = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  year: number | null;
  price: number;
  condition: string | null;
  description: string | null;
  image_url: string | null;
  in_stock: boolean;
};

export function VinylCard({ v }: { v: Vinyl }) {
  const { add } = useCart();
  return (
    <article className="group relative overflow-hidden rounded-xl bg-card border border-border/60 transition-all hover:border-primary/50 hover:-translate-y-1 hover:shadow-vinyl">
      <div className="aspect-square overflow-hidden bg-muted relative">
        {v.image_url ? (
          <img
            src={v.image_url}
            alt={`${v.artist} — ${v.title}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Disc3 className="h-20 w-20 text-muted-foreground" />
          </div>
        )}
        <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur text-foreground border-border">
          {v.genre}
        </Badge>
        {!v.in_stock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="font-display text-2xl tracking-wider">НЕТ В НАЛИЧИИ</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{v.artist}</p>
        <h3 className="mt-1 font-semibold text-lg leading-tight line-clamp-1">{v.title}</h3>
        <div className="mt-3 flex items-end justify-between">
          <span className="text-xs text-muted-foreground">{v.year ?? "—"} · {v.condition}</span>
          <span className="font-display text-2xl text-gold">{v.price.toLocaleString("ru-RU")} ₽</span>
        </div>
        <Button
          size="sm"
          className="mt-3 w-full"
          disabled={!v.in_stock}
          onClick={() => { add(v); toast.success(`«${v.title}» добавлено в корзину`); }}
        >
          <ShoppingCart className="h-4 w-4 mr-2" /> В корзину
        </Button>
      </div>
    </article>
  );
}
