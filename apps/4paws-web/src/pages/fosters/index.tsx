import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, CheckCircle, XCircle, Calendar } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function FostersIndex() {
  const { data: fosters = [], isLoading } = useQuery({
    queryKey: ["/api/v1/people"],
    select: (data: any[]) => data.filter(p => p.type === 'foster'),
  });

  return (
    <AppLayout title="Foster Management" subtitle={`${fosters.length} active fosters`}>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search fosters..." 
                className="pl-10"
                data-testid="input-search-fosters"
              />
            </div>
            <Select defaultValue="all-status">
              <SelectTrigger className="w-full lg:w-[180px]" data-testid="select-status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
            <Button data-testid="button-add-foster">
              <Plus className="w-4 h-4 mr-2" />
              Add Foster
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12" data-testid="loading-fosters">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : fosters.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={CheckCircle}
              title="No fosters yet"
              description="Add foster families to your network to provide temporary homes for animals"
              actionLabel="Add First Foster"
              onAction={() => {}}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fosters.map((foster: any) => {
            const isAvailable = foster.flags?.available !== false;
            return (
              <Card 
                key={foster.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                data-testid={`card-foster-${foster.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        isAvailable ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {foster.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground" data-testid={`text-name-${foster.id}`}>
                          {foster.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{foster.email}</p>
                      </div>
                    </div>
                    <Badge 
                      className={isAvailable ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}
                      data-testid={`badge-status-${foster.id}`}
                    >
                      {isAvailable ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Available
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Unavailable
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Max Capacity: <span className="text-foreground font-medium">
                        {foster.flags?.maxCapacity || 'Not set'}
                      </span>
                    </p>
                    {foster.phone && (
                      <p className="text-muted-foreground">
                        Phone: <span className="text-foreground">{foster.phone}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
