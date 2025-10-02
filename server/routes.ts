import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { db } from "./db";
import { authenticateUser, hashPassword } from "./auth";
import { insertAnimalSchema, insertPersonSchema, insertMedicalScheduleSchema, insertApplicationSchema, insertAdoptionSchema, insertNoteSchema, insertPhotoSchema, outcomes, animals, adoptions as adoptionsTable, medicalSchedule, people } from "@shared/schema";
import { eq } from "drizzle-orm";
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
  app.get("/api/v1/notes/:subjectType/:subjectId", requireAuth, requireOrg, async (req, res) => {
    try {
      const { subjectType, subjectId } = req.params;
      
      if (subjectType === 'animal') {
        const animal = await storage.getAnimal(subjectId, req.session.organizationId!);
        if (!animal) {
          return res.status(404).json({ message: "Animal not found in your organization" });
        }
      }
      
      const notesList = await storage.getNotes(subjectType, subjectId);
      res.json(notesList);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/v1/notes", requireAuth, requireOrg, async (req, res) => {
    try {
      const data = insertNoteSchema.parse({ ...req.body, authorId: req.session.userId });
      
      if (data.subjectType === 'animal') {
        const animal = await storage.getAnimal(data.subjectId, req.session.organizationId!);
        if (!animal) {
          return res.status(404).json({ message: "Animal not found in your organization" });
        }
      }
      
      const note = await storage.createNote(data);
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Photo routes
  app.get("/api/v1/photos/:subjectType/:subjectId", requireAuth, requireOrg, async (req, res) => {
    try {
      const { subjectType, subjectId } = req.params;
      
      if (subjectType === 'animal') {
        const animal = await storage.getAnimal(subjectId, req.session.organizationId!);
        if (!animal) {
          return res.status(404).json({ message: "Animal not found in your organization" });
        }
      }
      
      const photosList = await storage.getPhotos(subjectType, subjectId);
      res.json(photosList);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/v1/photos", requireAuth, requireOrg, async (req, res) => {
    try {
      const data = insertPhotoSchema.parse({ ...req.body, authorId: req.session.userId });
      
      if (data.subjectType === 'animal') {
        const animal = await storage.getAnimal(data.subjectId, req.session.organizationId!);
        if (!animal) {
          return res.status(404).json({ message: "Animal not found in your organization" });
        }
      }
      
      const photo = await storage.createPhoto(data);
      res.json(photo);
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

  // Reports metrics
  app.get("/api/v1/reports/metrics", requireAuth, requireOrg, async (req, res) => {
    try {
      const organizationId = req.session.organizationId!;
      
      // Get outcomes with animal data for calculations
      const outcomesData = await db.select()
        .from(outcomes)
        .innerJoin(animals, eq(outcomes.animalId, animals.id))
        .where(eq(animals.organizationId, organizationId));
      
      // Get adoptions for this month calculation
      const adoptionsData = await db.select()
        .from(adoptionsTable)
        .innerJoin(animals, eq(adoptionsTable.animalId, animals.id))
        .where(eq(animals.organizationId, organizationId));
      
      // Get medical tasks for compliance calculation
      const medicalTasksData = await db.select()
        .from(medicalSchedule)
        .innerJoin(animals, eq(medicalSchedule.animalId, animals.id))
        .where(eq(animals.organizationId, organizationId));
      
      // Calculate Live Release Rate (positive outcomes / total outcomes * 100)
      const positiveOutcomes = outcomesData.filter((o: any) => 
        ['adoption', 'transfer_out', 'return_to_owner'].includes(o.outcomes.type)
      ).length;
      const liveReleaseRate = outcomesData.length > 0 
        ? ((positiveOutcomes / outcomesData.length) * 100).toFixed(1)
        : "0.0";
      
      // Calculate Average Length of Stay
      const outcomesWithDates = outcomesData.filter((o: any) => o.animals.intakeDate && o.outcomes.date);
      const totalDays = outcomesWithDates.reduce((sum: number, o: any) => {
        const intake = new Date(o.animals.intakeDate);
        const outcome = new Date(o.outcomes.date);
        const days = Math.floor((outcome.getTime() - intake.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      const avgLOS = outcomesWithDates.length > 0 
        ? Math.round(totalDays / outcomesWithDates.length)
        : 0;
      
      // Calculate Total Adoptions this month
      const now = new Date();
      const thisMonth = adoptionsData.filter((a: any) => {
        const adoptionDate = new Date(a.adoptions.date);
        return adoptionDate.getMonth() === now.getMonth() && 
               adoptionDate.getFullYear() === now.getFullYear();
      }).length;
      
      // Calculate Medical Compliance (simplified - all done tasks counted as on time)
      const doneTasks = medicalTasksData.filter((t: any) => t.medicalSchedule.status === 'done');
      const totalTasks = medicalTasksData.length;
      const medicalCompliance = totalTasks > 0 
        ? ((doneTasks.length / totalTasks) * 100).toFixed(1)
        : "100.0";
      
      res.json({
        liveReleaseRate: `${liveReleaseRate}%`,
        avgLengthOfStay: `${avgLOS} days`,
        totalAdoptionsThisMonth: thisMonth,
        medicalCompliance: `${medicalCompliance}%`,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // CSV Export
  app.get("/api/v1/reports/export/csv", requireAuth, requireOrg, async (req, res) => {
    try {
      const { entity } = req.query;
      const organizationId = req.session.organizationId!;
      
      let csvData = '';
      let filename = 'export.csv';
      
      if (entity === 'animals') {
        const animals = await storage.getAnimals(organizationId);
        filename = `animals_${new Date().toISOString().split('T')[0]}.csv`;
        csvData = 'ID,Name,Species,Breed,Sex,Status,Intake Date,Location\n';
        animals.forEach(animal => {
          const intakeDate = animal.intakeDate ? new Date(animal.intakeDate).toLocaleDateString() : '';
          csvData += `"${animal.id}","${animal.name}","${animal.species}","${animal.breed || ''}","${animal.sex || ''}","${animal.status}","${intakeDate}","${animal.locationId || ''}"\n`;
        });
      } else if (entity === 'people') {
        const people = await storage.getPeople(organizationId);
        filename = `people_${new Date().toISOString().split('T')[0]}.csv`;
        csvData = 'ID,Name,Type,Email,Phone,Address\n';
        people.forEach(person => {
          csvData += `"${person.id}","${person.name}","${person.type}","${person.email || ''}","${person.phone || ''}","${person.address || ''}"\n`;
        });
      } else if (entity === 'adoptions') {
        const adoptionsData = await db.select()
          .from(adoptionsTable)
          .innerJoin(animals, eq(adoptionsTable.animalId, animals.id))
          .innerJoin(people, eq(adoptionsTable.adopterId, people.id))
          .where(eq(animals.organizationId, organizationId));
        
        filename = `adoptions_${new Date().toISOString().split('T')[0]}.csv`;
        csvData = 'Adoption ID,Animal Name,Adopter Name,Date,Fee,Donation\n';
        adoptionsData.forEach((row: any) => {
          const date = new Date(row.adoptions.date).toLocaleDateString();
          const fee = (row.adoptions.feeCents / 100).toFixed(2);
          const donation = row.adoptions.donationCents ? (row.adoptions.donationCents / 100).toFixed(2) : '0.00';
          csvData += `"${row.adoptions.id}","${row.animals.name}","${row.people.name}","${date}","$${fee}","$${donation}"\n`;
        });
      } else if (entity === 'medical') {
        const medicalTasksData = await db.select()
          .from(medicalSchedule)
          .innerJoin(animals, eq(medicalSchedule.animalId, animals.id))
          .where(eq(animals.organizationId, organizationId));
        
        filename = `medical_${new Date().toISOString().split('T')[0]}.csv`;
        csvData = 'Task ID,Animal Name,Type,Due Date,Status,Notes\n';
        medicalTasksData.forEach((row: any) => {
          const dueDate = new Date(row.medicalSchedule.dueDate).toLocaleDateString();
          csvData += `"${row.medicalSchedule.id}","${row.animals.name}","${row.medicalSchedule.type}","${dueDate}","${row.medicalSchedule.status}","${row.medicalSchedule.notes || ''}"\n`;
        });
      } else {
        return res.status(400).json({ message: "Invalid entity type" });
      }
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Feeds for external integrations
  app.get("/api/v1/feeds/petfinder.xml", requireAuth, requireOrg, async (req, res) => {
    try {
      const animals = await storage.getAnimals(req.session.organizationId!);
      const availableAnimals = animals.filter(a => a.status === 'available');
      
      // Helper function to calculate age from DOB
      const calculateAge = (dob: Date | string | null): string => {
        if (!dob) return 'Unknown';
        const dobDate = typeof dob === 'string' ? new Date(dob) : dob;
        
        // Check for Invalid Date
        if (Number.isNaN(dobDate.getTime())) return 'Unknown';
        
        const now = new Date();
        const years = Math.floor((now.getTime() - dobDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        const months = Math.floor((now.getTime() - dobDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
        
        if (years > 0) return `${years} year${years > 1 ? 's' : ''}`;
        if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
        return 'Less than 1 month';
      };
      
      // Helper function to escape XML special characters
      const escapeXml = (str: string | null | undefined): string => {
        if (!str) return '';
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      };
      
      // Generate enhanced XML feed structure
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<pets>\n';
      availableAnimals.forEach(animal => {
        xml += `  <pet>\n`;
        xml += `    <id>${escapeXml(animal.id)}</id>\n`;
        xml += `    <name>${escapeXml(animal.name)}</name>\n`;
        xml += `    <species>${escapeXml(animal.species)}</species>\n`;
        xml += `    <breed>${escapeXml(animal.breed) || 'Unknown'}</breed>\n`;
        xml += `    <sex>${escapeXml(animal.sex) || 'Unknown'}</sex>\n`;
        xml += `    <age>${calculateAge(animal.dobEst)}</age>\n`;
        xml += `    <color>${escapeXml(animal.color) || 'Unknown'}</color>\n`;
        
        if (animal.description) {
          xml += `    <description><![CDATA[${animal.description}]]></description>\n`;
        }
        
        if (animal.microchip) {
          xml += `    <microchip>${escapeXml(animal.microchip)}</microchip>\n`;
        }
        
        if (animal.locationId) {
          xml += `    <location>${escapeXml(animal.locationId)}</location>\n`;
        }
        
        if (animal.photos && animal.photos.length > 0) {
          xml += `    <photos>\n`;
          animal.photos.forEach(photo => {
            // Safely extract URL whether photo is a string or object
            const photoUrl = typeof photo === 'string' ? photo : (photo as any).url || String(photo);
            if (photoUrl && photoUrl !== '[object Object]') {
              xml += `      <photo>${escapeXml(photoUrl)}</photo>\n`;
            }
          });
          xml += `    </photos>\n`;
        }
        
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
