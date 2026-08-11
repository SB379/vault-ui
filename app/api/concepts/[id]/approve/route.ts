import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";
import { authHeader } from "@/lib/supabase/token";

// Proxy the approve mutation to vault-core (server-side), forwarding the user's
// Supabase token so vault-core can authorize the write.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const res = await fetch(`${API_BASE}/api/concepts/${id}/approve`, {
    method: "POST",
    headers: { ...(await authHeader()) },
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
