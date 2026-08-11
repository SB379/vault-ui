"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ email }: { email: string }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="hidden sm:inline">{email}</span>
      <button
        onClick={signOut}
        className="rounded-md border border-border px-2 py-1 transition-colors hover:border-primary/50 hover:text-foreground"
      >
        sign out
      </button>
    </div>
  );
}
