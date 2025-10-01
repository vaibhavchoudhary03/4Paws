import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Weight, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";

export default function FosterPortal() {
  const { data: fosterAnimals = [] } = useQuery({
    queryKey: ["/api/v1/animals"],
    select: (data: any[]) => data.filter(a => a.status === 'fostered').slice(0, 2),
  });

  return (
    <AppLayout title="My Foster Animals" subtitle="Welcome back! You have 2 animals in your care.">
      {/* Availability Toggle */}
      <Card className="mb-6" data-testid="card-availability">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Foster Availability</h3>
              <p className="text-sm text-muted-foreground">
                Let us know when you're available to take in more animals
              </p>
            </div>
            <Switch defaultChecked data-testid="switch-availability" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1">Preferred Species</Label>
              <Select defaultValue="puppies">
                <SelectTrigger data-testid="select-species">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dogs">Dogs</SelectItem>
                  <SelectItem value="puppies">Puppies</SelectItem>
                  <SelectItem value="cats">Cats</SelectItem>
                  <SelectItem value="kittens">Kittens</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1">Max Capacity</Label>
              <Select defaultValue="2">
                <SelectTrigger data-testid="select-capacity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 animal</SelectItem>
                  <SelectItem value="2">2 animals</SelectItem>
                  <SelectItem value="3">3 animals</SelectItem>
                  <SelectItem value="4">4+ animals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Foster Animals */}
      <div className="grid gap-6 lg:grid-cols-2">
        {fosterAnimals.map((animal: any) => (
          <Card key={animal.id} className="overflow-hidden" data-testid={`card-foster-animal-${animal.id}`}>
            <div className="w-full h-48 bg-muted flex items-center justify-center">
              <span className="text-6xl">🐕</span>
            </div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground" data-testid={`text-animal-name-${animal.name}`}>
                    {animal.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {animal.breed} • {animal.sex} • 10 weeks
                  </p>
                </div>
                <Badge className="bg-success/10 text-success">
                  Day 12 of foster
                </Badge>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-foreground">8.2</p>
                  <p className="text-xs text-muted-foreground">lbs</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-foreground">3</p>
                  <p className="text-xs text-muted-foreground">updates</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-foreground">12</p>
                  <p className="text-xs text-muted-foreground">photos</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full" data-testid={`button-add-photo-${animal.id}`}>
                  <Camera className="w-4 h-4 mr-2" />
                  Add Photo
                </Button>
                <Button variant="outline" className="w-full" data-testid={`button-log-weight-${animal.id}`}>
                  <Weight className="w-4 h-4 mr-2" />
                  Log Weight
                </Button>
                <Button variant="outline" className="w-full col-span-2" data-testid={`button-add-note-${animal.id}`}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>

              {/* Medical Alert */}
              <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Dewormer Due Tomorrow</p>
                    <p className="text-xs text-muted-foreground">Drontal - 1 tablet with food</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Issue */}
      <Card className="mt-6" data-testid="card-report-issue">
        <CardHeader>
          <CardTitle>Report an Issue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" className="h-auto p-4 justify-start" data-testid="button-medical-issue">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Medical Issue</p>
                  <p className="text-xs text-muted-foreground">Report illness or injury</p>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start" data-testid="button-behavior-concern">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-warning" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Behavior Concern</p>
                  <p className="text-xs text-muted-foreground">Report behavioral issues</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
