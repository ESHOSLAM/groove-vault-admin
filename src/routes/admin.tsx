import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Plus, Trash2, Disc3, Upload, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { saveVinyl, deleteVinyl, uploadVinylImage } from "@/lib/admin.functions";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Vinyl } from "@/components/VinylCard";

const GENRES = ["Классика", "Rock", "Pop", "Jazz", "Classical", "Electronic", "Hip-Hop", "Blues", "Soul/Funk", "Reggae", "Metal", "Folk", "Country"];
const CONDITIONS = [
  { v: "M", l: "M — Mint (новый)" },
  { v: "NM", l: "NM — Near Mint" },
  { v: "EX", l: "EX — Excellent" },
  { v: "VG+", l: "VG+ — Very Good Plus" },
  { v: "VG", l: "VG — Very Good" },
];

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Админ — ГРАМПЛАСТ" }] }),
  component: AdminPage,
});

type FormState = Omit<Vinyl, "id" | "in_stock"> & { id?: string; in_stock: boolean; image_urls: string[] };

const MAX_IMAGES = 4;

const empty: FormState = {
  title: "", artist: "", genre: "Rock", year: new Date().getFullYear(),
  price: 0, condition: "NM", description: "", image_url: "", image_urls: [], in_stock: true,
};

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [vinyls, setVinyls] = useState<Vinyl[]>([]);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveVinylFn = useServerFn(saveVinyl);
  const deleteVinylFn = useServerFn(deleteVinyl);
  const uploadFn = useServerFn(uploadVinylImage);

  function getPassword(): string {
    const p = sessionStorage.getItem("admin_password");
    if (!p) throw new Error("Сессия истекла, войдите снова");
    return p;
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !editing) return;
    const slotsLeft = MAX_IMAGES - editing.image_urls.length;
    if (slotsLeft <= 0) {
      toast.error(`Максимум ${MAX_IMAGES} изображений`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const toUpload = files.slice(0, slotsLeft);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        const fd = new FormData();
        fd.append("password", getPassword());
        fd.append("file", file);
        const res = await uploadFn({ data: fd });
        urls.push(res.url);
      }
      const newUrls = [...editing.image_urls, ...urls].slice(0, MAX_IMAGES);
      setEditing({ ...editing, image_urls: newUrls, image_url: newUrls[0] ?? "" });
      toast.success("Загружено");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImageAt(idx: number) {
    if (!editing) return;
    const newUrls = editing.image_urls.filter((_, i) => i !== idx);
    setEditing({ ...editing, image_urls: newUrls, image_url: newUrls[0] ?? "" });
  }

  function addUrlImage(url: string) {
    if (!editing) return;
    const trimmed = url.trim();
    if (!trimmed) return;
    if (editing.image_urls.length >= MAX_IMAGES) {
      toast.error(`Максимум ${MAX_IMAGES} изображений`);
      return;
    }
    const newUrls = [...editing.image_urls, trimmed];
    setEditing({ ...editing, image_urls: newUrls, image_url: newUrls[0] ?? "" });
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
    try {
      await saveVinylFn({
        data: {
          password: getPassword(),
          id: editing.id,
          data: {
            title: editing.title, artist: editing.artist, genre: editing.genre,
            year: editing.year ?? null, price: editing.price,
            condition: editing.condition ?? null, description: editing.description ?? null,
            image_url: editing.image_urls[0] ?? editing.image_url ?? null,
            image_urls: editing.image_urls,
            in_stock: editing.in_stock,
          },
        },
      });
      toast.success(editing.id ? "Обновлено" : "Добавлено");
      setOpen(false); setEditing(null); refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка сохранения");
    }
  }

  async function remove(id: string) {
    if (!confirm("Удалить пластинку?")) return;
    try {
      await deleteVinylFn({ data: { password: getPassword(), id } });
      toast.success("Удалено"); refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка удаления");
    }
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
                    <div>
                      <Label>Жанр</Label>
                      <Select value={editing.genre} onValueChange={(val) => setEditing({ ...editing, genre: val })}>
                        <SelectTrigger><SelectValue placeholder="Выберите жанр" /></SelectTrigger>
                        <SelectContent>
                          {GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Год</Label><Input type="number" value={editing.year ?? ""} onChange={(e) => setEditing({ ...editing, year: e.target.value ? +e.target.value : null })} /></div>
                    <div><Label>Цена ₽</Label><Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: +e.target.value })} /></div>
                    <div>
                      <Label>Состояние</Label>
                      <Select value={editing.condition ?? ""} onValueChange={(val) => setEditing({ ...editing, condition: val })}>
                        <SelectTrigger><SelectValue placeholder="Состояние" /></SelectTrigger>
                        <SelectContent>
                          {CONDITIONS.map((c) => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Изображения ({editing.image_urls.length}/{MAX_IMAGES})</Label>
                    {editing.image_urls.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {editing.image_urls.map((url, i) => (
                          <div key={url + i} className="relative">
                            <img src={url} alt="" className="aspect-square w-full object-cover rounded border border-border" />
                            <button
                              type="button"
                              onClick={() => removeImageAt(i)}
                              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                            {i === 0 && (
                              <span className="absolute bottom-1 left-1 bg-background/80 text-foreground text-[10px] px-1 rounded">обложка</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder="URL изображения (Enter чтобы добавить)"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addUrlImage((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={uploading || editing.image_urls.length >= MAX_IMAGES}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      </Button>
                      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                    </div>
                  </div>
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

        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по исполнителю, названию, жанру..."
            className="pl-9"
          />
        </div>

        <div className="grid gap-3">
          {vinyls
            .filter((v) => {
              const q = query.trim().toLowerCase();
              if (!q) return true;
              return (
                v.title.toLowerCase().includes(q) ||
                v.artist.toLowerCase().includes(q) ||
                v.genre.toLowerCase().includes(q)
              );
            })
            .map((v) => (
            <div key={v.id} className="flex items-center gap-4 bg-card border border-border rounded-lg p-3">
              <div className="h-16 w-16 rounded bg-muted overflow-hidden flex-shrink-0">
                {v.image_url && <img src={v.image_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{v.genre} · {v.year}</p>
                <p className="font-medium truncate">{v.artist} — {v.title}</p>
                <p className="text-sm text-gold">{v.price.toLocaleString("ru-RU")} ₽ · {v.in_stock ? "в наличии" : "нет"}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => { setEditing({ ...v, in_stock: v.in_stock, image_urls: (v.image_urls && v.image_urls.length > 0) ? v.image_urls : (v.image_url ? [v.image_url] : []) }); setOpen(true); }}>
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
