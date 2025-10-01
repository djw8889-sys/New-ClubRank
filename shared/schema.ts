import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  serial,
  primaryKey,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: varchar("username", { length: 255 }).unique(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  points: integer("points").default(0).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export type User = typeof users.$inferSelect;
export const insertUserSchema = createInsertSchema(users);

export const clubs = pgTable("clubs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  ownerId: text("owner_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Club = typeof clubs.$inferSelect;
export const insertClubSchema = createInsertSchema(clubs);

export const clubMembers = pgTable(
  "club_members",
  {
    clubId: integer("club_id")
      .references(() => clubs.id)
      .notNull(),
    userId: text("user_id")
      .references(() => users.id)
      .notNull(),
    role: varchar("role", { length: 50 }).default("member").notNull(), // e.g., 'owner', 'admin', 'member'
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.clubId, table.userId] }),
    };
  }
);

export const insertClubMemberSchema = createInsertSchema(clubMembers);

export const rankings = pgTable("rankings", {
    clubId: integer("club_id").references(() => clubs.id).notNull(),
    userId: text("user_id").references(() => users.id).notNull(),
    rating: integer("rating").default(1200).notNull(),
    wins: integer("wins").default(0),
    losses: integer("losses").default(0),
    draws: integer("draws").default(0),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.clubId, table.userId] })
    }
});

export const matches = pgTable("matches", {
    id: serial("id").primaryKey(),
    clubId: integer("club_id").references(() => clubs.id).notNull(),
    player1Id: text("player1_id").references(() => users.id).notNull(),
    player2Id: text("player2_id").references(() => users.id).notNull(),
    result: varchar("result", { length: 10 }).notNull(), // 'win', 'loss', 'draw' for player1
    eloChange: integer("elo_change"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Match = typeof matches.$inferSelect;

