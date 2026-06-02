import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Disc3, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ADMIN_PASSWORD = "zaqsd1974zazqsd";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Администратор — ГРАМПЛАСТ" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_access", "true");
      sessionStorage.setItem("admin_password", password);
      window.dispatchEvent(new Event("admin-access-changed"));
      toast.success("Добро пожаловать, администратор!");
      navigate({ to: "/admin" });
    } else {
      toast.error("Неверный пароль");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Disc3 className="h-8 w-8 text-primary" />
          <span className="font-display text-3xl tracking-wider">ГРАМ<span className="text-gold">ПЛАСТ</span></span>
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-vinyl">
          <div className="flex justify-center mb-4">
            <Shield className="h-10 w-10 text-gold" />
          </div>
          <h1 className="font-display text-3xl tracking-wide text-center mb-1">АДМИНИСТРАТОР</h1>
          <p className="text-center text-sm text-muted-foreground mb-6">
            Введите пароль для доступа к админ-панели
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "..." : "Войти"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
