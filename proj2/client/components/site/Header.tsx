import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function SiteHeader() {
  const supabase = getSupabase();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => sub?.subscription.unsubscribe();
  }, [supabase]);

  async function logout() {
    await supabase?.auth.signOut();
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary font-bold">EB</span>
          <span className="text-lg font-semibold">EcoBites</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#mission" className="text-foreground/70 hover:text-foreground transition-colors">Mission</a>
          <a href="#how-it-works" className="text-foreground/70 hover:text-foreground transition-colors">How It Works</a>
          <a href="#whats-new" className="text-foreground/70 hover:text-foreground transition-colors">What's New</a>
        </nav>
        <div className="flex items-center gap-2">
          {email ? (
            <>
              <span className="hidden sm:inline text-sm text-foreground/70">{email}</span>
              <Button size="sm" variant="ghost" onClick={logout}>Sign out</Button>
            </>
          ) : (
            <Button asChild size="sm" variant="ghost" className="text-foreground/80">
              <a href="/customer">Login</a>
            </Button>
          )}
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href="#whats-new">See What's New</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
