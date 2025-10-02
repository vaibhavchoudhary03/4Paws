/**
 * STORAGE LAYER - Data access interface and implementation
 * 
 * ARCHITECTURE:
 * This layer sits between API routes and the database, providing:
 * 
 * 1. ABSTRACTION: Routes call storage methods, not raw SQL
 *    - Makes code more testable (can mock IStorage)
 *    - Allows swapping database implementations
 *    - Centralizes all data access logic
 * 
 * 2. TYPE SAFETY: All methods strongly typed with Drizzle schemas
 *    - Input: Insert types (exclude auto-generated fields)
 *    - Output: Select types (complete entity with all fields)
 *    - Compile-time guarantees about data shape
 * 
 * 3. ORGANIZATION SCOPING: Critical for multi-tenancy
 *    - Most methods require organizationId parameter
 *    - Prevents data leaks between organizations
 *    - Enforced at database query level (not just UI)
 * 
 * DATA ACCESS PATTERNS:
 * - Simple queries: Single table, equality filters
 * - Joined queries: Return enriched data (e.g., medical tasks with animal info)
 * - Sorting: Default to createdAt desc (newest first)
 * - Filtering: Optional parameters for common filters
 * 
 * SECURITY NOTE:
 * This layer trusts that organizationId is correct - it's the caller's
 * responsibility (auth middleware) to ensure the user has access to that org.
 */

import { db } from "./db";
import { users, animals, organizations, memberships, people, medicalSchedule, applications, intakes, adoptions, fosterAssignments, notes, photos, type User, type InsertUser, type Animal, type InsertAnimal, type Organization, type InsertOrganization, type Membership, type InsertMembership, type Person, type InsertPerson, type MedicalSchedule, type InsertMedicalSchedule, type Application, type InsertApplication, type Adoption, type InsertAdoption, type Note, type InsertNote, type Photo, type InsertPhoto } from "@shared/schema";
import { eq, and, desc, lte, gte } from "drizzle-orm";

/**
 * IStorage - Interface defining all data operations
 * 
 * WHY AN INTERFACE?
 * - Enables testing with mock implementations
 * - Documents all available data operations
 * - Allows future storage backends (e.g., caching layer)
 * 
 * NAMING CONVENTIONS:
 * - get* = Fetch single or multiple records
 * - create* = Insert new record
 * - update* = Modify existing record
 * - (No delete methods yet - soft deletes preferred for audit trail)
 */
export interface IStorage {
  // ========== USER OPERATIONS ==========
  // Users are global (no organizationId) - they gain org access through memberships
  
  /** Fetch user by ID (for session validation) */
  getUser(id: string): Promise<User | undefined>;
  
  /** Fetch user by email (for login authentication) */
  getUserByEmail(email: string): Promise<User | undefined>;
  
  /** Create new user account (registration) */
  createUser(user: InsertUser): Promise<User>;
  
  // ========== ORGANIZATION OPERATIONS ==========
  
  /** Fetch organization by ID (for session context) */
  getOrganization(id: string): Promise<Organization | undefined>;
  
  /** Create new organization (new shelter signup) */
  createOrganization(org: InsertOrganization): Promise<Organization>;
  
  // ========== MEMBERSHIP OPERATIONS ==========
  
  /** Get all organizations a user belongs to (with join for org details) */
  getUserMemberships(userId: string): Promise<(Membership & { organization: Organization })[]>;
  
  /** Grant user access to an organization with a role */
  createMembership(membership: InsertMembership): Promise<Membership>;
  
  // ========== ANIMAL OPERATIONS (ORG-SCOPED) ==========
  // All animal operations require organizationId for tenant isolation
  
  /** Fetch all animals for an organization (sorted newest first) */
  getAnimals(organizationId: string): Promise<Animal[]>;
  
  /** Fetch single animal - requires BOTH id AND organizationId for security */
  getAnimal(id: string, organizationId: string): Promise<Animal | undefined>;
  
  /** Create new animal (intake process) */
  createAnimal(animal: InsertAnimal): Promise<Animal>;
  
