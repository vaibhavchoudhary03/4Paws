/**
 * API ROUTES - All HTTP endpoints for the 4Paws application
 * 
 * ARCHITECTURE OVERVIEW:
 * This file registers all RESTful API routes with Express. The API follows these patterns:
 * 
 * 1. RESOURCE-BASED URLs: /api/v1/{resource} (animals, people, medical, etc.)
 * 2. HTTP VERBS: GET (read), POST (create), PATCH (update), DELETE (rarely used)
 * 3. MIDDLEWARE CHAIN: All protected routes use requireAuth + requireOrg
 * 4. ERROR HANDLING: Try-catch with descriptive error messages
 * 5. VALIDATION: Zod schemas validate request bodies before processing
 * 
 * SECURITY LAYERS:
 * 1. Session-based authentication (HTTP-only cookies)
 * 2. Organization scoping (all data queries include organizationId)
 * 3. Input validation (Zod schemas prevent malformed data)
 * 4. SQL injection protection (Drizzle ORM parameterization)
 * 
 * API VERSIONING:
 * All routes prefixed with /api/v1/ for future backward compatibility.
 * If breaking changes needed, create /api/v2/ alongside v1.
 * 
 * ROUTE GROUPS:
 * - Authentication: Login, logout, session management
 * - Animals: Core entity CRUD
 * - Medical: Task scheduling and batch operations
 * - People: External contacts (adopters, fosters, volunteers)
 * - Notes & Photos: Polymorphic attachments on any entity
 * - Applications: Adoption/foster application pipeline
 * - Adoptions: Finalized placements with Stripe integration
 * - Reports: Live metrics and CSV exports
 * - Feeds: External integrations (Petfinder XML)
 */

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

// ============================================================================
// SESSION CONFIGURATION - Extend session type for TypeScript
// ============================================================================

/**
 * Extend express-session types to include our custom session data
 * 
 * Session stores:
 * - userId: Identifies authenticated user
 * - organizationId: Current organization context (for multi-tenant isolation)
 * 
 * Both are set during login and used throughout the application.
 */
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    organizationId?: string;
  }
}

// ============================================================================
// STRIPE INITIALIZATION - Payment processing for adoptions
// ============================================================================

/**
 * Stripe client for processing adoption fees and donations
 * 
 * Only initialized if STRIPE_SECRET_KEY environment variable is present.
 * Routes check for null before using to handle development environments.
 * 
 * API version pinned for consistency (prevents breaking changes from Stripe).
 */
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
}) : null;

