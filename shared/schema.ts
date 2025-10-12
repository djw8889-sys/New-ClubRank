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
import { createInsertSchema } from "drizzle-zod";

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
  region: varchar("region"),
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

// Posts Table (NEW)
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  clubId: integer("club_id").references(() => clubs.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Comments Table (NEW)
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);

// TypeScript types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Club = typeof clubs.$inferSelect;
export type NewClub = typeof clubs.$inferInsert;
export type ClubMember = typeof clubMembers.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

// Chat related types
export interface ChatRoom {
  id: string;
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
  lastMessageAt?: Date;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

export type InsertMessage = Omit<Message, 'id' | 'createdAt'>;
export type InsertChatRoom = Omit<ChatRoom, 'id' | 'createdAt' | 'updatedAt'>;