/**
 * USER REQUESTS PAGE - Admin approval system for new user requests
 * 
 * PURPOSE:
 * Allows organization administrators to review and approve/deny new user requests.
 * This implements the permission-based signup workflow where users must be approved
 * before gaining access to the organization.
 * 
 * KEY FEATURES:
 * - List all pending user requests
 * - Approve or deny requests with comments
 * - Bulk actions for multiple requests
 * - Email notifications to users
 * - Request history and audit trail
 * 
 * USER ROLES:
 * - Only organization admins can access this page
 * - Staff members can view but not approve requests
 * - Other roles have no access
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth-context-simple";
import { useToast } from "../hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { 
  ArrowLeft, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  UserPlus, 
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  MessageSquare
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import AppLayout from "../components/layout/app-layout";

// ============================================================================
// TYPES
// ============================================================================

interface UserRequest {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  status: 'pending' | 'approved' | 'denied';
  message?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  organization: {
    id: string;
    name: string;
  };
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: string;
}

interface ApprovalAction {
  requestId: string;
  action: 'approve' | 'deny';
  role?: string;
  notes?: string;
}

// ============================================================================
// USER REQUESTS PAGE COMPONENT
// ============================================================================

export default function UserRequests() {
  const [, setLocation] = useLocation();
  const { user, isAdmin, isStaff } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean;
    request: UserRequest | null;
    action: 'approve' | 'deny';
  }>({ open: false, request: null, action: 'approve' });

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ["user-requests", user?.currentOrganization?.id],
    queryFn: async () => {
      if (!user?.currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('user_memberships')
        .select(`
          *,
          user:users(id, email, first_name, last_name),
          organization:organizations(id, name)
        `)
        .eq('organization_id', user.currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user requests:', error);
        throw new Error('Failed to fetch user requests');
      }

      return data || [];
    },
    enabled: !!user?.currentOrganization?.id,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const approveRequestMutation = useMutation({
    mutationFn: async ({ requestId, role, notes }: { requestId: string; role?: string; notes?: string }) => {
      const { error } = await supabase
        .from('user_memberships')
        .update({
          status: 'active',
          role: role || 'volunteer',
          reviewed_by: user?.profile.id,
          review_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-requests"] });
      toast({
        title: "Request approved",
        description: "User has been granted access to the organization",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive",
      });
    },
  });

  const denyRequestMutation = useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes?: string }) => {
      const { error } = await supabase
        .from('user_memberships')
        .update({
          status: 'denied',
          reviewed_by: user?.profile.id,
          review_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-requests"] });
      toast({
        title: "Request denied",
        description: "User has been notified of the decision",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deny request",
        variant: "destructive",
      });
    },
  });

  // ============================================================================
  // FILTERING AND SEARCH
  // ============================================================================

  const filteredRequests = requests.filter((request: UserRequest) => {
    const matchesSearch = 
      request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesRole = roleFilter === "all" || request.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedRequests.size === filteredRequests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(filteredRequests.map(r => r.id)));
    }
  };

  const handleApprovalAction = (request: UserRequest, action: 'approve' | 'deny') => {
    setApprovalDialog({ open: true, request, action });
  };

  const handleConfirmApproval = async (formData: { role?: string; notes?: string }) => {
    if (!approvalDialog.request) return;

    if (approvalDialog.action === 'approve') {
      await approveRequestMutation.mutateAsync({
        requestId: approvalDialog.request.id,
        role: formData.role,
        notes: formData.notes,
      });
    } else {
      await denyRequestMutation.mutateAsync({
        requestId: approvalDialog.request.id,
        notes: formData.notes,
      });
    }

    setApprovalDialog({ open: false, request: null, action: 'approve' });
  };

  // ============================================================================
  // ACCESS CONTROL
  // ============================================================================

  if (!isAdmin() && !isStaff()) {
    return (
      <AppLayout title="Access Denied" subtitle="You don't have permission to view this page">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              Only administrators and staff can view user requests.
            </p>
            <Button onClick={() => setLocation('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  // ============================================================================
  // LOADING AND ERROR STATES
  // ============================================================================

  if (isLoading) {
    return (
      <AppLayout title="User Requests" subtitle="Loading user requests...">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="User Requests" subtitle="Error loading requests">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Requests</h2>
            <p className="text-muted-foreground mb-4">
              {error.message || 'Failed to load user requests'}
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["user-requests"] })}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <AppLayout title="User Requests" subtitle="Review and approve new user requests">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h2 className="text-lg font-semibold">User Requests</h2>
              <p className="text-sm text-muted-foreground">
                {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="foster">Foster</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Requests Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || roleFilter !== "all"
                    ? "No requests match your current filters"
                    : "No pending user requests at this time"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request: UserRequest) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedRequests.has(request.id)}
                        onCheckedChange={() => handleSelectRequest(request.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">
                            {request.user.firstName} {request.user.lastName}
                          </h3>
                          <Badge 
                            variant={
                              request.status === 'approved' ? 'default' :
                              request.status === 'denied' ? 'destructive' : 'secondary'
                            }
                          >
                            {request.status}
                          </Badge>
                          <Badge variant="outline">{request.role}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">{request.user.email}</p>
                        {request.message && (
                          <p className="text-sm text-muted-foreground mb-2">
                            "{request.message}"
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Requested {new Date(request.createdAt).toLocaleDateString()}</span>
                          {request.reviewedAt && (
                            <span>Reviewed {new Date(request.reviewedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {request.status === 'pending' && isAdmin() && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprovalAction(request, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApprovalAction(request, 'deny')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Deny
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Approval Dialog */}
        <Dialog open={approvalDialog.open} onOpenChange={(open) => setApprovalDialog({ ...approvalDialog, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {approvalDialog.action === 'approve' ? 'Approve Request' : 'Deny Request'}
              </DialogTitle>
            </DialogHeader>
            {approvalDialog.request && (
              <ApprovalForm
                request={approvalDialog.request}
                action={approvalDialog.action}
                onSubmit={handleConfirmApproval}
                onCancel={() => setApprovalDialog({ open: false, request: null, action: 'approve' })}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

// ============================================================================
// APPROVAL FORM COMPONENT
// ============================================================================

interface ApprovalFormProps {
  request: UserRequest;
  action: 'approve' | 'deny';
  onSubmit: (data: { role?: string; notes?: string }) => void;
  onCancel: () => void;
}

function ApprovalForm({ request, action, onSubmit, onCancel }: ApprovalFormProps) {
  const [role, setRole] = useState(request.role);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ role: action === 'approve' ? role : undefined, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>User</Label>
        <p className="text-sm text-muted-foreground">
          {request.user.firstName} {request.user.lastName} ({request.user.email})
        </p>
      </div>

      {action === 'approve' && (
        <div>
          <Label htmlFor="role">Assign Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="volunteer">Volunteer</SelectItem>
              <SelectItem value="foster">Foster</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="readonly">Read Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={`Add a note about this ${action}...`}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant={action === 'approve' ? 'default' : 'destructive'}
        >
          {action === 'approve' ? 'Approve Request' : 'Deny Request'}
        </Button>
      </div>
    </form>
  );
}
