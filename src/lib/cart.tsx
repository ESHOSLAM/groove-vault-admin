import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Vinyl } from "@/components/VinylCard";

export type CartItem = { vinyl: Vinyl; qty: number };

type CartCtx = {
  items: CartItem[];
  add: (v: Vinyl) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "vinyl_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = (v: Vinyl) =>
    setItems((prev) => {
      const ex = prev.find((i) => i.vinyl.id === v.id);
      if (ex) return prev.map((i) => (i.vinyl.id === v.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { vinyl: v, qty: 1 }];
    });

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.vinyl.id !== id));
  const setQty = (id: string, qty: number) =>
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.vinyl.id !== id) : prev.map((i) => (i.vinyl.id === id ? { ...i, qty } : i))
    );
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.vinyl.price, 0);

  return <Ctx.Provider value={{ items, add, remove, setQty, clear, count, total }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
