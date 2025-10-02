/**
 * EDIT MEDICAL TASK PAGE - Form to update existing medical tasks
 * 
 * PURPOSE:
 * Allows staff to update existing medical task information and scheduling.
 * 
 * KEY FEATURES:
 * 1. PRE-POPULATED FORM
 *    - Loads existing medical task data
 *    - All fields populated with current values
 *    - Maintains data integrity
 * 
 * 2. VALIDATION
 *    - Same validation as create form
 *    - Prevents invalid updates
 *    - Shows field-specific errors
 * 
 * 3. USER EXPERIENCE
 *    - Clear form layout
 *    - Shows current vs new values
 *    - Success/error feedback
 *    - Cancel/save actions
 * 
 * USER WORKFLOWS:
 * - Staff: Update task details and scheduling
 * - Admin: Reschedule or modify complex procedures
 * - Veterinarian: Update task status and notes
 * 
 * TECHNICAL NOTES:
 * - Uses React Hook Form for form management
 * - Zod for validation schema
 * - TanStack Query for API calls
 * - Toast notifications for feedback
 */

import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// Validation schema (same as create)
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
});

type MedicalTaskFormData = z.infer<typeof medicalTaskSchema>;

export default function EditMedicalTask() {
  const [, params] = useRoute("/medical/:id/edit");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================================
  // DATA FETCHING - Load existing medical task and animals
  // ============================================================================

  const { data: medicalTask, isLoading: taskLoading, error: taskError } = useQuery({
    queryKey: ["medical-tasks", params?.id],
    queryFn: async () => {
      // We need to fetch the medical record directly from Supabase
      const { supabase } = await import("../../lib/supabase");
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          animals!inner(name)
        `)
        .eq('id', params!.id)
        .single();
      
      if (error) {
        throw new Error('Failed to fetch medical task');
      }
      
      return data;
    },
    enabled: !!params?.id,
  });

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
  });

  // ============================================================================
  // EFFECTS - Populate form when medical task data loads
  // ============================================================================

  useEffect(() => {
    if (medicalTask) {
      // Populate form with existing medical task data
      reset({
        animal_id: medicalTask.animal_id || "",
        type: medicalTask.type || "checkup",
        title: medicalTask.title || "",
        description: medicalTask.description || "",
        date: medicalTask.date ? new Date(medicalTask.date).toISOString().split('T')[0] : "",
        veterinarian: medicalTask.veterinarian || "",
        cost: medicalTask.cost || undefined,
        next_due_date: medicalTask.next_due_date ? new Date(medicalTask.next_due_date).toISOString().split('T')[0] : "",
        is_completed: medicalTask.is_completed || false,
      });
    }
  }, [medicalTask, reset]);

  // ============================================================================
  // MUTATIONS - Handle medical task updates
  // ============================================================================

  const updateMedicalTaskMutation = useMutation({
    mutationFn: async (data: MedicalTaskFormData) => {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      return await medicalApi.updateTask(params!.id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["medical-tasks", params?.id] });
      toast({
        title: "Medical task updated",
        description: "The medical task has been updated successfully",
      });
      setLocation("/medical");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update medical task",
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
      await updateMedicalTaskMutation.mutateAsync(data);
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
      if (medicalTask) {
        reset({
          animal_id: medicalTask.animal_id || "",
          type: medicalTask.type || "checkup",
          title: medicalTask.title || "",
          description: medicalTask.description || "",
          date: medicalTask.date ? new Date(medicalTask.date).toISOString().split('T')[0] : "",
          veterinarian: medicalTask.veterinarian || "",
          cost: medicalTask.cost || undefined,
          next_due_date: medicalTask.next_due_date ? new Date(medicalTask.next_due_date).toISOString().split('T')[0] : "",
          is_completed: medicalTask.is_completed || false,
        });
      }
    }
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

  // ============================================================================
  // LOADING AND ERROR STATES
  // ============================================================================

  if (taskLoading) {
    return (
      <AppLayout title="Loading..." subtitle="Please wait">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  if (taskError || !medicalTask) {
    return (
      <AppLayout title="Error" subtitle="Medical task not found">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">Medical task not found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {taskError?.message || 'The medical task you are looking for does not exist.'}
            </p>
            <Button onClick={() => setLocation("/medical")}>Back to Medical</Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title={`Edit Medical Task`} 
      subtitle={`${medicalTask.title} - ${medicalTask.animals?.name || 'Unknown Animal'}`}
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

        {/* Main Form - Same as create form */}
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

                {/* Status */}
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
                    Check this if the task has been completed
                  </p>
                </div>

                {/* Task Type Info */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Task Type Information</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {watch("type") === "vaccine" && (
                      <p>• Vaccines are typically scheduled annually</p>
                    )}
                    {watch("type") === "treatment" && (
                      <p>• Treatments may require follow-up appointments</p>
                    )}
                    {watch("type") === "exam" && (
                      <p>• Exams are usually scheduled quarterly or as needed</p>
                    )}
                    {watch("type") === "surgery" && (
                      <p>• Surgeries require pre and post-operative care</p>
                    )}
                    {watch("type") === "checkup" && (
                      <p>• Checkups are routine health assessments</p>
                    )}
                    {watch("type") === "other" && (
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
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Update Task
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
