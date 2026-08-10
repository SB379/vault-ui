import { CurateClient } from "@/components/curate-client";
import { getConcepts, getInterestProfile } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata = { title: "Curate" };

export default async function CuratePage() {
  const [{ concepts }, { interest_profile }] = await Promise.all([
    getConcepts("proposed"),
    getInterestProfile(),
  ]);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="kicker">control plane</p>
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
