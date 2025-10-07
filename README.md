# Kirby - Animal Shelter Management System

A production-ready, multi-tenant web application for U.S. animal shelters and foster-based rescues. Built with modern web technologies for speed, reliability, and ease of use.

## Features

### Core Functionality
- **Multi-tenant Architecture**: Secure, organization-based data isolation with role-based access control (admin, staff, volunteer, foster, readonly)
- **Animal Management**: Complete intake-to-outcome workflow with photo upload, batch intake for litters, microchip tracking, and status management
- **Medical Scheduling**: Automated vaccine/treatment schedules with batch actions, due date tracking, and overdue alerts
- **Adoption Pipeline**: Kanban-style application workflow with Stripe payment integration for fees and donations
- **Foster Management**: Availability tracking, animal assignment/transfer, and self-service portal for updates
- **Volunteer Portal**: Simple activity logging (walked/fed/play), behavior notes, and QR code support
- **Reporting & Analytics**: Canned reports (intake/outcomes, LOS, compliance) and custom query builder with CSV export
- **External Integrations**: Petfinder/Adopt-a-Pet XML feeds, Stripe donations, microchip registration stubs

### Technical Highlights
- **Stack**: React + TypeScript, Express.js, PostgreSQL, Drizzle ORM, TanStack Query
- **UI**: Tailwind CSS + shadcn/ui components with orange/yellow/white brand theme
- **Authentication**: Session-based auth with bcrypt password hashing
- **Database**: Normalized PostgreSQL schema with 20+ tables, JSONB for extensible fields
- **API**: RESTful endpoints under `/api/v1` with Zod validation
- **Storage**: S3-compatible for photos (configurable, local dev fallback)

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- pnpm (recommended) or npm

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd 4paws
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   # Required
   DATABASE_URL=postgresql://user:password@localhost:5432/4paws
   SESSION_SECRET=your-secret-key-here
   
   # Optional - Stripe for payments
   STRIPE_SECRET_KEY=sk_test_...
   VITE_STRIPE_PUBLIC_KEY=pk_test_...
   