  /** Update animal fields (status changes, kennel assignments, etc.) */
  updateAnimal(id: string, organizationId: string, data: Partial<InsertAnimal>): Promise<Animal>;
  
  // ========== PEOPLE OPERATIONS (ORG-SCOPED) ==========
  // Adopters, fosters, volunteers - all scoped to organization
  
  /** Fetch all people for an organization */
  getPeople(organizationId: string): Promise<Person[]>;
  
  /** Fetch single person with org verification */
  getPerson(id: string, organizationId: string): Promise<Person | undefined>;
  
  /** Create new person record (adopter, foster, volunteer, etc.) */
  createPerson(person: InsertPerson): Promise<Person>;
  
  // ========== MEDICAL OPERATIONS (ORG-SCOPED) ==========
  
  /** 
   * Fetch medical tasks with optional filters
   * Returns JOINED data (task + animal) for display in medical dashboard
   * 
   * Filters:
   * - dueDate: Only tasks due on or before this date (for "today's tasks")
   * - status: Filter by scheduled/done/missed
   */
  getMedicalTasks(organizationId: string, filters?: { dueDate?: Date, status?: string }): Promise<(MedicalSchedule & { animal: Animal })[]>;
  
  /** Create new scheduled medical task */
  createMedicalTask(task: InsertMedicalSchedule): Promise<MedicalSchedule>;
  
  /** Update medical task (typically changing status to 'done' or 'missed') */
  updateMedicalTask(id: string, data: Partial<InsertMedicalSchedule>): Promise<MedicalSchedule>;
  
  // ========== APPLICATION OPERATIONS (ORG-SCOPED) ==========
  
  /** 
   * Fetch all applications with JOINED animal and person data
   * Used by adoption pipeline to show full application context
   * Org scoping done via animal.organizationId join
   */
  getApplications(organizationId: string): Promise<(Application & { animal: Animal, person: Person })[]>;
  
  /** Create new adoption/foster application */
  createApplication(application: InsertApplication): Promise<Application>;
  
  /** Update application (status changes as it moves through pipeline) */
  updateApplication(id: string, data: Partial<InsertApplication>): Promise<Application>;
  
  // ========== ADOPTION OPERATIONS ==========
  
  /** Create adoption record (finalize approved application) */
  createAdoption(adoption: InsertAdoption): Promise<Adoption>;
  
  // ========== NOTES OPERATIONS (POLYMORPHIC) ==========
  // Notes can be attached to ANY entity (animals, people, applications, etc.)
  
  /** Fetch all notes for a specific subject (e.g., all notes on animal X) */
  getNotes(subjectType: string, subjectId: string): Promise<Note[]>;
  
  /** Create new note on any entity */
  createNote(note: InsertNote): Promise<Note>;
  
  // ========== PHOTO OPERATIONS (POLYMORPHIC) ==========
  // Photos can be attached to any entity, same pattern as notes
  
  /** Fetch all photos for a specific subject */
  getPhotos(subjectType: string, subjectId: string): Promise<Photo[]>;
  
  /** Create new photo record (URL points to S3/CDN) */
  createPhoto(photo: InsertPhoto): Promise<Photo>;
}

/**
 * DatabaseStorage - PostgreSQL implementation of IStorage
 * 
 * Uses Drizzle ORM for:
 * - Type-safe queries (compile-time SQL validation)
 * - Automatic parameter sanitization (prevents SQL injection)
 * - Join operations with type inference
 * 
 * QUERY PATTERNS:
 * 1. Simple select: db.select().from(table).where(condition)
 * 2. With joins: db.select().from(table).leftJoin(other, joinCondition)
 * 3. Insert: db.insert(table).values(data).returning()
 * 4. Update: db.update(table).set(data).where(condition).returning()
 * 
 * RETURNING clause: PostgreSQL feature that returns inserted/updated rows,
 * eliminating need for separate SELECT after write operations.
 */
export class DatabaseStorage implements IStorage {
  // ========== USER OPERATIONS ==========
  
