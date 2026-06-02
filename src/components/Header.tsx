import { Link } from "@tanstack/react-router";
import { Disc3, LogIn, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export function Header() {
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <Disc3 className="h-7 w-7 text-primary group-hover:vinyl-spin" />
          <span className="font-display text-2xl tracking-wider">ГРАМ<span className="text-gold">ПЛАСТ</span></span>
        </Link>

        <nav className="flex items-center gap-2">
          {isAdmin && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin"><Shield className="h-4 w-4 mr-1" /> Админ</Link>
            </Button>
          )}
          {user ? (
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
              <LogOut className="h-4 w-4 mr-1" /> Выйти
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth"><LogIn className="h-4 w-4 mr-1" /> Войти</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
