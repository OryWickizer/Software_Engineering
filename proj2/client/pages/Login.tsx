import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function Login() {
  const supabase = getSupabase();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const disabled = !supabase;

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      toast("Connect Supabase to enable login");
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      toast.success("Magic link sent! Check your email.");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  }

  async function oauth(provider: "google" | "github") {
    if (!supabase) {
      toast("Connect Supabase to enable OAuth");
      return;
    }
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
      if (!data?.url) return;
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message ?? "OAuth error");
    }
  }

  return (
    <div className="relative">
      <div className="absolute -z-10 inset-0 bg-[radial-gradient(90%_70%_at_50%_-10%,hsl(var(--primary)/0.25),transparent_60%)]" />
      <div className="container py-20 md:py-28 max-w-xl">
        <Card className="p-6 md:p-8 border-emerald-200/50 bg-white/80 backdrop-blur">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold">Sign in to EcoBites</h1>
            <p className="mt-1 text-sm text-foreground/60">Secure, passwordless login. Green by design.</p>
          </div>

          {!supabase && (
            <div className="mt-4 rounded-md bg-yellow-50 text-yellow-900 p-3 text-sm">
              Supabase is not connected. Click <a className="underline" href="#open-mcp-popover">Open MCP popover</a> and connect Supabase, then set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
            </div>
          )}

          <Tabs defaultValue="email" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email Link</TabsTrigger>
              <TabsTrigger value="oauth">OAuth</TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="mt-4">
              <form onSubmit={sendMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={disabled || loading} className="w-full">
                  {loading ? "Sending..." : "Send Magic Link"}
                </Button>
                <p className="text-xs text-foreground/60 text-center">
                  By continuing you agree to our Terms and acknowledge our Privacy Policy.
                </p>
              </form>
            </TabsContent>
            <TabsContent value="oauth" className="mt-4 space-y-3">
              <Button variant="secondary" className="w-full" onClick={() => oauth("google")}>Continue with Google</Button>
              <Button variant="secondary" className="w-full" onClick={() => oauth("github")}>Continue with GitHub</Button>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
