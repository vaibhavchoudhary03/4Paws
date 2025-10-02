/**
 * ANIMALS INDEX PAGE - Main animal directory with grid view
 * 
 * PURPOSE:
 * Central hub for viewing and searching all animals in care.
 * Provides quick overview of entire animal population with filtering.
 * 
 * KEY FEATURES:
 * 1. GRID VIEW
 *    - Card-based layout with animal photos
 *    - Status badges (available, fostered, hold, adopted)
 *    - Quick info: breed, sex, kennel, intake date
 * 
 * 2. SEARCH & FILTERS
 *    - Text search by name or ID
 *    - Filter by species (dog, cat, etc.)
 *    - Filter by status (available, fostered, hold)
 * 
 * 3. QUICK ACTIONS
 *    - Click card to view full animal profile
 *    - "Add Animal" button launches intake wizard
 * 
 * USER WORKFLOWS:
 * - Staff: Browse animals, check kennels, find specific animal
 * - Admins: Monitor population, identify available animals
 * - Future: Fosters view their assigned animals
 * 
 * TECHNICAL NOTES:
 * - Currently filters are UI-only (not functional)
 * - All data loaded at once (no pagination yet)
 * - Photos shown as placeholders (no image handling yet)
 * 
 * FUTURE ENHANCEMENTS:
 * - Implement actual filtering logic
 * - Add pagination for large animal counts
 * - Photo upload and display
 * - Bulk actions (batch status updates)
 * - Saved searches and views
 */

