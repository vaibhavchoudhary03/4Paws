/**
 * QUICK INTAKE DIALOG COMPONENT
 * 
 * PURPOSE:
 * Provides a streamlined, one-step animal intake process for common scenarios.
 * Designed for speed and efficiency while maintaining data quality.
 * 
 * FEATURES:
 * 1. SMART DEFAULTS - Pre-filled with common values
 * 2. QUICK PHOTO CAPTURE - Camera integration for immediate photos
 * 3. COMMON SCENARIOS - Pre-configured for typical intake types
 * 4. VALIDATION - Essential fields only, minimal friction
 * 5. FALLBACK - Easy access to full intake wizard for complex cases
 * 6. MOBILE OPTIMIZED - Touch-friendly interface
 * 
 * INTAKE SCENARIOS:
 * - Stray Dog/Cat (most common)
 * - Owner Surrender
 * - Transfer In
 * - Emergency Intake
 * - Born in Care
 */

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '../../hooks/use-toast';
import { animalsApi } from '../../lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Badge } from './badge';
import { Card, CardContent } from './card';
import { 
  Camera, 
  Upload, 
  Plus, 
  Clock, 
  MapPin, 
  User, 
  Heart,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  Settings,
  Calendar
} from 'lucide-react';
import PhotoUpload from './photo-upload';
import { cn } from '../../lib/utils';

// Simplified schema for quick intake - only essential fields
const quickIntakeSchema = z.object({
  name: z.string().min(1, "Animal name is required"),
  species: z.enum(["dog", "cat", "other"]),
  gender: z.enum(["male", "female", "unknown"]),
  intakeType: z.enum(["stray", "owner_surrender", "transfer_in", "emergency", "born_in_care"]),
  description: z.string().optional(),
  intakeNotes: z.string().optional(),
  photos: z.array(z.string()).optional(),
  intakeDate: z.string().min(1, "Intake date is required"),
});

type QuickIntakeFormData = z.infer<typeof quickIntakeSchema>;

interface QuickIntakeDialogProps {
  children: React.ReactNode;
}

// Pre-configured intake scenarios
const intakeScenarios = [
  {
    id: 'stray_dog',
    label: 'Stray Dog',
    icon: '🐕',
    species: 'dog' as const,
    gender: 'unknown' as const,
    intakeType: 'stray' as const,
    description: 'Found wandering, no owner present',
    color: 'bg-orange-50 text-orange-900 border-orange-300 hover:bg-orange-100 hover:border-orange-400',
  },
  {
    id: 'stray_cat',
    label: 'Stray Cat',
    icon: '🐱',
    species: 'cat' as const,
    gender: 'unknown' as const,
    intakeType: 'stray' as const,
    description: 'Found wandering, no owner present',
    color: 'bg-orange-50 text-orange-900 border-orange-300 hover:bg-orange-100 hover:border-orange-400',
  },
  {
    id: 'owner_surrender',
    label: 'Owner Surrender',
    icon: '👤',
    species: 'dog' as const,
    gender: 'unknown' as const,
    intakeType: 'owner_surrender' as const,
    description: 'Owner can no longer care for animal',
    color: 'bg-orange-50 text-orange-900 border-orange-300 hover:bg-orange-100 hover:border-orange-400',
  },
  {
    id: 'transfer_in',
    label: 'Transfer In',
    icon: '🚚',
    species: 'dog' as const,
    gender: 'unknown' as const,
    intakeType: 'transfer_in' as const,
    description: 'Transferred from another shelter',
    color: 'bg-orange-50 text-orange-900 border-orange-300 hover:bg-orange-100 hover:border-orange-400',
  },
  {
    id: 'emergency',
    label: 'Emergency',
    icon: '🚨',
    species: 'dog' as const,
    gender: 'unknown' as const,
    intakeType: 'emergency' as const,
    description: 'Urgent medical or safety situation',
    color: 'bg-orange-50 text-orange-900 border-orange-300 hover:bg-orange-100 hover:border-orange-400',
  },
  {
    id: 'born_in_care',
    label: 'Born in Care',
    icon: '👶',
    species: 'dog' as const,
    gender: 'unknown' as const,
    intakeType: 'born_in_care' as const,
    description: 'Born to animal already in our care',
    color: 'bg-orange-50 text-orange-900 border-orange-300 hover:bg-orange-100 hover:border-orange-400',
  },
];

