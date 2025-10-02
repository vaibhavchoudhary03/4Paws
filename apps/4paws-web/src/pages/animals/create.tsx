/**
 * CREATE ANIMAL PAGE - Form to add new animals to the system
 * 
 * PURPOSE:
 * Allows staff to add new animals to the shelter system with all required information.
 * 
 * KEY FEATURES:
 * 1. COMPREHENSIVE FORM
 *    - All required animal fields
 *    - Form validation with error messages
 *    - Photo upload placeholder (future enhancement)
 * 
 * 2. VALIDATION
 *    - Required field validation
 *    - Data type validation
 *    - Business rule validation
 * 
 * 3. USER EXPERIENCE
 *    - Clear form layout
 *    - Helpful field descriptions
 *    - Success/error feedback
 *    - Cancel/save actions
 * 
 * USER WORKFLOWS:
 * - Staff: Add new intake animals
 * - Admin: Bulk add animals from other sources
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

// Validation schema
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
  is_spayed_neutered: z.boolean().optional(),
  is_vaccinated: z.boolean().optional(),
});

type AnimalFormData = z.infer<typeof animalSchema>;

export default function CreateAnimal() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      species: "dog",
      gender: "male",
      size: "medium",
      status: "available",
      is_spayed_neutered: false,
      is_vaccinated: false,
    }
  });

  // ============================================================================
  // MUTATIONS - Handle animal creation
  // ============================================================================

  const createAnimalMutation = useMutation({
    mutationFn: async (data: AnimalFormData) => {
      // Add organization_id and timestamps
      const animalData = {
        ...data,
        organization_id: "00000000-0000-0000-0000-000000000001", // Demo organization
        intake_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return await animalsApi.create(animalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      toast({
        title: "Animal created",
        description: "The new animal has been added to the system",
      });
      setLocation("/animals");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create animal",
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
      await createAnimalMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? All changes will be lost.")) {
      setLocation("/animals");
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the form? All changes will be lost.")) {
      reset();
    }
  };

  return (
    <AppLayout 
      title="Add New Animal" 
      subtitle="Enter the animal's information to add them to the system"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => setLocation("/animals")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Animals
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

        {/* Main Form */}
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
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Create Animal
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