import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import { animalsApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, Calendar, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AnimalsIndex() {
  // ============================================================================
  // DATA FETCHING - Load all animals for current organization
  // ============================================================================
  
  /**
   * QUERY: Animals list
   * 
   * Fetches all animals belonging to current organization.
   * Backend automatically scopes by organizationId from session.
   * 
   * LOADING STATE:
   * isLoading used to show spinner while data fetches.
   * On first load, shows loading indicator.
   * Subsequent visits may use cached data (instant display).
   * 
   * CACHING:
   * Data shared with dashboard and other pages.
   * Invalidated after animal updates (create, edit, delete).
   */
  const { data: animals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/animals"],
  });

  // ============================================================================
  // HELPER FUNCTIONS - UI utilities for consistent styling
  // ============================================================================
  
  /**
   * Get status badge color based on animal status
   * 
   * STATUS MEANINGS:
   * - available: Ready for adoption (green)
   * - fostered: Temporarily with foster family (yellow)
   * - hold: Not available (on hold for various reasons)
   * - adopted: Successfully placed (gray, mostly for historical view)
   * 
   * COLOR SYSTEM:
   * Uses Tailwind utility classes with theme colors.
   * Colors match status badges throughout application.
   * 
   * @param status - Current animal status
   * @returns Tailwind class string for badge styling
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success/10 text-success';  // Green (positive, ready)
      case 'fostered': return 'bg-secondary/20 text-secondary-foreground';  // Yellow (temporary)
      case 'hold': return 'bg-warning/20 text-warning';  // Orange (caution)
      default: return 'bg-muted text-muted-foreground';  // Gray (neutral/archived)
    }
  };

  return (
    <AppLayout title="Animals" subtitle={`${animals.length} animals in care`}>
      {/* ========================================================================
          SEARCH AND FILTER BAR - Tools to narrow down animal list
          ======================================================================== */}
      
      {/**
       * Filter controls card
       * 
       * LAYOUT:
       * - Mobile: Stacked (vertical)
       * - Desktop: Horizontal row
       * 
       * CONTROLS:
       * 1. Text search input (by name/ID)
       * 2. Species dropdown filter
       * 3. Status dropdown filter
       * 4. Add Animal button
       * 
       * CURRENT STATE:
       * Filters are cosmetic only (don't filter results yet).
       * Search input doesn't filter displayed animals.
       * 
       * FUTURE IMPLEMENTATION:
       * - Add state management for filter values
       * - Filter animals array based on selections
       * - Debounce text search for performance
       * - URL params for bookmarkable filters
       */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* TEXT SEARCH INPUT */}
            {/**
             * Search by name or ID
             * 
             * TODO: Connect to filter state
             * TODO: Implement debounced search (300ms delay)
             * TODO: Highlight matching text in results
             */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search by name or ID..." 
                className="pl-10"
                data-testid="input-search-animals"
              />
            </div>
            
            {/* SPECIES FILTER DROPDOWN */}
            {/**
             * Filter by animal species
             * 
             * OPTIONS:
             * - All Species (default, shows everything)
             * - Dogs
             * - Cats
             * 
             * TODO: Add more species (rabbits, birds, etc.)
             * TODO: Connect to filter state
             */}
            <Select defaultValue="all-species">
              <SelectTrigger className="w-full lg:w-[180px]" data-testid="select-species">
                <SelectValue placeholder="All Species" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-species">All Species</SelectItem>
                <SelectItem value="dog">Dogs</SelectItem>
                <SelectItem value="cat">Cats</SelectItem>
              </SelectContent>
            </Select>
            
            {/* STATUS FILTER DROPDOWN */}
            {/**
             * Filter by availability status
             * 
             * OPTIONS:
             * - All Status (default, shows everything)
             * - Available (ready for adoption)
             * - Fostered (with foster families)
             * - On Hold (not available)
             * 
             * COMMON USE CASES:
             * - Staff: Filter to "Available" for adoption listings
             * - Foster coordinators: Filter to "Fostered"
             * 
             * TODO: Connect to filter state
             */}
            <Select defaultValue="all-status">
              <SelectTrigger className="w-full lg:w-[180px]" data-testid="select-status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="fostered">Fostered</SelectItem>
                <SelectItem value="hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            
            {/* ADD ANIMAL ACTION */}
            {/**
             * Primary action button
             * 
             * NAVIGATES TO: /intake (intake wizard)
             * 
             * TODO: Connect navigation handler
             * TODO: Check user permissions (staff/admin only)
             */}
            <Button data-testid="button-add-animal">
              <Plus className="w-4 h-4 mr-2" />
              Add Animal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================
          ANIMAL GRID - Card-based display of all animals
          ======================================================================== */}
      
      {/**
       * Conditional rendering based on data state
       * 
       * THREE STATES:
       * 1. Loading: Show spinner while fetching data
       * 2. Empty: Show friendly message if no animals exist
       * 3. Data: Show grid of animal cards
       */}
      
      {/* STATE 1: LOADING */}
      {/**
       * Loading spinner
       * 
       * SHOWS WHEN:
       * - Initial page load (no cached data)
       * - Background refetch (if cache invalidated)
       * 
       * DESIGN:
       * Simple rotating spinner with primary color.
       * Centered in page for focus.
       */}
      {isLoading ? (
        <div className="text-center py-12" data-testid="loading-animals">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : 
      
      /* STATE 2: EMPTY - No animals in system */
      animals.length === 0 ? (
        /**
         * Empty state message
         * 
         * SHOWS WHEN:
         * - New organization with no animals added yet
         * - All animals archived/removed
         * 
         * ENCOURAGES ACTION:
         * Friendly message prompts user to add first animal.
         * 
         * FUTURE ENHANCEMENT:
         * Add "Import Animals" option for CSV bulk upload.
         */
        <Card>
          <CardContent className="py-12 text-center" data-testid="empty-animals">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-foreground mb-2">No animals found</p>
            <p className="text-sm text-muted-foreground">Start by adding your first animal to the system</p>
          </CardContent>
        </Card>
      ) : 
      
      /* STATE 3: DATA - Show animal grid */
      (
        /**
         * Responsive grid layout
         * 
         * BREAKPOINTS:
         * - Mobile: 1 column
         * - Tablet (sm): 2 columns
         * - Desktop (lg): 3 columns
         * - Large desktop (xl): 4 columns
         * 
         * CARD INTERACTIONS:
         * - Hover: Shadow elevation increases
         * - Click: Navigate to animal detail page
         * 
         * CARD CONTENT:
         * - Photo (or placeholder)
         * - Name and breed
         * - Status badge
         * - Location (kennel)
         * - Intake date
         */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {animals.map((animal: any) => (
            <Card key={animal.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" data-testid={`card-animal-${animal.id}`}>
              {/* PHOTO SECTION */}
              {/**
               * Animal photo area
               * 
               * CURRENT STATE: Placeholder icon
               * 
               * FUTURE IMPLEMENTATION:
               * - Display animal.photos[0] (primary photo)
               * - Fallback to placeholder if no photo
               * - Image optimization (thumbnails)
               * - Lazy loading for performance
               * 
               * TODO: Replace with actual image tag
               * <img src={animal.photos?.[0]} alt={animal.name} />
               */}
              <div className="w-full h-48 bg-muted flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-12 h-12 text-muted-foreground">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                </svg>
              </div>
              
              {/* INFO SECTION */}
              <CardContent className="p-4">
                {/* NAME AND STATUS ROW */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    {/* Animal name (primary identifier) */}
                    <h3 className="font-semibold text-foreground" data-testid={`text-name-${animal.name}`}>{animal.name}</h3>
                    {/* Breed and sex (secondary info) */}
                    <p className="text-sm text-muted-foreground">{animal.breed} • {animal.sex}</p>
                  </div>
                  {/* Status badge (color-coded) */}
                  <Badge className={getStatusColor(animal.status)} data-testid={`badge-status-${animal.id}`}>
                    {animal.status}
                  </Badge>
                </div>
                
                {/* METADATA ROW */}
                {/**
                 * Location and date info
                 * 
                 * SHOWS:
                 * - Kennel location (where animal is housed)
                 * - Intake date (when animal entered shelter)
                 * 
                 * ICONS:
                 * MapPin for location, Calendar for date.
                 * Provides visual scanning without reading.
                 */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{animal.kennelId || 'No kennel'}</span>
                  <span>•</span>
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(animal.intakeDate).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
