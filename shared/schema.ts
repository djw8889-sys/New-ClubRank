import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  text,
  boolean,
  date,
} from "drizzle-orm/pg-core";

// Users Table
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: varchar("username"),
  avatarUrl: varchar("avatar_url"),
  email: varchar("email"),
  elo: integer("elo").default(1200),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  bio: text("bio"),
  isAdmin: boolean("is_admin").default(false),
  points: integer("points").default(0),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
});

// Clubs Table
export const clubs = pgTable("clubs", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  logoUrl: varchar("logo_url"),
  bannerUrl: varchar("banner_url"),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  region: varchar("region"), // FIX: .notNull()을 제거하여 string | null 타입을 허용
  primaryColor: varchar("primary_color"),
  rankingPoints: integer("ranking_points").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  establishedAt: date("established_at"),
});

// Club Members Table
export const clubMembers = pgTable("club_members", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  clubId: integer("club_id").references(() => clubs.id).notNull(),
  role: varchar("role").default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Matches Table
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  clubId: integer("club_id").references(() => clubs.id),
  player1Id: varchar("player1_id").references(() => users.id).notNull(),
  player2Id: varchar("player2_id").references(() => users.id).notNull(),
  result: varchar("result"),
  eloChange: integer("elo_change"),
  status: varchar("status").default("pending").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  location: varchar("location"),
});


// TypeScript types
export type User = typeof users.$inferSelect;
export type Club = typeof clubs.$inferSelect;
export type ClubMember = typeof clubMembers.$inferSelect;
export type Match = typeof matches.$inferSelect;

