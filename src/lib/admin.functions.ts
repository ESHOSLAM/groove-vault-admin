import { createServerFn } from "@tanstack/react-start";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Server-only secret. This file is *.functions.ts and never bundled to the client.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "zaqsd1974zaqsd";
const TOKEN_TTL_SEC = 60 * 60 * 8;

function sign(exp: number): string {
  return createHmac("sha256", ADMIN_PASSWORD).update(`admin:${exp}`).digest("hex");
}

function issueToken(): string {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SEC;
  return `${exp}.${sign(exp)}`;
}

function assertAdmin(token: string) {
  if (!token || typeof token !== "string") throw new Error("Доступ запрещён");
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || Math.floor(Date.now() / 1000) > exp) throw new Error("Сессия истекла, войдите снова");
  const expected = sign(exp);
  const a = Buffer.from(sig ?? "", "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("Доступ запрещён");
}

export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ password: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const a = Buffer.from(data.password);
    const b = Buffer.from(ADMIN_PASSWORD);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new Error("Неверный пароль");
    }
    return { token: issueToken() };
  });

export const checkAdminToken = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().min(1).max(500) }).parse(input),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.token);
    return { ok: true };
  });

const vinylPayload = z.object({
  token: z.string().min(1).max(500),
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
    assertAdmin(data.token);
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
    z.object({ token: z.string().min(1).max(500), id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.token);
    const { error } = await supabaseAdmin.from("vinyls").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const uploadVinylImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (!(input instanceof FormData)) throw new Error("Ожидается FormData");
    const token = input.get("token");
    const file = input.get("file");
    if (typeof token !== "string") throw new Error("Нет токена");
    if (!(file instanceof File)) throw new Error("Нет файла");
    if (file.size > 8 * 1024 * 1024) throw new Error("Файл больше 8 МБ");
    if (!file.type.startsWith("image/")) throw new Error("Только изображения");
    return { token, file };
  })
  .handler(async ({ data }) => {
    assertAdmin(data.token);
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
