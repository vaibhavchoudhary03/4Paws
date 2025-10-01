import { db } from "./db";
import { users, animals, organizations, memberships, people, medicalSchedule, applications, intakes, adoptions, fosterAssignments, type User, type InsertUser, type Animal, type InsertAnimal, type Organization, type InsertOrganization, type Membership, type InsertMembership, type Person, type InsertPerson, type MedicalSchedule, type InsertMedicalSchedule, type Application, type InsertApplication, type Adoption, type InsertAdoption } from "@shared/schema";
import { eq, and, desc, lte, gte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Organizations
  getOrganization(id: string): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  
  // Memberships
  getUserMemberships(userId: string): Promise<(Membership & { organization: Organization })[]>;
  createMembership(membership: InsertMembership): Promise<Membership>;
  
  // Animals
  getAnimals(organizationId: string): Promise<Animal[]>;
  getAnimal(id: string, organizationId: string): Promise<Animal | undefined>;
  createAnimal(animal: InsertAnimal): Promise<Animal>;
  updateAnimal(id: string, organizationId: string, data: Partial<InsertAnimal>): Promise<Animal>;
  
  // People
  getPeople(organizationId: string): Promise<Person[]>;
  getPerson(id: string, organizationId: string): Promise<Person | undefined>;
  createPerson(person: InsertPerson): Promise<Person>;
  
  // Medical Schedule
  getMedicalTasks(organizationId: string, filters?: { dueDate?: Date, status?: string }): Promise<(MedicalSchedule & { animal: Animal })[]>;
  createMedicalTask(task: InsertMedicalSchedule): Promise<MedicalSchedule>;
  updateMedicalTask(id: string, data: Partial<InsertMedicalSchedule>): Promise<MedicalSchedule>;
  
  // Applications
  getApplications(organizationId: string): Promise<(Application & { animal: Animal, person: Person })[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, data: Partial<InsertApplication>): Promise<Application>;
  
  // Adoptions
  createAdoption(adoption: InsertAdoption): Promise<Adoption>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org || undefined;
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const [organization] = await db.insert(organizations).values(org).returning();
    return organization;
  }

  async getUserMemberships(userId: string): Promise<(Membership & { organization: Organization })[]> {
    const result = await db.select({
      membership: memberships,
      organization: organizations,
    })
    .from(memberships)
    .leftJoin(organizations, eq(memberships.organizationId, organizations.id))
    .where(eq(memberships.userId, userId));
    
    return result.map(r => ({ ...r.membership, organization: r.organization! }));
  }

  async createMembership(membership: InsertMembership): Promise<Membership> {
    const [m] = await db.insert(memberships).values(membership).returning();
    return m;
  }

  async getAnimals(organizationId: string): Promise<Animal[]> {
    return await db.select().from(animals).where(eq(animals.organizationId, organizationId)).orderBy(desc(animals.createdAt));
  }

  async getAnimal(id: string, organizationId: string): Promise<Animal | undefined> {
    const [animal] = await db.select().from(animals).where(and(eq(animals.id, id), eq(animals.organizationId, organizationId)));
    return animal || undefined;
  }

  async createAnimal(animal: InsertAnimal): Promise<Animal> {
    const [a] = await db.insert(animals).values(animal).returning();
    return a;
  }

  async updateAnimal(id: string, organizationId: string, data: Partial<InsertAnimal>): Promise<Animal> {
    const [animal] = await db.update(animals).set(data).where(and(eq(animals.id, id), eq(animals.organizationId, organizationId))).returning();
    return animal;
  }

  async getPeople(organizationId: string): Promise<Person[]> {
    return await db.select().from(people).where(eq(people.organizationId, organizationId)).orderBy(desc(people.createdAt));
  }

  async getPerson(id: string, organizationId: string): Promise<Person | undefined> {
    const [person] = await db.select().from(people).where(and(eq(people.id, id), eq(people.organizationId, organizationId)));
    return person || undefined;
  }

  async createPerson(person: InsertPerson): Promise<Person> {
    const [p] = await db.insert(people).values(person).returning();
    return p;
  }

  async getMedicalTasks(organizationId: string, filters?: { dueDate?: Date, status?: string }): Promise<(MedicalSchedule & { animal: Animal })[]> {
    const conditions = [eq(animals.organizationId, organizationId)];
    
    if (filters?.dueDate) {
      conditions.push(lte(medicalSchedule.dueDate, filters.dueDate));
    }

    const result = await db.select({
      task: medicalSchedule,
      animal: animals,
    })
    .from(medicalSchedule)
    .leftJoin(animals, eq(medicalSchedule.animalId, animals.id))
    .where(and(...conditions))
    .orderBy(medicalSchedule.dueDate);
    
    return result.map(r => ({ ...r.task, animal: r.animal! }));
  }

  async createMedicalTask(task: InsertMedicalSchedule): Promise<MedicalSchedule> {
    const [t] = await db.insert(medicalSchedule).values(task).returning();
    return t;
  }

  async updateMedicalTask(id: string, data: Partial<InsertMedicalSchedule>): Promise<MedicalSchedule> {
    const [task] = await db.update(medicalSchedule).set(data).where(eq(medicalSchedule.id, id)).returning();
    return task;
  }

  async getApplications(organizationId: string): Promise<(Application & { animal: Animal, person: Person })[]> {
    const result = await db.select({
      application: applications,
      animal: animals,
      person: people,
    })
    .from(applications)
    .leftJoin(animals, eq(applications.animalId, animals.id))
    .leftJoin(people, eq(applications.personId, people.id))
    .where(eq(animals.organizationId, organizationId))
    .orderBy(desc(applications.createdAt));

    return result.map(r => ({ ...r.application, animal: r.animal!, person: r.person! }));
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [app] = await db.insert(applications).values(application).returning();
    return app;
  }

  async updateApplication(id: string, data: Partial<InsertApplication>): Promise<Application> {
    const [app] = await db.update(applications).set(data).where(eq(applications.id, id)).returning();
    return app;
  }

  async createAdoption(adoption: InsertAdoption): Promise<Adoption> {
    const [a] = await db.insert(adoptions).values(adoption).returning();
    return a;
  }
}

export const storage = new DatabaseStorage();
