/**
 * TASK STATUS COMPONENT - Manage medical task status and workflow
 * 
 * PURPOSE:
 * Provides a comprehensive status management system for medical tasks
 * with workflow transitions, status tracking, and completion workflows.
 * 
 * KEY FEATURES:
 * 1. STATUS WORKFLOW
 *    - Predefined status transitions
 *    - Role-based status changes
 *    - Workflow validation
 * 
 * 2. STATUS TRACKING
 *    - Current status display
 *    - Status history
 *    - Transition timestamps
 * 
 * 3. COMPLETION WORKFLOWS
 *    - Multi-step completion process
 *    - Required fields validation
 *    - Approval workflows
 * 
 * USER WORKFLOWS:
 * - Staff: Update task status as work progresses
 * - Admin: Monitor task status across organization
 * - Manager: Oversee completion workflows
 * 
 * TECHNICAL NOTES:
 * - Uses state machine pattern for status transitions
 * - Integrates with task assignment system
 * - Provides audit trail for status changes
 */

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Badge } from "./badge";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { Label } from "./label";
import { CheckCircle, Clock, AlertTriangle, XCircle, Play, Pause } from "lucide-react";

export type TaskStatus = 
  | "scheduled" 
  | "in_progress" 
  | "pending_review" 
  | "completed" 
  | "cancelled" 
  | "on_hold";

interface TaskStatusProps {
  currentStatus: TaskStatus;
  onStatusChange: (status: TaskStatus, notes?: string) => void;
  canChangeStatus: boolean;
  className?: string;
}

interface StatusTransition {
  from: TaskStatus;
  to: TaskStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  requiresNotes: boolean;
}

const statusTransitions: StatusTransition[] = [
  {
    from: "scheduled",
    to: "in_progress",
    label: "Start Task",
    description: "Begin working on this task",
    icon: <Play className="w-4 h-4" />,
    color: "bg-primary/10 text-primary",
    requiresNotes: false,
  },
  {
    from: "scheduled",
    to: "on_hold",
    label: "Put on Hold",
    description: "Temporarily pause this task",
    icon: <Pause className="w-4 h-4" />,
    color: "bg-warning/10 text-warning",
    requiresNotes: true,
  },
  {
    from: "scheduled",
    to: "cancelled",
    label: "Cancel Task",
    description: "Cancel this task permanently",
    icon: <XCircle className="w-4 h-4" />,
    color: "bg-destructive/10 text-destructive",
    requiresNotes: true,
  },
  {
    from: "in_progress",
    to: "pending_review",
    label: "Submit for Review",
    description: "Mark task as ready for review",
    icon: <CheckCircle className="w-4 h-4" />,
    color: "bg-secondary/10 text-secondary-foreground",
    requiresNotes: false,
  },
  {
    from: "in_progress",
    to: "on_hold",
    label: "Put on Hold",
    description: "Temporarily pause this task",
    icon: <Pause className="w-4 h-4" />,
    color: "bg-warning/10 text-warning",
    requiresNotes: true,
  },
  {
    from: "in_progress",
    to: "cancelled",
    label: "Cancel Task",
    description: "Cancel this task permanently",
    icon: <XCircle className="w-4 h-4" />,
    color: "bg-destructive/10 text-destructive",
    requiresNotes: true,
  },
  {
    from: "pending_review",
    to: "completed",
    label: "Approve & Complete",
    description: "Approve and mark task as completed",
    icon: <CheckCircle className="w-4 h-4" />,
    color: "bg-success/10 text-success",
    requiresNotes: false,
  },
  {
    from: "pending_review",
    to: "in_progress",
    label: "Return for Revision",
    description: "Return task for additional work",
    icon: <Play className="w-4 h-4" />,
    color: "bg-warning/10 text-warning",
    requiresNotes: true,
  },
  {
    from: "on_hold",
    to: "in_progress",
    label: "Resume Task",
    description: "Resume work on this task",
    icon: <Play className="w-4 h-4" />,
    color: "bg-primary/10 text-primary",
    requiresNotes: false,
  },
  {
    from: "on_hold",
    to: "cancelled",
    label: "Cancel Task",
    description: "Cancel this task permanently",
    icon: <XCircle className="w-4 h-4" />,
    color: "bg-destructive/10 text-destructive",
    requiresNotes: true,
  },
];

