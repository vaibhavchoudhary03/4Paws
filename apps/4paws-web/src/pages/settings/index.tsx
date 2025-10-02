import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Building, Users, Key, Database } from "lucide-react";

export default function SettingsIndex() {
  return (
    <AppLayout title="Settings" subtitle="Manage your organization settings">
      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="organization" data-testid="tab-organization">
            <Building className="w-4 h-4 mr-2" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="w-4 h-4 mr-2" />
            Users & Roles
          </TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-integrations">
            <Key className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="data" data-testid="tab-data">
            <Database className="w-4 h-4 mr-2" />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="mt-6">
          <Card data-testid="card-org-profile">
            <CardHeader>
              <CardTitle>Organization Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" defaultValue="4Paws Demo Shelter" data-testid="input-org-name" />
              </div>
              <div>
                <Label htmlFor="org-address">Address</Label>
                <Input id="org-address" defaultValue="123 Shelter Lane, Pet City, PC 12345" data-testid="input-org-address" />
              </div>
              <div>
                <Label htmlFor="org-phone">Phone</Label>
                <Input id="org-phone" type="tel" placeholder="(555) 123-4567" data-testid="input-org-phone" />
              </div>
              <div>
                <Label htmlFor="org-email">Email</Label>
                <Input id="org-email" type="email" placeholder="info@shelter.org" data-testid="input-org-email" />
              </div>
              <Button data-testid="button-save-org">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card data-testid="card-users">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Users & Permissions</CardTitle>
                <Button data-testid="button-add-user">
                  <Users className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>User management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Card data-testid="card-integrations">
            <CardHeader>
              <CardTitle>External Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">Petfinder Feed</h4>
                  <Button variant="outline" size="sm" data-testid="button-configure-petfinder">
                    Configure
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Export available animals to Petfinder automatically
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">Stripe Payments</h4>
                  <Button variant="outline" size="sm" data-testid="button-configure-stripe">
                    Configure
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Process adoption fees and donations
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">Microchip Registry</h4>
                  <Button variant="outline" size="sm" data-testid="button-configure-microchip">
                    Configure
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Auto-register microchips on adoption
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <Card data-testid="card-data">
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Import Data</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Import animals, people, or other records from CSV
                </p>
                <Button variant="outline" data-testid="button-import-data">
                  <Database className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Export Data</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Export all organization data for backup or migration
                </p>
                <Button variant="outline" data-testid="button-export-data">
                  <Database className="w-4 h-4 mr-2" />
                  Export All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
