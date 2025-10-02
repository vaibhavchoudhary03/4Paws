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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import AppLayout from "../components/layout/app-layout";
import { medicalApi, animalsApi } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dog, Stethoscope, HeartHandshake, HeartPulse, TrendingUp, AlertTriangle, Calendar, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [testRole, setTestRole] = useState<string>('admin');

  // ============================================================================
  // ROLE-BASED ACCESS CONTROL - Mock user role for now
  // ============================================================================
  
  /**
   * Mock user role - In a real app, this would come from authentication context
   * 
   * ROLES:
   * - admin: Full access to all features
   * - staff: Animal management, medical tasks, adoptions
   * - volunteer: Limited access to basic features
   * - foster: Foster-specific features only
   * - readonly: View-only access
   */
  const currentUserRole = testRole; // TODO: Replace with real auth context
  
  const canManageMedical = ['admin', 'staff'].includes(currentUserRole);
  const canManageAnimals = ['admin', 'staff'].includes(currentUserRole);
  const canViewReports = ['admin', 'staff'].includes(currentUserRole);
  const canManageAdoptions = ['admin', 'staff'].includes(currentUserRole);

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
  const { data: animals = [], isLoading: animalsLoading, error: animalsError } = useQuery({
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
  const { data: medicalTasks = [], isLoading: medicalLoading, error: medicalError } = useQuery({
    queryKey: ["medical-tasks"],
    queryFn: medicalApi.getTasks,
  });

  // Debug logging
  console.log('🔍 Dashboard Debug:', {
    medicalTasks: medicalTasks.length,
    medicalLoading,
    medicalError,
    sampleTask: medicalTasks[0]
  });

  // ============================================================================
  // MUTATIONS - Handle medical task updates
  // ============================================================================

  /**
   * MUTATION: Mark single task as done
   * 
   * Updates the medical record in Supabase and refreshes the data
   */
  const markTaskDoneMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return await medicalApi.updateTask(taskId, { is_completed: true });
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ["medical-tasks"] });
      setSelectedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      toast({
        title: "Task completed",
        description: "Medical task has been marked as done",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark task as done",
        variant: "destructive",
      });
    },
  });

  /**
   * MUTATION: Mark multiple tasks as done
   * 
   * Batch updates multiple medical records
   */
  const batchMarkDoneMutation = useMutation({
    mutationFn: async (taskIds: string[]) => {
      const promises = taskIds.map(id => 
        medicalApi.updateTask(id, { is_completed: true })
      );
      return await Promise.all(promises);
    },
    onSuccess: (_, taskIds) => {
      queryClient.invalidateQueries({ queryKey: ["medical-tasks"] });
      setSelectedTasks(new Set());
      toast({
        title: "Tasks completed",
        description: `${taskIds.length} medical tasks have been marked as done`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark tasks as done",
        variant: "destructive",
      });
    },
  });

  // ============================================================================
  // EVENT HANDLERS - User interactions
  // ============================================================================

  /**
   * Handle marking a single task as done
   */
  const handleMarkTaskDone = (taskId: string) => {
    markTaskDoneMutation.mutate(taskId);
  };

  /**
   * Handle toggling task selection for batch operations
   */
  const handleToggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  /**
   * Handle selecting all visible tasks
   */
  const handleSelectAllTasks = () => {
    const visibleTaskIds = medicalTasks.slice(0, 5).map((task: any) => task.id);
    setSelectedTasks(new Set(visibleTaskIds));
  };

  /**
   * Handle batch marking selected tasks as done
   */
  const handleBatchMarkDone = () => {
    if (selectedTasks.size === 0) {
      toast({
        title: "No tasks selected",
        description: "Please select at least one task to mark as done",
        variant: "destructive",
      });
      return;
    }
    batchMarkDoneMutation.mutate(Array.from(selectedTasks));
  };

  /**
   * Handle navigation to medical page
   */
  const handleViewAllTasks = () => {
    setLocation("/medical");
  };

  /**
   * Handle refreshing all data
   */
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["animals"] });
    queryClient.invalidateQueries({ queryKey: ["medical-tasks"] });
    toast({
      title: "Data refreshed",
      description: "Dashboard data has been updated",
    });
  };

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
      t.status === 'overdue'
    ).length,
  };

  // Show loading state if data is still loading
  if (animalsLoading || medicalLoading) {
    return (
      <AppLayout title="Dashboard" subtitle="Loading dashboard data...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show error state if there are errors
  if (animalsError || medicalError) {
    return (
      <AppLayout title="Dashboard" subtitle="Error loading dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-semibold mb-2">Error loading dashboard</p>
            <p className="text-muted-foreground">
              {animalsError?.message || medicalError?.message || 'Unknown error occurred'}
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard" subtitle="Welcome back! Here's what's happening today.">
      {/* ========================================================================
          DASHBOARD HEADER - Refresh button and quick actions
          ======================================================================== */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="text-sm text-muted-foreground">Real-time shelter statistics and tasks</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Role Switcher for Testing */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Role:</label>
            <select 
              value={testRole} 
              onChange={(e) => setTestRole(e.target.value)}
              className="px-2 py-1 text-sm border border-input rounded-md bg-background"
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="volunteer">Volunteer</option>
              <option value="foster">Foster</option>
              <option value="readonly">Read Only</option>
            </select>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={animalsLoading || medicalLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(animalsLoading || medicalLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

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
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive border-destructive" 
            data-testid="button-view-overdue"
            onClick={handleViewAllTasks}
          >
            View All
          </Button>
        </div>
      )}

      {/* ========================================================================
          TODAY'S MEDICAL TASKS - Preview of scheduled work (Role-aware)
          ======================================================================== */}
      
      {/**
       * Medical task list card - Role-based visibility and functionality
       * 
       * ROLE PERMISSIONS:
       * - admin/staff: Full access to medical tasks and actions
       * - volunteer: View-only access to medical tasks
       * - foster: Limited view of assigned animal tasks only
       * - readonly: No medical task access
       * 
       * SHOWS:
       * - First 5 tasks (most recent/urgent)
       * - Task checkboxes for batch selection (if permitted)
       * - Animal name and task type
       * - Status badge (scheduled/done/missed)
       * - Quick "Mark Done" button (if permitted)
       * 
       * FEATURES:
       * - Checkbox selection (foundation for batch actions)
       * - Hover effects for interactivity
       * - Empty state with helpful message
       * - Link to full medical dashboard
       * 
       * BATCH ACTIONS:
       * Only available to admin/staff roles
       * 
       * LIMITATION:
       * Only shows first 5 tasks.
       * User must visit medical dashboard for complete list.
       */}
      {canManageMedical && (
        <Card data-testid="card-medical-tasks">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Today's Medical Tasks</CardTitle>
              <p className="text-sm text-muted-foreground mt-1" data-testid="text-tasks-count">
                {medicalTasks.length} tasks
              </p>
            </div>
            <div className="flex gap-2">
              {selectedTasks.size > 0 && (
                <Button 
                  variant="default" 
                  size="sm" 
                  data-testid="button-batch-mark-done"
                  onClick={handleBatchMarkDone}
                  disabled={batchMarkDoneMutation.isPending}
                >
                  Mark {selectedTasks.size} Done
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                data-testid="button-select-all"
                onClick={handleSelectAllTasks}
              >
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                data-testid="button-view-all"
                onClick={handleViewAllTasks}
              >
                View All
              </Button>
            </div>
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
                    {/* Checkbox for batch selection */}
                    <input 
                      type="checkbox" 
                      className="mt-1 w-5 h-5 rounded border-input text-primary cursor-pointer" 
                      data-testid={`checkbox-task-${task.id}`}
                      checked={selectedTasks.has(task.id)}
                      onChange={() => handleToggleTaskSelection(task.id)}
                    />
                    
                    {/* Task details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          {/* Animal name (from transformed data) */}
                          <p className="font-medium text-foreground" data-testid={`text-animal-${task.animalName}`}>
                            {task.animalName || 'Unknown'}
                          </p>
                          {/* Task type and description */}
                          <p className="text-sm text-muted-foreground">{task.type} - {task.description}</p>
                        </div>
                        {/* Status badge (color-coded) */}
                        <Badge 
                          variant={task.status === 'overdue' ? 'destructive' : task.status === 'pending' ? 'secondary' : 'default'} 
                          data-testid={`badge-status-${task.id}`}
                        >
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Quick action button */}
                    <Button 
                      size="sm" 
                      className="bg-success hover:bg-success/90" 
                      data-testid={`button-complete-${task.id}`}
                      onClick={() => handleMarkTaskDone(task.id)}
                      disabled={markTaskDoneMutation.isPending}
                    >
                      Mark Done
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      )}

      {/* ========================================================================
          ROLE-BASED MESSAGES - Show appropriate content based on user role
          ======================================================================== */}
      
      {!canManageMedical && (
        <Card data-testid="card-no-medical-access">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-semibold mb-2">Medical Tasks</p>
              <p className="text-sm">
                {currentUserRole === 'volunteer' 
                  ? 'Medical tasks are managed by staff members'
                  : currentUserRole === 'foster'
                  ? 'Contact staff for medical task information'
                  : 'Medical access not available for your role'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
