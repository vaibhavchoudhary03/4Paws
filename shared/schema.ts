import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum('role', ['admin', 'staff', 'volunteer', 'foster', 'readonly']);
export const speciesEnum = pgEnum('species', ['dog', 'cat', 'other']);
export const animalStatusEnum = pgEnum('animal_status', ['available', 'hold', 'adopted', 'transferred', 'rto', 'euthanized', 'fostered']);
export const intakeTypeEnum = pgEnum('intake_type', ['stray', 'owner_surrender', 'transfer_in', 'confiscation', 'born_in_care']);
export const outcomeTypeEnum = pgEnum('outcome_type', ['adoption', 'transfer_out', 'return_to_owner', 'euthanasia']);
export const medicalTypeEnum = pgEnum('medical_type', ['vaccine', 'treatment', 'surgery', 'exam']);
export const medicalStatusEnum = pgEnum('medical_status', ['scheduled', 'done', 'missed']);
export const personTypeEnum = pgEnum('person_type', ['adopter', 'foster', 'volunteer', 'donor', 'staff']);
export const applicationTypeEnum = pgEnum('application_type', ['adoption', 'foster']);
export const applicationStatusEnum = pgEnum('application_status', ['received', 'review', 'approved', 'denied', 'withdrawn']);
export const fosterStatusEnum = pgEnum('foster_status', ['active', 'completed', 'failed']);
export const noteVisibilityEnum = pgEnum('note_visibility', ['staff_only', 'public_to_portal']);
export const locationTypeEnum = pgEnum('location_type', ['shelter', 'clinic', 'storage']);

