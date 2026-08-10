import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/score-badge";
import { MarkdownLite } from "@/components/markdown-lite";
import { getPaper, type PaperConcept, type PaperDetail } from "@/lib/api";

export const dynamic = "force-dynamic";

function Section({ title, body }: { title: string; body: string | null | undefined }) {
  if (!body || !body.trim()) return null;
  return (
    <section className="space-y-2">
      <p className="kicker">{title}</p>
      <MarkdownLite text={body} className="text-sm text-muted-foreground" />
    </section>
  );
}

export default async function PaperPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let paper: PaperDetail;
  let concepts: PaperConcept[];
  try {
    const data = await getPaper(Number(id));
    paper = data.paper;
    concepts = data.concepts;
  } catch {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <ScoreBadge score={(paper.score ?? 0) * 10} />
          {paper.published_date && <span className="kicker">{paper.published_date}</span>}
          {paper.categories.map((c) => (
            <span key={c} className="font-mono text-[11px] text-muted-foreground">
              {c}
            </span>
          ))}
        </div>
        <h1 className="font-display text-3xl leading-tight tracking-tight text-foreground">
          {paper.title}
        </h1>
        {paper.authors.length > 0 && (
          <p className="text-sm text-muted-foreground">{paper.authors.join(", ")}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {concepts.map((c) => (
            <Badge key={c.id} variant="outline" render={<Link href={`/concepts/${c.id}`} />}>
              {c.name}
            </Badge>
          ))}
        </div>
        {paper.pdf_url && (
          <a
            href={paper.pdf_url}
            target="_blank"
            rel="noreferrer"
            className="inline-block font-mono text-[11px] tracking-[0.14em] uppercase text-primary hover:underline"
          >
            arXiv ↗
          </a>
        )}
      </header>

      {paper.summary && (
        <section className="space-y-2">
          <p className="kicker">tl;dr</p>
          <p className="font-display text-lg leading-relaxed text-foreground">{paper.summary}</p>
        </section>
      )}

      {paper.highlights.length > 0 && (
        <section className="space-y-2">
          <p className="kicker">highlights</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {paper.highlights.map((h, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">›</span>
                <span className="leading-relaxed">{h}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Section title="method" body={paper.method} />
      <Section title="evals & results" body={paper.evals_results} />
      <Section title="so what" body={paper.practitioner_takeaways} />
      <Section title="open questions" body={paper.open_questions} />

      {paper.abstract && (
        <details className="rounded-lg border border-border">
          <summary className="cursor-pointer px-4 py-2 kicker">abstract</summary>
          <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{paper.abstract}</p>
        </details>
      )}
    </article>
  );
}
