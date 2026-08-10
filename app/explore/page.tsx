import { ConceptGraph } from "@/components/concept-graph";
import { getConceptGraph } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata = { title: "Explore" };

export default async function ExplorePage() {
  const graph = await getConceptGraph(1);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="kicker">concept map</p>
        <h1 className="font-display text-3xl tracking-tight text-foreground">
          The shape of the research
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Every node is a concept the vault tracks, sized by how many papers mention it.
          A link means two concepts <span className="text-foreground">co-occur</span> in the
          same paper — thicker links, more shared papers. Click a concept to see its papers
          and closest neighbours.
        </p>
      </header>
      <ConceptGraph data={graph} />
    </div>
  );
}
