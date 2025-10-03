import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Check, Loader2, Clock, User, Calendar, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { volunteerActivitiesApi, animalsApi } from "@/lib/api";
import { AddPhotoDialog } from "@/components/dialogs/add-photo-dialog";

export default function VolunteerPortal() {
  const [selectedLocation, setSelectedLocation] = useState("main-shelter-dogs");
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [urgent, setUrgent] = useState<Record<string, boolean>>({});
  const [activityPending, setActivityPending] = useState<Record<string, boolean>>({});
  const [notePending, setNotePending] = useState<Record<string, boolean>>({});
  const [duration, setDuration] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock current user ID - in real app, this would come from auth context
  const currentUserId = "550e8400-e29b-41d4-a716-446655440001";

  const { data: allAnimals = [], isLoading: animalsLoading } = useQuery({
    queryKey: ["animals"],
    queryFn: animalsApi.getAll,
  });

  const { data: volunteerActivities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["volunteer-activities"],
    queryFn: volunteerActivitiesApi.getAll,
  });

  const animals = allAnimals.filter((a: any) => 
    a.status === 'available' || a.status === 'medical' || a.status === 'fostered'
  ).slice(0, 10);

  // Get today's activities for current volunteer
  const todayActivities = volunteerActivities.filter(activity => {
    const activityDate = new Date(activity.date);
    const today = new Date();
    return activity.volunteerId === currentUserId && 
           activityDate.toDateString() === today.toDateString();
  });

  const logActivityMutation = useMutation({
    mutationFn: async (data: { animalId: string; activity: string; animalName: string; duration?: number }) => {
      return volunteerActivitiesApi.create({
        volunteerId: currentUserId,
        animalId: data.animalId,
        activityType: data.activity,
        description: `Volunteer activity: ${data.activity}`,
        duration: data.duration,
        date: new Date().toISOString(),
        notes: `Activity logged for ${data.animalName}`,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["volunteer-activities"] });
      setActivityPending(prev => ({ ...prev, [variables.animalId]: false }));
      toast({
        title: "Activity Logged",
        description: `${variables.activity} logged for ${variables.animalName}`,
      });
    },
    onError: (error, variables) => {
      setActivityPending(prev => ({ ...prev, [variables.animalId]: false }));
      toast({
        title: "Error",
        description: (error as any).message || "Failed to log activity",
        variant: "destructive",
      });
    },
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (data: { animalId: string; note: string; tags: string[]; duration?: number }) => {
      return volunteerActivitiesApi.create({
        volunteerId: currentUserId,
        animalId: data.animalId,
        activityType: "note",
        description: data.note,
        duration: data.duration,
        date: new Date().toISOString(),
        notes: data.tags.join(", "),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["volunteer-activities"] });
      setNotePending(prev => ({ ...prev, [variables.animalId]: false }));
      toast({
        title: "Note Saved",
        description: "Your note has been saved successfully",
      });
      setNotes((prev) => ({ ...prev, [variables.animalId]: "" }));
      setUrgent((prev) => ({ ...prev, [variables.animalId]: false }));
    },
    onError: (error, variables) => {
      setNotePending(prev => ({ ...prev, [variables.animalId]: false }));
      toast({
        title: "Error",
        description: (error as any).message || "Failed to save note",
        variant: "destructive",
      });
    },
  });

  const handleActivity = (animalId: string, animalName: string, activity: string) => {
    setActivityPending(prev => ({ ...prev, [animalId]: true }));
    const activityDuration = duration[animalId] || undefined;
    logActivityMutation.mutate({ 
      animalId, 
      animalName, 
      activity, 
      duration: activityDuration 
    });
  };

  const handleSaveNote = (animalId: string) => {
    const noteText = notes[animalId];
    if (!noteText || !noteText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note before saving",
        variant: "destructive",
      });
      return;
    }
    const tags = ["volunteer_note"];
    if (urgent[animalId]) {
      tags.push("urgent");
    }
    setNotePending(prev => ({ ...prev, [animalId]: true }));
    const noteDuration = duration[animalId] || undefined;
    saveNoteMutation.mutate({ 
      animalId, 
      note: noteText, 
      tags, 
      duration: noteDuration 
    });
  };

  const handleAddPhoto = (animal: any) => {
    setSelectedAnimal(animal);
    setPhotoDialogOpen(true);
  };

  if (animalsLoading || activitiesLoading) {
    return (
      <AppLayout title="Volunteer Check-In" subtitle="Loading...">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="Volunteer Check-In" 
      subtitle={`Log your activities and help us track animal care • ${todayActivities.length} activities logged today`}
    >
      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{todayActivities.length}</p>
                <p className="text-sm text-muted-foreground">Activities Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {todayActivities.reduce((total, activity) => total + (activity.duration || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Minutes Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{animals.length}</p>
                <p className="text-sm text-muted-foreground">Animals Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Selection */}
      <Card className="mb-6" data-testid="card-location">
        <CardContent className="p-6">
          <label className="block text-sm font-medium text-foreground mb-2">Select Your Location</label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full" data-testid="select-location">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main-shelter-dogs">Main Shelter - Dog Area</SelectItem>
              <SelectItem value="main-shelter-cats">Main Shelter - Cat Area</SelectItem>
              <SelectItem value="main-shelter-small">Main Shelter - Small Animals</SelectItem>
              <SelectItem value="clinic">Clinic</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Animals at Location */}
      <Card data-testid="card-animals">
        <CardHeader className="border-b border-border">
          <CardTitle>Animals at This Location ({animals.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {animals.map((animal: any) => (
              <div 
                key={animal.id} 
                className="p-4 hover:bg-accent/50 transition-colors"
                data-testid={`animal-item-${animal.id}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-3xl">🐕</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground" data-testid={`text-animal-name-${animal.name}`}>
                      {animal.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {animal.breed} • {animal.sex}
                    </p>
                  </div>
                </div>

                {/* Duration Input */}
                <div className="mb-3">
                  <Label htmlFor={`duration-${animal.id}`} className="text-xs text-muted-foreground">
                    Duration (minutes) - Optional
                  </Label>
                  <Input
                    id={`duration-${animal.id}`}
                    type="number"
                    min="1"
                    max="480"
                    placeholder="e.g., 30"
                    className="mt-1"
                    value={duration[animal.id] || ""}
                    onChange={(e) => setDuration(prev => ({ 
                      ...prev, 
                      [animal.id]: e.target.value ? parseInt(e.target.value) : 0 
                    }))}
                  />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    data-testid={`button-walked-${animal.id}`}
                    onClick={() => handleActivity(animal.id, animal.name, "walked")}
                    disabled={activityPending[animal.id]}
                  >
                    {activityPending[animal.id] ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                    Walked
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    data-testid={`button-fed-${animal.id}`}
                    onClick={() => handleActivity(animal.id, animal.name, "fed")}
                    disabled={activityPending[animal.id]}
                  >
                    {activityPending[animal.id] ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                    Fed
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    data-testid={`button-play-${animal.id}`}
                    onClick={() => handleActivity(animal.id, animal.name, "play")}
                    disabled={activityPending[animal.id]}
                  >
                    {activityPending[animal.id] ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                    Play
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    data-testid={`button-photo-${animal.id}`}
                    onClick={() => handleAddPhoto(animal)}
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Photo
                  </Button>
                </div>

                {/* Note Section */}
                <div>
                  <Textarea
                    placeholder="Add a note about behavior, health, or anything else..."
                    className="mb-2"
                    rows={2}
                    data-testid={`textarea-note-${animal.id}`}
                    value={notes[animal.id] || ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [animal.id]: e.target.value }))}
                  />
                  <div className="flex justify-between items-center">
                    <label className="flex items-center text-sm text-muted-foreground cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-input text-primary mr-2"
                        data-testid={`checkbox-urgent-${animal.id}`}
                        checked={urgent[animal.id] || false}
                        onChange={(e) => setUrgent((prev) => ({ ...prev, [animal.id]: e.target.checked }))}
                      />
                      Flag as urgent
                    </label>
                    <Button 
                      size="sm"
                      data-testid={`button-save-note-${animal.id}`}
                      onClick={() => handleSaveNote(animal.id)}
                      disabled={notePending[animal.id]}
                    >
                      {notePending[animal.id] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Note
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* QR Code Info */}
      <Card className="mt-6 bg-accent/50 border-accent" data-testid="card-qr-info">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">QR Code Quick Access</h3>
              <p className="text-sm text-muted-foreground">
                Look for QR codes on kennel cards to quickly log activities for specific animals without searching.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedAnimal && (
        <AddPhotoDialog
          open={photoDialogOpen}
          onOpenChange={setPhotoDialogOpen}
          subjectType="animal"
          subjectId={selectedAnimal.id}
          subjectName={selectedAnimal.name}
        />
      )}
    </AppLayout>
  );
}
