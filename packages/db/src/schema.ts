import { pgTable, text, timestamp, uuid, integer, boolean, jsonb, varchar } from 'drizzle-orm/pg-core';

// Organizations (Multi-tenant)
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  settings: jsonb('settings').$type<{
    theme?: string;
    features?: string[];
    contactInfo?: {
      email?: string;
      phone?: string;
      address?: string;
    };
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Users (with Supabase auth integration)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // This will match Supabase auth.users.id
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  role: varchar('role', { length: 50 }).notNull().default('volunteer'), // admin, staff, volunteer, foster, readonly
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  profile: jsonb('profile').$type<{
    phone?: string;
    address?: string;
    emergencyContact?: string;
    skills?: string[];
    availability?: string[];
  }>(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Animals
export const animals = pgTable('animals', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  species: varchar('species', { length: 50 }).notNull(), // dog, cat, etc.
  breed: varchar('breed', { length: 100 }),
  age: integer('age'), // in months
  gender: varchar('gender', { length: 20 }).notNull(), // male, female, unknown
  color: varchar('color', { length: 100 }),
  size: varchar('size', { length: 20 }), // small, medium, large
  weight: integer('weight'), // in pounds
  microchipId: varchar('microchip_id', { length: 50 }),
  status: varchar('status', { length: 50 }).notNull().default('intake'), // intake, available, adopted, foster, medical_hold, deceased
  intakeDate: timestamp('intake_date').defaultNow().notNull(),
  outcomeDate: timestamp('outcome_date'),
  outcomeType: varchar('outcome_type', { length: 50 }), // adoption, transfer, return_to_owner, deceased
  photos: jsonb('photos').$type<string[]>(),
  description: text('description'),
  behaviorNotes: text('behavior_notes'),
  medicalNotes: text('medical_notes'),
  specialNeeds: text('special_needs'),
  isSpayedNeutered: boolean('is_spayed_neutered').default(false),
  isVaccinated: boolean('is_vaccinated').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Medical Records
export const medicalRecords = pgTable('medical_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // vaccination, treatment, surgery, checkup
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  veterinarian: varchar('veterinarian', { length: 255 }),
  cost: integer('cost'), // in cents
  nextDueDate: timestamp('next_due_date'),
  isCompleted: boolean('is_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Adoptions
export const adoptions = pgTable('adoptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.id).notNull(),
  adopterId: uuid('adopter_id').references(() => users.id),
  adopterName: varchar('adopter_name', { length: 255 }).notNull(),
  adopterEmail: varchar('adopter_email', { length: 255 }).notNull(),
  adopterPhone: varchar('adopter_phone', { length: 50 }),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, approved, rejected, completed
  applicationDate: timestamp('application_date').defaultNow().notNull(),
  approvalDate: timestamp('approval_date'),
  adoptionDate: timestamp('adoption_date'),
  adoptionFee: integer('adoption_fee'), // in cents
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Fosters
export const fosters = pgTable('fosters', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.id).notNull(),
  fosterId: uuid('foster_id').references(() => users.id).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, completed, terminated
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Volunteer Activities
export const volunteerActivities = pgTable('volunteer_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  volunteerId: uuid('volunteer_id').references(() => users.id).notNull(),
  animalId: uuid('animal_id').references(() => animals.id),
  activityType: varchar('activity_type', { length: 50 }).notNull(), // walk, feed, play, clean, other
  description: text('description'),
  duration: integer('duration'), // in minutes
  date: timestamp('date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reports
export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // intake, outcome, medical, custom
  query: jsonb('query').notNull(), // The query parameters
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
