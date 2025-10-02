/**
 * CREATE MEDICAL TASK PAGE - Form to add new medical tasks
 * 
 * PURPOSE:
 * Allows staff to schedule new medical tasks for animals in the system.
 * 
 * KEY FEATURES:
 * 1. COMPREHENSIVE FORM
 *    - Animal selection from existing animals
 *    - Task type and description
 *    - Due date and scheduling
 *    - Veterinarian assignment
 *    - Cost tracking
 * 
 * 2. VALIDATION
 *    - Required field validation
 *    - Date validation (due date must be in future)
 *    - Business rule validation
 * 
 * 3. USER EXPERIENCE
 *    - Clear form layout
 *    - Animal search and selection
 *    - Helpful field descriptions
 *    - Success/error feedback
 * 
 * USER WORKFLOWS:
 * - Staff: Schedule routine medical tasks
 * - Admin: Schedule complex medical procedures
 * - Veterinarian: Schedule follow-up appointments
 * 
 * TECHNICAL NOTES:
 * - Uses React Hook Form for form management
 * - Zod for validation schema
 * - TanStack Query for API calls
 * - Toast notifications for feedback
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AppLayout from "../../components/layout/app-layout";
import { medicalApi, animalsApi } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { ArrowLeft, Save, X, Stethoscope } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import TaskAssignment from "../../components/ui/task-assignment";
import TaskStatus from "../../components/ui/task-status";
import TaskTemplates from "../../components/ui/task-templates";

// Validation schema
const medicalTaskSchema = z.object({
  animal_id: z.string().min(1, "Animal is required"),
  type: z.enum(["vaccine", "treatment", "exam", "surgery", "checkup", "other"], {
    required_error: "Task type is required"
  }),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  date: z.string().min(1, "Date is required"),
  veterinarian: z.string().max(100, "Veterinarian name too long").optional(),
  cost: z.number().min(0, "Cost must be positive").max(10000, "Cost too high").optional(),
  next_due_date: z.string().optional(),
  is_completed: z.boolean().optional(),
  assigned_to: z.string().optional(),
  status: z.enum(["scheduled", "in_progress", "pending_review", "completed", "cancelled", "on_hold"]).optional(),
});

type MedicalTaskFormData = z.infer<typeof medicalTaskSchema>;

export default function CreateMedicalTask() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState<"scheduled" | "in_progress" | "pending_review" | "completed" | "cancelled" | "on_hold">("scheduled");
  const [showTemplates, setShowTemplates] = useState(false);

  // ============================================================================
  // DATA FETCHING - Load animals for selection
  // ============================================================================

  const { data: animals = [], isLoading: animalsLoading } = useQuery({
    queryKey: ["animals"],
    queryFn: animalsApi.getAll,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<MedicalTaskFormData>({
    resolver: zodResolver(medicalTaskSchema),
    defaultValues: {
      type: "checkup",
      date: new Date().toISOString().split('T')[0], // Today's date
      is_completed: false,
      assigned_to: "",
      status: "scheduled",
    }
  });

  // Watch for type changes to set default next_due_date
  const taskType = watch("type");

  // ============================================================================
  // MUTATIONS - Handle medical task creation
  // ============================================================================

  const createMedicalTaskMutation = useMutation({
    mutationFn: async (data: MedicalTaskFormData) => {
      // Add organization_id and timestamps
      const taskData = {
        ...data,
        assigned_to: assignedTo,
        status: taskStatus,
        organization_id: "00000000-0000-0000-0000-000000000001", // Demo organization
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return await medicalApi.createTask(taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-tasks"] });
      toast({
        title: "Medical task created",
        description: "The new medical task has been scheduled successfully",
      });
      setLocation("/medical");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create medical task",
        variant: "destructive",
      });
    },
  });

  // ============================================================================
  // EVENT HANDLERS - Form interactions
  // ============================================================================

  const onSubmit = async (data: MedicalTaskFormData) => {
    setIsSubmitting(true);
    try {
      await createMedicalTaskMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? All changes will be lost.")) {
      setLocation("/medical");
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the form? All changes will be lost.")) {
      reset();
      setAssignedTo("");
      setTaskStatus("scheduled");
    }
  };

  const handleTemplateSelect = (template: any, parameters: any) => {
    // Apply template data to form
    setValue("type", template.type);
    setValue("title", template.title.replace("{animalName}", "Animal"));
    setValue("description", template.description);
    setValue("cost", template.defaultCost);
    
    // Set next due date based on template duration
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + template.defaultDuration);
    setValue("next_due_date", nextDue.toISOString().split('T')[0]);
    
    // Apply parameters
    Object.entries(parameters).forEach(([key, value]) => {
      if (key === "veterinarian") {
        setValue("veterinarian", value as string);
      }
      // Add other parameter mappings as needed
    });
    
    setShowTemplates(false);
    toast({
      title: "Template applied",
      description: `${template.name} template has been applied to the form`,
    });
  };

  // Set default next_due_date based on task type
  const handleTypeChange = (type: string) => {
    setValue("type", type as any);
    
    // Set default next due date based on task type
    const today = new Date();
    let nextDueDate = new Date();
    
    switch (type) {
      case "vaccine":
        nextDueDate.setMonth(today.getMonth() + 12); // Annual vaccines
        break;
      case "checkup":
        nextDueDate.setMonth(today.getMonth() + 6); // Bi-annual checkups
        break;
      case "treatment":
        nextDueDate.setDate(today.getDate() + 7); // Weekly follow-up
        break;
      case "exam":
        nextDueDate.setMonth(today.getMonth() + 3); // Quarterly exams
        break;
      default:
        nextDueDate.setMonth(today.getMonth() + 1); // Monthly for others
    }
    
    setValue("next_due_date", nextDueDate.toISOString().split('T')[0]);
  };

  return (
    <AppLayout 
      title="Schedule Medical Task" 
      subtitle="Add a new medical task for an animal"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => setLocation("/medical")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Medical
          </Button>
          
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTemplates(!showTemplates)}
                    disabled={isSubmitting}
                  >
                    <Stethoscope className="w-4 h-4 mr-2" />
                    {showTemplates ? "Hide Templates" : "Use Template"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
        </div>

        {/* Template Selection */}
        {showTemplates && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Task Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TaskTemplates
                onTemplateSelect={handleTemplateSelect}
                species={watch("animal_id") ? "all" : "all"}
              />
            </CardContent>
          </Card>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Task Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Animal Selection */}
                <div>
                  <Label htmlFor="animal_id">Animal *</Label>
                  <Select onValueChange={(value) => setValue("animal_id", value)}>
                    <SelectTrigger className={errors.animal_id ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select an animal" />
                    </SelectTrigger>
                    <SelectContent>
                      {animalsLoading ? (
                        <SelectItem value="loading" disabled>Loading animals...</SelectItem>
                      ) : (
                        animals
                          .filter((animal: any) => animal.status !== 'deleted')
                          .map((animal: any) => (
                            <SelectItem key={animal.id} value={animal.id}>
                              {animal.name} ({animal.species} - {animal.breed})
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.animal_id && (
                    <p className="text-sm text-destructive mt-1">{errors.animal_id.message}</p>
                  )}
                </div>

                {/* Task Type */}
                <div>
                  <Label htmlFor="type">Task Type *</Label>
                  <Select onValueChange={handleTypeChange}>
                    <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vaccine">Vaccine</SelectItem>
                      <SelectItem value="treatment">Treatment</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="checkup">Checkup</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Enter task title"
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter task description"
                    rows={3}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                  )}
                </div>

                {/* Veterinarian */}
                <div>
                  <Label htmlFor="veterinarian">Veterinarian</Label>
                  <Input
                    id="veterinarian"
                    {...register("veterinarian")}
                    placeholder="Enter veterinarian name"
                    className={errors.veterinarian ? "border-destructive" : ""}
                  />
                  {errors.veterinarian && (
                    <p className="text-sm text-destructive mt-1">{errors.veterinarian.message}</p>
                  )}
                </div>

                {/* Task Assignment */}
                <TaskAssignment
                  currentAssignee={assignedTo}
                  onAssigneeChange={setAssignedTo}
                  taskType={taskType}
                />
              </CardContent>
            </Card>

            {/* Right Column - Scheduling & Cost */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduling & Cost</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date */}
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    {...register("date")}
                    className={errors.date ? "border-destructive" : ""}
                  />
                  {errors.date && (
                    <p className="text-sm text-destructive mt-1">{errors.date.message}</p>
                  )}
                </div>

                {/* Next Due Date */}
                <div>
                  <Label htmlFor="next_due_date">Next Due Date</Label>
                  <Input
                    id="next_due_date"
                    type="date"
                    {...register("next_due_date")}
                    className={errors.next_due_date ? "border-destructive" : ""}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    When should this task be scheduled again?
                  </p>
                  {errors.next_due_date && (
                    <p className="text-sm text-destructive mt-1">{errors.next_due_date.message}</p>
                  )}
                </div>

                {/* Cost */}
                <div>
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    {...register("cost", { valueAsNumber: true })}
                    placeholder="Enter cost"
                    className={errors.cost ? "border-destructive" : ""}
                  />
                  {errors.cost && (
                    <p className="text-sm text-destructive mt-1">{errors.cost.message}</p>
                  )}
                </div>

                {/* Task Status */}
                <TaskStatus
                  currentStatus={taskStatus}
                  onStatusChange={(status, notes) => {
                    setTaskStatus(status);
                    if (notes) {
                      setValue("description", `${watch("description") || ""}\n\nStatus Notes: ${notes}`);
                    }
                  }}
                  canChangeStatus={true}
                />

                {/* Completion Status */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_completed"
                      {...register("is_completed")}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <Label htmlFor="is_completed">Mark as completed</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Check this if the task has already been completed
                  </p>
                </div>

                {/* Task Type Info */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Task Type Information</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {taskType === "vaccine" && (
                      <p>• Vaccines are typically scheduled annually</p>
                    )}
                    {taskType === "treatment" && (
                      <p>• Treatments may require follow-up appointments</p>
                    )}
                    {taskType === "exam" && (
                      <p>• Exams are usually scheduled quarterly or as needed</p>
                    )}
                    {taskType === "surgery" && (
                      <p>• Surgeries require pre and post-operative care</p>
                    )}
                    {taskType === "checkup" && (
                      <p>• Checkups are routine health assessments</p>
                    )}
                    {taskType === "other" && (
                      <p>• Other tasks can be customized as needed</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Create Task
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
