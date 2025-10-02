import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Calendar, MapPin, Dog } from "lucide-react";

interface AnimalCardProps {
  animal: {
    id: string;
    name: string;
    species: string;
    breed: string;
    sex: string;
    status: string;
    intakeDate: string;
    kennelId?: string;
    locationId?: string;
    photos?: string[];
  };
  onClick?: () => void;
}

export function AnimalCard({ animal, onClick }: AnimalCardProps) {
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
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" 
      onClick={onClick}
      data-testid={`card-animal-${animal.id}`}
    >
      <div className="w-full h-48 bg-muted flex items-center justify-center">
        {animal.photos && animal.photos.length > 0 ? (
          <img 
            src={animal.photos[0]} 
            alt={animal.name} 
            className="w-full h-full object-cover"
            data-testid={`img-animal-${animal.id}`}
          />
        ) : (
          <Dog className="w-12 h-12 text-muted-foreground" />
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-foreground" data-testid={`text-name-${animal.name}`}>
              {animal.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {animal.breed} • {animal.sex}
            </p>
          </div>
          <Badge className={getStatusColor(animal.status)} data-testid={`badge-status-${animal.id}`}>
            {animal.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>{animal.kennelId || 'No kennel'}</span>
          <span>•</span>
          <Calendar className="w-3 h-3" />
          <span>{new Date(animal.intakeDate).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
