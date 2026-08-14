import "server-only";

import { and, count, desc, eq, sql } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { db } from "@/lib/db";
import { clicks, links } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { redis, redisKey } from "@/lib/redis";
import { normalizeAndValidateUrl } from "@/lib/url";

const nanoid = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  7,
);

const CODE_PATTERN = /^[0-9A-Za-z]{4,32}$/;
const RESERVED_CODES = new Set([
  "api",
  "dashboard",
  "favicon",
  "robots",
  "signin",
  "signup",
  "sitemap",
]);

export type CachedLink = {
  id: string;
  originalUrl: string;
};

function cacheKey(code: string) {
  return redisKey(`code:${code}`);
}

function shortUrlFor(code: string) {
  return `${env.appUrl.replace(/\/$/, "")}/${code}`;
}

function generateCode() {
  let code = nanoid();
  while (RESERVED_CODES.has(code.toLowerCase())) {
    code = nanoid();
  }
  return code;
}

export function isValidShortCode(code: string) {
  return CODE_PATTERN.test(code) && !RESERVED_CODES.has(code.toLowerCase());
}

export async function cacheLink(link: CachedLink & { code: string }) {
  await redis.set(cacheKey(link.code), {
    id: link.id,
    originalUrl: link.originalUrl,
  } satisfies CachedLink);
}

export async function createShortLink(rawUrl: string, userId: string) {
  const originalUrl = normalizeAndValidateUrl(rawUrl);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateCode();
    try {
      const [created] = await db
        .insert(links)
        .values({ code, originalUrl, userId })
        .returning();

      if (!created) {
        throw new Error("Failed to create link");
      }

      await cacheLink(created);

      return {
        id: created.id,
        code: created.code,
        originalUrl: created.originalUrl,
        shortUrl: shortUrlFor(created.code),
        createdAt: created.createdAt,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("unique") || message.includes("duplicate")) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Could not generate a unique short code");
}

export async function resolveLink(code: string): Promise<CachedLink | null> {
  if (!isValidShortCode(code)) return null;

  const cached = await redis.get<CachedLink>(cacheKey(code));
  if (cached?.id && cached.originalUrl) {
    return cached;
  }

  const [row] = await db
    .select({
      id: links.id,
      originalUrl: links.originalUrl,
      code: links.code,
    })
    .from(links)
    .where(eq(links.code, code))
    .limit(1);

  if (!row) return null;

  await cacheLink(row);
  return { id: row.id, originalUrl: row.originalUrl };
}

export async function logClick(input: {
  linkId: string;
  country: string;
  device: string;
  browser: string | null;
  os: string | null;
  referrer: string | null;
}) {
  await db.insert(clicks).values({
    linkId: input.linkId,
    country: input.country,
    device: input.device,
    browser: input.browser,
    os: input.os,
    referrer: input.referrer,
  });
}

export async function listLinks(userId: string) {
  const rows = await db
    .select({
      id: links.id,
      code: links.code,
      originalUrl: links.originalUrl,
      createdAt: links.createdAt,
      clickCount: count(clicks.id),
    })
    .from(links)
    .leftJoin(clicks, eq(clicks.linkId, links.id))
    .where(eq(links.userId, userId))
    .groupBy(links.id, links.code, links.originalUrl, links.createdAt)
    .orderBy(desc(links.createdAt));

  return rows.map((row) => ({
    ...row,
    clickCount: Number(row.clickCount),
    shortUrl: shortUrlFor(row.code),
  }));
}

export async function getLinkStats(id: string, userId: string) {
  const [link] = await db
    .select()
    .from(links)
    .where(and(eq(links.id, id), eq(links.userId, userId)))
    .limit(1);
  if (!link) return null;

  const [totals] = await db
    .select({ total: count() })
    .from(clicks)
    .where(eq(clicks.linkId, id));

  const [byCountry, byDevice, byBrowser, byDay, recent] = await Promise.all([
    db
      .select({
        country: clicks.country,
        count: count(),
      })
      .from(clicks)
      .where(eq(clicks.linkId, id))
      .groupBy(clicks.country)
      .orderBy(desc(count())),
    db
      .select({
        device: clicks.device,
        count: count(),
      })
      .from(clicks)
      .where(eq(clicks.linkId, id))
      .groupBy(clicks.device)
      .orderBy(desc(count())),
    db
      .select({
        browser: clicks.browser,
        count: count(),
      })
      .from(clicks)
      .where(eq(clicks.linkId, id))
      .groupBy(clicks.browser)
      .orderBy(desc(count())),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${clicks.clickedAt}), 'YYYY-MM-DD')`,
        count: count(),
      })
      .from(clicks)
      .where(eq(clicks.linkId, id))
      .groupBy(sql`date_trunc('day', ${clicks.clickedAt})`)
      .orderBy(sql`date_trunc('day', ${clicks.clickedAt})`),
    db
      .select({
        id: clicks.id,
        clickedAt: clicks.clickedAt,
        country: clicks.country,
        device: clicks.device,
        browser: clicks.browser,
        os: clicks.os,
        referrer: clicks.referrer,
      })
      .from(clicks)
      .where(eq(clicks.linkId, id))
      .orderBy(desc(clicks.clickedAt))
      .limit(50),
  ]);

  return {
    ...link,
    shortUrl: shortUrlFor(link.code),
    clickCount: Number(totals?.total ?? 0),
    byCountry: byCountry.map((row) => ({
      country: row.country ?? "XX",
      count: Number(row.count),
    })),
    byDevice: byDevice.map((row) => ({
      device: row.device ?? "unknown",
      count: Number(row.count),
    })),
    byBrowser: byBrowser.map((row) => ({
      browser: row.browser ?? "unknown",
      count: Number(row.count),
    })),
    byDay: byDay.map((row) => ({
      day: row.day,
      count: Number(row.count),
    })),
    recentClicks: recent,
  };
}
