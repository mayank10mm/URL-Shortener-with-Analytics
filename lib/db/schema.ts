import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const links = pgTable("links", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  originalUrl: text("original_url").notNull(),
  userId: text("user_id"),
  starred: boolean("starred").default(false).notNull(),
  pinnedAt: timestamp("pinned_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const clicks = pgTable(
  "clicks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    linkId: uuid("link_id")
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    clickedAt: timestamp("clicked_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    country: varchar("country", { length: 8 }),
    device: varchar("device", { length: 32 }),
    browser: varchar("browser", { length: 64 }),
    os: varchar("os", { length: 64 }),
    referrer: text("referrer"),
  },
  (table) => [
    index("clicks_link_id_clicked_at_idx").on(table.linkId, table.clickedAt),
  ],
);

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
export type Click = typeof clicks.$inferSelect;
export type NewClick = typeof clicks.$inferInsert;
