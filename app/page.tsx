import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/score-badge";
import { getDigest, getDigests, type DigestDetail } from "@/lib/api";

export const dynamic = "force-dynamic";

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card px-5 py-4">
      <p className="kicker">{label}</p>
      <p className="mt-1 font-display text-2xl text-foreground tabular-nums">{value}</p>
    </div>
  );
}

export default async function HomePage() {
  const { digests } = await getDigests(30);

  if (digests.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
        <p className="kicker">no ingestion yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Run <code className="text-foreground">./vc ingest</code> to populate the vault.
        </p>
      </div>
    );
  }

  const latest: DigestDetail = await getDigest(digests[0].date);
  const avgScore =
    latest.papers.length > 0
      ? (
          (latest.papers.reduce((s, p) => s + (p.score ?? 0), 0) / latest.papers.length) *
          10
        ).toFixed(1)
      : "—";

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="kicker">latest digest · {latest.date}</p>
        <h1 className="font-display text-3xl tracking-tight text-foreground">
          Today&rsquo;s signal
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
        <StatTile label="papers ingested" value={latest.paper_count} />
        <StatTile label="avg score" value={avgScore} />
        <StatTile label="failures" value={latest.failure_count} />
      </div>

      <section className="space-y-3">
        <p className="kicker">the papers</p>
        <div className="space-y-2">
          {latest.papers.map((p) => (
            <Link
              key={p.id}
              href={`/papers/${p.id}`}
              className="block rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-foreground">{p.title}</span>
                <ScoreBadge score={(p.score ?? 0) * 10} className="mt-0.5 shrink-0" />
              </div>
              {p.concepts && p.concepts.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.concepts.map((c) => (
                    <Badge key={c} variant="ghost" className="text-muted-foreground">
                      {c}
                    </Badge>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {digests.length > 1 && (
        <section className="space-y-3">
          <p className="kicker">recent runs</p>
          <div className="flex flex-wrap gap-2">
            {digests.map((d) => (
              <span
                key={d.date}
                className="rounded-md border border-border px-3 py-1.5 font-mono text-[11px] text-muted-foreground"
              >
                {d.date} · {d.paper_count}p
                {d.failure_count > 0 && (
                  <span className="text-destructive"> · {d.failure_count}✕</span>
                )}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
