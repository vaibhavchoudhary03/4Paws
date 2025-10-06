/**
 * AUTHENTICATION CONTEXT - Multi-tenant authentication management
 * 
 * ARCHITECTURE OVERVIEW:
 * This context provides authentication state and methods for the entire application.
 * It integrates with Supabase Auth and manages multi-tenant organization access.
 * 
 * KEY FEATURES:
 * 1. SUPABASE AUTH INTEGRATION: Uses Supabase's built-in authentication
 * 2. MULTI-TENANT SUPPORT: Users can belong to multiple organizations
 * 3. ROLE-BASED ACCESS: Different permissions per organization
 * 4. SESSION MANAGEMENT: Automatic session restoration and cleanup
 * 5. ORGANIZATION SWITCHING: Users can switch between organizations
 * 
 * AUTHENTICATION FLOW:
 * 1. User signs up → Requests access to organization
 * 2. Admin approves → User gets organization access
 * 3. User logs in → Selects organization → Access granted
 * 4. Session persists → Automatic login on return
 * 
 * SECURITY CONSIDERATIONS:
 * - All API calls include organization context
 * - Row Level Security (RLS) enforces data isolation
 * - JWT tokens contain user and organization info
 * - Session automatically expires after inactivity
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

// ============================================================================
// TYPES - Authentication and organization data structures
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  settings?: {
    theme?: string;
    features?: string[];
    contactInfo?: {
      email?: string;
      phone?: string;
      address?: string;
    };
  };
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  role: 'admin' | 'staff' | 'volunteer' | 'foster' | 'readonly';
  status: 'active' | 'pending' | 'suspended';
  joinedAt: string;
  organization: Organization;
}

export interface AuthUser {
  profile: UserProfile;
  memberships: OrganizationMembership[];
  currentOrganization?: Organization;
  currentRole?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  message?: string;
}

export interface AuthContextType {
  // State
  user: AuthUser | null;
  loading: boolean;
  session: Session | null;
  
  // Authentication methods
  signUp: (request: SignupRequest) => Promise<{ success: boolean; message: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  
  // Organization methods
  switchOrganization: (organizationId: string) => Promise<void>;
  getAvailableOrganizations: () => OrganizationMembership[];
  
  // Utility methods
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isStaff: () => boolean;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// AUTHENTICATION PROVIDER COMPONENT
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Fetch user profile and memberships from database
   */
  const fetchUserData = async (supabaseUser: SupabaseUser): Promise<AuthUser | null> => {
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }

      // Fetch organization memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from('user_memberships')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('user_id', supabaseUser.id)
        .eq('status', 'active');

      if (membershipsError) {
        console.error('Error fetching memberships:', membershipsError);
        return null;
      }

      // Get the first active organization as default
      const currentMembership = memberships?.[0];
      
      return {
        profile: {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          avatar: profile.avatar,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        },
        memberships: memberships || [],
        currentOrganization: currentMembership?.organization,
        currentRole: currentMembership?.role,
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  /**
   * Check if user has specific role in current organization
   */
  const hasRole = (role: string): boolean => {
    if (!user?.currentRole) return false;
    return user.currentRole === role;
  };

  /**
   * Check if user has specific permission
   */
  const hasPermission = (permission: string): boolean => {
    if (!user?.currentRole) return false;
    
    const permissions: Record<string, string[]> = {
      admin: ['*'], // Admin has all permissions
      staff: ['animals:read', 'animals:write', 'medical:read', 'medical:write', 'adoptions:read', 'adoptions:write', 'people:read', 'people:write', 'reports:read'],
      volunteer: ['animals:read', 'volunteer:write', 'reports:read'],
      foster: ['animals:read', 'foster:write'],
      readonly: ['animals:read', 'reports:read'],
    };

    const userPermissions = permissions[user.currentRole] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  };

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  /**
   * Check if user is staff
   */
  const isStaff = (): boolean => {
    return hasRole('staff') || hasRole('admin');
  };

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  /**
   * Sign up a new user and request organization access
   */
  const signUp = async (request: SignupRequest): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);

      // Create Supabase user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: request.email,
        password: request.password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        return { success: false, message: `Auth error: ${authError.message}` };
      }

      if (!authData.user) {
        console.error('No user data returned from auth');
        return { success: false, message: 'Failed to create user account' };
      }

      console.log('Auth user created:', authData.user.id);

      // Wait a moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if profile was created by trigger, if not create it manually
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (!existingProfile) {
        // Create user profile manually if trigger didn't work
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: request.email,
            first_name: request.firstName,
            last_name: request.lastName,
          });

        if (profileError) {
          console.error('Profile error:', profileError);
          return { success: false, message: `Profile error: ${profileError.message}` };
        }
        console.log('User profile created manually');
      } else {
        console.log('User profile already exists (created by trigger)');
      }

      // Create membership request
      const { error: membershipError } = await supabase
        .from('user_memberships')
        .insert({
          user_id: authData.user.id,
          organization_id: request.organizationId,
          role: 'volunteer', // Default role for new users
          status: 'pending',
          message: request.message,
        });

      if (membershipError) {
        console.error('Membership error:', membershipError);
        return { success: false, message: `Membership error: ${membershipError.message}` };
      }

      console.log('User membership created successfully');

      return { 
        success: true, 
        message: 'Account created successfully! Your request to join the organization is pending approval.' 
      };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, message: error.message || 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (!data.user) {
        return { success: false, message: 'Login failed' };
      }

      // User data will be fetched in the session change handler
      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      console.error('Signin error:', error);
      return { success: false, message: error.message || 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Switch to a different organization
   */
  const switchOrganization = async (organizationId: string): Promise<void> => {
    if (!user) return;

    const membership = user.memberships.find(m => m.organizationId === organizationId);
    if (!membership) {
      throw new Error('You do not have access to this organization');
    }

    setUser({
      ...user,
      currentOrganization: membership.organization,
      currentRole: membership.role,
    });
  };

  /**
   * Get available organizations for current user
   */
  const getAvailableOrganizations = (): OrganizationMembership[] => {
    return user?.memberships || [];
  };

  // ============================================================================
  // EFFECTS - Handle session changes
  // ============================================================================

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserData(session.user).then(setUser);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          const userData = await fetchUserData(session.user);
          setUser(userData);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: AuthContextType = {
    user,
    loading,
    session,
    signUp,
    signIn,
    signOut,
    switchOrganization,
    getAvailableOrganizations,
    hasRole,
    hasPermission,
    isAdmin,
    isStaff,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HOOK - Use authentication context
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================================================
// HOOK - Check if user is authenticated
// ============================================================================

export function useRequireAuth(): AuthUser {
  const { user, loading } = useAuth();
  
  if (loading) {
    throw new Promise(() => {}); // Suspense boundary will handle loading
  }
  
  if (!user) {
    throw new Error('Authentication required'); // Will be caught by error boundary
  }
  
  return user;
}
