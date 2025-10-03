import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AppLayout from "@/components/layout/app-layout";
import { applicationsApi, animalsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const createApplicationSchema = z.object({
  animalId: z.string().min(1, "Please select an animal"),
  adopterName: z.string().min(2, "Name must be at least 2 characters"),
  adopterEmail: z.string().email("Please enter a valid email address"),
  adopterPhone: z.string().optional(),
  adoptionFee: z.number().min(0, "Adoption fee must be positive").optional(),
  notes: z.string().optional(),
});

type CreateApplicationForm = z.infer<typeof createApplicationSchema>;

export default function CreateAdoptionApplication() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: animals = [], isLoading: animalsLoading } = useQuery({
    queryKey: ["animals"],
    queryFn: animalsApi.getAll,
  });

  const availableAnimals = animals.filter(animal => 
    animal.status === 'available' || animal.status === 'adoptable'
  );

  const form = useForm<CreateApplicationForm>({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: {
      adopterName: "",
      adopterEmail: "",
      adopterPhone: "",
      adoptionFee: 0,
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateApplicationForm) => applicationsApi.create({
      animalId: data.animalId,
      adopterName: data.adopterName,
      adopterEmail: data.adopterEmail,
      adopterPhone: data.adopterPhone || undefined,
      adoptionFee: data.adoptionFee ? data.adoptionFee * 100 : undefined, // Convert to cents
      notes: data.notes || undefined,
      status: 'pending',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adoptions"] });
      toast({
        title: "Application created",
        description: "The adoption application has been created successfully",
      });
      setLocation('/adoptions/pipeline');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create adoption application",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateApplicationForm) => {
    createMutation.mutate(data);
  };

  return (
    <AppLayout 
      title="Create Adoption Application" 
      subtitle="Submit a new adoption application"
      actions={
        <Button 
          variant="outline" 
          onClick={() => setLocation('/adoptions/pipeline')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pipeline
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Animal Selection */}
              <div className="space-y-2">
                <Label htmlFor="animalId">Animal *</Label>
                <Select
                  value={form.watch("animalId")}
                  onValueChange={(value) => form.setValue("animalId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an animal" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAnimals.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.name} - {animal.breed} ({animal.species})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.animalId && (
                  <p className="text-sm text-red-500">{form.formState.errors.animalId.message}</p>
                )}
              </div>

              {/* Adopter Name */}
              <div className="space-y-2">
                <Label htmlFor="adopterName">Adopter Name *</Label>
                <Input
                  id="adopterName"
                  {...form.register("adopterName")}
                  placeholder="Enter adopter's full name"
                />
                {form.formState.errors.adopterName && (
                  <p className="text-sm text-red-500">{form.formState.errors.adopterName.message}</p>
                )}
              </div>

              {/* Adopter Email */}
              <div className="space-y-2">
                <Label htmlFor="adopterEmail">Email Address *</Label>
                <Input
                  id="adopterEmail"
                  type="email"
                  {...form.register("adopterEmail")}
                  placeholder="Enter email address"
                />
                {form.formState.errors.adopterEmail && (
                  <p className="text-sm text-red-500">{form.formState.errors.adopterEmail.message}</p>
                )}
              </div>

              {/* Adopter Phone */}
              <div className="space-y-2">
                <Label htmlFor="adopterPhone">Phone Number</Label>
                <Input
                  id="adopterPhone"
                  {...form.register("adopterPhone")}
                  placeholder="Enter phone number"
                />
                {form.formState.errors.adopterPhone && (
                  <p className="text-sm text-red-500">{form.formState.errors.adopterPhone.message}</p>
                )}
              </div>

              {/* Adoption Fee */}
              <div className="space-y-2">
                <Label htmlFor="adoptionFee">Adoption Fee ($)</Label>
                <Input
                  id="adoptionFee"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register("adoptionFee", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {form.formState.errors.adoptionFee && (
                  <p className="text-sm text-red-500">{form.formState.errors.adoptionFee.message}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Add any additional notes about this application..."
                rows={4}
              />
              {form.formState.errors.notes && (
                <p className="text-sm text-red-500">{form.formState.errors.notes.message}</p>
              )}
            </div>

            {/* Selected Animal Preview */}
            {form.watch("animalId") && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Selected Animal</h4>
                {(() => {
                  const selectedAnimal = availableAnimals.find(a => a.id === form.watch("animalId"));
                  return selectedAnimal ? (
                    <div className="flex items-center gap-3">
                      {selectedAnimal.photos?.[0] ? (
                        <img 
                          src={selectedAnimal.photos[0]} 
                          alt={selectedAnimal.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                          <span className="text-2xl">🐾</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{selectedAnimal.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAnimal.breed} • {selectedAnimal.species} • {selectedAnimal.age} years old
                        </p>
                        <p className="text-sm text-muted-foreground">{selectedAnimal.description}</p>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation('/adoptions/pipeline')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || animalsLoading}
              >
                {createMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
