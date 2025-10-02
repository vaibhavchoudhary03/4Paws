import { jsonb, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { appSchema } from "./AppSchema.drizzle";
import { UsersDatabaseSchema } from "./User.drizzle";

// Create an enum for system event types
export const systemEventTypeEnum = appSchema.enum("system_event_type", [
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "user_role_created",
  "user_role_updated",
  "user_created",
  "user_updated",
  "user_deleted",
]);

export const SystemEventsDatabaseSchema = appSchema.table("system_events", {
  id: uuid("id").primaryKey(),
  eventType: systemEventTypeEnum("event_type").notNull(),
  userId: uuid("user_id").references(() => UsersDatabaseSchema.id, {
    onDelete: "set null",
  }),
  actorId: text("actor_id"), // Removed foreign key - can be any identifier (user ID, "stripe", "system", etc.)
  entityId: text("entity_id"), // ID of the entity being acted upon (e.g., subscription ID)
  entityType: text("entity_type"), // Type of entity (e.g., "subscription", "user", "user_role")
  properties: jsonb("properties").notNull().default({}), // Additional event-specific data
  description: text("description"), // Human-readable description of the event
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
