# 4Paws - Animal Shelter Management System

## Overview

4Paws is a production-ready, multi-tenant web application designed for U.S. animal shelters and foster-based rescues. The system manages the complete lifecycle of animal care from intake through adoption, including medical scheduling, foster coordination, volunteer management, and reporting. Built with modern web technologies, it provides a fast, reliable platform with role-based access control and organization-level data isolation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18+ with TypeScript for type safety
- **Routing:** Wouter for lightweight client-side routing
- **State Management:** TanStack Query (React Query) for server state management and caching
- **UI Components:** shadcn/ui built on Radix UI primitives with Tailwind CSS for styling
- **Forms:** React Hook Form with Zod validation for type-safe form handling
- **Design System:** Custom theme using orange/yellow/white brand colors defined in CSS variables

**Component Organization:**
- Page components in `client/src/pages/` organized by feature (dashboard, animals, medical, adoptions, etc.)
- Reusable UI components in `client/src/components/ui/` following shadcn/ui patterns
- Layout components (Sidebar, MobileNav, AppLayout) for consistent application structure
- Custom business components (AnimalCard, MetricCard, EmptyState) for domain-specific UI

**Build System:**
- Vite for fast development and optimized production builds
- Path aliases for clean imports (@/, @shared/, @assets/)
- TypeScript configuration with strict mode enabled

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with Express.js framework
- **Database:** PostgreSQL with Drizzle ORM for type-safe database access
- **Database Driver:** Neon serverless PostgreSQL driver with WebSocket support
- **Authentication:** Session-based authentication using express-session with bcrypt password hashing
- **Validation:** Zod schemas for request/response validation

**API Design:**
- RESTful API structure under `/api/v1/` namespace
- Middleware-based authentication and authorization
- Organization-scoped data access enforced at the database query level
- Role-based access control (admin, staff, volunteer, foster, readonly)

**Database Schema:**
- Multi-tenant architecture with organizations table as the root
- User memberships linking users to organizations with roles
- Normalized schema with 20+ tables for animals, people, medical records, applications, adoptions, etc.
- JSONB fields for extensible custom data
- PostgreSQL enums for type-safe status fields

**Session Management:**
- HTTP-only cookies for security
- Session data includes userId and organizationId for tenant isolation
- Configurable session secret and expiration

### Data Storage Solutions

**Database:**
- Primary data store: PostgreSQL (configured via Drizzle ORM)
- Connection pooling via Neon serverless driver
- Schema migrations managed through Drizzle Kit
- Database URL configured via environment variable

**File Storage:**
- S3-compatible storage for animal photos and documents (configurable)
- Local development fallback for file uploads
- Photo URLs stored as text in database with subject-based organization

**Session Store:**
- In-memory session storage (development)
- PostgreSQL-backed sessions via connect-pg-simple (production-ready)

### Authentication and Authorization

**Authentication Flow:**
- Credential-based login with email/password
- Password hashing using bcrypt (10 rounds)
- Session-based authentication with HTTP-only cookies
- Session middleware validates userId on protected routes

**Authorization Model:**
- Multi-tenant isolation: all queries scoped to organizationId from session
- Role-based access control with five roles: admin, staff, volunteer, foster, readonly
- Middleware functions (requireAuth, requireOrg) enforce access rules
- Role-specific UI rendering and feature access

**Security Measures:**
- Passwords never stored in plain text
- Session secrets configured via environment variables
- HTTPS enforcement in production (secure cookies)
- 24-hour session expiration

### External Dependencies

**Payment Processing:**
- Stripe integration for adoption fees and donations
- Stripe API version: 2025-09-30.clover
- Public and secret keys configured via environment variables
- Checkout flow integrated into adoption pipeline

**Adoption Site Integration:**
- XML feed generation for Petfinder and Adopt-a-Pet
- Automated export of available animals with photos and details
- Stubs for microchip registration services

**Development Tools:**
- Replit-specific plugins for development environment
- Runtime error overlay for development debugging
- Cartographer and dev banner for Replit integration

**UI Component Libraries:**
- Radix UI primitives for accessible components
- Lucide React for consistent iconography
- Tailwind CSS for utility-first styling
- class-variance-authority for component variants

**Database and ORM:**
- Drizzle ORM with Neon serverless PostgreSQL driver
- WebSocket support for real-time database connections
- Drizzle Kit for schema migrations
- Drizzle Zod for automatic schema validation

**Additional Services:**
- Future integration points: Shelter Animals Count export, additional microchip registries
- CSV export functionality for reporting
- QR code support for volunteer portal access