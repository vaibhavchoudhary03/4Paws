/**
 * DATABASE SCHEMA - Complete data model for Kirby animal shelter management system
 * 
 * ARCHITECTURE OVERVIEW:
 * This schema implements a multi-tenant SaaS architecture where each organization
 * (animal shelter) has isolated data. Key design principles:
 * 
 * 1. MULTI-TENANCY: All core tables have organizationId for data isolation
 * 2. REFERENTIAL INTEGRITY: Foreign keys with cascade/set null rules protect data consistency
 * 3. TYPE SAFETY: PostgreSQL enums ensure valid status values throughout the application
 * 4. FLEXIBILITY: JSONB columns (attributes, settings, flags) allow custom fields without schema changes
 * 5. AUDIT TRAIL: createdAt timestamps on all tables for data lineage
 * 
 * DATA FLOW:
 * Animals → (intake process) → Medical care → Applications → Foster/Adoption → Outcomes
 * 
 * The schema supports the complete lifecycle from animal intake through final outcome,
 * with parallel workflows for medical care, foster assignments, and volunteer coordination.
 */

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// ENUMS - Type-safe constants for status fields and categories
// ============================================================================

/** User roles within an organization - determines access control and permissions */
export const roleEnum = pgEnum('role', ['admin', 'staff', 'volunteer', 'foster', 'readonly']);

/** Animal species - used for kennel assignments and species-specific workflows */
export const speciesEnum = pgEnum('species', ['dog', 'cat', 'other']);

/** Current status of an animal in the shelter system */
export const animalStatusEnum = pgEnum('animal_status', ['available', 'hold', 'adopted', 'transferred', 'rto', 'euthanized', 'fostered']);

/** How an animal entered the shelter - required for reporting and statistics */
export const intakeTypeEnum = pgEnum('intake_type', ['stray', 'owner_surrender', 'transfer_in', 'confiscation', 'born_in_care']);

/** Final outcome when animal leaves the shelter - used for live release rate calculations */
export const outcomeTypeEnum = pgEnum('outcome_type', ['adoption', 'transfer_out', 'return_to_owner', 'euthanasia']);

/** Type of medical procedure - determines scheduling and compliance tracking */
export const medicalTypeEnum = pgEnum('medical_type', ['vaccine', 'treatment', 'surgery', 'exam']);

/** Medical task completion status - used for compliance reporting */
export const medicalStatusEnum = pgEnum('medical_status', ['scheduled', 'done', 'missed']);

/** Categories of people in the system - each type has different workflows and permissions */
export const personTypeEnum = pgEnum('person_type', ['adopter', 'foster', 'volunteer', 'donor', 'staff']);

/** Type of application being submitted */
export const applicationTypeEnum = pgEnum('application_type', ['adoption', 'foster']);

/** Application review workflow status */
export const applicationStatusEnum = pgEnum('application_status', ['received', 'review', 'approved', 'denied', 'withdrawn']);

/** Foster placement status - tracks active, completed, and failed placements */
export const fosterStatusEnum = pgEnum('foster_status', ['active', 'completed', 'failed']);

/** Note visibility controls - staff_only protects sensitive information */
export const noteVisibilityEnum = pgEnum('note_visibility', ['staff_only', 'public_to_portal']);

/** Physical location types within the organization */
export const locationTypeEnum = pgEnum('location_type', ['shelter', 'clinic', 'storage']);

// ============================================================================
// ORGANIZATIONS TABLE - Root of the multi-tenant hierarchy
// ============================================================================

/**
 * Organizations - Each animal shelter or rescue organization
 * 
 * This is the ROOT table in the multi-tenant architecture. Every organization has:
 * - Isolated data (other tables reference organizationId)
 * - Custom settings stored in JSONB (branding, business rules, integrations)
 * - Independent user access through memberships table
 * 
 * Example settings: { branding: { logo: "url" }, businessRules: { maxFosterPets: 5 } }
 */
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  settings: jsonb("settings").default('{}'),  // Flexible organization-specific configuration
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({ id: true, createdAt: true });
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;

// ============================================================================
// USERS & MEMBERSHIPS - Authentication and authorization
// ============================================================================

/**
 * Users - Individual user accounts (staff, volunteers, fosters)
 * 
 * Users can belong to multiple organizations through the memberships table.
 * Passwords are bcrypt-hashed before storage (never stored in plain text).
 * Email must be unique across the entire system.
 * 
 * Note: This table does NOT have organizationId - users are global entities
 * that gain organization access through memberships.
 */
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),  // Enforces uniqueness across all users
  password: text("password").notNull(),     // Bcrypt hash, never plain text
  status: text("status").default('active'), // Can be used to suspend accounts
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

