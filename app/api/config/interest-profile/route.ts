import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

export async function GET() {
  const res = await fetch(`${API_BASE}/api/config/interest-profile`, {
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const res = await fetch(`${API_BASE}/api/config/interest-profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
