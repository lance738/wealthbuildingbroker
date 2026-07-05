import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy to the Boomerang FastAPI service.
 * Per the architecture doc: keep Boomerang as a connected service — the portal
 * reads its results via this API. Merge into the main app only once it's
 * converting and maintaining two things becomes the bigger cost.
 *
 * TODO: gate with an entitlements check (product = 'boomerang', status = 'active')
 * once auth is wired to the client portal session.
 */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path") ?? "/leads/shortlist";
  const res = await fetch(`${process.env.BOOMERANG_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${process.env.BOOMERANG_API_KEY}` },
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json({ error: "Boomerang service unavailable" }, { status: 502 });
  }
  return NextResponse.json(await res.json());
}
