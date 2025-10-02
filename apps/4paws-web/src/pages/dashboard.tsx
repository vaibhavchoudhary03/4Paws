/**
 * DASHBOARD PAGE - Main landing page after login
 * 
 * PURPOSE:
 * Provides at-a-glance overview of shelter operations:
 * - Animal population statistics
 * - Medical task alerts
 * - Today's priorities
 * 
 * DATA SOURCES:
 * - Animals list (/api/v1/animals) - for population stats
 * - Medical schedule (/api/v1/medical/schedule) - for task management
 * 
 * KEY FEATURES:
 * 1. QUICK STATS CARDS
 *    - Total animals in care
 *    - Available for adoption
 *    - In foster homes
 *    - Overdue medical tasks
 * 
 * 2. ALERT SYSTEM
 *    - Shows warnings for overdue tasks
 *    - Actionable buttons to resolve issues
 * 
 * 3. TODAY'S TASKS PREVIEW
 *    - Lists up to 5 medical tasks
 *    - Quick complete actions
 *    - Batch selection capabilities
 * 
 * USER FLOW:
 * Login → Dashboard (this page) → Navigate to specific sections
 * 
 * DESIGN PATTERN:
 * - Real-time calculations (no cached metrics)
 * - Client-side filtering and counting
 * - Optimistic loading with skeletons
 * 
 * FUTURE ENHANCEMENTS:
 * - Recent adoptions timeline
 * - Volunteer activity feed
 * - Quick action shortcuts (intake animal, schedule task)
 */

import { useQuery } from "@tanstack/react-query";
import AppLayout from "../components/layout/app-layout";
import { medicalApi, animalsApi } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dog, Stethoscope, HeartHandshake, HeartPulse, TrendingUp, AlertTriangle, Calendar, CheckCircle } from "lucide-react";

