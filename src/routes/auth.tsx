import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Disc3 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Вход — ГРАМПЛАСТ" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Аккаунт создан! Можете войти.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("С возвращением!");
        navigate({ to: "/" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Disc3 className="h-8 w-8 text-primary" />
          <span className="font-display text-3xl tracking-wider">ГРАМ<span className="text-gold">ПЛАСТ</span></span>
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-vinyl">
          <h1 className="font-display text-3xl tracking-wide text-center mb-1">
            {mode === "login" ? "ВХОД" : "РЕГИСТРАЦИЯ"}
          </h1>
          <p className="text-center text-sm text-muted-foreground mb-6">
            {mode === "login" ? "Войдите, чтобы продолжить" : "Первый зарегистрированный — администратор"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "..." : mode === "login" ? "Войти" : "Создать аккаунт"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="mt-5 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {mode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
          </button>
        </div>
      </div>
    </div>
  );
}
