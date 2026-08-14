import { UAParser } from "ua-parser-js";

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "127.0.0.1"
  );
}

export function getCountry(request: Request): string {
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry");
  if (!country || country === "unknown") return "XX";
  return country.slice(0, 8).toUpperCase();
}

export function parseUserAgent(request: Request): {
  device: string;
  browser: string | null;
  os: string | null;
} {
  const ua = request.headers.get("user-agent") ?? "";
  const result = new UAParser(ua).getResult();
  const type = result.device.type;
  const device =
    type === "mobile" || type === "tablet" || type === "wearable"
      ? type
      : "desktop";

  return {
    device,
    browser: result.browser.name?.slice(0, 64) ?? null,
    os: result.os.name?.slice(0, 64) ?? null,
  };
}

export function getReferrer(request: Request): string | null {
  const referrer = request.headers.get("referer");
  if (!referrer) return null;
  return referrer.slice(0, 2048);
}
