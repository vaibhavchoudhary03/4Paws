import { storage } from "./storage";
import { type User } from "@shared/schema";
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await storage.getUserByEmail(email);
  if (!user) return null;
  
  const valid = await verifyPassword(password, user.password);
  if (!valid) return null;
  
  return user;
}

export function getUserFromSession(session: any): User | null {
  return session?.user || null;
}
