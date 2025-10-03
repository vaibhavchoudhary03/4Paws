import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { animalsApi } from "@/lib/api";
import PhotoUpload from "@/components/ui/photo-upload";

const intakeSchema = z.object({
  name: z.string().min(1, "Animal name is required"),
  species: z.enum(["dog", "cat", "other"]),
  breed: z.string().optional(),
  sex: z.enum(["male", "female", "unknown"]).optional(),
  color: z.string().optional(),
  dobEst: z.string().optional(),
  microchip: z.string().optional(),
  description: z.string().optional(),
  intakeDate: z.string().min(1, "Intake date is required"),
  status: z.enum(["available", "hold", "fostered", "adopted", "transferred", "rto", "euthanized"]),
  intakeType: z.enum(["stray", "owner_surrender", "transfer_in", "confiscation", "born_in_care"]).optional(),
  intakeSource: z.string().optional(),
  intakeNotes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

type IntakeFormData = z.infer<typeof intakeSchema>;

export default function IntakeWizard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [photos, setPhotos] = useState<string[]>([]);

  const form = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      name: "",
      species: "dog",
      breed: "",
      sex: "unknown",
      color: "",
      dobEst: "",
      microchip: "",
      description: "",
      intakeDate: new Date().toISOString().split('T')[0],
      status: "available",
      intakeType: "stray",
      intakeSource: "",
      intakeNotes: "",
      photos: [],
    },
  });

  const createAnimalMutation = useMutation({
    mutationFn: async (data: IntakeFormData) => {
      return animalsApi.create({
        organization_id: '00000000-0000-0000-0000-000000000001',
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        gender: data.sex || null,
        color: data.color || null,
        age: data.dobEst ? Math.floor((Date.now() - new Date(data.dobEst).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null,
        intake_date: new Date(data.intakeDate).toISOString(),
        status: data.status,
        microchip_id: data.microchip || null,
        description: data.description || null,
        behavior_notes: data.intakeNotes || null,
        is_spayed_neutered: false,
        is_vaccinated: false,
        photos: photos,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      toast({
        title: "Success!",
        description: "Animal has been added to the system.",
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

  const steps = [
    { number: 1, title: "Photo", description: "Add animal photo" },
    { number: 2, title: "Basic Info", description: "Species, sex, age" },
    { number: 3, title: "Intake Details", description: "Source & type" },
    { number: 4, title: "Review", description: "Confirm details" },
  ];

  const canGoNext = () => {
    if (step === 2) {
      return form.getValues("name").trim() !== "";
    }
    return true;
  };

  const handleNext = () => {
    if (step === 2) {
      form.trigger(["name", "species"]);
      if (!form.formState.isValid) return;
    }
    setStep(Math.min(totalSteps, step + 1));
  };

  const handlePrevious = () => {
    setStep(Math.max(1, step - 1));
  };

  const handleSubmit = (data: IntakeFormData) => {
    createAnimalMutation.mutate({ ...data, photos });
  };

  return (
    <AppLayout title="New Animal Intake" subtitle="Fast intake wizard">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {steps.map((s, idx) => (
                  <div key={s.number} className="flex items-center flex-1">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                        step >= s.number ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`} data-testid={`step-indicator-${s.number}`}>
                        {s.number}
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`flex-1 h-1 mx-2 ${
                          step > s.number ? 'bg-primary' : 'bg-muted'
                        }`}></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                {steps.map((s) => (
                  <div key={s.number} className="text-center" style={{ width: `${100 / steps.length}%` }}>
                    <p className={`text-xs font-medium ${step >= s.number ? 'text-primary' : 'text-muted-foreground'}`}>
                      {s.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <Form {...form}>
              {step === 1 && (
                <div data-testid="step-photo-upload">
                  <h2 className="text-xl font-semibold text-foreground mb-2">Upload Animal Photo</h2>
                  <p className="text-muted-foreground mb-6">Add a clear photo of the animal. This will help with identification and adoption listings.</p>

                      <PhotoUpload
                        existingPhotos={photos}
                        onPhotosChange={setPhotos}
                        maxPhotos={5}
                        className="mb-6"
                      />

                  <div className="mt-6 text-center">
                    <Button 
                      variant="outline"
                      data-testid="button-skip-photo"
                      onClick={() => setStep(2)}
                    >
                      Continue to animal details →
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div data-testid="step-basic-info">
                  <h2 className="text-xl font-semibold text-foreground mb-2">Basic Information</h2>
                  <p className="text-muted-foreground mb-6">Enter the animal's basic details.</p>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Animal Name *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              data-testid="input-name"
                              placeholder="e.g., Buddy"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="species"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Species *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-species">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dog">Dog</SelectItem>
                              <SelectItem value="cat">Cat</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="breed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Breed</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              data-testid="input-breed"
                              placeholder="e.g., Labrador Mix"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sex</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-sex">
                                <SelectValue placeholder="Select sex" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="unknown">Unknown</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              data-testid="input-color"
                              placeholder="e.g., Brown/White"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dobEst"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth (Estimated)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              data-testid="input-dob"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="microchip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Microchip Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              data-testid="input-microchip"
                              placeholder="e.g., 985112345678901"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div data-testid="step-intake-details">
                  <h2 className="text-xl font-semibold text-foreground mb-2">Intake Details</h2>
                  <p className="text-muted-foreground mb-6">Provide intake and housing information.</p>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="intakeDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intake Date</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              data-testid="input-intake-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="intakeType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intake Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-intake-type">
                                <SelectValue placeholder="Select intake type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="stray">Stray</SelectItem>
                              <SelectItem value="owner_surrender">Owner Surrender</SelectItem>
                              <SelectItem value="transfer_in">Transfer In</SelectItem>
                              <SelectItem value="confiscation">Confiscation</SelectItem>
                              <SelectItem value="born_in_care">Born in Care</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="intakeSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intake Source</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              data-testid="input-intake-source"
                              placeholder="e.g., City Shelter, Owner Name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="hold">Hold</SelectItem>
                              <SelectItem value="fostered">Fostered</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Description / Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              data-testid="input-description"
                              placeholder="Behavioral notes, medical history, temperament..."
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="intakeNotes"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Intake-Specific Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              data-testid="input-intake-notes"
                              placeholder="Circumstances of intake, special considerations..."
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div data-testid="step-review">
                  <h2 className="text-xl font-semibold text-foreground mb-2">Review & Submit</h2>
                  <p className="text-muted-foreground mb-6">Please review the information before submitting.</p>

                  <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium" data-testid="text-review-name">{form.getValues("name") || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Species</p>
                        <p className="font-medium capitalize" data-testid="text-review-species">{form.getValues("species")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Breed</p>
                        <p className="font-medium" data-testid="text-review-breed">{form.getValues("breed") || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sex</p>
                        <p className="font-medium capitalize" data-testid="text-review-sex">{form.getValues("sex") || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Color</p>
                        <p className="font-medium" data-testid="text-review-color">{form.getValues("color") || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium capitalize" data-testid="text-review-status">{form.getValues("status")}</p>
                      </div>
                      {form.getValues("intakeType") && (
                        <div>
                          <p className="text-sm text-muted-foreground">Intake Type</p>
                          <p className="font-medium capitalize" data-testid="text-review-intake-type">
                            {form.getValues("intakeType").replace(/_/g, ' ')}
                          </p>
                        </div>
                      )}
                      {form.getValues("intakeSource") && (
                        <div>
                          <p className="text-sm text-muted-foreground">Intake Source</p>
                          <p className="font-medium" data-testid="text-review-intake-source">{form.getValues("intakeSource")}</p>
                        </div>
                      )}
                      {form.getValues("microchip") && (
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Microchip</p>
                          <p className="font-medium" data-testid="text-review-microchip">{form.getValues("microchip")}</p>
                        </div>
                      )}
                      {form.getValues("description") && (
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Description</p>
                          <p className="text-sm" data-testid="text-review-description">{form.getValues("description")}</p>
                        </div>
                      )}
                      {form.getValues("intakeNotes") && (
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Intake Notes</p>
                          <p className="text-sm" data-testid="text-review-intake-notes">{form.getValues("intakeNotes")}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      By submitting this form, you confirm that all information is accurate to the best of your knowledge.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex items-center justify-between pt-6 border-t border-border">
                <Button 
                  variant="ghost" 
                  onClick={handlePrevious}
                  disabled={step === 1}
                  data-testid="button-previous"
                >
                  ← Previous
                </Button>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    data-testid="button-cancel"
                    onClick={() => setLocation("/animals")}
                  >
                    Cancel
                  </Button>
                  {step < totalSteps ? (
                    <Button 
                      onClick={handleNext}
                      disabled={!canGoNext()}
                      data-testid="button-next"
                    >
                      Next Step →
                    </Button>
                  ) : (
                    <Button 
                      onClick={form.handleSubmit(handleSubmit)}
                      disabled={createAnimalMutation.isPending}
                      data-testid="button-submit"
                    >
                      {createAnimalMutation.isPending ? "Creating..." : "Create Animal"}
                    </Button>
                  )}
                </div>
              </div>
            </Form>
          </CardContent>
        </Card>

        {/* Batch Intake Option */}
        <div className="mt-6 bg-secondary/10 border border-secondary/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-secondary-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Batch Intake Available</h3>
              <p className="text-sm text-muted-foreground mb-3">Intaking multiple animals at once? Use batch mode to share common fields and speed up the process.</p>
              <Button variant="secondary" size="sm" data-testid="button-batch-mode" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
                </svg>
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
