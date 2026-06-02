import { Link, useNavigate } from "@tanstack/react-router";
import { Disc3, Shield, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function Header() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(sessionStorage.getItem("admin_access") === "true");
    const handler = () => setIsAdmin(sessionStorage.getItem("admin_access") === "true");
    window.addEventListener("storage", handler);
    window.addEventListener("admin-access-changed", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("admin-access-changed", handler);
    };
  }, []);

  function logout() {
    sessionStorage.removeItem("admin_access");
    window.dispatchEvent(new Event("admin-access-changed"));
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <Disc3 className="h-7 w-7 text-primary group-hover:vinyl-spin" />
          <span className="font-display text-2xl tracking-wider">ГРАМ<span className="text-gold">ПЛАСТ</span></span>
        </Link>

        <nav className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin"><Shield className="h-4 w-4 mr-1" /> Админ</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-1" /> Выйти
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth"><Shield className="h-4 w-4 mr-1" /> Администратор</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
