import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

// Proxy the approve mutation to vault-core (server-side; keeps the browser
// same-origin and the backend URL server-only).
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const res = await fetch(`${API_BASE}/api/concepts/${id}/approve`, {
    method: "POST",
  });
  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}
