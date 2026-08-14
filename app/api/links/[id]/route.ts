import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { getLinkStats } from "@/lib/links";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Invalid link id" }, { status: 400 });
  }

  try {
    const stats = await getLinkStats(id, userId);
    if (!stats) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }
    return NextResponse.json(stats);
  } catch (error) {
    console.error("GET /api/links/[id] failed", error);
    return NextResponse.json(
      { error: "Could not load stats" },
      { status: 500 },
    );
  }
}
