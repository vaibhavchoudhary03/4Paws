import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Check } from "lucide-react";

export default function VolunteerPortal() {
  const [selectedLocation, setSelectedLocation] = useState("main-shelter-dogs");

  const mockAnimals = [
    { id: '1', name: 'Rocky', kennelCode: 'A-08', breed: 'Lab Mix' },
    { id: '2', name: 'Luna', kennelCode: 'A-12', breed: 'Husky' },
    { id: '3', name: 'Max', kennelCode: 'B-03', breed: 'Beagle' },
  ];

  return (
    <AppLayout title="Volunteer Check-In" subtitle="Log your activities and help us track animal care">
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
          <CardTitle>Animals at This Location ({mockAnimals.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {mockAnimals.map((animal) => (
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
                      {animal.breed} • Kennel {animal.kennelCode}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    data-testid={`button-walked-${animal.id}`}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Walked
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    data-testid={`button-fed-${animal.id}`}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Fed
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    data-testid={`button-play-${animal.id}`}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Play
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    data-testid={`button-photo-${animal.id}`}
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
                  />
                  <div className="flex justify-between items-center">
                    <label className="flex items-center text-sm text-muted-foreground cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-input text-primary mr-2"
                        data-testid={`checkbox-urgent-${animal.id}`}
                      />
                      Flag as urgent
                    </label>
                    <Button 
                      size="sm"
                      data-testid={`button-save-note-${animal.id}`}
                    >
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
    </AppLayout>
  );
}
