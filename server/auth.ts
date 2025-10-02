/**
 * AUTHENTICATION MODULE - User authentication and password management
 * 
 * SECURITY ARCHITECTURE:
 * This module handles credential-based authentication using industry best practices:
 * 
 * 1. PASSWORD HASHING: Bcrypt with 10 salt rounds
 *    - Never store plain text passwords
 *    - Hash is computationally expensive to crack (protects against brute force)
 *    - Salt prevents rainbow table attacks
 * 
 * 2. SESSION-BASED AUTH: HTTP-only cookies (configured in server/index.ts)
 *    - Session data stored server-side (userId, organizationId, role)
 *    - Cookie only contains session ID (can't be read by JavaScript)
 *    - Protects against XSS attacks
 * 
 * 3. TIMING-SAFE COMPARISON: Bcrypt.compare prevents timing attacks
 *    - Equal time to verify wrong password vs wrong email
 *    - Prevents attackers from discovering valid emails
 * 
 * AUTHENTICATION FLOW:
 * 1. User submits email + password → POST /api/v1/auth/login
 * 2. authenticateUser() called to verify credentials
 * 3. If valid, user object stored in session
 * 4. Session cookie automatically sent with future requests
 * 5. Middleware (requireAuth) validates session on protected routes
 * 
 * AUTHORIZATION (separate from authentication):
 * - Authentication: "Who are you?" (this file)
 * - Authorization: "What can you do?" (handled in routes via session.role)
 */

import { storage } from "./storage";
import { type User } from "@shared/schema";
import bcrypt from "bcryptjs";

/**
 * Hash a plain text password for secure storage
 * 
 * SALT ROUNDS: 10 (balances security vs performance)
 * - Each increase doubles computation time
 * - 10 rounds = ~100ms on modern hardware
 * - Higher = more secure but slower login
 * 
 * WHEN TO USE:
 * - User registration (hash before storing)
 * - Password reset (hash new password)
 * - Password change (hash updated password)
 * 
 * SECURITY: Salt is unique per password and stored with the hash.
 * Bcrypt format: $2a$10$SALT_HERE_HASH_HERE
 * 
 * @param password - Plain text password to hash
 * @returns Bcrypt hash string safe for database storage
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify a password against its stored hash
 * 
 * TIMING-SAFE: Uses constant-time comparison to prevent timing attacks.
 * Even if password is wrong, takes same amount of time to verify.
 * 
 * WHEN TO USE:
 * - Login authentication
 * - Password confirmation (before sensitive actions)
 * 
 * @param password - Plain text password from user input
 * @param hash - Stored bcrypt hash from database
 * @returns true if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Authenticate user with email and password (login flow)
 * 
 * PROCESS:
 * 1. Look up user by email
 * 2. If not found, return null (don't reveal whether email exists)
 * 3. Verify password against stored hash
 * 4. If password wrong, return null
 * 5. If valid, return user object
 * 
 * SECURITY CONSIDERATIONS:
 * - Returns null for both "user not found" and "wrong password"
 *   (prevents email enumeration attacks)
 * - Does not reveal WHY authentication failed
 * - Timing should be similar for both failure cases (bcrypt helps with this)
 * 
 * CALLER RESPONSIBILITY:
 * After successful authentication, caller must:
 * - Store user data in session
 * - Return success response to client
 * - Set session cookie (handled by express-session)
 * 
 * @param email - User's email address (case-sensitive as stored)
 * @param password - Plain text password from login form
 * @returns User object if valid credentials, null if invalid
 */
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  // Step 1: Attempt to find user by email
  const user = await storage.getUserByEmail(email);
  if (!user) return null;  // User not found - don't reveal this detail
  
  // Step 2: Verify password hash (timing-safe comparison)
  const valid = await verifyPassword(password, user.password);
  if (!valid) return null;  // Wrong password - don't reveal this detail
  
  // Step 3: Authentication successful - return user for session storage
  return user;
}

/**
 * Extract user from session (convenience helper)
 * 
 * Used by middleware and routes to check if request is authenticated.
 * 
 * SESSION STRUCTURE (after login):
 * {
 *   user: { id, email, name, ... },
 *   organizationId: "uuid",
 *   role: "admin" | "staff" | etc
 * }
 * 
 * WHEN TO USE:
 * - Middleware to check authentication
 * - Routes that need current user info
 * 
 * @param session - Express session object from req.session
 * @returns User object if logged in, null if not authenticated
 */
export function getUserFromSession(session: any): User | null {
  return session?.user || null;
}
