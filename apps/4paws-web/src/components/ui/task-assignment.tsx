/**
 * TASK ASSIGNMENT COMPONENT - Assign medical tasks to staff members
 * 
 * PURPOSE:
 * Allows staff to assign medical tasks to specific team members with
 * role-based filtering and assignment tracking.
 * 
 * KEY FEATURES:
 * 1. STAFF SELECTION
 *    - Dropdown with available staff members
 *    - Role-based filtering (vets, techs, volunteers)
 *    - Current workload indication
 * 
 * 2. ASSIGNMENT TRACKING
 *    - Show current assignee
 *    - Assignment history
 *    - Reassignment capability
 * 
 * 3. WORKLOAD MANAGEMENT
 *    - Show staff member's current task load
 *    - Prevent over-assignment
 *    - Balance workload distribution
 * 
 * USER WORKFLOWS:
 * - Staff: Assign tasks during creation or editing
 * - Admin: Reassign tasks for workload balance
 * - Manager: Monitor team workload distribution
 * 
 * TECHNICAL NOTES:
 * - Uses mock staff data for now
 * - Integrates with medical task forms
 * - Provides assignment validation
 */

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Badge } from "./badge";
import { Button } from "./button";
import { User, Clock, AlertCircle } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  currentTasks: number;
  maxTasks: number;
  isAvailable: boolean;
}

interface TaskAssignmentProps {
  currentAssignee?: string;
  onAssigneeChange: (assigneeId: string) => void;
  taskType?: string;
  className?: string;
}

// Mock staff data - in a real app, this would come from the API
const mockStaff: StaffMember[] = [
  {
    id: "staff-1",
    name: "Dr. Sarah Johnson",
    role: "Veterinarian",
    currentTasks: 3,
    maxTasks: 10,
    isAvailable: true,
  },
  {
    id: "staff-2",
    name: "Mike Chen",
    role: "Veterinary Technician",
    currentTasks: 7,
    maxTasks: 15,
    isAvailable: true,
  },
  {
    id: "staff-3",
    name: "Emily Rodriguez",
    role: "Veterinary Technician",
    currentTasks: 12,
    maxTasks: 15,
    isAvailable: false,
  },
  {
    id: "staff-4",
    name: "Dr. James Wilson",
    role: "Veterinarian",
    currentTasks: 8,
    maxTasks: 10,
    isAvailable: true,
  },
  {
    id: "staff-5",
    name: "Lisa Park",
    role: "Volunteer",
    currentTasks: 2,
    maxTasks: 5,
    isAvailable: true,
  },
];

export default function TaskAssignment({ 
  currentAssignee, 
  onAssigneeChange, 
  taskType = "general",
  className = ""
}: TaskAssignmentProps) {
  const [selectedAssignee, setSelectedAssignee] = useState(currentAssignee || "");

  // ============================================================================
  // STAFF FILTERING - Filter staff based on task type and availability
  // ============================================================================

  const getFilteredStaff = () => {
    return mockStaff.filter(staff => {
      // Filter by availability
      if (!staff.isAvailable) return false;

      // Filter by role based on task type
      switch (taskType) {
        case "surgery":
        case "exam":
          return staff.role === "Veterinarian";
        case "treatment":
        case "vaccine":
          return ["Veterinarian", "Veterinary Technician"].includes(staff.role);
        case "checkup":
        case "other":
          return true; // All roles can handle these
        default:
          return true;
      }
    });
  };

  const filteredStaff = getFilteredStaff();
  const selectedStaff = mockStaff.find(s => s.id === selectedAssignee);

  // ============================================================================
  // WORKLOAD INDICATORS - Show staff workload status
  // ============================================================================

  const getWorkloadStatus = (staff: StaffMember) => {
    const percentage = (staff.currentTasks / staff.maxTasks) * 100;
    
    if (percentage >= 90) return { color: "destructive", text: "Overloaded" };
    if (percentage >= 70) return { color: "warning", text: "Busy" };
    if (percentage >= 50) return { color: "secondary", text: "Moderate" };
    return { color: "success", text: "Available" };
  };

  const getWorkloadColor = (staff: StaffMember) => {
    const percentage = (staff.currentTasks / staff.maxTasks) * 100;
    
    if (percentage >= 90) return "bg-destructive/10 text-destructive";
    if (percentage >= 70) return "bg-warning/10 text-warning";
    if (percentage >= 50) return "bg-secondary/10 text-secondary-foreground";
    return "bg-success/10 text-success";
  };

  // ============================================================================
  // EVENT HANDLERS - Handle assignment changes
  // ============================================================================

  const handleAssigneeChange = (assigneeId: string) => {
    setSelectedAssignee(assigneeId);
    onAssigneeChange(assigneeId);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Assign to Staff Member
        </label>
        <Select value={selectedAssignee} onValueChange={handleAssigneeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select staff member" />
          </SelectTrigger>
          <SelectContent>
            {filteredStaff.map((staff) => {
              const workload = getWorkloadStatus(staff);
              return (
                <SelectItem key={staff.id} value={staff.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{staff.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {staff.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge className={getWorkloadColor(staff)}>
                        {workload.text}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {staff.currentTasks}/{staff.maxTasks}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Staff Info */}
      {selectedStaff && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{selectedStaff.name}</span>
              <Badge variant="outline" className="text-xs">
                {selectedStaff.role}
              </Badge>
            </div>
            <Badge className={getWorkloadColor(selectedStaff)}>
              {getWorkloadStatus(selectedStaff).text}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{selectedStaff.currentTasks} current tasks</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Max {selectedStaff.maxTasks} tasks</span>
            </div>
          </div>

          {/* Workload Bar */}
          <div className="mt-2">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  getWorkloadStatus(selectedStaff).color === "destructive" ? "bg-destructive" :
                  getWorkloadStatus(selectedStaff).color === "warning" ? "bg-warning" :
                  getWorkloadStatus(selectedStaff).color === "secondary" ? "bg-secondary" :
                  "bg-success"
                }`}
                style={{
                  width: `${(selectedStaff.currentTasks / selectedStaff.maxTasks) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* No Staff Available Warning */}
      {filteredStaff.length === 0 && (
        <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-center gap-2 text-warning">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">No staff available</span>
          </div>
          <p className="text-sm text-warning/80 mt-1">
            No staff members are available for this type of task. Consider reassigning or waiting for availability.
          </p>
        </div>
      )}
    </div>
  );
}