// Organizations
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  settings: jsonb("settings").default('{}'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({ id: true, createdAt: true });
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;

// Users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  status: text("status").default('active'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Memberships (user-organization with roles)
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

// Locations
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

// Kennels
export const kennels = pgTable("kennels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  locationId: varchar("location_id").references(() => locations.id, { onDelete: 'set null' }),
  code: text("code").notNull(),
  size: text("size"),
  species: speciesEnum("species"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertKennelSchema = createInsertSchema(kennels).omit({ id: true, createdAt: true });
export type InsertKennel = z.infer<typeof insertKennelSchema>;
export type Kennel = typeof kennels.$inferSelect;

// Animals
export const animals = pgTable("animals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  species: speciesEnum("species").notNull(),
  breed: text("breed"),
  sex: text("sex"),
  color: text("color"),
  dobEst: timestamp("dob_est"),
  intakeDate: timestamp("intake_date").notNull().defaultNow(),
  status: animalStatusEnum("status").notNull().default('available'),
  locationId: varchar("location_id").references(() => locations.id, { onDelete: 'set null' }),
  kennelId: varchar("kennel_id").references(() => kennels.id, { onDelete: 'set null' }),
  microchip: text("microchip"),
  photos: text("photos").array(),
  description: text("description"),
  attributes: jsonb("attributes").default('{}'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnimalSchema = createInsertSchema(animals).omit({ id: true, createdAt: true });
export type InsertAnimal = z.infer<typeof insertAnimalSchema>;
export type Animal = typeof animals.$inferSelect;

// Intakes
export const intakes = pgTable("intakes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  animalId: varchar("animal_id").notNull().references(() => animals.id, { onDelete: 'cascade' }),
  type: intakeTypeEnum("type").notNull(),
  source: jsonb("source").default('{}'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertIntakeSchema = createInsertSchema(intakes).omit({ id: true, createdAt: true });
export type InsertIntake = z.infer<typeof insertIntakeSchema>;
export type Intake = typeof intakes.$inferSelect;

// Outcomes
export const outcomes = pgTable("outcomes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  animalId: varchar("animal_id").notNull().references(() => animals.id, { onDelete: 'cascade' }),
  type: outcomeTypeEnum("type").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  details: jsonb("details").default('{}'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOutcomeSchema = createInsertSchema(outcomes).omit({ id: true, createdAt: true });
export type InsertOutcome = z.infer<typeof insertOutcomeSchema>;
export type Outcome = typeof outcomes.$inferSelect;

// Medical Records
export const medicalRecords = pgTable("medical_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  animalId: varchar("animal_id").notNull().references(() => animals.id, { onDelete: 'cascade' }),
  type: medicalTypeEnum("type").notNull(),
  product: text("product"),
  dose: text("dose"),
  route: text("route"),
  dateGiven: timestamp("date_given").notNull(),
  vetId: varchar("vet_id").references(() => users.id, { onDelete: 'set null' }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({ id: true, createdAt: true });
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;

// Medical Schedule
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

// People
export const people = pgTable("people", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  type: personTypeEnum("type").notNull(),
  flags: jsonb("flags").default('{}'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPersonSchema = createInsertSchema(people).omit({ id: true, createdAt: true });
export type InsertPerson = z.infer<typeof insertPersonSchema>;
export type Person = typeof people.$inferSelect;

// Applications
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  animalId: varchar("animal_id").notNull().references(() => animals.id, { onDelete: 'cascade' }),
  personId: varchar("person_id").notNull().references(() => people.id, { onDelete: 'cascade' }),
  type: applicationTypeEnum("type").notNull(),
  status: applicationStatusEnum("status").notNull().default('received'),
  form: jsonb("form").default('{}'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, createdAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

// Foster Assignments
export const fosterAssignments = pgTable("foster_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  animalId: varchar("animal_id").notNull().references(() => animals.id, { onDelete: 'cascade' }),
  personId: varchar("person_id").notNull().references(() => people.id, { onDelete: 'cascade' }),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  status: fosterStatusEnum("status").notNull().default('active'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFosterAssignmentSchema = createInsertSchema(fosterAssignments).omit({ id: true, createdAt: true });
export type InsertFosterAssignment = z.infer<typeof insertFosterAssignmentSchema>;
export type FosterAssignment = typeof fosterAssignments.$inferSelect;

// Adoptions
export const adoptions = pgTable("adoptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  animalId: varchar("animal_id").notNull().references(() => animals.id, { onDelete: 'cascade' }),
  adopterId: varchar("adopter_id").notNull().references(() => people.id, { onDelete: 'cascade' }),
  date: timestamp("date").notNull().defaultNow(),
  feeCents: integer("fee_cents").notNull().default(0),
  donationCents: integer("donation_cents").default(0),
  contractUrl: text("contract_url"),
  paymentIntentId: text("payment_intent_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdoptionSchema = createInsertSchema(adoptions).omit({ id: true, createdAt: true });
export type InsertAdoption = z.infer<typeof insertAdoptionSchema>;
export type Adoption = typeof adoptions.$inferSelect;

// Notes
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectType: text("subject_type").notNull(),
  subjectId: varchar("subject_id").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  visibility: noteVisibilityEnum("visibility").notNull().default('staff_only'),
  body: text("body").notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true });
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

// Photos
export const photos = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectType: text("subject_type").notNull(),
  subjectId: varchar("subject_id").notNull(),
  url: text("url").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPhotoSchema = createInsertSchema(photos).omit({ id: true, createdAt: true });
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photos.$inferSelect;

// Volunteer Shifts
export const volunteerShifts = pgTable("volunteer_shifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personId: varchar("person_id").notNull().references(() => people.id, { onDelete: 'cascade' }),
  locationId: varchar("location_id").references(() => locations.id, { onDelete: 'set null' }),
  start: timestamp("start").notNull(),
  end: timestamp("end").notNull(),
  hours: integer("hours").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVolunteerShiftSchema = createInsertSchema(volunteerShifts).omit({ id: true, createdAt: true });
export type InsertVolunteerShift = z.infer<typeof insertVolunteerShiftSchema>;
export type VolunteerShift = typeof volunteerShifts.$inferSelect;

// Inventory
export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  sku: text("sku"),
  qty: integer("qty").notNull().default(0),
  unit: text("unit"),
  threshold: integer("threshold"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({ id: true, createdAt: true });
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;

// Report Jobs
export const reportJobs = pgTable("report_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),
  params: jsonb("params").default('{}'),
  status: text("status").notNull().default('pending'),
  outputUrl: text("output_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReportJobSchema = createInsertSchema(reportJobs).omit({ id: true, createdAt: true });
export type InsertReportJob = z.infer<typeof insertReportJobSchema>;
export type ReportJob = typeof reportJobs.$inferSelect;

// Integration Configs
export const integrationConfigs = pgTable("integration_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  provider: text("provider").notNull(),
  config: jsonb("config").default('{}'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertIntegrationConfigSchema = createInsertSchema(integrationConfigs).omit({ id: true, createdAt: true });
export type InsertIntegrationConfig = z.infer<typeof insertIntegrationConfigSchema>;
export type IntegrationConfig = typeof integrationConfigs.$inferSelect;

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  actorId: varchar("actor_id").references(() => users.id, { onDelete: 'set null' }),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: varchar("entity_id"),
  data: jsonb("data").default('{}'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// Relations
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
