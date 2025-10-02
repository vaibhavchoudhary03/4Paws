import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../../lib/queryClient";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// Temporary types until we fix the schema
type InsertPerson = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  type: "adopter" | "foster" | "volunteer" | "donor" | "staff";
  organizationId?: string;
  flags?: Record<string, any>;
};

type Person = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  type: "adopter" | "foster" | "volunteer" | "donor" | "staff";
  organizationId: string;
  flags?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
};

const insertPersonSchema = {
  omit: (fields: any) => ({
    parse: (data: any) => data
  })
};
import { useToast } from "../../hooks/use-toast";
import { Users, Plus, Search, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import AppLayout from "../../components/layout/app-layout";

export default function PeopleIndex() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: people = [], isLoading } = useQuery<Person[]>({
    queryKey: ["/api/v1/people"],
  });

  const createPersonMutation = useMutation({
    mutationFn: async (data: InsertPerson) => {
      const res = await apiRequest("POST", "/api/v1/people", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/people"] });
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

  const form = useForm<InsertPerson>({
    resolver: zodResolver(insertPersonSchema.omit({ organizationId: true, flags: true })),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      type: "adopter",
    },
  });

  const onSubmit = (data: InsertPerson) => {
    createPersonMutation.mutate({ ...data, flags: data.flags || {} });
  };

  const filteredPeople = people.filter((person) => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || person.type === selectedType;
    return matchesSearch && matchesType;
  });

  const peopleByType = {
    all: filteredPeople,
    adopter: filteredPeople.filter(p => p.type === "adopter"),
    foster: filteredPeople.filter(p => p.type === "foster"),
    volunteer: filteredPeople.filter(p => p.type === "volunteer"),
    donor: filteredPeople.filter(p => p.type === "donor"),
    staff: filteredPeople.filter(p => p.type === "staff"),
  };

  const renderPersonCard = (person: Person) => (
    <Card key={person.id} className="hover:shadow-md transition-shadow" data-testid={`card-person-${person.id}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div>
              <h3 className="font-semibold text-lg" data-testid={`text-person-name-${person.id}`}>{person.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{person.type}</p>
            </div>
            {person.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-person-email-${person.id}`}>
                <Mail className="w-4 h-4" />
                <span>{person.email}</span>
              </div>
            )}
            {person.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-person-phone-${person.id}`}>
                <Phone className="w-4 h-4" />
                <span>{person.phone}</span>
              </div>
            )}
            {person.address && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-person-address-${person.id}`}>
                <MapPin className="w-4 h-4" />
                <span>{person.address}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-person-name" placeholder="John Doe" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-person-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="adopter">Adopter</SelectItem>
                            <SelectItem value="foster">Foster</SelectItem>
                            <SelectItem value="volunteer">Volunteer</SelectItem>
                            <SelectItem value="donor">Donor</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
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
            <TabsTrigger value="adopter" data-testid="tab-adopter">
              Adopters ({peopleByType.adopter.length})
            </TabsTrigger>
            <TabsTrigger value="foster" data-testid="tab-foster">
              Fosters ({peopleByType.foster.length})
            </TabsTrigger>
            <TabsTrigger value="volunteer" data-testid="tab-volunteer">
              Volunteers ({peopleByType.volunteer.length})
            </TabsTrigger>
            <TabsTrigger value="donor" data-testid="tab-donor">
              Donors ({peopleByType.donor.length})
            </TabsTrigger>
            <TabsTrigger value="staff" data-testid="tab-staff">
              Staff ({peopleByType.staff.length})
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
            </>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}
