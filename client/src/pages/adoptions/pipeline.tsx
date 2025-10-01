import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AppLayout from "@/components/layout/app-layout";
import { applicationsApi } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/empty-state";

export default function AdoptionsPipeline() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/applications"],
  });

  const updateApplicationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => applicationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/applications"] });
      toast({
        title: "Application updated",
        description: "Status has been changed successfully",
      });
    },
  });

  const columns = [
    { id: 'received', title: 'Received', color: 'bg-blue-500' },
    { id: 'review', title: 'Under Review', color: 'bg-secondary' },
    { id: 'approved', title: 'Approved', color: 'bg-success' },
    { id: 'checkout', title: 'Checkout', color: 'bg-primary' },
  ];

  const getApplicationsByStatus = (status: string) => {
    return applications.filter((app: any) => app.status === status);
  };

  const handleStatusChange = (appId: string, newStatus: string) => {
    updateApplicationMutation.mutate({ id: appId, data: { status: newStatus } });
  };

  const handleCheckout = (appId: string) => {
    setLocation(`/adoptions/checkout?applicationId=${appId}`);
  };

  return (
    <AppLayout 
      title="Adoption Pipeline" 
      subtitle={`${applications.length} applications • Track from submission to adoption`}
    >
      <Card className="mb-6">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Select defaultValue="all-animals">
                <SelectTrigger className="w-[180px]" data-testid="select-animal-filter">
                  <SelectValue placeholder="All Animals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-animals">All Animals</SelectItem>
                  <SelectItem value="dogs">Dogs</SelectItem>
                  <SelectItem value="cats">Cats</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button data-testid="button-new-application">
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="text-center py-12" data-testid="loading-applications">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={User}
              title="No applications yet"
              description="Adoption applications will appear here as they are submitted"
              actionLabel="Create Application"
              onAction={() => {}}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {columns.map((column) => {
              const columnApps = getApplicationsByStatus(column.id);
              return (
                <Card key={column.id} className="w-80 flex-shrink-0" data-testid={`column-${column.id}`}>
                  <CardHeader className="border-b border-border bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${column.color}`}></div>
                        <h3 className="font-semibold text-foreground">{column.title}</h3>
                      </div>
                      <Badge variant="secondary" data-testid={`badge-count-${column.id}`}>
                        {columnApps.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                    {columnApps.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm" data-testid={`empty-${column.id}`}>
                        No applications
                      </div>
                    ) : (
                      columnApps.map((app: any) => (
                        <Card 
                          key={app.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          data-testid={`card-app-${app.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                <User className="w-6 h-6 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate" data-testid={`text-animal-${app.animal?.name}`}>
                                  {app.animal?.name || 'Unknown'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {app.animal?.breed || 'Unknown breed'}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <p className="text-sm text-foreground" data-testid={`text-applicant-${app.person?.name}`}>
                                  {app.person?.name || 'Unknown'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">
                                  {new Date(app.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {column.id === 'approved' && (
                              <Button 
                                className="w-full mt-3" 
                                size="sm"
                                onClick={() => handleCheckout(app.id)}
                                data-testid={`button-checkout-${app.id}`}
                              >
                                Proceed to Checkout
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
