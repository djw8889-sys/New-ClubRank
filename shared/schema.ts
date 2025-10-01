import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: varchar("username"),
  avatarUrl: varchar("avatar_url"),
  email: varchar("email"),
  elo: integer("elo").default(1200),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  bio: text("bio"),
  location: varchar("location"),
  isAdmin: boolean("is_admin").default(false),
  points: integer("points").default(0),
  ntrp: varchar("ntrp"),
  region: varchar("region"),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
});

export const clubs = pgTable("clubs", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  description: text("description"),
  logoUrl: varchar("logo_url"),
  ownerId: varchar("owner_id")
    .references(() => users.id)
    .notNull(),
  region: varchar("region"),
  primaryColor: varchar("primary_color"),
});

export const clubMembers = pgTable("club_members", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  clubId: integer("club_id")
    .references(() => clubs.id)
    .notNull(),
  role: varchar("role").default("member").notNull(), 
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  clubId: integer("club_id").references(() => clubs.id),
  player1Id: varchar("player1_id") // Requester
    .references(() => users.id)
    .notNull(),
  player2Id: varchar("player2_id") // Target
    .references(() => users.id)
    .notNull(),
  result: varchar("result"), // 'player1_wins', 'player2_wins', 'draw'
  eloChange: integer("elo_change"),
  status: varchar("status").default("pending").notNull(), // 'pending', 'accepted', 'completed', 'rejected'
  scheduledAt: timestamp("scheduled_at"),
  location: varchar("location"),
});

export const posts = pgTable("posts", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    clubId: integer("club_id").references(() => clubs.id),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    postId: integer("post_id").references(() => posts.id).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertClubSchema = createInsertSchema(clubs);
export const insertClubMemberSchema = createInsertSchema(clubMembers);

// TypeScript types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Club = typeof clubs.$inferSelect;
export type NewClub = typeof clubs.$inferInsert;
export type ClubMember = typeof clubMembers.$inferSelect;
export type NewClubMember = typeof clubMembers.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type Comment = typeof comments.$inferSelect;

