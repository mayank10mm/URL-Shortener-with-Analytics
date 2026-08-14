const MAX_URL_LENGTH = 2048;

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
  "metadata.google.internal",
]);

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

function isBlockedHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (BLOCKED_HOSTS.has(host)) return true;
  if (host.endsWith(".localhost") || host.endsWith(".local")) return true;
  if (host.startsWith("127.")) return true;
  if (isPrivateIpv4(host)) return true;
  if (host.includes(":")) {
    const ip = host.toLowerCase();
    return (
      ip === "::1" ||
      ip.startsWith("fc") ||
      ip.startsWith("fd") ||
      ip.startsWith("fe80")
    );
  }
  return false;
}

export function normalizeAndValidateUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new UrlValidationError("URL is required");
  }
  if (trimmed.length > MAX_URL_LENGTH) {
    throw new UrlValidationError(`URL must be at most ${MAX_URL_LENGTH} characters`);
  }

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("file:") ||
    lower.startsWith("vbscript:")
  ) {
    throw new UrlValidationError("That URL scheme is not allowed");
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new UrlValidationError("Enter a valid URL including http:// or https://");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new UrlValidationError("Only http and https URLs are allowed");
  }

  if (!parsed.hostname || isBlockedHost(parsed.hostname)) {
    throw new UrlValidationError("That host is not allowed");
  }

  return parsed.toString();
}

export class UrlValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UrlValidationError";
  }
}
