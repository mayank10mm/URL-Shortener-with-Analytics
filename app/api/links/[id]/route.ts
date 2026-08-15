import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth";
import {
  deleteLink,
  getLinkStats,
  PinLimitError,
  togglePin,
  toggleStar,
} from "@/lib/links";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const patchSchema = z.object({
  action: z.enum(["star", "pin"]),
});

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

export async function PATCH(request: Request, context: RouteContext) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Invalid link id" }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const updated =
      parsed.data.action === "star"
        ? await toggleStar(id, userId)
        : await togglePin(id, userId);

    if (!updated) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: updated.id,
      starred: updated.starred,
      pinned: Boolean(updated.pinnedAt),
    });
  } catch (error) {
    if (error instanceof PinLimitError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("PATCH /api/links/[id] failed", error);
    return NextResponse.json(
      { error: "Could not update link" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Invalid link id" }, { status: 400 });
  }

  try {
    const deleted = await deleteLink(id, userId);
    if (!deleted) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/links/[id] failed", error);
    return NextResponse.json(
      { error: "Could not delete link" },
      { status: 500 },
    );
  }
}
