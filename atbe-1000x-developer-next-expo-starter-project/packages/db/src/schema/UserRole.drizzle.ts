import { sql } from "drizzle-orm";
import { timestamp, uuid } from "drizzle-orm/pg-core";
import { z } from "zod";
import { appSchema } from "./AppSchema.drizzle";
import { UsersDatabaseSchema } from "./User.drizzle";

// Create an enum for user roles
export const userRoleEnum = appSchema.enum("user_role", ["user", "admin"]);

// Zod schemas for UserRole
export const userRoleSchema = z.enum(["user", "admin"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userRoleRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  role: userRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: userRoleSchema.optional().default("user"),
});

export const updateUserRoleSchema = z.object({
  role: userRoleSchema,
});

export type UserRoleRecord = z.infer<typeof userRoleRecordSchema>;
export type CreateUserRole = z.infer<typeof createUserRoleSchema>;
export type UpdateUserRole = z.infer<typeof updateUserRoleSchema>;

export const convertStringToUserRole = (role: string): UserRole => {
  return role as UserRole;
};

export const UserRolesDatabaseSchema = appSchema.table("user_roles", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => UsersDatabaseSchema.id, { onDelete: "cascade" }),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