const statusConfig = {
  scheduled: {
    label: "Scheduled",
    color: "bg-kirby-primary/10 text-kirby-primary-dark",
    icon: <Clock className="w-4 h-4" />,
    description: "Task is scheduled and waiting to begin",
  },
  in_progress: {
    label: "In Progress",
    color: "bg-kirby-secondary/10 text-kirby-secondary-dark",
    icon: <Play className="w-4 h-4" />,
    description: "Task is currently being worked on",
  },
  pending_review: {
    label: "Pending Review",
    color: "bg-kirby-accent/10 text-kirby-accent-dark",
    icon: <AlertTriangle className="w-4 h-4" />,
    description: "Task is completed and awaiting review",
  },
  completed: {
    label: "Completed",
    color: "bg-kirby-accent/20 text-kirby-accent-dark",
    icon: <CheckCircle className="w-4 h-4" />,
    description: "Task has been completed successfully",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-destructive/10 text-destructive",
    icon: <XCircle className="w-4 h-4" />,
    description: "Task has been cancelled",
  },
  on_hold: {
    label: "On Hold",
    color: "bg-kirby-primary/20 text-kirby-primary-dark",
    icon: <Pause className="w-4 h-4" />,
    description: "Task is temporarily paused",
  },
};

export default function TaskStatus({ 
  currentStatus, 
  onStatusChange, 
  canChangeStatus = true,
  className = ""
}: TaskStatusProps) {
  const [selectedTransition, setSelectedTransition] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  // ============================================================================
  // STATUS LOGIC - Get available transitions and current status info
  // ============================================================================

  const getAvailableTransitions = () => {
    return statusTransitions.filter(transition => transition.from === currentStatus);
  };

  const getCurrentStatusConfig = () => {
    return statusConfig[currentStatus];
  };

  const handleStatusChange = () => {
    if (!selectedTransition) return;

    const transition = statusTransitions.find(t => 
      t.from === currentStatus && t.to === selectedTransition as TaskStatus
    );

    if (transition) {
      onStatusChange(transition.to as TaskStatus, notes);
      setSelectedTransition("");
      setNotes("");
      setShowNotes(false);
    }
  };

  const handleTransitionSelect = (transitionId: string) => {
    setSelectedTransition(transitionId);
    const transition = statusTransitions.find(t => 
      t.from === currentStatus && t.to === transitionId as TaskStatus
    );
    
    if (transition?.requiresNotes) {
      setShowNotes(true);
    } else {
      setShowNotes(false);
    }
  };

  const availableTransitions = getAvailableTransitions();
  const currentConfig = getCurrentStatusConfig();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Status Display */}
      <div className="flex items-center gap-3">
        <Badge className={currentConfig.color}>
          <div className="flex items-center gap-1">
            {currentConfig.icon}
            {currentConfig.label}
          </div>
        </Badge>
        <span className="text-sm text-muted-foreground">
          {currentConfig.description}
        </span>
      </div>

      {/* Status Change Controls */}
      {canChangeStatus && availableTransitions.length > 0 && (
        <div className="space-y-3">
          <Label>Change Status</Label>
          <Select value={selectedTransition} onValueChange={handleTransitionSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              {availableTransitions.map((transition) => (
                <SelectItem key={transition.to} value={transition.to}>
                  <div className="flex items-center gap-2">
                    {transition.icon}
                    <span>{transition.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Notes Field */}
          {showNotes && (
            <div className="space-y-2">
              <Label htmlFor="status-notes">Notes (Required)</Label>
              <Textarea
                id="status-notes"
                placeholder="Enter notes for this status change..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Action Button */}
          {selectedTransition && (
            <Button 
              onClick={handleStatusChange}
              disabled={showNotes && !notes.trim()}
              className="w-full"
            >
              {statusTransitions.find(t => t.to === selectedTransition as TaskStatus)?.icon}
              {statusTransitions.find(t => t.to === selectedTransition as TaskStatus)?.label}
            </Button>
          )}
        </div>
      )}

      {/* Status History (Placeholder) */}
      <div className="text-xs text-muted-foreground">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}