/**
 * Memberships - Links users to organizations with role-based access
 * 
 * This is the JOIN TABLE that creates multi-tenancy. Each membership grants:
 * - Access to one organization's data
 * - A specific role (admin, staff, volunteer, foster, readonly)
 * - Basis for all authorization checks
 * 
 * When a user logs in, we store their userId and active organizationId in the session.
 * All subsequent queries are scoped to that organizationId.
 * 
 * Cascade delete: If user or organization is deleted, membership is automatically removed.
 */
export const memberships = pgTable("memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  role: roleEnum("role").notNull().default('staff'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMembershipSchema = createInsertSchema(memberships).omit({ id: true, createdAt: true });
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type Membership = typeof memberships.$inferSelect;

// ============================================================================
// LOCATIONS & KENNELS - Physical space management
// ============================================================================

/**
 * Locations - Physical sites where animals are housed or treated
 * 
 * Organizations can have multiple locations (main shelter, satellite clinic, storage facility).
 * Used for:
 * - Tracking where animals are physically located
 * - Volunteer shift assignments
 * - Inventory management per location
 */
export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  type: locationTypeEnum("type").notNull().default('shelter'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLocationSchema = createInsertSchema(locations).omit({ id: true, createdAt: true });
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

/**
 * Kennels - Individual housing units within locations
 * 
 * Represents cages, kennels, runs, or rooms where animals are housed.
 * Supports:
 * - Capacity planning (code system for identification)
 * - Species-specific housing (cat room vs dog runs)
 * - Size-based assignments (small/medium/large kennels)
 * 
 * Set null on location delete: Kennel can exist without location reference
 */
export const kennels = pgTable("kennels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  locationId: varchar("location_id").references(() => locations.id, { onDelete: 'set null' }),
  code: text("code").notNull(),        // e.g., "K-101", "CAT-A3"
  size: text("size"),                  // e.g., "small", "medium", "large"
  species: speciesEnum("species"),     // Restrict kennel to specific species
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertKennelSchema = createInsertSchema(kennels).omit({ id: true, createdAt: true });
export type InsertKennel = z.infer<typeof insertKennelSchema>;
export type Kennel = typeof kennels.$inferSelect;

// ============================================================================
// ANIMALS TABLE - Core entity representing shelter animals
// ============================================================================

/**
 * Animals - Central table representing each animal in the shelter system
 * 
 * This is the CORE ENTITY of the entire application. Everything revolves around animals:
 * - Medical records track animal health
 * - Applications connect animals to potential adopters
 * - Foster assignments track temporary placements
 * - Notes and photos document animal behavior and appearance
 * 
 * DESIGN DECISIONS:
 * - dobEst (estimated date of birth): Often exact birthdate is unknown for strays
 * - photos: Array of URLs, not foreign keys (simpler for external storage like S3)
 * - attributes: JSONB for flexible data (temperament, special needs, dietary restrictions)
 * - status: Drives workflow (available → fostered → adopted)
 * - microchip: Critical for reuniting lost pets with owners
 * 
 * CASCADE RULES:
 * - Delete organization → deletes animals (tenant isolation)
 * - Delete location/kennel → sets to null (animals still exist, just unassigned)
 */
export const animals = pgTable("animals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  species: speciesEnum("species").notNull(),
  breed: text("breed"),
  sex: text("sex"),                                    // e.g., "M", "F", "Unknown"
  color: text("color"),                                // Primary color for identification
  dobEst: timestamp("dob_est"),                        // Estimated DOB (often unknown for rescues)
  intakeDate: timestamp("intake_date").notNull().defaultNow(),  // When animal entered shelter
  status: animalStatusEnum("status").notNull().default('available'),
  locationId: varchar("location_id").references(() => locations.id, { onDelete: 'set null' }),
  kennelId: varchar("kennel_id").references(() => kennels.id, { onDelete: 'set null' }),
  microchip: text("microchip"),                        // Unique ID for pet recovery
  photos: text("photos").array(),                      // Array of photo URLs (S3/CDN)
  description: text("description"),                    // Adoption listing description
  attributes: jsonb("attributes").default('{}'),       // Flexible: { goodWithKids: true, housebroken: false }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnimalSchema = createInsertSchema(animals).omit({ id: true, createdAt: true });
export type InsertAnimal = z.infer<typeof insertAnimalSchema>;
export type Animal = typeof animals.$inferSelect;

// ============================================================================
// INTAKE & OUTCOME TRACKING - Animal lifecycle endpoints
// ============================================================================

/**
 * Intakes - Records how and why an animal entered the shelter
 * 
 * Required for:
 * - Statistics and reporting (how many strays vs surrenders)
 * - Legal compliance (intake records often required by law)
 * - Operational insights (identify intake patterns)
 * 
 * Source JSONB can include: { ownerName: "...", reason: "moving", location: "..." }
 */
export const intakes = pgTable("intakes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  animalId: varchar("animal_id").notNull().references(() => animals.id, { onDelete: 'cascade' }),
  type: intakeTypeEnum("type").notNull(),
  source: jsonb("source").default('{}'),  // Flexible intake context (owner info, location found, etc.)
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertIntakeSchema = createInsertSchema(intakes).omit({ id: true, createdAt: true });
export type InsertIntake = z.infer<typeof insertIntakeSchema>;
export type Intake = typeof intakes.$inferSelect;

/**
 * Outcomes - Records how and when an animal left the shelter
 * 
 * CRITICAL FOR METRICS:
 * - Live release rate = (adoptions + transfers + RTO) / total outcomes
 * - Average length of stay = outcome.date - animal.intakeDate
 * 
 * Details JSONB can include: { transferOrg: "...", adopter: { id: "..." }, reason: "..." }
 * 
 * Note: Adoptions also have their own detailed table; this provides the summary outcome.
 */
export const outcomes = pgTable("outcomes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  animalId: varchar("animal_id").notNull().references(() => animals.id, { onDelete: 'cascade' }),
  type: outcomeTypeEnum("type").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  details: jsonb("details").default('{}'),  // Additional outcome context
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOutcomeSchema = createInsertSchema(outcomes).omit({ id: true, createdAt: true });
export type InsertOutcome = z.infer<typeof insertOutcomeSchema>;
export type Outcome = typeof outcomes.$inferSelect;

// ============================================================================
// MEDICAL SYSTEM - Health records and scheduling
// ============================================================================

/**
 * Medical Records - Completed medical procedures (historical record)
 * 
 * Records ACTUAL medical care that was administered:
 * - Vaccines given (product, dose, route)
 * - Treatments performed
 * - Surgeries completed
 * - Exams conducted
 * 
 * This is the permanent, immutable record of care. Used for:
 * - Medical history when animal is adopted
 * - Vaccine compliance tracking
 * - Audit trail for veterinary care
 * 
 * vetId links to user who performed the procedure (must be staff/admin)
 */
export const medicalRecords = pgTable("medical_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  animalId: varchar("animal_id").notNull().references(() => animals.id, { onDelete: 'cascade' }),
  type: medicalTypeEnum("type").notNull(),
  product: text("product"),            // e.g., "Rabies vaccine", "Amoxicillin"
  dose: text("dose"),                  // e.g., "1ml", "250mg"
  route: text("route"),                // e.g., "subcutaneous", "oral"
  dateGiven: timestamp("date_given").notNull(),
  vetId: varchar("vet_id").references(() => users.id, { onDelete: 'set null' }),  // Who administered
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({ id: true, createdAt: true });
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;

/**
 * Medical Schedule - Upcoming/scheduled medical tasks (forward-looking)
 * 
 * Manages FUTURE medical care that needs to happen:
 * - Vaccine due dates
 * - Scheduled surgeries
 * - Follow-up exams
 * 
 * WORKFLOW:
 * 1. Task created with status='scheduled' and dueDate
 * 2. Staff assigned to task (assignedTo)
 * 3. When completed, status changes to 'done' and medicalRecord is created
 * 4. If missed, status changes to 'missed' for compliance tracking
 * 
 * COMPLIANCE REPORTING:
 * Medical compliance % = done tasks / (done + missed tasks)
 * 
 * Used heavily by the medical dashboard for daily task lists and batch actions.
 */
export const medicalSchedule = pgTable("medical_schedule", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  animalId: varchar("animal_id").notNull().references(() => animals.id, { onDelete: 'cascade' }),
  type: medicalTypeEnum("type").notNull(),
  dueDate: timestamp("due_date").notNull(),
  assignedTo: varchar("assigned_to").references(() => users.id, { onDelete: 'set null' }),
  status: medicalStatusEnum("status").notNull().default('scheduled'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMedicalScheduleSchema = createInsertSchema(medicalSchedule).omit({ id: true, createdAt: true });
export type InsertMedicalSchedule = z.infer<typeof insertMedicalScheduleSchema>;
export type MedicalSchedule = typeof medicalSchedule.$inferSelect;

// ============================================================================
// PEOPLE MANAGEMENT - External contacts (adopters, fosters, volunteers)
// ============================================================================

/**
 * People - External individuals who interact with the shelter
 * 
 * Represents everyone who is NOT a user (doesn't log into the system):
 * - Adopters: People who adopt animals
 * - Fosters: Temporary caregivers
 * - Volunteers: Help with daily operations
 * - Donors: Financial supporters
 * - Staff: External staff (different from users who have login access)
 * 
 * FLAGS JSONB stores warnings/notes: { doNotAdopt: true, allergies: "cats", notes: "..." }
 * 
 * Note: A person can have multiple types (volunteer who also fosters), but primary
 * type field helps with filtering and workflow routing.
 */
export const people = pgTable("people", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  type: personTypeEnum("type").notNull(),
  flags: jsonb("flags").default('{}'),  // Warnings, preferences, special notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPersonSchema = createInsertSchema(people).omit({ id: true, createdAt: true });
export type InsertPerson = z.infer<typeof insertPersonSchema>;
export type Person = typeof people.$inferSelect;

// ============================================================================
// APPLICATION & ADOPTION WORKFLOW
// ============================================================================

/**
 * Applications - Formal requests to adopt or foster an animal
 * 
 * WORKFLOW PIPELINE (visible on adoptions/pipeline page):
 * 1. received: Application submitted
 * 2. review: Staff is reviewing
 * 3. approved: Ready to schedule meet & greet
 * 4. denied/withdrawn: Application not proceeding
 * 
 * Form JSONB contains: { homeType: "house", hasYard: true, otherPets: [...], references: [...] }
 * 
 * This feeds the adoption pipeline Kanban board where staff drag cards between columns.
 */
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  animalId: varchar("animal_id").notNull().references(() => animals.id, { onDelete: 'cascade' }),
  personId: varchar("person_id").notNull().references(() => people.id, { onDelete: 'cascade' }),
  type: applicationTypeEnum("type").notNull(),
  status: applicationStatusEnum("status").notNull().default('received'),
  form: jsonb("form").default('{}'),   // Complete application form data
  notes: text("notes"),                // Staff notes about application review
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, createdAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

/**
 * Foster Assignments - Temporary placements of animals with foster families
 * 
 * Tracks animals living temporarily outside the shelter:
 * - Active: Currently in foster care
 * - Completed: Successfully returned to shelter
 * - Failed: Foster couldn't continue (animal returned early)
 * 
 * WORKFLOW:
 * 1. Approved foster application creates assignment
 * 2. Animal status changes to 'fostered'
 * 3. Foster can log updates via foster portal
 * 4. When ready for adoption, endDate is set and status → completed
 * 
 * Important for capacity management and animal socialization.
 */
export const fosterAssignments = pgTable("foster_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  animalId: varchar("animal_id").notNull().references(() => animals.id, { onDelete: 'cascade' }),
  personId: varchar("person_id").notNull().references(() => people.id, { onDelete: 'cascade' }),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),      // Null while still in foster care
  status: fosterStatusEnum("status").notNull().default('active'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFosterAssignmentSchema = createInsertSchema(fosterAssignments).omit({ id: true, createdAt: true });
export type InsertFosterAssignment = z.infer<typeof insertFosterAssignmentSchema>;
export type FosterAssignment = typeof fosterAssignments.$inferSelect;

/**
 * Adoptions - Final adoption records (successful placements)
 * 
 * Created when an approved application is finalized:
 * - Legal contract signed (contractUrl)
 * - Payment processed via Stripe (paymentIntentId)
 * - Animal officially transferred to adopter
 * 
 * FINANCIAL TRACKING:
 * - feeCents: Required adoption fee (in cents to avoid float math)
 * - donationCents: Optional additional donation
 * - paymentIntentId: Links to Stripe payment for reconciliation
 * 
 * This triggers:
 * 1. Animal status → 'adopted'
 * 2. Outcome record created
 * 3. Notification to foster (if fostered)
 * 4. Adoption certificate generation
 */
export const adoptions = pgTable("adoptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  animalId: varchar("animal_id").notNull().references(() => animals.id, { onDelete: 'cascade' }),
  adopterId: varchar("adopter_id").notNull().references(() => people.id, { onDelete: 'cascade' }),
  date: timestamp("date").notNull().defaultNow(),
  feeCents: integer("fee_cents").notNull().default(0),      // Amount in cents (e.g., 15000 = $150.00)
  donationCents: integer("donation_cents").default(0),      // Additional donation
  contractUrl: text("contract_url"),                        // Signed contract PDF
  paymentIntentId: text("payment_intent_id"),               // Stripe payment reference
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdoptionSchema = createInsertSchema(adoptions).omit({ id: true, createdAt: true });
export type InsertAdoption = z.infer<typeof insertAdoptionSchema>;
export type Adoption = typeof adoptions.$inferSelect;

// ============================================================================
// NOTES & PHOTOS - Flexible documentation system
// ============================================================================

/**
 * Notes - Text annotations on any entity (polymorphic association)
 * 
 * POLYMORPHIC PATTERN:
 * - subjectType: e.g., "animal", "person", "application"
 * - subjectId: ID of the subject
 * 
 * This allows notes to be attached to ANY entity without creating separate tables.
 * 
 * VISIBILITY CONTROL:
 * - staff_only: Only visible to staff (internal notes, concerns)
 * - public_to_portal: Visible to foster/volunteer portals
 * 
 * TAGS: Array for categorization: ["behavior", "medical", "urgent"]
 * Used heavily by volunteer and foster portals to log activities and observations.
 */
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectType: text("subject_type").notNull(),              // e.g., "animal", "person"
  subjectId: varchar("subject_id").notNull(),               // ID of the subject entity
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  visibility: noteVisibilityEnum("visibility").notNull().default('staff_only'),
  body: text("body").notNull(),
  tags: text("tags").array(),                               // Categorization: ["walked", "fed", "medical"]
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true });
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

/**
 * Photos - Image attachments on any entity (polymorphic association)
 * 
 * Similar polymorphic pattern to notes:
 * - subjectType + subjectId link to any entity
 * - Most commonly used for animal photos
 * 
 * URL points to external storage (S3, CDN):
 * - Not stored in database (expensive, slow)
 * - Database only stores reference URL
 * 
 * authorId tracks who uploaded (accountability for inappropriate images)
 * caption provides context (e.g., "After grooming", "New collar")
 */
export const photos = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectType: text("subject_type").notNull(),
  subjectId: varchar("subject_id").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  url: text("url").notNull(),                               // S3/CDN URL
  caption: text("caption"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPhotoSchema = createInsertSchema(photos).omit({ id: true, createdAt: true });
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photos.$inferSelect;

// ============================================================================
// VOLUNTEER MANAGEMENT
// ============================================================================

/**
 * Volunteer Shifts - Tracks volunteer time and location
 * 
 * Records when and where volunteers worked:
 * - Used for volunteer hour tracking
 * - Required for some grant reporting
 * - Helps schedule coverage across locations
 * 
 * Hours field is pre-calculated (end - start) for easy reporting/summation.
 */
export const volunteerShifts = pgTable("volunteer_shifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personId: varchar("person_id").notNull().references(() => people.id, { onDelete: 'cascade' }),
  locationId: varchar("location_id").references(() => locations.id, { onDelete: 'set null' }),
  start: timestamp("start").notNull(),
  end: timestamp("end").notNull(),
  hours: integer("hours").notNull(),                        // Pre-calculated for easy reporting
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVolunteerShiftSchema = createInsertSchema(volunteerShifts).omit({ id: true, createdAt: true });
export type InsertVolunteerShift = z.infer<typeof insertVolunteerShiftSchema>;
export type VolunteerShift = typeof volunteerShifts.$inferSelect;

// ============================================================================
// INVENTORY & OPERATIONS
// ============================================================================

/**
 * Inventory Items - Track supplies and equipment
 * 
 * Manages shelter supplies:
 * - Food, medicine, cleaning supplies
 * - Equipment (leashes, crates, toys)
 * 
 * THRESHOLD ALERTS:
 * When qty < threshold, system can alert staff to reorder.
 * 
 * SKU field for integration with purchasing systems.
 */
export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  sku: text("sku"),                                         // Stock keeping unit
  qty: integer("qty").notNull().default(0),
  unit: text("unit"),                                       // e.g., "bags", "bottles", "each"
  threshold: integer("threshold"),                          // Alert when qty falls below this
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({ id: true, createdAt: true });
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;

// ============================================================================
// REPORTING & INTEGRATIONS
// ============================================================================

/**
 * Report Jobs - Async report generation tracking
 * 
 * For long-running reports that can't be generated in real-time:
 * - Monthly/annual statistics
 * - CSV exports
 * - PDF certificates
 * 
 * WORKFLOW:
 * 1. User requests report → job created with status='pending'
 * 2. Background worker picks up job
 * 3. Report generated and uploaded to S3
 * 4. status='completed', outputUrl set
 * 5. User downloads from outputUrl
 */
export const reportJobs = pgTable("report_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),                             // e.g., "monthly_stats", "adoption_certificates"
  params: jsonb("params").default('{}'),                    // Report parameters: { month: "2024-01", includePhotos: true }
  status: text("status").notNull().default('pending'),      // pending, processing, completed, failed
  outputUrl: text("output_url"),                            // S3 URL when complete
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReportJobSchema = createInsertSchema(reportJobs).omit({ id: true, createdAt: true });
export type InsertReportJob = z.infer<typeof insertReportJobSchema>;
export type ReportJob = typeof reportJobs.$inferSelect;

/**
 * Integration Configs - Settings for external service integrations
 * 
 * Stores configuration for:
 * - Petfinder feed generation
 * - Microchip registry APIs
 * - Email service settings
 * - Payment processor credentials (encrypted)
 * 
 * Config JSONB example: { apiKey: "encrypted...", feedUrl: "...", schedule: "daily" }
 */
export const integrationConfigs = pgTable("integration_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  provider: text("provider").notNull(),                     // e.g., "petfinder", "stripe", "email_service"
  config: jsonb("config").default('{}'),                    // Provider-specific settings
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertIntegrationConfigSchema = createInsertSchema(integrationConfigs).omit({ id: true, createdAt: true });
export type InsertIntegrationConfig = z.infer<typeof insertIntegrationConfigSchema>;
export type IntegrationConfig = typeof integrationConfigs.$inferSelect;

// ============================================================================
// AUDIT & COMPLIANCE
// ============================================================================

/**
 * Audit Logs - Immutable record of all significant actions
 * 
 * Tracks WHO did WHAT and WHEN for:
 * - Compliance (required for some shelter licenses)
 * - Security (detect unauthorized access)
 * - Troubleshooting (trace how data changed)
 * 
 * ACTION examples: "create", "update", "delete", "view_sensitive"
 * ENTITY examples: "animal", "adoption", "medical_record"
 * DATA JSONB: Snapshot of what changed: { before: {...}, after: {...} }
 * 
 * actorId can be null for system-generated events (automated processes).
 */
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  actorId: varchar("actor_id").references(() => users.id, { onDelete: 'set null' }),  // Who performed action
  action: text("action").notNull(),                         // What action was performed
  entity: text("entity").notNull(),                         // What type of entity
  entityId: varchar("entity_id"),                           // Specific entity ID
  data: jsonb("data").default('{}'),                        // Additional context/snapshot
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ============================================================================
// RELATIONS - Define how tables connect to each other
// ============================================================================
// These relations enable Drizzle ORM to perform efficient joins and eager loading.
// They don't create database constraints - just inform the ORM about relationships.

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(memberships),
  animals: many(animals),
  people: many(people),
  locations: many(locations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
  notes: many(notes),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
  organization: one(organizations, { fields: [memberships.organizationId], references: [organizations.id] }),
}));

export const animalsRelations = relations(animals, ({ one, many }) => ({
  organization: one(organizations, { fields: [animals.organizationId], references: [organizations.id] }),
  location: one(locations, { fields: [animals.locationId], references: [locations.id] }),
  kennel: one(kennels, { fields: [animals.kennelId], references: [kennels.id] }),
  intake: one(intakes),
  outcomes: many(outcomes),
  medicalRecords: many(medicalRecords),
  medicalSchedule: many(medicalSchedule),
  applications: many(applications),
  fosterAssignments: many(fosterAssignments),
  adoptions: many(adoptions),
}));

export const peopleRelations = relations(people, ({ one, many }) => ({
  organization: one(organizations, { fields: [people.organizationId], references: [organizations.id] }),
  applications: many(applications),
  fosterAssignments: many(fosterAssignments),
  adoptions: many(adoptions),
  volunteerShifts: many(volunteerShifts),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  animal: one(animals, { fields: [applications.animalId], references: [animals.id] }),
  person: one(people, { fields: [applications.personId], references: [people.id] }),
}));