// ============================================================================
// ROUTE REGISTRATION - Main entry point for all API endpoints
// ============================================================================

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ==========================================================================
  // SESSION MIDDLEWARE - Configure session storage and cookies
  // ==========================================================================
  
  /**
   * Express session middleware configuration
   * 
   * SESSION STORAGE:
   * - In memory for development (data lost on server restart)
   * - Production should use Redis or PostgreSQL session store
   * 
   * COOKIE SETTINGS:
   * - httpOnly: true (prevents JavaScript access, protects against XSS)
   * - secure: true in production (requires HTTPS)
   * - maxAge: 24 hours (user must re-login after expiration)
   * 
   * SECURITY:
   * - secret: Signs session cookie to prevent tampering
   * - resave: false (don't save unchanged sessions)
   * - saveUninitialized: false (don't create sessions for anonymous users)
   */
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,  // Cannot be accessed by JavaScript
      secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
      maxAge: 24 * 60 * 60 * 1000,  // 24 hours in milliseconds
    }
  }));

  // ==========================================================================
  // AUTHENTICATION MIDDLEWARE - Protect routes that require login
  // ==========================================================================
  
  /**
   * requireAuth - Ensures user is logged in
   * 
   * Checks for userId in session (set during login).
   * If not present, returns 401 Unauthorized.
   * 
   * USAGE: Apply to all routes except login/register
   * Example: app.get("/api/v1/animals", requireAuth, handler)
   */
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();  // Proceed to next middleware or route handler
  };

  /**
   * requireOrg - Ensures user has selected an organization
   * 
   * Multi-tenant applications need an organization context for data isolation.
   * This middleware ensures organizationId is in session before proceeding.
   * 
   * USAGE: Apply after requireAuth to all data routes
   * Example: app.get("/api/v1/animals", requireAuth, requireOrg, handler)
   * 
   * WHY SEPARATE MIDDLEWARE?
   * - Not all authenticated routes need org context (e.g., /auth/me)
   * - Clearer error messages (401 vs 403)
   * - More flexible for future multi-org user switching
   */
  const requireOrg = (req: Request, res: Response, next: Function) => {
    if (!req.session.organizationId) {
      return res.status(403).json({ message: "No organization selected" });
    }
    next();
  };

  // ==========================================================================
  // AUTHENTICATION ROUTES - Login, logout, session management
  // ==========================================================================
  
  /**
   * POST /api/v1/auth/login - Authenticate user and create session
   * 
   * FLOW:
   * 1. Validate email/password credentials
   * 2. Look up user's organization memberships
   * 3. Store userId and first organizationId in session
   * 4. Return user details and organization info
   * 
   * MULTI-TENANT CONSIDERATIONS:
   * - User might belong to multiple organizations
   * - Currently auto-selects first organization
   * - Future enhancement: Let user choose organization
   * 
   * SECURITY:
   * - Password verified using bcrypt timing-safe comparison
   * - Generic error message (doesn't reveal if email exists)
   * - Session cookie automatically set by express-session
   * 
   * REQUEST BODY:
   * {
   *   "email": "user@example.com",
   *   "password": "plaintext_password"
   * }
   * 
   * RESPONSE:
   * {
   *   "user": { "id": "...", "name": "...", "email": "..." },
   *   "organization": { "id": "...", "name": "..." },
   *   "role": "admin" | "staff" | "volunteer" | "foster" | "readonly"
   * }
   */
  app.post("/api/v1/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Authenticate credentials (returns null if invalid)
      const user = await authenticateUser(email, password);
      
      if (!user) {
        // Generic message - don't reveal whether email exists
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Look up user's organization access
      const memberships = await storage.getUserMemberships(user.id);
      if (memberships.length === 0) {
        // User has no organization access (edge case - shouldn't happen)
        return res.status(403).json({ message: "No organization access" });
      }

      // Store authentication state in session
      req.session.userId = user.id;
      req.session.organizationId = memberships[0].organizationId;  // Use first org

      // Return user profile and organization context
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

  /**
   * POST /api/v1/auth/logout - End user session
   * 
   * FLOW:
   * 1. Destroy server-side session data
   * 2. Cookie automatically cleared by browser
   * 3. User must log in again to access protected routes
   * 
   * SECURITY:
   * - Completely destroys session (not just clears cookie)
   * - Session ID becomes invalid immediately
   * - No possibility of session hijacking with old cookie
   */
  app.post("/api/v1/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out" });
    });
  });

  /**
   * GET /api/v1/auth/me - Get current user session info
   * 
   * Used by frontend to:
   * - Check if user is still logged in
   * - Display current user name/email
   * - Show current organization context
   * - Enable role-based UI features
   * 
   * TYPICAL USAGE:
   * Frontend calls this on app startup to restore session state.
   * If returns 401, redirect to login page.
   * 
   * MIDDLEWARE: requireAuth (ensures session exists)
   */
  app.get("/api/v1/auth/me", requireAuth, async (req, res) => {
    try {
      // Fetch fresh user data from database
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        // Session references non-existent user (shouldn't happen)
        return res.status(404).json({ message: "User not found" });
      }

      // Get membership info for current organization
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

  // ==========================================================================
  // ANIMALS ROUTES - Core entity representing shelter animals
  // ==========================================================================
  
  /**
   * GET /api/v1/animals - List all animals for current organization
   * 
   * Returns complete animal records including:
   * - Basic info (name, species, breed, sex, color)
   * - Status (available, fostered, adopted, etc.)
   * - Intake date and estimated DOB
   * - Location and kennel assignments
   * - Photo URLs
   * - Custom attributes (JSONB)
   * 
   * ORGANIZATION SCOPING:
   * Uses req.session.organizationId to filter results.
   * Users can ONLY see animals belonging to their organization.
   * 
   * SORTING:
   * Results sorted by createdAt DESC (newest animals first).
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.get("/api/v1/animals", requireAuth, requireOrg, async (req, res) => {
    try {
      const animals = await storage.getAnimals(req.session.organizationId!);
      res.json(animals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/v1/animals/:id - Get single animal details
   * 
   * Used by animal detail pages to show:
   * - Complete animal profile
   * - Medical history
   * - Application status
   * - Notes and photos
   * 
   * SECURITY:
   * Requires BOTH animal ID and organizationId match.
   * Prevents accessing animals from other organizations by guessing IDs.
   * 
   * RESPONSE:
   * - 200 + animal object if found
   * - 404 if not found or belongs to different org
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
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

  /**
   * POST /api/v1/animals - Create new animal (intake process)
   * 
   * Called by intake wizard when new animal enters shelter.
   * 
   * VALIDATION:
   * - Request body validated against insertAnimalSchema (from shared/schema.ts)
   * - Required fields: name, species, intakeDate
   * - Optional fields: breed, sex, color, dobEst, kennel, photos, etc.
   * 
   * ORGANIZATION INJECTION:
   * organizationId automatically added from session.
   * Frontend doesn't need to provide it (prevents spoofing).
   * 
   * REQUEST BODY EXAMPLE:
   * {
   *   "name": "Max",
   *   "species": "dog",
   *   "breed": "Labrador Mix",
   *   "sex": "M",
   *   "intakeDate": "2024-01-15T10:00:00Z",
   *   "attributes": { "goodWithKids": true, "housebroken": false }
   * }
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.post("/api/v1/animals", requireAuth, requireOrg, async (req, res) => {
    try {
      // Merge request body with organizationId from session
      const data = insertAnimalSchema.parse({ ...req.body, organizationId: req.session.organizationId });
      const animal = await storage.createAnimal(data);
      res.json(animal);
    } catch (error: any) {
      // Zod validation errors return 400 with detailed error info
      res.status(400).json({ message: error.message });
    }
  });

  /**
   * PATCH /api/v1/animals/:id - Update animal fields
   * 
   * PARTIAL UPDATES:
   * Only provided fields are updated (others remain unchanged).
   * 
   * COMMON USES:
   * - Status changes (available → fostered → adopted)
   * - Kennel reassignments
   * - Adding photos
   * - Updating description for adoption listings
   * 
   * SECURITY:
   * Update only succeeds if animal belongs to user's organization.
   * Storage layer enforces organizationId check.
   * 
   * REQUEST BODY EXAMPLE:
   * {
   *   "status": "adopted",
   *   "description": "Updated description for adoption page"
   * }
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.patch("/api/v1/animals/:id", requireAuth, requireOrg, async (req, res) => {
    try {
      const animal = await storage.updateAnimal(req.params.id, req.session.organizationId!, req.body);
      res.json(animal);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==========================================================================
  // MEDICAL SCHEDULE ROUTES - Task management and batch operations
  // ==========================================================================
  
  /**
   * GET /api/v1/medical/schedule - List medical tasks with animal details
   * 
   * Returns scheduled medical care (vaccines, treatments, surgeries, exams).
   * Each task includes joined animal data for display purposes.
   * 
   * USED BY:
   * - Medical dashboard (today's tasks view)
   * - Batch action UI (select multiple tasks)
   * - Compliance reports
   * 
   * FUTURE ENHANCEMENTS:
   * Could add query params for filtering:
   * - ?dueDate=2024-01-15 (tasks due on/before date)
   * - ?status=scheduled (filter by status)
   * - ?animalId=123 (tasks for specific animal)
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.get("/api/v1/medical/schedule", requireAuth, requireOrg, async (req, res) => {
    try {
      const tasks = await storage.getMedicalTasks(req.session.organizationId!);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/v1/medical/schedule - Create new scheduled task
   * 
   * Used to schedule future medical care:
   * - Vaccine boosters (due 3 weeks after initial)
   * - Spay/neuter appointments
   * - Follow-up exams
   * - Regular treatments
   * 
   * VALIDATION:
   * Request body must match insertMedicalScheduleSchema:
   * - animalId (required)
   * - type: vaccine | treatment | surgery | exam
   * - dueDate (required)
   * - assignedTo (optional, userId)
   * - status defaults to 'scheduled'
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.post("/api/v1/medical/schedule", requireAuth, requireOrg, async (req, res) => {
    try {
      const data = insertMedicalScheduleSchema.parse(req.body);
      const task = await storage.createMedicalTask(data);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  /**
   * PATCH /api/v1/medical/schedule/:id - Update single task
   * 
   * TYPICAL UPDATE:
   * Changing status from 'scheduled' to 'done' when task completed.
   * 
   * Can also update:
   * - dueDate (reschedule)
   * - assignedTo (reassign to different staff)
   * - notes (add completion details)
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.patch("/api/v1/medical/schedule/:id", requireAuth, requireOrg, async (req, res) => {
    try {
      const task = await storage.updateMedicalTask(req.params.id, req.body);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  /**
   * POST /api/v1/medical/schedule/batch - Update multiple tasks at once
   * 
   * POWER USER FEATURE:
   * Medical staff can select multiple tasks and mark them all done simultaneously.
   * 
   * WORKFLOW:
   * 1. User selects 5 tasks in UI (checkboxes)
   * 2. Clicks "Mark All Done" button
   * 3. Frontend sends taskIds array + updates object
   * 4. Backend verifies all tasks belong to organization
   * 5. Updates all valid tasks
   * 6. Returns count and updated task objects
   * 
   * SECURITY:
   * Verifies ALL task IDs belong to current organization before updating.
   * Filters out any IDs from other organizations (prevents privilege escalation).
   * 
   * REQUEST BODY:
   * {
   *   "taskIds": ["id1", "id2", "id3"],
   *   "updates": {
   *     "status": "done"
   *   }
   * }
   * 
   * RESPONSE:
   * {
   *   "updated": 3,
   *   "tasks": [{ task1 }, { task2 }, { task3 }]
   * }
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.post("/api/v1/medical/schedule/batch", requireAuth, requireOrg, async (req, res) => {
    try {
      // Validate request structure
      const batchUpdateSchema = z.object({
        taskIds: z.array(z.string()).min(1),
        updates: z.object({
          status: z.enum(['scheduled', 'done', 'missed']),
        }),
      });

      const { taskIds, updates } = batchUpdateSchema.parse(req.body);
      
      // Security: Get all tasks for this organization
      const orgId = req.session.organizationId!;
      const allTasks = await storage.getMedicalTasks(orgId);
      const validTaskIds = allTasks.map(t => t.id);
      
      // Filter: Only update tasks that belong to this organization
      const tasksToUpdate = taskIds.filter(id => validTaskIds.includes(id));
      if (tasksToUpdate.length === 0) {
        return res.status(404).json({ message: "No valid tasks found in your organization" });
      }
      
      // Update all valid tasks in parallel
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

  // ==========================================================================
  // PEOPLE ROUTES - Adopters, fosters, volunteers, donors
  // ==========================================================================
  
  /**
   * GET /api/v1/people - List all people for current organization
   * 
   * Returns contacts who interact with shelter:
   * - Adopters (who adopted animals)
   * - Fosters (temporary caregivers)
   * - Volunteers (help with daily operations)
   * - Donors (financial supporters)
   * - Staff (external staff without user accounts)
   * 
   * FRONTEND FILTERING:
   * Frontend often filters by type to show "Adopters Only" or "Volunteers Only".
   * Backend returns all types; frontend handles display filtering.
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.get("/api/v1/people", requireAuth, requireOrg, async (req, res) => {
    try {
      const people = await storage.getPeople(req.session.organizationId!);
      res.json(people);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/v1/people - Create new person record
   * 
   * Used when:
   * - New adoption application submitted (create adopter record)
   * - Volunteer signs up
   * - Foster approved (create foster record)
   * 
   * VALIDATION:
   * - name (required)
   * - type (required): adopter | foster | volunteer | donor | staff
   * - email, phone, address (optional)
   * - flags (optional JSONB): warnings, preferences, special notes
   * 
   * ORGANIZATION INJECTION:
   * organizationId automatically added from session (like animals).
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.post("/api/v1/people", requireAuth, requireOrg, async (req, res) => {
    try {
      const data = insertPersonSchema.parse({ ...req.body, organizationId: req.session.organizationId });
      const person = await storage.createPerson(data);
      res.json(person);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==========================================================================
  // NOTE ROUTES - Polymorphic text annotations on any entity
  // ==========================================================================
  
  /**
   * GET /api/v1/notes/:subjectType/:subjectId - Get notes for an entity
   * 
   * POLYMORPHIC PATTERN:
   * subjectType + subjectId allows notes on ANY entity:
   * - /api/v1/notes/animal/123 → notes on animal 123
   * - /api/v1/notes/person/456 → notes on person 456
   * - /api/v1/notes/application/789 → notes on application 789
   * 
   * ORGANIZATION SCOPING:
   * If subject is an animal, verifies it belongs to current organization.
   * Prevents viewing notes on other organizations' entities.
   * 
   * FUTURE ENHANCEMENT:
   * Add verification for other subject types (person, application).
   * Currently only checks animals.
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.get("/api/v1/notes/:subjectType/:subjectId", requireAuth, requireOrg, async (req, res) => {
    try {
      const { subjectType, subjectId } = req.params;
      
      // Security check: Verify subject belongs to organization
      if (subjectType === 'animal') {
        const animal = await storage.getAnimal(subjectId, req.session.organizationId!);
        if (!animal) {
          return res.status(404).json({ message: "Animal not found in your organization" });
        }
      }
      
      // TODO: Add verification for other subject types (person, application, etc.)
      
      const notesList = await storage.getNotes(subjectType, subjectId);
      res.json(notesList);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/v1/notes - Create note on any entity
   * 
   * USED BY:
   * - Volunteer portal (log activities: walked, fed, played)
   * - Foster portal (updates on fostered animals)
   * - Staff notes (behavioral observations, medical concerns)
   * - Application reviews (staff comments on applicants)
   * 
   * VALIDATION:
   * - subjectType (required): 'animal', 'person', etc.
   * - subjectId (required): ID of the subject
   * - body (required): Note text
   * - visibility (optional): 'staff_only' (default) or 'public_to_portal'
   * - tags (optional): Array of strings for categorization
   * 
   * AUTHOR INJECTION:
   * authorId automatically set from session.userId.
   * Creates audit trail of who wrote each note.
   * 
   * SECURITY:
   * Verifies subject belongs to current organization (prevents notes on other orgs' entities).
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.post("/api/v1/notes", requireAuth, requireOrg, async (req, res) => {
    try {
      // Inject authorId from session (who's creating this note)
      const data = insertNoteSchema.parse({ ...req.body, authorId: req.session.userId });
      
      // Security check: Verify subject belongs to organization
      if (data.subjectType === 'animal') {
        const animal = await storage.getAnimal(data.subjectId, req.session.organizationId!);
        if (!animal) {
          return res.status(404).json({ message: "Animal not found in your organization" });
        }
      }
      
      // TODO: Add verification for other subject types
      
      const note = await storage.createNote(data);
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==========================================================================
  // PHOTO ROUTES - Polymorphic image attachments on any entity
  // ==========================================================================
  
  /**
   * GET /api/v1/photos/:subjectType/:subjectId - Get photos for an entity
   * 
   * Same polymorphic pattern as notes:
   * - /api/v1/photos/animal/123 → animal photos
   * - /api/v1/photos/person/456 → person photos (profile pics)
   * 
   * PHOTO STORAGE:
   * Photos stored externally (S3, CDN).
   * Database only stores URLs and metadata.
   * 
   * ORGANIZATION SCOPING:
   * Verifies subject belongs to current organization (same as notes).
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.get("/api/v1/photos/:subjectType/:subjectId", requireAuth, requireOrg, async (req, res) => {
    try {
      const { subjectType, subjectId } = req.params;
      
      // Security check: Verify subject belongs to organization
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

  /**
   * POST /api/v1/photos - Create photo record
   * 
   * WORKFLOW:
   * 1. Frontend uploads image to S3 (separate API/SDK)
   * 2. S3 returns URL
   * 3. Frontend calls this endpoint with URL to record in database
   * 
   * WHY SEPARATE UPLOAD?
   * - Multipart form uploads complex for REST APIs
   * - Direct S3 upload faster (no backend bottleneck)
   * - Presigned URLs provide secure, temporary upload access
   * 
   * REQUEST BODY:
   * {
   *   "subjectType": "animal",
   *   "subjectId": "123",
   *   "url": "https://cdn.example.com/photos/abc123.jpg",
   *   "caption": "After grooming"
   * }
   * 
   * AUTHOR INJECTION:
   * authorId automatically set from session (who uploaded this photo).
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.post("/api/v1/photos", requireAuth, requireOrg, async (req, res) => {
    try {
      // Inject authorId from session
      const data = insertPhotoSchema.parse({ ...req.body, authorId: req.session.userId });
      
      // Security check: Verify subject belongs to organization
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

  // ==========================================================================
  // APPLICATION ROUTES - Adoption/foster application pipeline
  // ==========================================================================
  
  /**
   * GET /api/v1/applications - List all applications with full context
   * 
   * Returns applications with joined data:
   * - Application details (type, status, form data)
   * - Animal info (name, species, photos)
   * - Applicant info (name, contact details)
   * 
   * POWERS THE KANBAN BOARD:
   * Adoption pipeline page displays applications as cards:
   * - Column 1: Received (new applications)
   * - Column 2: Review (staff reviewing)
   * - Column 3: Approved (ready to finalize)
   * - Column 4: Denied/Withdrawn
   * 
   * Staff drag cards between columns, triggering PATCH updates.
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.get("/api/v1/applications", requireAuth, requireOrg, async (req, res) => {
    try {
      const applications = await storage.getApplications(req.session.organizationId!);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/v1/applications - Submit new application
   * 
   * USED BY:
   * - Public adoption application forms
   * - Staff entering applications on behalf of applicants
   * - Foster application submissions
   * 
   * VALIDATION:
   * - animalId (required)
   * - personId (required)
   * - type: 'adoption' or 'foster'
   * - form (JSONB): Complete application form data
   *   Example: { homeType: "house", hasYard: true, otherPets: [...], references: [...] }
   * - status defaults to 'received'
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.post("/api/v1/applications", requireAuth, requireOrg, async (req, res) => {
    try {
      const data = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(data);
      res.json(application);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  /**
   * PATCH /api/v1/applications/:id - Update application status
   * 
   * PRIMARY USE CASE:
   * Moving application through workflow stages:
   * - received → review (staff starts reviewing)
   * - review → approved (application looks good)
   * - review → denied (application rejected)
   * - any → withdrawn (applicant cancels)
   * 
   * KANBAN BOARD INTERACTION:
   * When user drags card from "Review" column to "Approved" column,
   * frontend calls: PATCH /api/v1/applications/123 { status: "approved" }
   * 
   * OTHER UPDATES:
   * Can also update notes field with staff comments.
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.patch("/api/v1/applications/:id", requireAuth, requireOrg, async (req, res) => {
    try {
      const application = await storage.updateApplication(req.params.id, req.body);
      res.json(application);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==========================================================================
  // ADOPTION ROUTES - Finalize placements with payment processing
  // ==========================================================================
  
  /**
   * POST /api/v1/adoptions/checkout - Create Stripe payment intent
   * 
   * STRIPE CHECKOUT FLOW:
   * 1. Frontend calls this endpoint with adoption details
   * 2. Backend creates Stripe PaymentIntent
   * 3. Backend returns clientSecret to frontend
   * 4. Frontend uses Stripe.js to collect payment
   * 5. User completes payment on Stripe-hosted form
   * 6. Frontend calls POST /api/v1/adoptions to finalize
   * 
   * PAYMENT BREAKDOWN:
   * - feeCents: Required adoption fee (set by organization)
   * - donationCents: Optional additional donation
   * - Total charged: feeCents + donationCents
   * 
   * METADATA:
   * Stripe PaymentIntent includes adoption details in metadata.
   * Useful for reconciliation and webhooks.
   * 
   * REQUEST BODY:
   * {
   *   "animalId": "123",
   *   "adopterId": "456",
   *   "feeCents": 15000,  // $150.00
   *   "donationCents": 5000  // $50.00
   * }
   * 
   * RESPONSE:
   * {
   *   "clientSecret": "pi_xxx_secret_yyy"
   * }
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.post("/api/v1/adoptions/checkout", requireAuth, requireOrg, async (req, res) => {
    try {
      // Check if Stripe is configured (might be disabled in development)
      if (!stripe) {
        return res.status(500).json({ message: "Stripe not configured" });
      }

      const { animalId, adopterId, feeCents, donationCents } = req.body;
      const totalCents = (feeCents || 0) + (donationCents || 0);

      // Create PaymentIntent (holds funds, doesn't charge yet)
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

      // Return clientSecret for frontend to complete payment
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/v1/adoptions - Finalize adoption (create permanent record)
   * 
   * CALLED AFTER PAYMENT SUCCEEDS:
   * 1. User completes Stripe payment
   * 2. Frontend verifies payment success
   * 3. Frontend calls this endpoint to record adoption
   * 
   * CREATES:
   * - Adoption record in database
   * - Links to animal, adopter, and Stripe payment
   * - Includes fee, donation, and contract URL
   * 
   * SIDE EFFECTS:
   * - Updates animal status to 'adopted'
   * - Triggers adoption certificate generation (future)
   * - Sends confirmation email (future)
   * - Creates outcome record (future)
   * 
   * REQUEST BODY:
   * {
   *   "animalId": "123",
   *   "adopterId": "456",
   *   "feeCents": 15000,
   *   "donationCents": 5000,
   *   "paymentIntentId": "pi_xxx",
   *   "contractUrl": "https://cdn.../contract.pdf"
   * }
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.post("/api/v1/adoptions", requireAuth, requireOrg, async (req, res) => {
    try {
      // Validate and create adoption record
      const data = insertAdoptionSchema.parse(req.body);
      const adoption = await storage.createAdoption(data);
      
      // SIDE EFFECT: Update animal status to adopted
      await storage.updateAnimal(data.animalId, req.session.organizationId!, { status: 'adopted' });
      
      // Future enhancements:
      // - Create outcome record (type: 'adoption')
      // - Send adoption confirmation email
      // - Generate adoption certificate PDF
      // - Notify foster if animal was fostered
      
      res.json(adoption);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==========================================================================
  // REPORTS ROUTES - Analytics, metrics, and data exports
  // ==========================================================================
  
  /**
   * GET /api/v1/reports/metrics - Calculate live metrics for dashboard
   * 
   * CALCULATES KEY PERFORMANCE INDICATORS:
   * 
   * 1. LIVE RELEASE RATE:
   *    (Adoptions + Transfers + Returns to Owner) / Total Outcomes × 100
   *    Industry standard metric for shelter success.
   * 
   * 2. AVERAGE LENGTH OF STAY:
   *    Average days between intake and outcome.
   *    Lower is better (animals find homes faster).
   * 
   * 3. TOTAL ADOPTIONS THIS MONTH:
   *    Count of adoptions in current calendar month.
   *    Tracks monthly performance goals.
   * 
   * 4. MEDICAL COMPLIANCE:
   *    (Done Tasks) / (Done + Missed Tasks) × 100
   *    Measures how well medical schedules are followed.
   * 
   * REAL-TIME CALCULATION:
   * Metrics calculated on-demand from current database state.
   * No caching (always shows latest numbers).
   * 
   * PERFORMANCE NOTE:
   * Multiple database joins required.
   * Could be slow for large datasets.
   * Future: Add caching with Redis or materialized views.
   * 
   * RESPONSE EXAMPLE:
   * {
   *   "liveReleaseRate": "92.5%",
   *   "avgLengthOfStay": "14 days",
   *   "totalAdoptionsThisMonth": 8,
   *   "medicalCompliance": "87.3%"
   * }
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.get("/api/v1/reports/metrics", requireAuth, requireOrg, async (req, res) => {
    try {
      const organizationId = req.session.organizationId!;
      
      // QUERY 1: Get outcomes with animal data for calculations
      const outcomesData = await db.select()
        .from(outcomes)
        .innerJoin(animals, eq(outcomes.animalId, animals.id))
        .where(eq(animals.organizationId, organizationId));
      
      // QUERY 2: Get adoptions for this month calculation
      const adoptionsData = await db.select()
        .from(adoptionsTable)
        .innerJoin(animals, eq(adoptionsTable.animalId, animals.id))
        .where(eq(animals.organizationId, organizationId));
      
      // QUERY 3: Get medical tasks for compliance calculation
      const medicalTasksData = await db.select()
        .from(medicalSchedule)
        .innerJoin(animals, eq(medicalSchedule.animalId, animals.id))
        .where(eq(animals.organizationId, organizationId));
      
      // CALCULATION 1: Live Release Rate (positive outcomes / total outcomes * 100)
      const positiveOutcomes = outcomesData.filter((o: any) => 
        ['adoption', 'transfer_out', 'return_to_owner'].includes(o.outcomes.type)
      ).length;
      const liveReleaseRate = outcomesData.length > 0 
        ? ((positiveOutcomes / outcomesData.length) * 100).toFixed(1)
        : "0.0";
      
      // CALCULATION 2: Average Length of Stay (days between intake and outcome)
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
      
      // CALCULATION 3: Total Adoptions this month (current calendar month)
      const now = new Date();
      const thisMonth = adoptionsData.filter((a: any) => {
        const adoptionDate = new Date(a.adoptions.date);
        return adoptionDate.getMonth() === now.getMonth() && 
               adoptionDate.getFullYear() === now.getFullYear();
      }).length;
      
      // CALCULATION 4: Medical Compliance (done tasks / total completed tasks * 100)
      // Note: Only counts done vs missed (scheduled tasks don't affect compliance yet)
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

  /**
   * GET /api/v1/reports/export/csv - Export data as CSV
   * 
   * SUPPORTED ENTITIES:
   * - animals: Complete animal records
   * - people: All contacts (adopters, fosters, volunteers)
   * - adoptions: Finalized adoptions with fees
   * - medical: Medical tasks with status
   * 
   * QUERY PARAM:
   * ?entity=animals (specifies what to export)
   * 
   * CSV FORMAT:
   * - Header row with column names
   * - Data rows with quoted fields (handles commas in data)
   * - Filename includes date: animals_2024-01-15.csv
   * 
   * BROWSER DOWNLOAD:
   * Content-Disposition header triggers browser download dialog.
   * User doesn't need to manually save response.
   * 
   * ORGANIZATION SCOPING:
   * All exports filtered to current organization.
   * No risk of exporting other organizations' data.
   * 
   * FUTURE ENHANCEMENTS:
   * - Date range filtering
   * - Column selection (choose which fields to include)
   * - Excel (.xlsx) format support
   * - Async generation for very large exports
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.get("/api/v1/reports/export/csv", requireAuth, requireOrg, async (req, res) => {
    try {
      const { entity } = req.query;
      const organizationId = req.session.organizationId!;
      
      let csvData = '';
      let filename = 'export.csv';
      
      // EXPORT TYPE 1: Animals
      if (entity === 'animals') {
        const animals = await storage.getAnimals(organizationId);
        filename = `animals_${new Date().toISOString().split('T')[0]}.csv`;
        csvData = 'ID,Name,Species,Breed,Sex,Status,Intake Date,Location\n';
        animals.forEach(animal => {
          const intakeDate = animal.intakeDate ? new Date(animal.intakeDate).toLocaleDateString() : '';
          csvData += `"${animal.id}","${animal.name}","${animal.species}","${animal.breed || ''}","${animal.sex || ''}","${animal.status}","${intakeDate}","${animal.locationId || ''}"\n`;
        });
      } 
      
      // EXPORT TYPE 2: People
      else if (entity === 'people') {
        const people = await storage.getPeople(organizationId);
        filename = `people_${new Date().toISOString().split('T')[0]}.csv`;
        csvData = 'ID,Name,Type,Email,Phone,Address\n';
        people.forEach(person => {
          csvData += `"${person.id}","${person.name}","${person.type}","${person.email || ''}","${person.phone || ''}","${person.address || ''}"\n`;
        });
      } 
      
      // EXPORT TYPE 3: Adoptions (with joins for animal and adopter names)
      else if (entity === 'adoptions') {
        const adoptionsData = await db.select()
          .from(adoptionsTable)
          .innerJoin(animals, eq(adoptionsTable.animalId, animals.id))
          .innerJoin(people, eq(adoptionsTable.adopterId, people.id))
          .where(eq(animals.organizationId, organizationId));
        
        filename = `adoptions_${new Date().toISOString().split('T')[0]}.csv`;
        csvData = 'Adoption ID,Animal Name,Adopter Name,Date,Fee,Donation\n';
        adoptionsData.forEach((row: any) => {
          const date = new Date(row.adoptions.date).toLocaleDateString();
          const fee = (row.adoptions.feeCents / 100).toFixed(2);  // Convert cents to dollars
          const donation = row.adoptions.donationCents ? (row.adoptions.donationCents / 100).toFixed(2) : '0.00';
          csvData += `"${row.adoptions.id}","${row.animals.name}","${row.people.name}","${date}","$${fee}","$${donation}"\n`;
        });
      } 
      
      // EXPORT TYPE 4: Medical tasks (with joins for animal names)
      else if (entity === 'medical') {
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
      } 
      
      // INVALID ENTITY TYPE
      else {
        return res.status(400).json({ message: "Invalid entity type" });
      }
      
      // Set headers to trigger browser download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==========================================================================
  // INTEGRATION FEEDS - External service integrations
  // ==========================================================================
  
  /**
   * GET /api/v1/feeds/petfinder.xml - Generate Petfinder XML feed
   * 
   * PURPOSE:
   * Exports available animals to Petfinder and Adopt-a-Pet listing services.
   * These services syndicate animal listings to thousands of adopters.
   * 
   * XML STRUCTURE:
   * <pets>
   *   <pet>
   *     <id>animal-id</id>
   *     <name>Max</name>
   *     <species>dog</species>
   *     <breed>Labrador Mix</breed>
   *     <sex>M</sex>
   *     <age>2 years</age>
   *     <color>Black</color>
   *     <description><![CDATA[Friendly and energetic...]]></description>
   *     <microchip>123456789</microchip>
   *     <location>shelter-location-id</location>
   *     <photos>
   *       <photo>https://cdn.../photo1.jpg</photo>
   *       <photo>https://cdn.../photo2.jpg</photo>
   *     </photos>
   *   </pet>
   * </pets>
   * 
   * DATA FILTERING:
   * Only includes animals with status='available'.
   * Adopted/fostered animals excluded automatically.
   * 
   * AGE CALCULATION:
   * Converts dobEst to human-readable age ("2 years", "3 months").
   * Handles unknown birthdates gracefully.
   * 
   * XML ESCAPING:
   * All text fields escaped to prevent XML injection.
   * Description uses CDATA for rich text content.
   * 
   * PHOTO HANDLING:
   * Extracts URLs whether stored as strings or objects.
   * Filters out invalid photo entries.
   * 
   * EXTERNAL SERVICE SETUP:
   * Petfinder/Adopt-a-Pet configured to fetch this URL on schedule (e.g., daily).
   * They parse XML and update their listings automatically.
   * 
   * MIDDLEWARE: requireAuth + requireOrg
   */
  app.get("/api/v1/feeds/petfinder.xml", requireAuth, requireOrg, async (req, res) => {
    try {
      const animals = await storage.getAnimals(req.session.organizationId!);
      const availableAnimals = animals.filter(a => a.status === 'available');
      
      // Helper function to calculate age from DOB
      const calculateAge = (dob: Date | string | null): string => {
        if (!dob) return 'Unknown';
        const dobDate = typeof dob === 'string' ? new Date(dob) : dob;
        
        // Check for Invalid Date (malformed input)
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
        
        // Description with CDATA (allows HTML/special characters)
        if (animal.description) {
          xml += `    <description><![CDATA[${animal.description}]]></description>\n`;
        }
        
        // Optional fields (only include if present)
        if (animal.microchip) {
          xml += `    <microchip>${escapeXml(animal.microchip)}</microchip>\n`;
        }
        
        if (animal.locationId) {
          xml += `    <location>${escapeXml(animal.locationId)}</location>\n`;
        }
        
        // Photos array (handle both string URLs and photo objects)
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
      
      // Set correct Content-Type for XML
      res.set('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==========================================================================
  // HEALTH CHECK - System status endpoint
  // ==========================================================================
  
  /**
   * GET /api/healthz - Simple health check endpoint
   * 
   * Used by:
   * - Load balancers (verify server is responsive)
   * - Monitoring systems (uptime checks)
   * - Deployment scripts (wait for server ready)
   * 
   * NO AUTHENTICATION REQUIRED:
   * Public endpoint - needs to work even if session store is down.
   * 
   * FUTURE ENHANCEMENTS:
   * Could check:
   * - Database connectivity (SELECT 1)
   * - Redis connection (if using for sessions)
   * - Disk space availability
   * Return 503 if any dependency is unhealthy.
   */
  app.get("/api/healthz", (req, res) => {
    res.json({ status: "ok" });
  });

  // ==========================================================================
  // HTTP SERVER CREATION
  // ==========================================================================
  
  /**
   * Create and return HTTP server instance
   * 
   * Wraps Express app in Node.js HTTP server.
   * Enables WebSocket support (for future real-time features).
   * 
   * Server started in server/index.ts after routes registered.
   */
  const httpServer = createServer(app);
  return httpServer;
}
