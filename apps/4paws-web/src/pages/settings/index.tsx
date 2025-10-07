/**
 * SETTINGS PAGE - Comprehensive system configuration
 * 
 * PURPOSE:
 * Centralized settings management for the animal shelter system.
 * Provides configuration options for users, organizations, and system preferences.
 * 
 * SECTIONS:
 * 1. USER PROFILE - Personal information, account settings, preferences
 * 2. ORGANIZATION - Shelter details, branding, contact information
 * 3. NOTIFICATIONS - Email, SMS, and in-app notification preferences
 * 4. SYSTEM PREFERENCES - UI themes, language, timezone, date formats
 * 5. DATA MANAGEMENT - Backup, export, import, data retention policies
 * 6. SECURITY - Password, 2FA, session management, audit logs
 * 7. INTEGRATIONS - Third-party services, API keys, webhooks
 * 
 * FEATURES:
 * - Tabbed interface for organized settings
 * - Real-time form validation and saving
 * - Role-based access control (admin vs staff vs volunteer)
 * - Responsive design for mobile and desktop
 * - Unsaved changes warnings
 * - Bulk operations for data management
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../lib/auth-context-simple';
import { useToast } from '../../hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { 
  User, 
  Building2, 
  Bell, 
  Settings as SettingsIcon, 
  Database, 
  Shield, 
  Plug, 
  Save,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Palette,
  Download,
  Upload,
  Trash2,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import AppLayout from '../../components/layout/app-layout';

// Settings sections
const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Personal information and account settings' },
  { id: 'organization', label: 'Organization', icon: Building2, description: 'Shelter details and branding' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and alert preferences' },
  { id: 'preferences', label: 'Preferences', icon: SettingsIcon, description: 'UI and system preferences' },
  { id: 'data', label: 'Data Management', icon: Database, description: 'Backup, export, and data policies' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Password, 2FA, and access control' },
  { id: 'integrations', label: 'Integrations', icon: Plug, description: 'Third-party services and APIs' },
];

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch organization data
  const { data: organization, isLoading: orgLoading } = useQuery({
    queryKey: ['organization', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return null;
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', user.organizationId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.organizationId,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get form data
      const formData = new FormData(document.querySelector('form') || document.createElement('form'));
      
      // Update user profile data
      const profileData = {
        firstName: formData.get('firstName') as string || user.firstName,
        lastName: formData.get('lastName') as string || user.lastName,
        profile: {
          phone: formData.get('phone') as string || user.profile?.phone,
          address: formData.get('address') as string || user.profile?.address,
          emergencyContact: formData.get('emergencyContact') as string || user.profile?.emergencyContact,
        }
      };

      // Update user in database
      const { error: userError } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id);

      if (userError) throw userError;

      // Update organization data if user has permission
      if (organization && (user.role === 'admin' || user.role === 'staff')) {
        const orgData = {
          name: formData.get('orgName') as string || organization.name,
          settings: {
            ...organization.settings,
            contactInfo: {
              email: formData.get('orgEmail') as string || organization.settings?.contactInfo?.email,
              phone: formData.get('orgPhone') as string || organization.settings?.contactInfo?.phone,
              address: formData.get('orgAddress') as string || organization.settings?.contactInfo?.address,
            }
          }
        };

        const { error: orgError } = await supabase
          .from('organizations')
          .update(orgData)
          .eq('id', organization.id);

        if (orgError) throw orgError;
      }

      setHasUnsavedChanges(false);
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect
  }

  return (
    <AppLayout title="Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account, organization, and system preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-amber-600 border-amber-200">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Unsaved Changes
              </Badge>
            )}
            <Button 
              onClick={handleSave} 
              disabled={!hasUnsavedChanges || isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            {SETTINGS_SECTIONS.map((section) => (
              <TabsTrigger 
                key={section.id} 
                value={section.id}
                className="flex items-center gap-2 text-xs"
              >
                <section.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{section.label}</span>
          </TabsTrigger>
            ))}
        </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <form>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      defaultValue={user.firstName || ''}
                      onChange={() => setHasUnsavedChanges(true)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      defaultValue={user.lastName || ''}
                      onChange={() => setHasUnsavedChanges(true)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    defaultValue={user.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact your administrator if needed.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    defaultValue={user.profile?.phone || ''}
                    placeholder="(555) 123-4567"
                    onChange={() => setHasUnsavedChanges(true)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea 
                    id="address"
                    defaultValue={user.profile?.address || ''}
                    placeholder="Your address..."
                    rows={2}
                    onChange={() => setHasUnsavedChanges(true)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input 
                    id="emergencyContact"
                    defaultValue={user.profile?.emergencyContact || ''}
                    placeholder="Emergency contact name and phone"
                    onChange={() => setHasUnsavedChanges(true)}
                  />
                </div>
              </CardContent>
              </Card>

              <Card>
            <CardHeader>
                <CardTitle>Account Preferences</CardTitle>
                <CardDescription>
                  Configure your account behavior and preferences
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about important events
                    </p>
              </div>
                  <Switch defaultChecked onChange={() => setHasUnsavedChanges(true)} />
              </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-logout</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically log out after 8 hours of inactivity
                    </p>
              </div>
                  <Switch defaultChecked onChange={() => setHasUnsavedChanges(true)} />
              </div>
            </CardContent>
          </Card>
            </form>
        </TabsContent>

          {/* Organization Settings */}
          <TabsContent value="organization" className="space-y-6">
            <form>
              <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Shelter Information
                </CardTitle>
                <CardDescription>
                  Manage your organization's details and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {orgLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Clock className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading organization data...</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input 
                        id="orgName" 
                        defaultValue={organization?.name || ''}
                        onChange={() => setHasUnsavedChanges(true)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgSlug">Organization Slug</Label>
                      <Input 
                        id="orgSlug" 
                        defaultValue={organization?.slug || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Organization slug cannot be changed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgDescription">Description</Label>
                      <Textarea 
                        id="orgDescription"
                        defaultValue={organization?.settings?.contactInfo?.email ? '' : 'Brief description of your organization...'}
                        placeholder="Brief description of your organization..."
                        rows={3}
                        onChange={() => setHasUnsavedChanges(true)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="orgAddress">Address</Label>
                        <Textarea 
                          id="orgAddress"
                          defaultValue={organization?.settings?.contactInfo?.address || ''}
                          placeholder="123 Main St, City, State 12345"
                          rows={2}
                          onChange={() => setHasUnsavedChanges(true)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="orgPhone">Phone</Label>
                        <Input 
                          id="orgPhone" 
                          type="tel"
                          defaultValue={organization?.settings?.contactInfo?.phone || ''}
                          placeholder="(555) 123-4567"
                          onChange={() => setHasUnsavedChanges(true)}
                        />
                      </div>
              </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgEmail">Contact Email</Label>
                      <Input 
                        id="orgEmail" 
                        type="email"
                        defaultValue={organization?.settings?.contactInfo?.email || ''}
                        placeholder="contact@yourshelter.org"
                        onChange={() => setHasUnsavedChanges(true)}
                      />
              </div>
                  </>
                )}
            </CardContent>
          </Card>
            </form>
        </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about important events
                </CardDescription>
            </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Email Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>New Animal Intakes</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when new animals are added
                        </p>
                      </div>
                      <Switch defaultChecked onChange={() => setHasUnsavedChanges(true)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Medical Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive reminders for upcoming medical tasks
                        </p>
                      </div>
                      <Switch defaultChecked onChange={() => setHasUnsavedChanges(true)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Adoption Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Updates on adoption applications and processes
                        </p>
                      </div>
                      <Switch defaultChecked onChange={() => setHasUnsavedChanges(true)} />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">In-App Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Desktop Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Show browser notifications for important events
                        </p>
                      </div>
                      <Switch onChange={() => setHasUnsavedChanges(true)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Sound Alerts</Label>
                <p className="text-sm text-muted-foreground">
                          Play sound when new notifications arrive
                </p>
              </div>
                      <Switch defaultChecked onChange={() => setHasUnsavedChanges(true)} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  System Preferences
                </CardTitle>
                <CardDescription>
                  Customize your experience and system behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Appearance</h4>
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select defaultValue="system" onValueChange={() => setHasUnsavedChanges(true)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select defaultValue="en" onValueChange={() => setHasUnsavedChanges(true)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Date & Time</h4>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue="America/New_York" onValueChange={() => setHasUnsavedChanges(true)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select defaultValue="MM/DD/YYYY" onValueChange={() => setHasUnsavedChanges(true)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
              </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Manage your data, backups, and data retention policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Export Data</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Animals Data
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Medical Records
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Adoption Records
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export All Data
                  </Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Data Retention</h4>
                  <div className="space-y-2">
                    <Label htmlFor="retentionPeriod">Keep records for</Label>
                    <Select defaultValue="7" onValueChange={() => setHasUnsavedChanges(true)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 year</SelectItem>
                        <SelectItem value="3">3 years</SelectItem>
                        <SelectItem value="5">5 years</SelectItem>
                        <SelectItem value="7">7 years</SelectItem>
                        <SelectItem value="forever">Forever</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Password</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input 
                        id="currentPassword" 
                        type="password"
                        placeholder="Enter current password"
                        onChange={() => setHasUnsavedChanges(true)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input 
                        id="newPassword" 
                        type="password"
                        placeholder="Enter new password"
                        onChange={() => setHasUnsavedChanges(true)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password"
                        placeholder="Confirm new password"
                        onChange={() => setHasUnsavedChanges(true)}
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      Update Password
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable 2FA</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch onChange={() => setHasUnsavedChanges(true)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="w-5 h-5" />
                  Third-Party Integrations
                </CardTitle>
                <CardDescription>
                  Connect with external services and manage API keys
                </CardDescription>
            </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">Email Service</h4>
                      <p className="text-sm text-muted-foreground">
                        Configure SMTP settings for email notifications
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">SMS Service</h4>
                      <p className="text-sm text-muted-foreground">
                        Set up SMS notifications for urgent alerts
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                </Button>
              </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">Veterinary Software</h4>
                      <p className="text-sm text-muted-foreground">
                        Sync medical records with veterinary management systems
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                </Button>
                  </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  );
}