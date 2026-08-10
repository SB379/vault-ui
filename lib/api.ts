/**
 * Typed client for the vault-core REST API.
 *
 * Reads run server-side (in server components / route handlers), so the browser
 * never talks to vault-core directly and there's no CORS to worry about. Base
 * URL comes from API_BASE (server env), defaulting to the local hybrid stack.
 */

const API_BASE = process.env.API_BASE ?? "http://localhost:8000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`vault-core ${path} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// --- DTOs (mirror the API responses in system-design/api-reference.md) ---

export interface PaperSummary {
  id: number;
  arxiv_id: string;
  title: string;
  score: number;
  published_date: string | null;
  relevance?: number;
  concepts?: string[];
}

export interface PaperConcept {
  id: number;
  name: string;
  type: string | null;
  relevance: number;
}

export interface PaperDetail {
  id: number;
  arxiv_id: string;
  title: string;
  authors: string[];
  categories: string[];
  abstract: string | null;
  score: number;
  pdf_url: string | null;
  published_date: string | null;
  summary: string | null;
  highlights: string[];
  method: string | null;
  evals_results: string | null;
  practitioner_takeaways: string | null;
  open_questions: string | null;
}

export interface Concept {
  id: number;
  name: string;
  description?: string | null;
  type: string | null;
  mention_count: number;
}

export interface ConceptNode {
  id: number;
  name: string;
  type: string | null;
  mention_count: number;
}

export interface ConceptEdge {
  source: number;
  target: number;
  weight: number;
}

export interface ConceptGraph {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

export interface RelatedConcept extends ConceptNode {
  weight: number;
}

export interface ConceptNeighborhood {
  root_concept: ConceptNode;
  related_concepts: RelatedConcept[];
  papers: PaperSummary[];
}

export interface Digest {
  date: string;
  paper_count: number;
  failure_count: number;
}

export interface DigestDetail extends Digest {
  papers: PaperSummary[];
}

// --- endpoints ---

export const getConceptGraph = (minWeight = 1) =>
  get<ConceptGraph>(`/api/graph/concepts?min_weight=${minWeight}`);

export const getConcepts = (type?: string) =>
  get<{ concepts: Concept[]; count: number }>(
    `/api/concepts${type ? `?type=${encodeURIComponent(type)}&limit=500` : "?limit=500"}`,
  );

export const getConceptNeighborhood = (id: number) =>
  get<ConceptNeighborhood>(`/api/concepts/${id}/graph`);

export const getPaper = (id: number) =>
  get<{ paper: PaperDetail; concepts: PaperConcept[] }>(`/api/papers/${id}`);

export const getDigests = (limit = 30) =>
  get<{ digests: Digest[]; count: number }>(`/api/digests?limit=${limit}`);

export const getDigest = (date: string) =>
  get<DigestDetail>(`/api/digests/${date}`);

export const getInterestProfile = () =>
  get<{ interest_profile: string | null }>("/api/config/interest-profile");

export { API_BASE };
