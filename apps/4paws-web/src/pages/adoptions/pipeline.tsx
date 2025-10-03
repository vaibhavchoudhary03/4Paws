import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AppLayout from "@/components/layout/app-layout";
import { applicationsApi } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, User, Calendar, CheckCircle, XCircle, Eye, MoreHorizontal, Clock, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/empty-state";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AdoptionsPipeline() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: string; appId: string }>({
    open: false,
    action: '',
    appId: ''
  });
  const [notes, setNotes] = useState('');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["adoptions"],
    queryFn: applicationsApi.getAll,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string, status: string, notes?: string }) => 
      applicationsApi.updateStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adoptions"] });
      setActionDialog({ open: false, action: '', appId: '' });
      setNotes('');
      toast({
        title: "Application updated",
        description: "Status has been changed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string, notes?: string }) => 
      applicationsApi.approve(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adoptions"] });
      setActionDialog({ open: false, action: '', appId: '' });
      setNotes('');
      toast({
        title: "Application approved",
        description: "The application has been approved successfully",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string, notes?: string }) => 
      applicationsApi.reject(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adoptions"] });
      setActionDialog({ open: false, action: '', appId: '' });
      setNotes('');
      toast({
        title: "Application rejected",
        description: "The application has been rejected",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, adoptionFee, notes }: { id: string, adoptionFee?: number, notes?: string }) => 
      applicationsApi.complete(id, adoptionFee, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adoptions"] });
      setActionDialog({ open: false, action: '', appId: '' });
      setNotes('');
      toast({
        title: "Adoption completed",
        description: "The adoption has been completed successfully",
      });
    },
  });

  const columns = [
    { id: 'pending', title: 'Received', color: 'bg-blue-500', description: 'New applications awaiting review' },
    { id: 'review', title: 'Under Review', color: 'bg-yellow-500', description: 'Applications being evaluated' },
    { id: 'approved', title: 'Approved', color: 'bg-green-500', description: 'Ready for adoption' },
    { id: 'completed', title: 'Completed', color: 'bg-purple-500', description: 'Successfully adopted' },
  ];

  const getApplicationsByStatus = (status: string) => {
    return applications.filter((app: any) => app.status === status);
  };

  const handleAction = (action: string, appId: string) => {
    setActionDialog({ open: true, action, appId });
    setNotes('');
  };

  const handleConfirmAction = () => {
    const { action, appId } = actionDialog;
    
    switch (action) {
      case 'approve':
        approveMutation.mutate({ id: appId, notes: notes || undefined });
        break;
      case 'reject':
        rejectMutation.mutate({ id: appId, notes: notes || undefined });
        break;
      case 'complete':
        completeMutation.mutate({ id: appId, notes: notes || undefined });
        break;
      case 'review':
        updateStatusMutation.mutate({ id: appId, status: 'review', notes: notes || undefined });
        break;
      default:
        break;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'review': return 'default';
      case 'approved': return 'default';
      case 'completed': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-blue-600 bg-blue-50';
      case 'review': return 'text-yellow-600 bg-yellow-50';
      case 'approved': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-purple-600 bg-purple-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
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
            <Button 
              data-testid="button-new-application"
              onClick={() => setLocation('/adoptions/create')}
            >
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
                        <div>
                          <h3 className="font-semibold text-foreground">{column.title}</h3>
                          <p className="text-xs text-muted-foreground">{column.description}</p>
                        </div>
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
                          className="cursor-pointer hover:shadow-md transition-shadow group"
                          data-testid={`card-app-${app.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                {app.animal?.photos?.[0] ? (
                                  <img 
                                    src={app.animal.photos[0]} 
                                    alt={app.animal.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                ) : (
                                  <User className="w-6 h-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-foreground truncate" data-testid={`text-animal-${app.animal?.name}`}>
                                    {app.animal?.name || 'Unknown'}
                                  </p>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => setSelectedApp(app)}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      {app.status === 'pending' && (
                                        <DropdownMenuItem onClick={() => handleAction('review', app.id)}>
                                          <Clock className="w-4 h-4 mr-2" />
                                          Move to Review
                                        </DropdownMenuItem>
                                      )}
                                      {app.status === 'review' && (
                                        <>
                                          <DropdownMenuItem onClick={() => handleAction('approve', app.id)}>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Approve
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleAction('reject', app.id)}>
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                      {app.status === 'approved' && (
                                        <DropdownMenuItem onClick={() => handleAction('complete', app.id)}>
                                          <DollarSign className="w-4 h-4 mr-2" />
                                          Complete Adoption
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {app.animal?.breed || 'Unknown breed'} • {app.animal?.species}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <p className="text-sm text-foreground" data-testid={`text-applicant-${app.adopter_name}`}>
                                  {app.adopter_name || 'Unknown'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">
                                  Applied {new Date(app.application_date).toLocaleDateString()}
                                </p>
                              </div>
                              {app.adoption_fee && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">
                                    Fee: ${(app.adoption_fee / 100).toFixed(2)}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="mt-3 flex gap-2">
                              {app.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleAction('review', app.id)}
                                  className="flex-1"
                                >
                                  <Clock className="w-4 h-4 mr-1" />
                                  Review
                                </Button>
                              )}
                              {app.status === 'review' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleAction('approve', app.id)}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleAction('reject', app.id)}
                                    className="flex-1"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {app.status === 'approved' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleAction('complete', app.id)}
                                  className="flex-1"
                                >
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  Complete
                                </Button>
                              )}
                            </div>
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

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'approve' && 'Approve Application'}
              {actionDialog.action === 'reject' && 'Reject Application'}
              {actionDialog.action === 'complete' && 'Complete Adoption'}
              {actionDialog.action === 'review' && 'Move to Review'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {actionDialog.action === 'approve' && 'Are you sure you want to approve this application?'}
              {actionDialog.action === 'reject' && 'Are you sure you want to reject this application?'}
              {actionDialog.action === 'complete' && 'Are you ready to complete this adoption?'}
              {actionDialog.action === 'review' && 'Move this application to review status?'}
            </p>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this action..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setActionDialog({ open: false, action: '', appId: '' })}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmAction}
                disabled={updateStatusMutation.isPending || approveMutation.isPending || rejectMutation.isPending || completeMutation.isPending}
              >
                {updateStatusMutation.isPending || approveMutation.isPending || rejectMutation.isPending || completeMutation.isPending ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Application Details Modal */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Animal Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedApp.animal?.name || 'Unknown'}</p>
                    <p><strong>Breed:</strong> {selectedApp.animal?.breed || 'Unknown'}</p>
                    <p><strong>Species:</strong> {selectedApp.animal?.species || 'Unknown'}</p>
                    <p><strong>Age:</strong> {selectedApp.animal?.age || 'Unknown'}</p>
                    <p><strong>Gender:</strong> {selectedApp.animal?.gender || 'Unknown'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Applicant Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedApp.adopter_name}</p>
                    <p><strong>Email:</strong> {selectedApp.adopter_email}</p>
                    <p><strong>Phone:</strong> {selectedApp.adopter_phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Application Details</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Status:</strong> 
                    <Badge variant={getStatusBadgeVariant(selectedApp.status)} className="ml-2">
                      {selectedApp.status}
                    </Badge>
                  </p>
                  <p><strong>Application Date:</strong> {new Date(selectedApp.application_date).toLocaleDateString()}</p>
                  {selectedApp.approval_date && (
                    <p><strong>Approval Date:</strong> {new Date(selectedApp.approval_date).toLocaleDateString()}</p>
                  )}
                  {selectedApp.adoption_date && (
                    <p><strong>Adoption Date:</strong> {new Date(selectedApp.adoption_date).toLocaleDateString()}</p>
                  )}
                  {selectedApp.adoption_fee && (
                    <p><strong>Adoption Fee:</strong> ${(selectedApp.adoption_fee / 100).toFixed(2)}</p>
                  )}
                </div>
              </div>

              {selectedApp.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedApp.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedApp(null)}>
                  Close
                </Button>
                {selectedApp.status === 'pending' && (
                  <Button onClick={() => handleAction('review', selectedApp.id)}>
                    Move to Review
                  </Button>
                )}
                {selectedApp.status === 'review' && (
                  <>
                    <Button variant="outline" onClick={() => handleAction('reject', selectedApp.id)}>
                      Reject
                    </Button>
                    <Button onClick={() => handleAction('approve', selectedApp.id)}>
                      Approve
                    </Button>
                  </>
                )}
                {selectedApp.status === 'approved' && (
                  <Button onClick={() => handleAction('complete', selectedApp.id)}>
                    Complete Adoption
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
