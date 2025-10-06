/**
 * EDIT ANIMAL PAGE - Form to update existing animal information
 * 
 * PURPOSE:
 * Allows staff to update existing animal information in the system.
 * 
 * KEY FEATURES:
 * 1. PRE-POPULATED FORM
 *    - Loads existing animal data
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
 * - Staff: Update animal information
 * - Admin: Bulk update animal status
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
import { animalsApi } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { ArrowLeft, Save, X } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

// Validation schema (same as create)
const animalSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  species: z.enum(["dog", "cat", "rabbit", "bird", "other"], {
    required_error: "Species is required"
  }),
  breed: z.string().min(1, "Breed is required").max(100, "Breed too long"),
  gender: z.enum(["male", "female"], {
    required_error: "Gender is required"
  }),
  age: z.number().min(0, "Age must be positive").max(300, "Age too high").optional(),
  color: z.string().max(50, "Color too long").optional(),
  size: z.enum(["small", "medium", "large"], {
    required_error: "Size is required"
  }),
  weight: z.number().min(0, "Weight must be positive").max(200, "Weight too high").optional(),
  microchip_id: z.string().max(50, "Microchip ID too long").optional(),
  status: z.enum(["available", "fostered", "hold", "adopted"], {
    required_error: "Status is required"
  }),
  description: z.string().max(1000, "Description too long").optional(),
  behavior_notes: z.string().max(1000, "Behavior notes too long").optional(),
  medical_notes: z.string().max(1000, "Medical notes too long").optional(),
  special_needs: z.string().max(1000, "Special needs too long").optional(),
  additional_notes: z.string().max(1000, "Additional notes too long").optional(),
  is_spayed_neutered: z.boolean().optional(),
  is_vaccinated: z.boolean().optional(),
});

type AnimalFormData = z.infer<typeof animalSchema>;

export default function EditAnimal() {
  const [, params] = useRoute("/animals/:id/edit");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================================
  // DATA FETCHING - Load existing animal data
  // ============================================================================

  const { data: animal, isLoading, error } = useQuery({
    queryKey: ["animals", params?.id],
    queryFn: () => animalsApi.getById(params!.id),
    enabled: !!params?.id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema),
  });

  // ============================================================================
  // EFFECTS - Populate form when animal data loads
  // ============================================================================

  useEffect(() => {
    if (animal) {
      // Populate form with existing animal data
      reset({
        name: animal.name || "",
        species: animal.species || "dog",
        breed: animal.breed || "",
        gender: animal.gender || "male",
        age: animal.age || undefined,
        color: animal.color || "",
        size: animal.size || "medium",
        weight: animal.weight || undefined,
        microchip_id: animal.microchip_id || "",
        status: animal.status || "available",
        description: animal.description || "",
        behavior_notes: animal.behavior_notes || "",
        medical_notes: animal.medical_notes || "",
        special_needs: animal.special_needs || "",
        additional_notes: animal.additional_notes || "",
        is_spayed_neutered: animal.is_spayed_neutered || false,
        is_vaccinated: animal.is_vaccinated || false,
      });
    }
  }, [animal, reset]);

  // ============================================================================
  // MUTATIONS - Handle animal updates
  // ============================================================================

  const updateAnimalMutation = useMutation({
    mutationFn: async (data: AnimalFormData) => {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      return await animalsApi.update(params!.id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["animals", params?.id] });
      toast({
        title: "Animal updated",
        description: "The animal information has been updated successfully",
      });
      setLocation(`/animals/${params?.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update animal",
        variant: "destructive",
      });
    },
  });

  // ============================================================================
  // EVENT HANDLERS - Form interactions
  // ============================================================================

  const onSubmit = async (data: AnimalFormData) => {
    setIsSubmitting(true);
    try {
      await updateAnimalMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? All changes will be lost.")) {
      setLocation(`/animals/${params?.id}`);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the form? All changes will be lost.")) {
      if (animal) {
        reset({
          name: animal.name || "",
          species: animal.species || "dog",
          breed: animal.breed || "",
          gender: animal.gender || "male",
          age: animal.age || undefined,
          color: animal.color || "",
          size: animal.size || "medium",
          weight: animal.weight || undefined,
          microchip_id: animal.microchip_id || "",
          status: animal.status || "available",
          description: animal.description || "",
          behavior_notes: animal.behavior_notes || "",
          medical_notes: animal.medical_notes || "",
          special_needs: animal.special_needs || "",
          additional_notes: animal.additional_notes || "",
          is_spayed_neutered: animal.is_spayed_neutered || false,
          is_vaccinated: animal.is_vaccinated || false,
        });
      }
    }
  };

  // ============================================================================
  // LOADING AND ERROR STATES
  // ============================================================================

  if (isLoading) {
    return (
      <AppLayout title="Loading..." subtitle="Please wait">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !animal) {
    return (
      <AppLayout title="Error" subtitle="Animal not found">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8 text-destructive">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-foreground mb-2">Animal not found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {error?.message || 'The animal you are looking for does not exist.'}
            </p>
            <Button onClick={() => setLocation("/animals")}>Back to Animals</Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title={`Edit ${animal.name}`} 
      subtitle="Update the animal's information"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => setLocation(`/animals/${params?.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Animal
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
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Enter animal's name"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Species */}
                <div>
                  <Label htmlFor="species">Species *</Label>
                  <Select onValueChange={(value) => setValue("species", value as any)}>
                    <SelectTrigger className={errors.species ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select species" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                      <SelectItem value="rabbit">Rabbit</SelectItem>
                      <SelectItem value="bird">Bird</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.species && (
                    <p className="text-sm text-destructive mt-1">{errors.species.message}</p>
                  )}
                </div>

                {/* Breed */}
                <div>
                  <Label htmlFor="breed">Breed *</Label>
                  <Input
                    id="breed"
                    {...register("breed")}
                    placeholder="Enter breed"
                    className={errors.breed ? "border-destructive" : ""}
                  />
                  {errors.breed && (
                    <p className="text-sm text-destructive mt-1">{errors.breed.message}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select onValueChange={(value) => setValue("gender", value as any)}>
                    <SelectTrigger className={errors.gender ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-destructive mt-1">{errors.gender.message}</p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <Label htmlFor="age">Age (months)</Label>
                  <Input
                    id="age"
                    type="number"
                    {...register("age", { valueAsNumber: true })}
                    placeholder="Enter age in months"
                    className={errors.age ? "border-destructive" : ""}
                  />
                  {errors.age && (
                    <p className="text-sm text-destructive mt-1">{errors.age.message}</p>
                  )}
                </div>

                {/* Color */}
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    {...register("color")}
                    placeholder="Enter color"
                    className={errors.color ? "border-destructive" : ""}
                  />
                  {errors.color && (
                    <p className="text-sm text-destructive mt-1">{errors.color.message}</p>
                  )}
                </div>

                {/* Size */}
                <div>
                  <Label htmlFor="size">Size *</Label>
                  <Select onValueChange={(value) => setValue("size", value as any)}>
                    <SelectTrigger className={errors.size ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.size && (
                    <p className="text-sm text-destructive mt-1">{errors.size.message}</p>
                  )}
                </div>

                {/* Weight */}
                <div>
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    {...register("weight", { valueAsNumber: true })}
                    placeholder="Enter weight in pounds"
                    className={errors.weight ? "border-destructive" : ""}
                  />
                  {errors.weight && (
                    <p className="text-sm text-destructive mt-1">{errors.weight.message}</p>
                  )}
                </div>

                {/* Microchip ID */}
                <div>
                  <Label htmlFor="microchip_id">Microchip ID</Label>
                  <Input
                    id="microchip_id"
                    {...register("microchip_id")}
                    placeholder="Enter microchip ID"
                    className={errors.microchip_id ? "border-destructive" : ""}
                  />
                  {errors.microchip_id && (
                    <p className="text-sm text-destructive mt-1">{errors.microchip_id.message}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select onValueChange={(value) => setValue("status", value as any)}>
                    <SelectTrigger className={errors.status ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="fostered">Fostered</SelectItem>
                      <SelectItem value="hold">On Hold</SelectItem>
                      <SelectItem value="adopted">Adopted</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-destructive mt-1">{errors.status.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter a description of the animal"
                    rows={3}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                  )}
                </div>

                {/* Behavior Notes */}
                <div>
                  <Label htmlFor="behavior_notes">Behavior Notes</Label>
                  <Textarea
                    id="behavior_notes"
                    {...register("behavior_notes")}
                    placeholder="Enter behavior observations"
                    rows={3}
                    className={errors.behavior_notes ? "border-destructive" : ""}
                  />
                  {errors.behavior_notes && (
                    <p className="text-sm text-destructive mt-1">{errors.behavior_notes.message}</p>
                  )}
                </div>

                {/* Medical Notes */}
                <div>
                  <Label htmlFor="medical_notes">Medical Notes</Label>
                  <Textarea
                    id="medical_notes"
                    {...register("medical_notes")}
                    placeholder="Enter medical information"
                    rows={3}
                    className={errors.medical_notes ? "border-destructive" : ""}
                  />
                  {errors.medical_notes && (
                    <p className="text-sm text-destructive mt-1">{errors.medical_notes.message}</p>
                  )}
                </div>

                {/* Special Needs */}
                <div>
                  <Label htmlFor="special_needs">Special Needs</Label>
                  <Textarea
                    id="special_needs"
                    {...register("special_needs")}
                    placeholder="Enter any special needs or requirements"
                    rows={3}
                    className={errors.special_needs ? "border-destructive" : ""}
                  />
                  {errors.special_needs && (
                    <p className="text-sm text-destructive mt-1">{errors.special_needs.message}</p>
                  )}
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="additional_notes">Additional Notes</Label>
                  <Textarea
                    id="additional_notes"
                    {...register("additional_notes")}
                    placeholder="Enter any additional notes or comments"
                    rows={3}
                    className={errors.additional_notes ? "border-destructive" : ""}
                  />
                  {errors.additional_notes && (
                    <p className="text-sm text-destructive mt-1">{errors.additional_notes.message}</p>
                  )}
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_spayed_neutered"
                      {...register("is_spayed_neutered")}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <Label htmlFor="is_spayed_neutered">Spayed/Neutered</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_vaccinated"
                      {...register("is_vaccinated")}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <Label htmlFor="is_vaccinated">Vaccinated</Label>
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
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Update Animal
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
