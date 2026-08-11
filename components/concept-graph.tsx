"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { forceCollide } from "d3-force";
import { useRouter } from "next/navigation";
import type { ConceptGraph as ConceptGraphData } from "@/lib/api";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] items-center justify-center">
      <p className="kicker">assembling graph…</p>
    </div>
  ),
});

// Theme constants (matches globals.css dark intelligence-briefing palette)
const AMBER = "#e0a43a";
const AMBER_DIM = "rgba(224, 164, 58, 0.28)";
const LINK_COLOR = "rgba(222, 217, 205, 0.10)";
const LINK_HOT = "rgba(224, 164, 58, 0.5)";
const LABEL_INK = "rgba(237, 233, 224, 0.92)";
const LABEL_MUTED = "rgba(180, 174, 160, 0.85)";
const BG = "rgba(0,0,0,0)";

type FGNode = { id: number; name: string; mention_count: number; x?: number; y?: number };
type FGLink = { source: number | FGNode; target: number | FGNode; weight: number };

function endpointId(v: number | FGNode): number {
  return typeof v === "object" ? v.id : v;
}

function nodeRadius(n: FGNode): number {
  return 7 + Math.sqrt(n.mention_count ?? 0) * 3.2;
}

export function ConceptGraph({ data }: { data: ConceptGraphData }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const didFit = useRef(false);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [hoverId, setHoverId] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () =>
      setSize({ w: el.clientWidth, h: Math.max(520, window.innerHeight - 300) });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Spread the graph out so bubbles and labels don't overlap: strong repulsion,
  // longer links, and a collision force reserving room around each node+label.
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force("charge")?.strength(-420).distanceMax(600);
    fg.d3Force("link")?.distance(110).strength(0.15);
    fg.d3Force("collide", forceCollide((n: FGNode) => nodeRadius(n) + 26));
    fg.d3ReheatSimulation?.();
  }, [size, data]);

  // Fresh copies — the force engine mutates node/link objects.
  const graphData = useMemo(
    () => ({
      nodes: data.nodes.map((n) => ({ ...n })),
      links: data.edges.map((e) => ({ ...e })),
    }),
    [data],
  );

  const { neighbors, degree, maxWeight, maxDegree } = useMemo(() => {
    const neighbors = new Map<number, Set<number>>();
    const degree = new Map<number, number>();
    let maxWeight = 1;
    for (const e of data.edges) {
      if (!neighbors.has(e.source)) neighbors.set(e.source, new Set());
      if (!neighbors.has(e.target)) neighbors.set(e.target, new Set());
      neighbors.get(e.source)!.add(e.target);
      neighbors.get(e.target)!.add(e.source);
      degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
      degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
      maxWeight = Math.max(maxWeight, e.weight);
    }
    let maxDegree = 0;
    for (const d of degree.values()) maxDegree = Math.max(maxDegree, d);
    return { neighbors, degree, maxWeight, maxDegree };
  }, [data.edges]);

  const labelThreshold = Math.max(3, Math.ceil(maxDegree * 0.5));

  const isDimmed = useCallback(
    (id: number) => {
      if (hoverId === null || id === hoverId) return false;
      return !(neighbors.get(hoverId)?.has(id) ?? false);
    },
    [hoverId, neighbors],
  );

  const paintNode = useCallback(
    (node: FGNode, ctx: CanvasRenderingContext2D, scale: number) => {
      const r = nodeRadius(node);
      const dimmed = isDimmed(node.id);
      ctx.beginPath();
      ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI);
      ctx.fillStyle = dimmed ? AMBER_DIM : AMBER;
      ctx.fill();
      if (node.id === hoverId) {
        ctx.lineWidth = 1.5 / scale;
        ctx.strokeStyle = AMBER;
        ctx.stroke();
      }
      const hovered =
        hoverId !== null &&
        (node.id === hoverId || (neighbors.get(hoverId)?.has(node.id) ?? false));
      // With the graph spread out, show labels for everything unless dimmed by a
      // hover elsewhere. Each label sits on a dark chip so it stays readable
      // over links and neighbouring nodes.
      const showLabel = hovered || (!dimmed && (scale > 0.5 || (degree.get(node.id) ?? 0) >= labelThreshold));
      if (showLabel) {
        const fontSize = Math.min(13 / scale, 6.5);
        ctx.font = `600 ${fontSize}px ui-monospace, monospace`;
        const label = node.name.length > 30 ? node.name.slice(0, 28) + "…" : node.name;
        const textW = ctx.measureText(label).width;
        const padX = 4 / scale;
        const padY = 2.5 / scale;
        const cx = node.x ?? 0;
        const top = (node.y ?? 0) + r + 3 / scale;
        ctx.fillStyle = hovered ? "rgba(30,25,18,0.94)" : "rgba(18,16,12,0.78)";
        const bx = cx - textW / 2 - padX;
        const bw = textW + padX * 2;
        const bh = fontSize + padY * 2;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(bx, top - padY, bw, bh, 2.5 / scale);
          ctx.fill();
        } else {
          ctx.fillRect(bx, top - padY, bw, bh);
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = hovered ? LABEL_INK : LABEL_MUTED;
        ctx.fillText(label, cx, top);
      }
    },
    [isDimmed, hoverId, neighbors, degree, labelThreshold],
  );

  const linkColor = useCallback(
    (l: FGLink) => {
      if (hoverId === null) return LINK_COLOR;
      const s = endpointId(l.source);
      const t = endpointId(l.target);
      return s === hoverId || t === hoverId ? LINK_HOT : "rgba(222, 217, 205, 0.03)";
    },
    [hoverId],
  );

  const linkWidth = useCallback(
    (l: FGLink) => 0.5 + (l.weight / maxWeight) * 3.5,
    [maxWeight],
  );

  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: AMBER }} aria-hidden />
          concept · sized by mentions
        </span>
        <span className="kicker">
          {graphData.nodes.length} concepts · {graphData.links.length} co-occurrence links
        </span>
      </div>
      <div ref={containerRef} className="relative overflow-hidden">
        {size && (
          <ForceGraph2D
            ref={fgRef}
            width={size.w}
            height={size.h}
            graphData={graphData}
            backgroundColor={BG}
            nodeId="id"
            nodeLabel=""
            nodeVal={(n) => nodeRadius(n as FGNode) ** 2}
            nodeCanvasObject={(n, ctx, scale) => paintNode(n as FGNode, ctx, scale)}
            nodePointerAreaPaint={(n, color, ctx) => {
              const node = n as FGNode;
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x ?? 0, node.y ?? 0, nodeRadius(node), 0, 2 * Math.PI);
              ctx.fill();
            }}
            linkColor={(l) => linkColor(l as FGLink)}
            linkWidth={(l) => linkWidth(l as FGLink)}
            onNodeClick={(n) => router.push(`/concepts/${(n as FGNode).id}`)}
            onNodeHover={(n) => setHoverId(n ? (n as FGNode).id : null)}
            cooldownTicks={200}
            warmupTicks={60}
            onEngineStop={() => {
              if (!didFit.current) {
                didFit.current = true;
                fgRef.current?.zoomToFit(500, 60);
              }
            }}
          />
        )}
      </div>
    </section>
  );
}
