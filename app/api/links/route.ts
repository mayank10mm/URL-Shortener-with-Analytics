import { z } from "zod";
import { after, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { createShortLink, listLinks } from "@/lib/links";
import { limitCreate } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-meta";
import { UrlValidationError } from "@/lib/url";

const createSchema = z.object({
  url: z.string().min(1, "URL is required").max(2048),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const items = await listLinks(userId);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET /api/links failed", error);
    return NextResponse.json(
      { error: "Could not load links" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const { success, pending } = await limitCreate(ip);
  after(() => pending);
  if (!success) {
    return NextResponse.json(
      { error: "Too many links created. Try again in a minute." },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  try {
    const link = await createShortLink(parsed.data.url, userId);
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    if (error instanceof UrlValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("POST /api/links failed", error);
    return NextResponse.json(
      { error: "Could not create short link" },
      { status: 500 },
    );
  }
}
