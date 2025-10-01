import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";

export default function IntakeWizard() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const steps = [
    { number: 1, title: "Photo", description: "Add animal photo" },
    { number: 2, title: "Basic Info", description: "Species, sex, age" },
    { number: 3, title: "Intake Details", description: "Source & type" },
    { number: 4, title: "Medical", description: "Initial vaccines" },
  ];

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

                <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer bg-muted/30">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-medium text-foreground mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                  <Button className="mt-4" data-testid="button-choose-file">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <button className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="button-skip-photo">
                    Skip for now (can add later)
                  </button>
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
                <Button variant="outline" data-testid="button-save-draft">
                  Save as Draft
                </Button>
                <Button 
                  onClick={() => setStep(Math.min(totalSteps, step + 1))}
                  data-testid="button-next"
                >
                  Next Step →
                </Button>
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
              <Button variant="secondary" size="sm" data-testid="button-batch-mode">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
                </svg>
                Switch to Batch Mode
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
