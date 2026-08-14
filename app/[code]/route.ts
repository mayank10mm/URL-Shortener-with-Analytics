import { after, NextResponse } from "next/server";
import { isValidShortCode, logClick, resolveLink } from "@/lib/links";
import { limitRedirect } from "@/lib/rate-limit";
import {
  getClientIp,
  getCountry,
  getReferrer,
  parseUserAgent,
} from "@/lib/request-meta";

type RouteContext = {
  params: Promise<{ code: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { code } = await context.params;
  if (!isValidShortCode(code)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ip = getClientIp(request);
  const { success, pending } = await limitRedirect(ip);
  after(() => pending);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429 },
    );
  }

  const link = await resolveLink(code);
  if (!link) {
    return NextResponse.json({ error: "Short link not found" }, { status: 404 });
  }

  const country = getCountry(request);
  const ua = parseUserAgent(request);
  const referrer = getReferrer(request);

  after(async () => {
    try {
      await logClick({
        linkId: link.id,
        country,
        device: ua.device,
        browser: ua.browser,
        os: ua.os,
        referrer,
      });
    } catch (error) {
      console.error("Failed to log click", error);
    }
  });

  return NextResponse.redirect(link.originalUrl, {
    status: 302,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
