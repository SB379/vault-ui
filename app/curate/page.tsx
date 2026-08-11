import { redirect } from "next/navigation";
import { CurateClient } from "@/components/curate-client";
import { getConcepts, getInterestProfile } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export const dynamic = "force-dynamic";

export const metadata = { title: "Curate" };

export default async function CuratePage() {
  // Gate the control plane behind a session when Supabase is configured.
  // Local dev (no Supabase env) stays open so the screen is demoable offline.
  let userEmail: string | null = null;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    userEmail = user.email ?? null;
  }

  const [{ concepts }, { interest_profile }] = await Promise.all([
    getConcepts("proposed"),
    getInterestProfile(),
  ]);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <p className="kicker">control plane</p>
          {userEmail && <SignOutButton email={userEmail} />}
        </div>
        <h1 className="font-display text-3xl tracking-tight text-foreground">Curate</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          The pipeline&rsquo;s operational config lives in the graph, edited here — not in
          redeployed files. Approve the concepts ingestion proposes, and tune the interest
          profile that steers scoring.
        </p>
      </header>
      <CurateClient
        initialProposed={concepts.map((c) => ({ id: c.id, name: c.name, mention_count: c.mention_count }))}
        initialProfile={interest_profile ?? ""}
      />
    </div>
  );
}
