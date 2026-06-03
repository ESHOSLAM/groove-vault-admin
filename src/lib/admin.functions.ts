import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ADMIN_PASSWORD = "zaqsd1974zaqsd";

function assertAdmin(password: string) {
  if (password !== ADMIN_PASSWORD) {
    throw new Error("Доступ запрещён");
  }
}

const vinylPayload = z.object({
  password: z.string().min(1),
  id: z.string().uuid().optional(),
  data: z.object({
    title: z.string().trim().min(1).max(200),
    artist: z.string().trim().min(1).max(200),
    genre: z.string().trim().min(1).max(100),
    year: z.number().int().min(1900).max(2100).nullable().optional(),
    price: z.number().min(0).max(10_000_000),
    condition: z.string().trim().max(50).nullable().optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    image_url: z.string().trim().max(2000).nullable().optional(),
    image_urls: z.array(z.string().trim().min(1).max(2000)).max(4).optional(),
    in_stock: z.boolean(),
  }),
});

export const saveVinyl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => vinylPayload.parse(input))
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    if (data.id) {
      const { error } = await supabaseAdmin.from("vinyls").update(data.data).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("vinyls").insert(data.data);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteVinyl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ password: z.string().min(1), id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const { error } = await supabaseAdmin.from("vinyls").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const uploadVinylImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (!(input instanceof FormData)) throw new Error("Ожидается FormData");
    const password = input.get("password");
    const file = input.get("file");
    if (typeof password !== "string") throw new Error("Нет пароля");
    if (!(file instanceof File)) throw new Error("Нет файла");
    if (file.size > 8 * 1024 * 1024) throw new Error("Файл больше 8 МБ");
    if (!file.type.startsWith("image/")) throw new Error("Только изображения");
    return { password, file };
  })
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const ext = (data.file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "jpg"}`;
    const buffer = new Uint8Array(await data.file.arrayBuffer());
    const { error: upErr } = await supabaseAdmin.storage
      .from("vinyl-images")
      .upload(path, buffer, { contentType: data.file.type, cacheControl: "31536000", upsert: false });
    if (upErr) throw new Error(upErr.message);
    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("vinyl-images")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (sErr || !signed) throw new Error(sErr?.message ?? "Не удалось получить URL");
    return { url: signed.signedUrl };
  });