export default function Dashboard() {
  // ============================================================================
  // DATA FETCHING - Load animals and medical tasks
  // ============================================================================
  
  /**
   * QUERY: Animals list
   * 
   * Used to calculate:
   * - Total animal count
   * - Available for adoption count
   * - In foster count
   * 
   * CACHING:
   * Data cached by React Query until invalidated.
   * Shared with animals list page (same queryKey).
   */
  const { data: animals = [] } = useQuery({
    queryKey: ["animals"],
    queryFn: animalsApi.getAll,
  });

  /**
   * QUERY: Medical tasks
   * 
   * Used to:
   * - Count overdue tasks
   * - Display today's task list
   * - Show completion checkboxes
   * 
   * CACHING:
   * Shared with medical dashboard page.
   * Invalidated after task updates.
   */
  const { data: medicalTasks = [] } = useQuery({
    queryKey: ["medical-tasks"],
    queryFn: medicalApi.getTasks,
  });

  // ============================================================================
  // STATISTICS CALCULATION - Real-time metrics from raw data
  // ============================================================================
  
  /**
   * Calculate dashboard statistics
   * 
   * WHY CLIENT-SIDE CALCULATION?
   * - Data already loaded for other purposes
   * - No need for separate metrics API call
   * - Always accurate (no stale cached metrics)
   * - Filtering logic is simple
   * 
   * OVERDUE LOGIC:
   * Task is overdue if:
   * - Status = 'scheduled' (not done/missed)
   * - dueDate < today (past due)
   * 
   * NOTE: Using new Date() for "now" comparison means
   * overdue count updates as user stays on page overnight.
   */
  const stats = {
    // Total animals currently in care (all statuses)
    totalAnimals: animals.length,
    
    // Animals ready for adoption (status = 'available')
    available: animals.filter((a: any) => a.status === 'available').length,
    
    // Animals temporarily with foster families (status = 'fostered')
    fostered: animals.filter((a: any) => a.status === 'fostered').length,
    
    // Medical tasks that are past their due date
    overdueTasks: medicalTasks.filter((t: any) => 
      t.status === 'scheduled' && new Date(t.dueDate) < new Date()
    ).length,
  };

  return (
    <AppLayout title="Dashboard" subtitle="Welcome back! Here's what's happening today.">
      {/* ========================================================================
          QUICK STATS GRID - Four key metrics in card layout
          ======================================================================== */}
      
      {/**
       * Grid layout:
       * - Mobile: 1 column (stacked)
       * - Tablet: 2 columns
       * - Desktop: 4 columns (all in one row)
       * 
       * Each card shows:
       * - Metric name
       * - Icon
       * - Large number (primary value)
       * - Supporting text or context
       * 
       * Color coding:
       * - Primary (orange): Total animals
       * - Success (green): Available
       * - Secondary (yellow): Fostered
       * - Warning/Destructive: Overdue tasks
       */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* CARD 1: Total Animals in Care */}
        <Card data-testid="card-stat-total">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Animals in Care</p>
              <Dog className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground" data-testid="text-total-animals">{stats.totalAnimals}</p>
            <p className="text-xs text-success mt-2">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              Active animals
            </p>
          </CardContent>
        </Card>

        {/* CARD 2: Available for Adoption */}
        <Card data-testid="card-stat-available">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Available</p>
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <p className="text-3xl font-bold text-foreground" data-testid="text-available-animals">{stats.available}</p>
            <p className="text-xs text-muted-foreground mt-2">Ready for adoption</p>
          </CardContent>
        </Card>

        {/* CARD 3: In Foster Homes */}
        <Card data-testid="card-stat-fostered">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">In Foster</p>
              <HeartPulse className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-3xl font-bold text-foreground" data-testid="text-fostered-animals">{stats.fostered}</p>
            <p className="text-xs text-muted-foreground mt-2">With fosters</p>
          </CardContent>
        </Card>

        {/* CARD 4: Overdue Medical Tasks - Requires Attention */}
        <Card data-testid="card-stat-overdue">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Medical Tasks Due</p>
              <Stethoscope className="w-5 h-5 text-warning" />
            </div>
            <p className="text-3xl font-bold text-foreground" data-testid="text-overdue-tasks">{stats.overdueTasks}</p>
            <p className="text-xs text-destructive mt-2">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              {stats.overdueTasks} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================
          ALERT BANNER - Shows critical issues needing immediate attention
          ======================================================================== */}
      
      {/**
       * Conditional alert for overdue medical tasks
       * 
       * VISIBILITY LOGIC:
       * Only shows if stats.overdueTasks > 0
       * 
       * USER ACTION:
       * "View All" button navigates to medical dashboard
       * where staff can batch-complete or reschedule tasks
       * 
       * DESIGN:
       * - Red/destructive color scheme (urgent)
       * - Alert triangle icon for visual attention
       * - Prominent placement (above task list)
       * 
       * FUTURE ENHANCEMENTS:
       * - Click to expand overdue task list inline
       * - Quick "Mark All Done" action
       * - Dismissible alerts with preferences
       */}
      {stats.overdueTasks > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start space-x-3 mb-6" data-testid="alert-overdue-tasks">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-destructive">
              {stats.overdueTasks} Overdue Medical Tasks
            </p>
            <p className="text-sm text-destructive/80 mt-1">
              Medical schedules need immediate attention
            </p>
          </div>
          <Button variant="outline" size="sm" className="text-destructive border-destructive" data-testid="button-view-overdue">
            View All
          </Button>
        </div>
      )}

      {/* ========================================================================
          TODAY'S MEDICAL TASKS - Preview of scheduled work
          ======================================================================== */}
      
      {/**
       * Medical task list card
       * 
       * SHOWS:
       * - First 5 tasks (most recent/urgent)
       * - Task checkboxes for batch selection
       * - Animal name and task type
       * - Status badge (scheduled/done/missed)
       * - Quick "Mark Done" button
       * 
       * FEATURES:
       * - Checkbox selection (foundation for batch actions)
       * - Hover effects for interactivity
       * - Empty state with helpful message
       * - Link to full medical dashboard
       * 
       * BATCH ACTIONS:
       * "Batch Actions" button currently non-functional.
       * Future: Enable batch mark done, reschedule, assign.
       * 
       * LIMITATION:
       * Only shows first 5 tasks.
       * User must visit medical dashboard for complete list.
       */}
      <Card data-testid="card-medical-tasks">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Today's Medical Tasks</CardTitle>
              <p className="text-sm text-muted-foreground mt-1" data-testid="text-tasks-count">
                {medicalTasks.length} tasks
              </p>
            </div>
            <Button variant="outline" size="sm" data-testid="button-batch-actions">Batch Actions</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {/* EMPTY STATE: No tasks scheduled */}
            {medicalTasks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground" data-testid="empty-tasks">
                <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No medical tasks scheduled</p>
              </div>
            ) : (
              /* TASK LIST: Show first 5 tasks */
              medicalTasks.slice(0, 5).map((task: any) => (
                <div key={task.id} className="p-4 hover:bg-accent/50 transition-colors" data-testid={`task-${task.id}`}>
                  <div className="flex items-start gap-4">
                    {/* Checkbox for batch selection (not currently functional) */}
                    <input type="checkbox" className="mt-1 w-5 h-5 rounded border-input text-primary" data-testid={`checkbox-task-${task.id}`} />
                    
                    {/* Task details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          {/* Animal name (from joined data) */}
                          <p className="font-medium text-foreground" data-testid={`text-animal-${task.animal?.name}`}>
                            {task.animal?.name || 'Unknown'}
                          </p>
                          {/* Task type and notes */}
                          <p className="text-sm text-muted-foreground">{task.type} - {task.notes}</p>
                        </div>
                        {/* Status badge (color-coded) */}
                        <Badge variant={task.status === 'scheduled' ? 'secondary' : 'default'} data-testid={`badge-status-${task.id}`}>
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Quick action button */}
                    <Button size="sm" className="bg-success hover:bg-success/90" data-testid={`button-complete-${task.id}`}>
                      Mark Done
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