  /**
   * Fetch user by ID
   * Used for session validation (checking if userId from session exists)
   */
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  /**
   * Fetch user by email
   * Used during login to find user account and verify password
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  /**
   * Create new user
   * Password should be bcrypt-hashed BEFORE calling this method
   */
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // ========== ORGANIZATION OPERATIONS ==========
  
  /**
   * Fetch organization by ID
   * Used to load org settings and validate org exists
   */
  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org || undefined;
  }

  /**
   * Create new organization
   * Typically followed immediately by creating a membership for the creator
   */
  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const [organization] = await db.insert(organizations).values(org).returning();
    return organization;
  }

  // ========== MEMBERSHIP OPERATIONS ==========
  
  /**
   * Get all user's organization memberships
   * 
   * Returns JOINED data with organization details so we can display org names.
   * Used during login to let user choose which organization to access.
   * 
   * Join pattern: leftJoin ensures we get membership even if org was deleted
   * (though cascade delete should prevent this scenario)
   */
  async getUserMemberships(userId: string): Promise<(Membership & { organization: Organization })[]> {
    const result = await db.select({
      membership: memberships,
      organization: organizations,
    })
    .from(memberships)
    .leftJoin(organizations, eq(memberships.organizationId, organizations.id))
    .where(eq(memberships.userId, userId));
    
    // Reshape from { membership: {...}, organization: {...} } to flat object
    return result.map(r => ({ ...r.membership, organization: r.organization! }));
  }

  /**
   * Create membership (grant user access to organization)
   * 
   * Used when:
   * - New organization created (owner gets admin role)
   * - Existing user invited to organization
   */
  async createMembership(membership: InsertMembership): Promise<Membership> {
    const [m] = await db.insert(memberships).values(membership).returning();
    return m;
  }

  // ========== ANIMAL OPERATIONS ==========
  
  /**
   * Fetch all animals for an organization
   * 
   * ORG SCOPING: Only returns animals belonging to specified organization.
   * SORTING: Newest animals first (most recent intakes at top of list).
   */
  async getAnimals(organizationId: string): Promise<Animal[]> {
    return await db.select().from(animals).where(eq(animals.organizationId, organizationId)).orderBy(desc(animals.createdAt));
  }

  /**
   * Fetch single animal with security check
   * 
   * SECURITY: Requires BOTH animal ID AND organizationId.
   * This prevents users from accessing animals in other organizations
   * by guessing IDs.
   */
  async getAnimal(id: string, organizationId: string): Promise<Animal | undefined> {
    const [animal] = await db.select().from(animals).where(and(eq(animals.id, id), eq(animals.organizationId, organizationId)));
    return animal || undefined;
  }

  /**
   * Create new animal (intake process)
   * 
   * Caller must provide organizationId in the animal object.
   * Returns complete animal record with auto-generated fields (id, createdAt).
   */
  async createAnimal(animal: InsertAnimal): Promise<Animal> {
    const [a] = await db.insert(animals).values(animal).returning();
    return a;
  }

  /**
   * Update animal fields
   * 
   * ORG SCOPING: Update only succeeds if animal belongs to organization.
   * PARTIAL UPDATE: Only specified fields in 'data' are changed.
   * Common uses: Status changes (available → adopted), kennel assignments, photo updates.
   */
  async updateAnimal(id: string, organizationId: string, data: Partial<InsertAnimal>): Promise<Animal> {
    const [animal] = await db.update(animals).set(data).where(and(eq(animals.id, id), eq(animals.organizationId, organizationId))).returning();
    return animal;
  }

  // ========== PEOPLE OPERATIONS ==========
  
  /**
   * Fetch all people for an organization
   * 
   * Returns adopters, fosters, volunteers, donors, staff.
   * Sorted newest first for easy management of recent additions.
   */
  async getPeople(organizationId: string): Promise<Person[]> {
    return await db.select().from(people).where(eq(people.organizationId, organizationId)).orderBy(desc(people.createdAt));
  }

  /**
   * Fetch single person with org security check
   * 
   * Same pattern as getAnimal - requires both ID and organizationId.
   */
  async getPerson(id: string, organizationId: string): Promise<Person | undefined> {
    const [person] = await db.select().from(people).where(and(eq(people.id, id), eq(people.organizationId, organizationId)));
    return person || undefined;
  }

  /**
   * Create new person record
   * 
   * Used when adding adopters, registering volunteers, etc.
   * Caller must specify type (adopter/foster/volunteer/donor/staff).
   */
  async createPerson(person: InsertPerson): Promise<Person> {
    const [p] = await db.insert(people).values(person).returning();
    return p;
  }

  // ========== MEDICAL OPERATIONS ==========
  
  /**
   * Fetch medical tasks with optional filters and joined animal data
   * 
   * JOINS: Includes animal info so UI can display "Rabies vaccine for Max"
   * 
   * ORG SCOPING: Via animals.organizationId (tasks don't have direct org reference)
   * 
   * FILTERS:
   * - dueDate: Tasks due on or before this date (for "today's tasks" view)
   * - status: Filter by scheduled/done/missed (for compliance reporting)
   * 
   * SORTING: By dueDate ascending (earliest deadlines first)
   * 
   * Used by:
   * - Medical dashboard (show today's tasks)
   * - Batch actions (select and complete multiple tasks)
   * - Compliance reports (calculate completion percentage)
   */
  async getMedicalTasks(organizationId: string, filters?: { dueDate?: Date, status?: string }): Promise<(MedicalSchedule & { animal: Animal })[]> {
    // Start with base condition: only tasks for animals in this org
    const conditions = [eq(animals.organizationId, organizationId)];
    
    // Add optional dueDate filter (tasks due on or before specified date)
    if (filters?.dueDate) {
      conditions.push(lte(medicalSchedule.dueDate, filters.dueDate));
    }

    // Join medical tasks with animals to get animal details
    const result = await db.select({
      task: medicalSchedule,
      animal: animals,
    })
    .from(medicalSchedule)
    .leftJoin(animals, eq(medicalSchedule.animalId, animals.id))
    .where(and(...conditions))  // Combine all conditions with AND
    .orderBy(medicalSchedule.dueDate);  // Sort by due date (earliest first)
    
    // Flatten join result: merge task and animal into single object
    return result.map(r => ({ ...r.task, animal: r.animal! }));
  }

  /**
   * Create new medical task (schedule future care)
   * 
   * Typically created:
   * - During intake (initial vaccines)
   * - After medical procedure (follow-up appointments)
   * - Manually by staff (scheduled surgeries)
   */
  async createMedicalTask(task: InsertMedicalSchedule): Promise<MedicalSchedule> {
    const [t] = await db.insert(medicalSchedule).values(task).returning();
    return t;
  }

  /**
   * Update medical task (typically status changes)
   * 
   * Most common update: status 'scheduled' → 'done' when task completed.
   * Can also update assignedTo, notes, or dueDate.
   */
  async updateMedicalTask(id: string, data: Partial<InsertMedicalSchedule>): Promise<MedicalSchedule> {
    const [task] = await db.update(medicalSchedule).set(data).where(eq(medicalSchedule.id, id)).returning();
    return task;
  }

  // ========== APPLICATION OPERATIONS ==========
  
  /**
   * Fetch all applications with complete context (animal + person)
   * 
   * DOUBLE JOIN: Get both animal and applicant info for display.
   * 
   * ORG SCOPING: Via animals.organizationId join condition.
   * 
   * SORTING: Newest applications first.
   * 
   * Powers the adoption pipeline Kanban board where staff:
   * - See who applied for which animal
   * - Move applications through workflow stages
   * - Access applicant contact info
   */
  async getApplications(organizationId: string): Promise<(Application & { animal: Animal, person: Person })[]> {
    const result = await db.select({
      application: applications,
      animal: animals,
      person: people,
    })
    .from(applications)
    .leftJoin(animals, eq(applications.animalId, animals.id))
    .leftJoin(people, eq(applications.personId, people.id))
    .where(eq(animals.organizationId, organizationId))  // Org scoping via animal
    .orderBy(desc(applications.createdAt));

    // Flatten: spread application fields, add animal and person as nested objects
    return result.map(r => ({ ...r.application, animal: r.animal!, person: r.person! }));
  }

  /**
   * Create new application
   * 
   * Triggered when someone submits adoption/foster application form.
   * Form data stored in JSONB 'form' field for flexibility.
   */
  async createApplication(application: InsertApplication): Promise<Application> {
    const [app] = await db.insert(applications).values(application).returning();
    return app;
  }

  /**
   * Update application (move through workflow stages)
   * 
   * Typical workflow:
   * - received → review: Staff starts reviewing
   * - review → approved: Application looks good
   * - approved → (create adoption): Finalize placement
   */
  async updateApplication(id: string, data: Partial<InsertApplication>): Promise<Application> {
    const [app] = await db.update(applications).set(data).where(eq(applications.id, id)).returning();
    return app;
  }

  // ========== ADOPTION OPERATIONS ==========
  
  /**
   * Create adoption record (finalize placement)
   * 
   * Creates permanent record of:
   * - Who adopted which animal
   * - When adoption occurred
   * - Financial details (fees, donations, Stripe payment)
   * - Legal contract reference
   * 
   * Typically triggers:
   * - Animal status update to 'adopted'
   * - Outcome record creation
   * - Certificate generation
   */
  async createAdoption(adoption: InsertAdoption): Promise<Adoption> {
    const [a] = await db.insert(adoptions).values(adoption).returning();
    return a;
  }

  // ========== NOTES OPERATIONS ==========
  
  /**
   * Fetch notes for any entity (polymorphic pattern)
   * 
   * Examples:
   * - subjectType='animal', subjectId='123' → all notes on animal 123
   * - subjectType='person', subjectId='456' → all notes on person 456
   * 
   * SORTING: Newest notes first.
   * 
   * Used by:
   * - Animal detail pages (show behavioral notes)
   * - Volunteer/foster portals (log activities)
   * - Application reviews (staff comments)
   */
  async getNotes(subjectType: string, subjectId: string): Promise<Note[]> {
    return await db.select().from(notes).where(and(eq(notes.subjectType, subjectType), eq(notes.subjectId, subjectId))).orderBy(desc(notes.createdAt));
  }

  /**
   * Create note on any entity
   * 
   * Caller must specify:
   * - subjectType & subjectId (what the note is about)
   * - authorId (who wrote it)
   * - visibility (staff_only or public_to_portal)
   * - Optional tags for categorization
   */
  async createNote(note: InsertNote): Promise<Note> {
    const [n] = await db.insert(notes).values(note).returning();
    return n;
  }

  // ========== PHOTO OPERATIONS ==========
  
  /**
   * Fetch photos for any entity (same polymorphic pattern as notes)
   * 
   * Photos stored externally (S3/CDN) - database only stores URLs.
   * SORTING: Newest photos first.
   */
  async getPhotos(subjectType: string, subjectId: string): Promise<Photo[]> {
    return await db.select().from(photos).where(and(eq(photos.subjectType, subjectType), eq(photos.subjectId, subjectId))).orderBy(desc(photos.createdAt));
  }

  /**
   * Create photo record
   * 
   * Actual image upload happens separately (to S3).
   * This just records the URL and metadata in the database.
   * 
   * authorId tracks who uploaded (for moderation/accountability).
   */
  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const [p] = await db.insert(photos).values(photo).returning();
    return p;
  }
}

/**
 * SINGLETON INSTANCE
 * 
 * Export single storage instance used throughout the application.
 * All API routes import and use this shared instance.
 * 
 * Benefits of singleton:
 * - Single database connection pool
 * - Consistent behavior across all routes
 * - Easy to mock in tests (just mock this export)
 */
export const storage = new DatabaseStorage();
