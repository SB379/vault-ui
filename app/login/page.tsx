"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/curate");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 py-16">
      <header className="space-y-1">
        <p className="kicker">curator access</p>
        <h1 className="font-display text-2xl tracking-tight text-foreground">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Editing the vault&rsquo;s config requires an account. Browsing is open.
        </p>
      </header>
      <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        Curator accounts are provisioned by invite — there&rsquo;s no self-serve
        sign-up. Contact the maintainer for access.
      </p>
      <form onSubmit={signIn} className="space-y-3">
        <input
          type="email"
          required
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
        />
        <input
          type="password"
          required
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "signing in…" : "sign in"}
        </Button>
      </form>
    </div>
  );
}
