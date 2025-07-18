import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProjectSchema, updateProjectSchema } from "@shared/schema";
import { registerUser, authenticateUser, getUserById } from "./auth";
import { z } from "zod";

// Simple session interface for TypeScript
interface SessionData {
  userId?: number;
  username?: string;
}

declare module "express-session" {
  interface SessionData {
    userId?: number;
    username?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to check authentication
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // User Authentication Routes

  // POST /api/register - Create a new user
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Register user with hashed password
      const user = await registerUser(userData);

      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;

      res.status(201).json({
        message: "User created successfully",
        user
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      if (error instanceof Error && error.message === "Username already exists") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // POST /api/login - Log in a user
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      // Authenticate user with hashed password verification
      const user = await authenticateUser(username, password);

      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;

      res.json({
        message: "Login successful",
        user
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid credentials") {
        return res.status(401).json({ message: error.message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // POST /api/logout - Log out a user
  app.post("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // GET /api/me - Get current user info
  app.get("/api/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await getUserById(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Project Management Routes

  // GET /api/projects - Get all projects for the logged-in user
  app.get("/api/projects", requireAuth, async (req: Request, res: Response) => {
    try {
      const projects = await storage.getProjectsByUserId(req.session.userId!);
      res.json({ projects });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // POST /api/projects - Create a new project
  app.post("/api/projects", requireAuth, async (req: Request, res: Response) => {
    try {
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId: req.session.userId!
      });

      const project = await storage.createProject(projectData);
      res.status(201).json({ message: "Project created successfully", project });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/projects/:id - Get a specific project
  app.get("/api/projects/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user owns the project
      if (project.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json({ project });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // PUT /api/projects/:id - Update a project
  app.put("/api/projects/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // Check if project exists and user owns it
      const existingProject = await storage.getProject(projectId);
      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (existingProject.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updateData = updateProjectSchema.parse(req.body);
      const updatedProject = await storage.updateProject(projectId, updateData);

      res.json({ message: "Project updated successfully", project: updatedProject });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // DELETE /api/projects/:id - Delete a project
  app.delete("/api/projects/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // Check if project exists and user owns it
      const existingProject = await storage.getProject(projectId);
      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (existingProject.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const deleted = await storage.deleteProject(projectId);
      if (deleted) {
        res.json({ message: "Project deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete project" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
