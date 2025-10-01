import { Request, Response, NextFunction, Router } from "express";
import { User, insertUserSchema, users } from "../shared/schema.js";
import { db } from "./storage.js";
import { eq } from "drizzle-orm";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import MemoryStore from "memorystore";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function registerRoutes(app: Router) {
  const server = app;

  const sessionMiddleware = session({
    store: new (MemoryStore(session))({ checkPeriod: 86400000 }),
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: app.get("env") === "production" },
  });

  server.use(sessionMiddleware);
  server.use(passport.initialize());
  server.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const usersResult = await db.select().from(users).where(eq(users.username, username));
        const user = usersResult[0];
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const usersResult = await db.select().from(users).where(eq(users.id, id));
      const user = usersResult[0];
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  server.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json({ message: "Logged in successfully", user: req.user });
  });

  server.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  server.post("/api/register", async (req: AuthenticatedRequest, res) => {
    const validation = insertUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: "Invalid user data", errors: validation.error.issues });
    }
    try {
        await db.insert(users).values(validation.data);
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Registration failed", error });
    }
  });

  return server;
}