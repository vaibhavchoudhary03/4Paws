import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { authenticateUser, hashPassword } from "./auth";
import { insertAnimalSchema, insertPersonSchema, insertMedicalScheduleSchema, insertApplicationSchema, insertAdoptionSchema, insertNoteSchema } from "@shared/schema";
import Stripe from "stripe";
import { z } from "zod";

// Session middleware
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    organizationId?: string;
  }
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
}) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  }));

  // Auth middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const requireOrg = (req: Request, res: Response, next: Function) => {
    if (!req.session.organizationId) {
      return res.status(403).json({ message: "No organization selected" });
    }
    next();
  };

  // Auth routes
  app.post("/api/v1/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await authenticateUser(email, password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Get user's first organization
      const memberships = await storage.getUserMemberships(user.id);
      if (memberships.length === 0) {
        return res.status(403).json({ message: "No organization access" });
      }

      req.session.userId = user.id;
      req.session.organizationId = memberships[0].organizationId;

      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email 
        },
        organization: memberships[0].organization,
        role: memberships[0].role,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/v1/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/v1/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const memberships = await storage.getUserMemberships(user.id);
      const currentMembership = memberships.find(m => m.organizationId === req.session.organizationId);

      res.json({
        user: { id: user.id, name: user.name, email: user.email },
        organization: currentMembership?.organization,
        role: currentMembership?.role,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Animals routes
  app.get("/api/v1/animals", requireAuth, requireOrg, async (req, res) => {
    try {
      const animals = await storage.getAnimals(req.session.organizationId!);
      res.json(animals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/v1/animals/:id", requireAuth, requireOrg, async (req, res) => {
    try {
      const animal = await storage.getAnimal(req.params.id, req.session.organizationId!);
      if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
      }
      res.json(animal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/v1/animals", requireAuth, requireOrg, async (req, res) => {
    try {
      const data = insertAnimalSchema.parse({ ...req.body, organizationId: req.session.organizationId });
      const animal = await storage.createAnimal(data);
      res.json(animal);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/v1/animals/:id", requireAuth, requireOrg, async (req, res) => {
    try {
      const animal = await storage.updateAnimal(req.params.id, req.session.organizationId!, req.body);
      res.json(animal);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Medical routes
  app.get("/api/v1/medical/schedule", requireAuth, requireOrg, async (req, res) => {
    try {
      const tasks = await storage.getMedicalTasks(req.session.organizationId!);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/v1/medical/schedule", requireAuth, requireOrg, async (req, res) => {
    try {
      const data = insertMedicalScheduleSchema.parse(req.body);
      const task = await storage.createMedicalTask(data);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/v1/medical/schedule/:id", requireAuth, requireOrg, async (req, res) => {
    try {
      const task = await storage.updateMedicalTask(req.params.id, req.body);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/v1/medical/schedule/batch", requireAuth, requireOrg, async (req, res) => {
    try {
      const batchUpdateSchema = z.object({
        taskIds: z.array(z.string()).min(1),
        updates: z.object({
          status: z.enum(['scheduled', 'done', 'missed']),
        }),
      });

      const { taskIds, updates } = batchUpdateSchema.parse(req.body);
      
      const orgId = req.session.organizationId!;
      const allTasks = await storage.getMedicalTasks(orgId);
      const validTaskIds = allTasks.map(t => t.id);
      
      const tasksToUpdate = taskIds.filter(id => validTaskIds.includes(id));
      if (tasksToUpdate.length === 0) {
        return res.status(404).json({ message: "No valid tasks found in your organization" });
      }
      
      const results = await Promise.all(
        tasksToUpdate.map(id => storage.updateMedicalTask(id, updates))
      );
      res.json({ updated: results.length, tasks: results });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request format", errors: error.errors });
      }
      res.status(400).json({ message: error.message });
    }
  });

  // People routes
  app.get("/api/v1/people", requireAuth, requireOrg, async (req, res) => {
    try {
      const people = await storage.getPeople(req.session.organizationId!);
      res.json(people);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/v1/people", requireAuth, requireOrg, async (req, res) => {
    try {
      const data = insertPersonSchema.parse({ ...req.body, organizationId: req.session.organizationId });
      const person = await storage.createPerson(data);
      res.json(person);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Note routes
  app.get("/api/v1/notes/:subjectType/:subjectId", requireAuth, async (req, res) => {
    try {
      const { subjectType, subjectId } = req.params;
      const notesList = await storage.getNotes(subjectType, subjectId);
      res.json(notesList);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/v1/notes", requireAuth, async (req, res) => {
    try {
      const data = insertNoteSchema.parse({ ...req.body, authorId: req.session.userId });
      const note = await storage.createNote(data);
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Applications routes
  app.get("/api/v1/applications", requireAuth, requireOrg, async (req, res) => {
    try {
      const applications = await storage.getApplications(req.session.organizationId!);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/v1/applications", requireAuth, requireOrg, async (req, res) => {
    try {
      const data = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(data);
      res.json(application);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/v1/applications/:id", requireAuth, requireOrg, async (req, res) => {
    try {
      const application = await storage.updateApplication(req.params.id, req.body);
      res.json(application);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Adoption checkout with Stripe
  app.post("/api/v1/adoptions/checkout", requireAuth, requireOrg, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe not configured" });
      }

      const { animalId, adopterId, feeCents, donationCents } = req.body;
      const totalCents = (feeCents || 0) + (donationCents || 0);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalCents,
        currency: "usd",
        metadata: {
          animalId,
          adopterId,
          feeCents: String(feeCents),
          donationCents: String(donationCents),
        }
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/v1/adoptions", requireAuth, requireOrg, async (req, res) => {
    try {
      const data = insertAdoptionSchema.parse(req.body);
      const adoption = await storage.createAdoption(data);
      
      // Update animal status to adopted
      await storage.updateAnimal(data.animalId, req.session.organizationId!, { status: 'adopted' });
      
      res.json(adoption);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Feeds for external integrations
  app.get("/api/v1/feeds/petfinder.xml", requireAuth, requireOrg, async (req, res) => {
    try {
      const animals = await storage.getAnimals(req.session.organizationId!);
      const availableAnimals = animals.filter(a => a.status === 'available');
      
      // Generate basic XML feed structure
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<pets>\n';
      availableAnimals.forEach(animal => {
        xml += `  <pet>\n`;
        xml += `    <id>${animal.id}</id>\n`;
        xml += `    <name>${animal.name}</name>\n`;
        xml += `    <species>${animal.species}</species>\n`;
        xml += `    <breed>${animal.breed || 'Unknown'}</breed>\n`;
        xml += `    <sex>${animal.sex || 'Unknown'}</sex>\n`;
        xml += `  </pet>\n`;
      });
      xml += '</pets>';
      
      res.set('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Health check
  app.get("/api/healthz", (req, res) => {
    res.json({ status: "ok" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