export default function QuickIntakeDialog({ children }: QuickIntakeDialogProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to format date consistently
  const formatIntakeDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    // Parse the date string as local time to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString();
  };

  const form = useForm<QuickIntakeFormData>({
    resolver: zodResolver(quickIntakeSchema),
    defaultValues: {
      name: '',
      species: 'dog',
      gender: 'unknown',
      intakeType: 'stray',
      description: '',
      intakeNotes: '',
      photos: [],
      intakeDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    },
  });

  // Handle scenario selection
  const handleScenarioSelect = (scenario: typeof intakeScenarios[0]) => {
    setSelectedScenario(scenario.id);
    form.setValue('species', scenario.species);
    form.setValue('gender', scenario.gender);
    form.setValue('intakeType', scenario.intakeType);
    form.setValue('description', scenario.description);
  };

  // Create animal mutation
  const createAnimalMutation = useMutation({
    mutationFn: async (data: QuickIntakeFormData) => {
      return animalsApi.create({
        organization_id: '00000000-0000-0000-0000-000000000001',
        name: data.name,
        species: data.species,
        breed: null,
        gender: data.gender,
        color: null,
        age: null,
        intake_date: new Date(data.intakeDate).toISOString(),
        status: 'available',
        microchip_id: null,
        description: data.description || null,
        behavior_notes: data.intakeNotes || null,
        is_spayed_neutered: false,
        is_vaccinated: false,
        photos: photos,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      toast({
        title: "Animal Intake Complete!",
        description: "The animal has been successfully added to the system.",
      });
      setOpen(false);
      form.reset();
      setPhotos([]);
      setSelectedScenario(null);
    },
    onError: (error: any) => {
      toast({
        title: "Intake Failed",
        description: error.message || "Failed to create animal record",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = async (data: QuickIntakeFormData) => {
    if (!data.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter an animal name",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createAnimalMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle advanced intake
  const handleAdvancedIntake = () => {
    setOpen(false);
    setLocation('/intake');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-border/50">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            Quick Animal Intake
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Quickly add a new animal to the system. Choose a common scenario or use the advanced form.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scenario Selection */}
          {!selectedScenario && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Choose Intake Type</h3>
                  <p className="text-sm text-muted-foreground mt-1">Select the most common scenario for this animal</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdvancedIntake}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Advanced Intake
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {intakeScenarios.map((scenario) => (
                  <Card
                    key={scenario.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-lg border-2 transform hover:scale-105",
                      scenario.color,
                      selectedScenario === scenario.id && "ring-2 ring-primary ring-offset-2 shadow-lg scale-105"
                    )}
                    onClick={() => handleScenarioSelect(scenario)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl mb-3">{scenario.icon}</div>
                      <h4 className="font-semibold text-base mb-2">{scenario.label}</h4>
                      <p className="text-sm opacity-80 leading-relaxed">
                        {scenario.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quick Form */}
          {selectedScenario && (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Selected Scenario Badge */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {intakeScenarios.find(s => s.id === selectedScenario)?.icon}
                  </div>
                  <div>
                    <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
                      {intakeScenarios.find(s => s.id === selectedScenario)?.label}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {intakeScenarios.find(s => s.id === selectedScenario)?.description}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedScenario(null)}
                  className="hover:bg-primary/10"
                >
                  Change Type
                </Button>
              </div>

              {/* Essential Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Animal Name *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Enter animal name"
                    className={form.formState.errors.name ? "border-destructive" : ""}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={form.watch('gender')}
                    onValueChange={(value) => form.setValue('gender', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Intake Date */}
              <div className="space-y-2">
                <Label htmlFor="intakeDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Intake Date *
                </Label>
                <Input
                  id="intakeDate"
                  type="date"
                  {...form.register('intakeDate')}
                  className={form.formState.errors.intakeDate ? "border-destructive" : ""}
                />
                {form.formState.errors.intakeDate && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.intakeDate.message}
                  </p>
                )}
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Photos</Label>
                <PhotoUpload
                  existingPhotos={photos}
                  onPhotosChange={setPhotos}
                  maxPhotos={3}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  Add up to 3 photos to help identify the animal
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Physical description, behavior, condition..."
                  rows={3}
                />
              </div>

              {/* Intake Notes */}
              <div className="space-y-2">
                <Label htmlFor="intakeNotes">Intake Notes</Label>
                <Textarea
                  id="intakeNotes"
                  {...form.register('intakeNotes')}
                  placeholder="Where found, circumstances, any immediate concerns..."
                  rows={2}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t bg-muted/30 -mx-6 px-6 py-4 rounded-b-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Intake Date: {formatIntakeDate(form.watch('intakeDate'))}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isSubmitting}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !form.watch('name')?.trim()}
                    className="min-w-[140px] bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Add Animal
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
