import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/score-badge";
import { getConceptNeighborhood } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data;
  try {
    data = await getConceptNeighborhood(Number(id));
  } catch {
    notFound();
  }
  const { root_concept, related_concepts, papers } = data;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link href="/explore" className="kicker hover:text-foreground">
          ← concept map
        </Link>
        <h1 className="font-display text-3xl tracking-tight text-foreground">
          {root_concept.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Mentioned in{" "}
          <span className="text-foreground">{root_concept.mention_count}</span> papers
          {root_concept.type === "proposed" && (
            <Badge variant="outline" className="ml-2 align-middle">
              proposed
            </Badge>
          )}
        </p>
      </header>

      {related_concepts.length > 0 && (
        <section className="space-y-3">
          <p className="kicker">most connected concepts</p>
          <div className="flex flex-wrap gap-2">
            {related_concepts.map((c) => (
              <Badge
                key={c.id}
                variant="outline"
                render={<Link href={`/concepts/${c.id}`} />}
              >
                {c.name}
                <span className="ml-1 font-mono text-[10px] text-muted-foreground">
                  {c.weight}
                </span>
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Number = papers this concept shares with {root_concept.name}.
          </p>
        </section>
      )}

      <section className="space-y-3">
        <p className="kicker">papers · {papers.length}</p>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {papers.map((p) => (
            <li key={p.id}>
              <Link
                href={`/papers/${p.id}`}
                className="flex items-start justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <span className="text-sm text-foreground">{p.title}</span>
                <ScoreBadge score={(p.score ?? 0) * 10} className="mt-0.5 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
