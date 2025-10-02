/**
 * APP.TSX - React application root component
 * 
 * ARCHITECTURE OVERVIEW:
 * This is the main entry point for the React frontend. It sets up:
 * 
 * 1. ROUTING (Wouter):
 *    - Client-side routing without page reloads
 *    - URL-based navigation between features
 *    - Dynamic routes for detail pages (e.g., /animals/:id)
 * 
 * 2. STATE MANAGEMENT (TanStack Query):
 *    - Server state caching and synchronization
 *    - Automatic background refetching
 *    - Optimistic updates and invalidation
 * 
 * 3. UI PROVIDERS:
 *    - Toaster: Global toast notifications
 *    - Tooltip: Hover tooltips throughout app
 * 
 * COMPONENT HIERARCHY:
 * App (this file)
 * └─ QueryClientProvider (React Query context)
 *    └─ TooltipProvider (Radix UI tooltips)
 *       ├─ Toaster (Toast notifications)
 *       └─ Router (Route matching and rendering)
 *          └─ [Page Components] (Dashboard, Animals, etc.)
 *             └─ AppLayout (Sidebar, header, content area)
 * 
 * ROUTING STRATEGY:
 * - Public routes: / and /login (authentication pages)
 * - Protected routes: All others (require authentication)
 * - Route protection happens in individual pages (check for user session)
 * - 404 handling: Catch-all route at the end
 * 
 * WHY WOUTER INSTEAD OF REACT ROUTER?
 * - Lightweight (1.5KB vs 10KB)
 * - Simpler API for basic routing needs
 * - Built-in TypeScript support
 * - Sufficient for single-tenant SPA
 */

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";

// Page imports - Each represents a major application feature
import NotFound from "./pages/not-found";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import AnimalsIndex from "./pages/animals/index";
import AnimalDetail from "./pages/animals/[id]";
import IntakeWizard from "./pages/intake/wizard";
import MedicalIndex from "./pages/medical/index";
import AdoptionsPipeline from "./pages/adoptions/pipeline";
import FostersPortal from "./pages/fosters/portal";
import VolunteersPortal from "./pages/volunteers/portal";
import ReportsIndex from "./pages/reports/index";
import PeopleIndex from "./pages/people/index";

/**
 * Router Component - Defines all application routes
 * 
 * ROUTE ORGANIZATION:
 * Routes ordered by specificity (most specific first):
 * 1. Exact matches (/, /login)
 * 2. Dynamic routes (/animals/:id)
 * 3. Base routes (/animals, /medical)
 * 4. Catch-all (404)
 * 
 * ROUTE GROUPS:
 * 
 * AUTHENTICATION:
 * - / → Login (root redirects to login)
 * - /login → Login page
 * 
 * CORE WORKFLOWS:
 * - /dashboard → Main dashboard (metrics, recent activity)
 * - /animals → Animal list (grid view with filters)
 * - /animals/:id → Animal detail (full profile, medical, applications)
 * - /intake → Intake wizard (multi-step form for new animals)
 * 
 * MEDICAL:
 * - /medical → Medical task dashboard (today's tasks, batch actions)
 * 
 * ADOPTION PROCESS:
 * - /adoptions → Application pipeline (Kanban board)
 * 
 * PORTALS (Role-specific views):
 * - /fosters → Foster portal (assigned animals, submit updates)
 * - /volunteers → Volunteer portal (log activities)
 * 
 * MANAGEMENT:
 * - /people → People directory (adopters, fosters, volunteers)
 * - /reports → Analytics dashboard (metrics, CSV exports)
 * 
 * ERROR HANDLING:
 * - 404 → Not Found page (catch-all route)
 * 
 * ROUTE PROTECTION:
 * Authentication checks happen within each page component.
 * Pages call useQuery({ queryKey: ['/api/v1/auth/me'] }) to verify session.
 * If not authenticated, pages redirect to /login using useLocation hook.
 * 
 * DYNAMIC ROUTES:
 * /animals/:id uses URL parameter to load specific animal.
 * Component accesses ID via: const [_, params] = useRoute('/animals/:id')
 */
function Router() {
  return (
    <Switch>
      {/* Authentication routes - Public access */}
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      
      {/* Main dashboard - First page after login */}
      <Route path="/dashboard" component={Dashboard} />
      
      {/* Animal management routes - Core functionality */}
      <Route path="/animals/:id" component={AnimalDetail} />  {/* Must be before /animals */}
      <Route path="/animals" component={AnimalsIndex} />
      <Route path="/intake" component={IntakeWizard} />
      
      {/* Medical management - Scheduling and compliance */}
      <Route path="/medical" component={MedicalIndex} />
      
      {/* Adoption workflow - Application processing */}
      <Route path="/adoptions" component={AdoptionsPipeline} />
      
      {/* Portal routes - Role-specific interfaces */}
      <Route path="/fosters" component={FostersPortal} />
      <Route path="/volunteers" component={VolunteersPortal} />
      
      {/* Management and reporting */}
      <Route path="/people" component={PeopleIndex} />
      <Route path="/reports" component={ReportsIndex} />
      
      {/* Catch-all route - 404 handling (must be last) */}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * App Component - Application root
 * 
 * PROVIDER LAYERS:
 * 
 * 1. QueryClientProvider (Outermost):
 *    - Provides React Query client to entire app
 *    - Enables data fetching, caching, and synchronization
 *    - All useQuery and useMutation hooks need this context
 * 
 * 2. TooltipProvider (Radix UI):
 *    - Required for Radix tooltip components to work
 *    - Manages tooltip positioning and delays
 *    - Used throughout UI for help text and explanations
 * 
 * 3. Toaster (shadcn/ui):
 *    - Global toast notification system
 *    - Success/error messages appear in bottom-right corner
 *    - Triggered via useToast() hook from any component
 * 
 * 4. Router:
 *    - Renders appropriate page based on URL
 *    - Handles navigation between features
 *    - Supports browser back/forward buttons
 * 
 * WHY THIS ORDER?
 * - QueryClient must be outermost (all components need data access)
 * - TooltipProvider wraps UI components that use tooltips
 * - Toaster renders globally (doesn't matter where it sits)
 * - Router renders the matched page component
 * 
 * DATA FLOW:
 * User navigates → Router matches URL → Page component renders →
 * Page calls useQuery → QueryClient fetches from cache or API →
 * Data renders → User interacts → useMutation updates data →
 * QueryClient invalidates cache → Background refetch → UI updates
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;