import { useState } from "react";
import { ShoppingCart, Trash2, Plus, Minus, Send, Disc3 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export function CartDrawer() {
  const { items, count, total, setQty, remove, clear } = useCart();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const buildMessage = () => {
    const lines = items.map(
      ({ vinyl, qty }) =>
        `• ${vinyl.artist} — ${vinyl.title} × ${qty} = ${(vinyl.price * qty).toLocaleString("ru-RU")} ₽`
    );
    return `Здравствуйте! Хочу заказать:\n${lines.join("\n")}\n\nИтого: ${total.toLocaleString("ru-RU")} ₽`;
  };

  const sendToSeller = () => {
    const url = `https://t.me/Selling_vinyl_LP?text=${encodeURIComponent(buildMessage())}`;
    window.open(url, "_blank");
    toast.success("Открываю Telegram продавца");
    setConfirmOpen(false);
  };

  return (
    <>
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
              <Button className="w-full" size="lg" onClick={() => setConfirmOpen(true)}>
                Написать продавцу
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-2 justify-center mb-2">
              <Disc3 className="h-6 w-6 text-gold animate-spin-slow" />
              <DialogTitle className="font-display tracking-wider text-2xl text-center">
                ПОДТВЕРЖДЕНИЕ ЗАКАЗА
              </DialogTitle>
              <Disc3 className="h-6 w-6 text-gold animate-spin-slow" />
            </div>
            <DialogDescription className="text-center">
              Проверьте состав заказа перед отправкой продавцу
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 py-2">
            {items.map(({ vinyl, qty }) => (
              <div
                key={vinyl.id}
                className="flex gap-3 border border-gold/30 bg-gradient-to-br from-background to-muted/40 rounded-lg p-3"
              >
                <div className="h-16 w-16 rounded bg-muted overflow-hidden flex-shrink-0">
                  {vinyl.image_url && (
                    <img src={vinyl.image_url} alt={vinyl.title} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider truncate">{vinyl.artist}</p>
                  <p className="font-medium text-sm truncate">{vinyl.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Количество: {qty}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-gold whitespace-nowrap">
                    {(vinyl.price * qty).toLocaleString("ru-RU")} ₽
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gold/30 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground uppercase tracking-wider text-sm">Итого к оплате:</span>
              <span className="font-display text-3xl text-gold">{total.toLocaleString("ru-RU")} ₽</span>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              После нажатия откроется Telegram продавца <span className="text-gold">@Selling_vinyl_LP</span> с готовым сообщением
            </p>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button className="w-full" size="lg" onClick={sendToSeller}>
              <Send className="h-4 w-4" />
              Написать продавцу
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setConfirmOpen(false)}>
              Назад к корзине
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
