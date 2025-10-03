import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Badge } from "../../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { useToast } from "../../hooks/use-toast";
import { peopleApi } from "../../lib/api";
import { Users, Plus, Search, Mail, Phone, MapPin, Loader2, MoreHorizontal, Edit, Trash2, Eye, User, Calendar, Shield, Home, Heart, Gift } from "lucide-react";
import AppLayout from "../../components/layout/app-layout";

const personSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "staff", "volunteer", "foster", "adopter", "donor"]),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  availability: z.string().optional(),
  notes: z.string().optional(),
});

type PersonFormData = z.infer<typeof personSchema>;

export default function PeopleIndex() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: people = [], isLoading } = useQuery({
    queryKey: ["people"],
    queryFn: peopleApi.getAll,
  });

  const createPersonMutation = useMutation({
    mutationFn: async (data: PersonFormData) => {
      return peopleApi.create({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        organization_id: "00000000-0000-0000-0000-000000000001", // Mock org ID
        profile: {
          phone: data.phone,
          address: data.address,
          bio: data.bio,
          emergency_contact: data.emergency_contact,
          emergency_phone: data.emergency_phone,
          skills: data.skills,
          availability: data.availability,
          notes: data.notes,
        },
        is_active: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Person created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create person",
        variant: "destructive",
      });
    },
  });

  const updatePersonMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: PersonFormData }) => {
      return peopleApi.update(id, {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        profile: {
          phone: data.phone,
          address: data.address,
          bio: data.bio,
          emergency_contact: data.emergency_contact,
          emergency_phone: data.emergency_phone,
          skills: data.skills,
          availability: data.availability,
          notes: data.notes,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      setEditDialogOpen(false);
      setSelectedPerson(null);
      form.reset();
      toast({
        title: "Success",
        description: "Person updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update person",
        variant: "destructive",
      });
    },
  });

  const deletePersonMutation = useMutation({
    mutationFn: async (id: string) => {
      return peopleApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      toast({
        title: "Success",
        description: "Person deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete person",
        variant: "destructive",
      });
    },
  });

  const form = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      role: "volunteer",
      phone: "",
      address: "",
      bio: "",
      emergency_contact: "",
      emergency_phone: "",
      skills: [],
      availability: "",
      notes: "",
    },
  });

  const onSubmit = (data: PersonFormData) => {
    if (selectedPerson) {
      updatePersonMutation.mutate({ id: selectedPerson.id, data });
    } else {
      createPersonMutation.mutate(data);
    }
  };

  const handleEdit = (person: any) => {
    setSelectedPerson(person);
    form.reset({
      email: person.email,
      first_name: person.first_name || "",
      last_name: person.last_name || "",
      role: person.role,
      phone: person.profile?.phone || "",
      address: person.profile?.address || "",
      bio: person.profile?.bio || "",
      emergency_contact: person.profile?.emergency_contact || "",
      emergency_phone: person.profile?.emergency_phone || "",
      skills: person.profile?.skills || [],
      availability: person.profile?.availability || "",
      notes: person.profile?.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleView = (person: any) => {
    setSelectedPerson(person);
    setViewDialogOpen(true);
  };

  const handleDelete = (person: any) => {
    if (confirm(`Are you sure you want to delete ${person.first_name} ${person.last_name}?`)) {
      deletePersonMutation.mutate(person.id);
    }
  };

  const filteredPeople = people.filter((person) => {
    const fullName = `${person.first_name || ''} ${person.last_name || ''}`.trim();
    const matchesSearch = searchTerm === "" || 
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.profile?.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || person.role === selectedType;
    return matchesSearch && matchesType;
  });

  const peopleByType = {
    all: filteredPeople,
    admin: filteredPeople.filter(p => p.role === "admin"),
    staff: filteredPeople.filter(p => p.role === "staff"),
    volunteer: filteredPeople.filter(p => p.role === "volunteer"),
    foster: filteredPeople.filter(p => p.role === "foster"),
    adopter: filteredPeople.filter(p => p.role === "adopter"),
    donor: filteredPeople.filter(p => p.role === "donor"),
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "staff": return "default";
      case "volunteer": return "secondary";
      case "foster": return "outline";
      case "adopter": return "secondary";
      case "donor": return "outline";
      default: return "outline";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Shield className="w-4 h-4" />;
      case "staff": return <User className="w-4 h-4" />;
      case "volunteer": return <Users className="w-4 h-4" />;
      case "foster": return <Home className="w-4 h-4" />;
      case "adopter": return <Heart className="w-4 h-4" />;
      case "donor": return <Gift className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const renderPersonCard = (person: any) => {
    const fullName = `${person.first_name || ''} ${person.last_name || ''}`.trim() || person.email;
    
    return (
      <Card key={person.id} className="hover:shadow-md transition-shadow" data-testid={`card-person-${person.id}`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg" data-testid={`text-person-name-${person.id}`}>
                  {fullName}
                </h3>
                <Badge variant={getRoleBadgeVariant(person.role)} className="text-xs">
                  {getRoleIcon(person.role)}
                  <span className="ml-1 capitalize">{person.role}</span>
                </Badge>
              </div>
              
              {person.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-person-email-${person.id}`}>
                  <Mail className="w-4 h-4" />
                  <span>{person.email}</span>
                </div>
              )}
              
              {person.profile?.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-person-phone-${person.id}`}>
                  <Phone className="w-4 h-4" />
                  <span>{person.profile.phone}</span>
                </div>
              )}
              
              {person.profile?.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-person-address-${person.id}`}>
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{person.profile.address}</span>
                </div>
              )}

              {person.profile?.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {person.profile.bio}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Joined {new Date(person.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-testid={`button-actions-${person.id}`}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleView(person)} data-testid={`button-view-${person.id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(person)} data-testid={`button-edit-${person.id}`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDelete(person)} 
                  data-testid={`button-delete-${person.id}`}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout title="People" subtitle="Manage adopters, fosters, volunteers, donors, and staff">
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-person">
                <Plus className="w-4 h-4 mr-2" />
                Add Person
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Person</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-first-name" placeholder="John" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-role">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="volunteer">Volunteer</SelectItem>
                            <SelectItem value="foster">Foster</SelectItem>
                            <SelectItem value="adopter">Adopter</SelectItem>
                            <SelectItem value="donor">Donor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} type="email" data-testid="input-person-email" placeholder="john@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} data-testid="input-person-phone" placeholder="(555) 555-5555" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} data-testid="input-person-address" placeholder="123 Main St, City, State ZIP" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createPersonMutation.isPending}
                      data-testid="button-submit-person"
                    >
                      {createPersonMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Person
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-people"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter-type">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="adopter">Adopters</SelectItem>
              <SelectItem value="foster">Fosters</SelectItem>
              <SelectItem value="volunteer">Volunteers</SelectItem>
              <SelectItem value="donor">Donors</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">
              All ({peopleByType.all.length})
            </TabsTrigger>
            <TabsTrigger value="admin" data-testid="tab-admin">
              Admins ({peopleByType.admin.length})
            </TabsTrigger>
            <TabsTrigger value="staff" data-testid="tab-staff">
              Staff ({peopleByType.staff.length})
            </TabsTrigger>
            <TabsTrigger value="volunteer" data-testid="tab-volunteer">
              Volunteers ({peopleByType.volunteer.length})
            </TabsTrigger>
            <TabsTrigger value="foster" data-testid="tab-foster">
              Fosters ({peopleByType.foster.length})
            </TabsTrigger>
            <TabsTrigger value="adopter" data-testid="tab-adopter">
              Adopters ({peopleByType.adopter.length})
            </TabsTrigger>
            <TabsTrigger value="donor" data-testid="tab-donor">
              Donors ({peopleByType.donor.length})
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <TabsContent value="all" className="space-y-4">
                {peopleByType.all.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No people found. Add your first person to get started.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {peopleByType.all.map(renderPersonCard)}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="admin" className="space-y-4">
                {peopleByType.admin.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No administrators found.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {peopleByType.admin.map(renderPersonCard)}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="staff" className="space-y-4">
                {peopleByType.staff.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No staff found.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {peopleByType.staff.map(renderPersonCard)}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="volunteer" className="space-y-4">
                {peopleByType.volunteer.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No volunteers found.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {peopleByType.volunteer.map(renderPersonCard)}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="foster" className="space-y-4">
                {peopleByType.foster.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No fosters found.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {peopleByType.foster.map(renderPersonCard)}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="adopter" className="space-y-4">
                {peopleByType.adopter.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No adopters found.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {peopleByType.adopter.map(renderPersonCard)}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="donor" className="space-y-4">
                {peopleByType.donor.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No donors found.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {peopleByType.donor.map(renderPersonCard)}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      {/* Create/Edit Person Dialog */}
      <Dialog open={dialogOpen || editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setDialogOpen(false);
          setEditDialogOpen(false);
          setSelectedPerson(null);
          form.reset();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPerson ? "Edit Person" : "Add New Person"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-first-name" placeholder="John" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-last-name" placeholder="Doe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" data-testid="input-email" placeholder="john@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                          <SelectItem value="foster">Foster</SelectItem>
                          <SelectItem value="adopter">Adopter</SelectItem>
                          <SelectItem value="donor">Donor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-phone" placeholder="(555) 555-5555" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-address" placeholder="123 Main St, City, State ZIP" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="input-bio" placeholder="Tell us about this person..." rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="emergency_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-emergency-contact" placeholder="Emergency contact name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergency_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Phone</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-emergency-phone" placeholder="(555) 555-5555" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="input-notes" placeholder="Additional notes..." rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setDialogOpen(false);
                    setEditDialogOpen(false);
                    setSelectedPerson(null);
                    form.reset();
                  }}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPersonMutation.isPending || updatePersonMutation.isPending}
                  data-testid="button-submit"
                >
                  {(createPersonMutation.isPending || updatePersonMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {selectedPerson ? "Update Person" : "Create Person"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Person Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Person Details</DialogTitle>
          </DialogHeader>
          {selectedPerson && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {`${selectedPerson.first_name || ''} ${selectedPerson.last_name || ''}`.trim() || selectedPerson.email}
                  </h3>
                  <Badge variant={getRoleBadgeVariant(selectedPerson.role)} className="mt-1">
                    {getRoleIcon(selectedPerson.role)}
                    <span className="ml-1 capitalize">{selectedPerson.role}</span>
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedPerson.email}</p>
                </div>
                {selectedPerson.profile?.phone && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedPerson.profile.phone}</p>
                  </div>
                )}
                {selectedPerson.profile?.address && (
                  <div className="md:col-span-2">
                    <Label className="text-sm text-muted-foreground">Address</Label>
                    <p className="font-medium">{selectedPerson.profile.address}</p>
                  </div>
                )}
                {selectedPerson.profile?.bio && (
                  <div className="md:col-span-2">
                    <Label className="text-sm text-muted-foreground">Bio</Label>
                    <p className="text-sm">{selectedPerson.profile.bio}</p>
                  </div>
                )}
                {selectedPerson.profile?.emergency_contact && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Emergency Contact</Label>
                    <p className="font-medium">{selectedPerson.profile.emergency_contact}</p>
                  </div>
                )}
                {selectedPerson.profile?.emergency_phone && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Emergency Phone</Label>
                    <p className="font-medium">{selectedPerson.profile.emergency_phone}</p>
                  </div>
                )}
                {selectedPerson.profile?.notes && (
                  <div className="md:col-span-2">
                    <Label className="text-sm text-muted-foreground">Notes</Label>
                    <p className="text-sm">{selectedPerson.profile.notes}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm text-muted-foreground">Joined</Label>
                  <p className="font-medium">{new Date(selectedPerson.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <p className="font-medium">{selectedPerson.is_active ? "Active" : "Inactive"}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setViewDialogOpen(false)}
                  data-testid="button-close-view"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleEdit(selectedPerson);
                  }}
                  data-testid="button-edit-from-view"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
