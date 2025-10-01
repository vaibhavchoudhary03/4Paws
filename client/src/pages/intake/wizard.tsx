import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type IntakeFormData = {
  name: string;
  species: "dog" | "cat" | "other";
  breed: string;
  sex: string;
  color: string;
  dobEst: string;
  microchip: string;
  description: string;
  intakeDate: string;
  status: "available" | "hold" | "fostered" | "adopted" | "transferred" | "rto" | "euthanized";
  attributes: {
    intakeType?: "stray" | "owner_surrender" | "transfer_in" | "confiscation" | "born_in_care";
    intakeSource?: string;
    intakeNotes?: string;
  };
};

export default function IntakeWizard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const [formData, setFormData] = useState<IntakeFormData>({
    name: "",
    species: "dog",
    breed: "",
    sex: "",
    color: "",
    dobEst: "",
    microchip: "",
    description: "",
    intakeDate: new Date().toISOString().split('T')[0],
    status: "available",
    attributes: {},
  });

  const createAnimalMutation = useMutation({
    mutationFn: async (data: IntakeFormData) => {
      return await apiRequest("/api/v1/animals", "POST", {
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        sex: data.sex || null,
        color: data.color || null,
        dobEst: data.dobEst ? new Date(data.dobEst).toISOString() : null,
        intakeDate: new Date(data.intakeDate).toISOString(),
        status: data.status,
        microchip: data.microchip || null,
        description: data.description || null,
        attributes: data.attributes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/animals"] });
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

  const handleInputChange = (field: keyof IntakeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAttributeChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: { ...prev.attributes, [key]: value },
    }));
  };

  const canGoNext = () => {
    if (step === 2) {
      return formData.name.trim() !== "";
    }
    return true;
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Animal name is required",
        variant: "destructive",
      });
      return;
    }
    createAnimalMutation.mutate(formData);
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
            {step === 1 && (
              <div data-testid="step-photo-upload">
                <h2 className="text-xl font-semibold text-foreground mb-2">Upload Animal Photo</h2>
                <p className="text-muted-foreground mb-6">Add a clear photo of the animal. This will help with identification and adoption listings.</p>

                <div className="border-2 border-dashed border-border rounded-xl p-12 text-center bg-muted/30">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-medium text-foreground mb-1">Photo Upload</p>
                  <p className="text-sm text-muted-foreground">Photo upload requires storage backend setup. You can add photos after creating the animal record.</p>
                </div>

                <div className="mt-6 text-center">
                  <button 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors" 
                    data-testid="button-skip-photo"
                    onClick={() => setStep(2)}
                  >
                    Continue to animal details →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div data-testid="step-basic-info">
                <h2 className="text-xl font-semibold text-foreground mb-2">Basic Information</h2>
                <p className="text-muted-foreground mb-6">Enter the animal's basic details.</p>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Animal Name *</Label>
                    <Input
                      id="name"
                      data-testid="input-name"
                      placeholder="e.g., Buddy"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="species">Species *</Label>
                    <Select 
                      value={formData.species} 
                      onValueChange={(value: any) => handleInputChange("species", value)}
                    >
                      <SelectTrigger data-testid="select-species">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="breed">Breed</Label>
                    <Input
                      id="breed"
                      data-testid="input-breed"
                      placeholder="e.g., Labrador Mix"
                      value={formData.breed}
                      onChange={(e) => handleInputChange("breed", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sex">Sex</Label>
                    <Select 
                      value={formData.sex} 
                      onValueChange={(value) => handleInputChange("sex", value)}
                    >
                      <SelectTrigger data-testid="select-sex">
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      data-testid="input-color"
                      placeholder="e.g., Brown/White"
                      value={formData.color}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dobEst">Date of Birth (Estimated)</Label>
                    <Input
                      id="dobEst"
                      type="date"
                      data-testid="input-dob"
                      value={formData.dobEst}
                      onChange={(e) => handleInputChange("dobEst", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="microchip">Microchip Number</Label>
                    <Input
                      id="microchip"
                      data-testid="input-microchip"
                      placeholder="e.g., 985112345678901"
                      value={formData.microchip}
                      onChange={(e) => handleInputChange("microchip", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div data-testid="step-intake-details">
                <h2 className="text-xl font-semibold text-foreground mb-2">Intake Details</h2>
                <p className="text-muted-foreground mb-6">Provide intake and housing information.</p>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="intakeDate">Intake Date</Label>
                    <Input
                      id="intakeDate"
                      type="date"
                      data-testid="input-intake-date"
                      value={formData.intakeDate}
                      onChange={(e) => handleInputChange("intakeDate", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="intakeType">Intake Type</Label>
                    <Select 
                      value={formData.attributes.intakeType || ""} 
                      onValueChange={(value) => handleAttributeChange("intakeType", value)}
                    >
                      <SelectTrigger data-testid="select-intake-type">
                        <SelectValue placeholder="Select intake type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stray">Stray</SelectItem>
                        <SelectItem value="owner_surrender">Owner Surrender</SelectItem>
                        <SelectItem value="transfer_in">Transfer In</SelectItem>
                        <SelectItem value="confiscation">Confiscation</SelectItem>
                        <SelectItem value="born_in_care">Born in Care</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="intakeSource">Intake Source</Label>
                    <Input
                      id="intakeSource"
                      data-testid="input-intake-source"
                      placeholder="e.g., City Shelter, Owner Name"
                      value={formData.attributes.intakeSource || ""}
                      onChange={(e) => handleAttributeChange("intakeSource", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Initial Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: any) => handleInputChange("status", value)}
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="hold">Hold</SelectItem>
                        <SelectItem value="fostered">Fostered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description / Notes</Label>
                    <Textarea
                      id="description"
                      data-testid="input-description"
                      placeholder="Behavioral notes, medical history, temperament..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="intakeNotes">Intake-Specific Notes</Label>
                    <Textarea
                      id="intakeNotes"
                      data-testid="input-intake-notes"
                      placeholder="Circumstances of intake, special considerations..."
                      rows={3}
                      value={formData.attributes.intakeNotes || ""}
                      onChange={(e) => handleAttributeChange("intakeNotes", e.target.value)}
                    />
                  </div>
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
                      <p className="font-medium" data-testid="text-review-name">{formData.name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Species</p>
                      <p className="font-medium capitalize" data-testid="text-review-species">{formData.species}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Breed</p>
                      <p className="font-medium" data-testid="text-review-breed">{formData.breed || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sex</p>
                      <p className="font-medium capitalize" data-testid="text-review-sex">{formData.sex || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Color</p>
                      <p className="font-medium" data-testid="text-review-color">{formData.color || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize" data-testid="text-review-status">{formData.status}</p>
                    </div>
                    {formData.attributes.intakeType && (
                      <div>
                        <p className="text-sm text-muted-foreground">Intake Type</p>
                        <p className="font-medium capitalize" data-testid="text-review-intake-type">
                          {formData.attributes.intakeType.replace(/_/g, ' ')}
                        </p>
                      </div>
                    )}
                    {formData.attributes.intakeSource && (
                      <div>
                        <p className="text-sm text-muted-foreground">Intake Source</p>
                        <p className="font-medium" data-testid="text-review-intake-source">{formData.attributes.intakeSource}</p>
                      </div>
                    )}
                    {formData.microchip && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Microchip</p>
                        <p className="font-medium" data-testid="text-review-microchip">{formData.microchip}</p>
                      </div>
                    )}
                    {formData.description && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="text-sm" data-testid="text-review-description">{formData.description}</p>
                      </div>
                    )}
                    {formData.attributes.intakeNotes && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Intake Notes</p>
                        <p className="text-sm" data-testid="text-review-intake-notes">{formData.attributes.intakeNotes}</p>
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
                onClick={() => setStep(Math.max(1, step - 1))}
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
                    onClick={() => setStep(Math.min(totalSteps, step + 1))}
                    disabled={!canGoNext()}
                    data-testid="button-next"
                  >
                    Next Step →
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={createAnimalMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createAnimalMutation.isPending ? "Creating..." : "Create Animal"}
                  </Button>
                )}
              </div>
            </div>
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
