import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export function CartDrawer() {
  const { items, count, total, setQty, remove, clear } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative" aria-label="Корзина">
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display tracking-wider text-2xl">КОРЗИНА</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">Корзина пуста</p>
          ) : (
            items.map(({ vinyl, qty }) => (
              <div key={vinyl.id} className="flex gap-3 border border-border/60 rounded-lg p-3">
                <div className="h-16 w-16 rounded bg-muted overflow-hidden flex-shrink-0">
                  {vinyl.image_url && (
                    <img src={vinyl.image_url} alt={vinyl.title} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider truncate">{vinyl.artist}</p>
                  <p className="font-medium text-sm truncate">{vinyl.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQty(vinyl.id, qty - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{qty}</span>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQty(vinyl.id, qty + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-display text-gold">{(vinyl.price * qty).toLocaleString("ru-RU")} ₽</span>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(vinyl.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t border-border/60 pt-4 flex-col gap-3 sm:flex-col">
            <div className="flex justify-between items-center w-full">
              <span className="text-muted-foreground">Итого:</span>
              <span className="font-display text-2xl text-gold">{total.toLocaleString("ru-RU")} ₽</span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                const lines = items.map(
                  ({ vinyl, qty }) =>
                    `• ${vinyl.artist} — ${vinyl.title} × ${qty} = ${(vinyl.price * qty).toLocaleString("ru-RU")} ₽`
                );
                const text = `Здравствуйте! Хочу заказать:\n${lines.join("\n")}\n\nИтого: ${total.toLocaleString("ru-RU")} ₽`;
                const url = `https://t.me/Selling_vinyl_LP?text=${encodeURIComponent(text)}`;
                window.open(url, "_blank");
                toast.success("Открываю Telegram продавца");
              }}
            >
              Написать продавцу
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
