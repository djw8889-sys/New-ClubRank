import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      return this.users.get(id);
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Failed to get user');
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      return Array.from(this.users.values()).find(
        (user) => user.username === username,
      );
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw new Error('Failed to get user by username');
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const id = randomUUID();
      const now = new Date();
      const user: User = { 
        id,
        email: insertUser.email,
        username: insertUser.username,
        photoURL: insertUser.photoURL || null,
        ntrp: insertUser.ntrp,
        region: insertUser.region,
        age: insertUser.age,
        bio: insertUser.bio || null,
        availableTimes: Array.isArray(insertUser.availableTimes) ? insertUser.availableTimes as string[] : [],
        points: 100,
        wins: 0,
        losses: 0,
        createdAt: now,
        updatedAt: now
      };
      this.users.set(id, user);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }
}

export const storage = new MemStorage();
