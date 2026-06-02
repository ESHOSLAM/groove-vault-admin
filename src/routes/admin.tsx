import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Pencil, Plus, Trash2, Disc3, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Vinyl } from "@/components/VinylCard";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Админ — ГРАМПЛАСТ" }] }),
  component: AdminPage,
});

type FormState = Omit<Vinyl, "id" | "in_stock"> & { id?: string; in_stock: boolean };

const empty: FormState = {
  title: "", artist: "", genre: "Rock", year: new Date().getFullYear(),
  price: 0, condition: "NM", description: "", image_url: "", in_stock: true,
};

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [vinyls, setVinyls] = useState<Vinyl[]>([]);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("vinyl-images").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data, error: sErr } = await supabase.storage
        .from("vinyl-images")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (sErr || !data) throw sErr ?? new Error("Не удалось получить URL");
      setEditing({ ...editing, image_url: data.signedUrl });
      toast.success("Фото загружено");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }


  useEffect(() => {
    const ok = typeof window !== "undefined" && sessionStorage.getItem("admin_access") === "true";
    setIsAdmin(ok);
    if (!ok) navigate({ to: "/auth" });
  }, [navigate]);

  async function refresh() {
    const { data } = await supabase.from("vinyls").select("*").order("created_at", { ascending: false });
    setVinyls((data as Vinyl[]) ?? []);
  }

  useEffect(() => { refresh(); }, []);

  async function save() {
    if (!editing) return;
    const payload = {
      title: editing.title, artist: editing.artist, genre: editing.genre,
      year: editing.year, price: editing.price, condition: editing.condition,
      description: editing.description, image_url: editing.image_url, in_stock: editing.in_stock,
    };
    const { error } = editing.id
      ? await supabase.from("vinyls").update(payload).eq("id", editing.id)
      : await supabase.from("vinyls").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing.id ? "Обновлено" : "Добавлено");
    setOpen(false); setEditing(null); refresh();
  }

  async function remove(id: string) {
    if (!confirm("Удалить пластинку?")) return;
    const { error } = await supabase.from("vinyls").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Удалено"); refresh();
  }

  if (isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center"><Disc3 className="h-10 w-10 text-primary vinyl-spin" /></div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-hero">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-4xl tracking-wide mb-4">ДОСТУП ЗАКРЫТ</h1>
          <p className="text-muted-foreground">Этот раздел доступен только администраторам.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl tracking-wide">АДМИН-ПАНЕЛЬ</h1>
            <p className="text-muted-foreground text-sm mt-1">{vinyls.length} пластинок в каталоге</p>
          </div>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing({ ...empty })}>
                <Plus className="h-4 w-4 mr-1" /> Добавить
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing?.id ? "Редактировать" : "Новая пластинка"}</DialogTitle>
              </DialogHeader>
              {editing && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Исполнитель</Label><Input value={editing.artist} onChange={(e) => setEditing({ ...editing, artist: e.target.value })} /></div>
                    <div><Label>Название</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
                    <div><Label>Жанр</Label><Input value={editing.genre} onChange={(e) => setEditing({ ...editing, genre: e.target.value })} /></div>
                    <div><Label>Год</Label><Input type="number" value={editing.year ?? ""} onChange={(e) => setEditing({ ...editing, year: e.target.value ? +e.target.value : null })} /></div>
                    <div><Label>Цена ₽</Label><Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: +e.target.value })} /></div>
                    <div><Label>Состояние</Label><Input value={editing.condition ?? ""} onChange={(e) => setEditing({ ...editing, condition: e.target.value })} /></div>
                  </div>
                  <div><Label>URL изображения</Label><Input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} /></div>
                  <div><Label>Описание</Label><Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editing.in_stock} onChange={(e) => setEditing({ ...editing, in_stock: e.target.checked })} />
                    В наличии
                  </label>
                  <Button onClick={save} className="w-full">Сохранить</Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-3">
          {vinyls.map((v) => (
            <div key={v.id} className="flex items-center gap-4 bg-card border border-border rounded-lg p-3">
              <div className="h-16 w-16 rounded bg-muted overflow-hidden flex-shrink-0">
                {v.image_url && <img src={v.image_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{v.genre} · {v.year}</p>
                <p className="font-medium truncate">{v.artist} — {v.title}</p>
                <p className="text-sm text-gold">{v.price.toLocaleString("ru-RU")} ₽ · {v.in_stock ? "в наличии" : "нет"}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => { setEditing({ ...v, in_stock: v.in_stock }); setOpen(true); }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(v.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
