import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import AppLayout from "../../components/layout/app-layout";
import { animalsApi } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dog, Calendar, MapPin, Edit, Trash2, FileText, Stethoscope, Heart } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import PhotoGallery from "../../components/ui/photo-gallery";

export default function AnimalDetail() {
  const [, params] = useRoute("/animals/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: animal, isLoading, error } = useQuery({
    queryKey: ["animals", params?.id],
    queryFn: () => animalsApi.getById(params!.id),
    enabled: !!params?.id,
  });

  // Debug logging
  console.log('🔍 Animal Detail Debug:', {
    params,
    animalId: params?.id,
    isLoading,
    error,
    animal: animal ? 'Found' : 'Not found'
  });

  // ============================================================================
  // MUTATIONS - Handle animal updates and deletion
  // ============================================================================

  /**
   * MUTATION: Delete animal
   * 
   * Deletes the animal from Supabase and navigates back to animals list
   */
  const deleteAnimalMutation = useMutation({
    mutationFn: async (animalId: string) => {
      // For now, we'll just update the status to 'deleted' instead of actually deleting
      // This preserves data integrity and allows for recovery
      return await animalsApi.update(animalId, { status: 'deleted' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      toast({
        title: "Animal deleted",
        description: "The animal has been removed from the system",
      });
      setLocation("/animals");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete animal",
        variant: "destructive",
      });
    },
  });

  /**
   * Handle delete confirmation
   */
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${animal?.name}? This action cannot be undone.`)) {
      deleteAnimalMutation.mutate(animal!.id);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Loading..." subtitle="Please wait">
        <div className="flex items-center justify-center py-12" data-testid="loading-animal">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !animal) {
    return (
      <AppLayout title="Not Found" subtitle="Animal not found">
        <Card>
          <CardContent className="py-12 text-center">
            <Dog className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground mb-2">Animal not found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {error?.message || 'The animal you are looking for does not exist.'}
            </p>
            <Button onClick={() => setLocation("/animals")} data-testid="button-back-to-list">
              Back to Animals
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success/10 text-success';
      case 'fostered': return 'bg-secondary/20 text-secondary-foreground';
      case 'hold': return 'bg-warning/20 text-warning';
      case 'adopted': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AppLayout 
      title={animal.name} 
      subtitle={`${animal.breed} • ${animal.gender} • ID: ${animal.id.slice(0, 8)}`}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Photo and Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card data-testid="card-animal-photo">
            <CardContent className="p-0">
                  <div className="w-full aspect-square bg-muted flex items-center justify-center rounded-t-xl overflow-hidden">
                    {animal.photos && animal.photos.length > 0 ? (
                      <img 
                        src={animal.photos[0]} 
                        alt={animal.name}
                        className="w-full h-full object-cover"
                        data-testid="img-animal-main"
                      />
                    ) : (
                      <Dog className="w-24 h-24 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Photo Gallery */}
                  {animal.photos && animal.photos.length > 0 && (
                    <div className="mt-4">
                      <PhotoGallery
                        photos={animal.photos}
                        editable={false}
                        className="max-h-32"
                      />
                    </div>
                  )}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(animal.status)} data-testid="badge-animal-status">
                    {animal.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      data-testid="button-edit"
                      onClick={() => setLocation(`/animals/${animal.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      data-testid="button-delete"
                      onClick={handleDelete}
                      disabled={deleteAnimalMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Dog className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">Species:</span>
                    <span className="text-muted-foreground">{animal.species}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">Age:</span>
                    <span className="text-muted-foreground">
                      {animal.age ? `${animal.age} months` : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">Location:</span>
                    <span className="text-muted-foreground">{animal.microchip_id || 'No kennel'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details" data-testid="tab-details">
                <FileText className="w-4 h-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="medical" data-testid="tab-medical">
                <Stethoscope className="w-4 h-4 mr-2" />
                Medical
              </TabsTrigger>
              <TabsTrigger value="applications" data-testid="tab-applications">
                <Heart className="w-4 h-4 mr-2" />
                Applications
              </TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">
                <Calendar className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <Card data-testid="card-details">
                <CardHeader>
                  <CardTitle>Animal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Breed</p>
                      <p className="text-foreground" data-testid="text-breed">{animal.breed}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Color</p>
                      <p className="text-foreground" data-testid="text-color">{animal.color}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Gender</p>
                      <p className="text-foreground" data-testid="text-gender">{animal.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Intake Date</p>
                      <p className="text-foreground" data-testid="text-intake-date">
                        {new Date(animal.intake_date).toLocaleDateString()}
                      </p>
                    </div>
                    {animal.microchip_id && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Microchip</p>
                        <p className="text-foreground font-mono" data-testid="text-microchip">{animal.microchip_id}</p>
                      </div>
                    )}
                  </div>
                  {animal.description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                      <p className="text-foreground" data-testid="text-description">{animal.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical" className="mt-6">
              <Card data-testid="card-medical">
                <CardHeader>
                  <CardTitle>Medical History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No medical records found</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications" className="mt-6">
              <Card data-testid="card-applications">
                <CardHeader>
                  <CardTitle>Adoption Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No applications yet</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card data-testid="card-history">
                <CardHeader>
                  <CardTitle>Activity History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No activity history</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
