import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';

// ============================================================================
// TYPES
// ============================================================================

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  organizationId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string, organizationId: string) => Promise<{ success: boolean; message: string }>;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================================================
  // AUTH METHODS
  // ============================================================================

  const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      console.log('Signing in with:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { success: false, message: error.message };
      }

      if (!data.user) {
        return { success: false, message: 'No user data returned' };
      }

      // Create a simple user object
      const simpleUser: User = {
        id: data.user.id,
        email: data.user.email || '',
        firstName: '',
        lastName: '',
        role: 'admin', // Default role for now
        organizationId: '00000000-0000-0000-0000-000000000001', // Default organization
      };

      setUser(simpleUser);
      console.log('Sign in successful');
      return { success: true, message: 'Sign in successful' };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, message: error.message || 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    organizationId: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      console.log('Signing up:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Sign up error:', error);
        return { success: false, message: error.message };
      }

      if (!data.user) {
        return { success: false, message: 'No user data returned' };
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail completely
      }

      // Create membership
      const { error: membershipError } = await supabase
        .from('user_memberships')
        .insert({
          user_id: data.user.id,
          organization_id: organizationId,
          role: 'volunteer',
          status: 'pending',
        });

      if (membershipError) {
        console.error('Membership creation error:', membershipError);
        // Don't fail completely
      }

      console.log('Sign up successful');
      return { success: true, message: 'Account created successfully!' };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { success: false, message: error.message || 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  useEffect(() => {
    let isMounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (isMounted) setLoading(false);
          return;
        }

        if (session?.user && isMounted) {
          const simpleUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: '',
            lastName: '',
            role: 'admin',
            organizationId: '00000000-0000-0000-0000-000000000001',
          };
          setUser(simpleUser);
        }
        
        if (isMounted) setLoading(false);
      } catch (error) {
        console.error('Session error:', error);
        if (isMounted) setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (isMounted) {
          if (session?.user) {
            const simpleUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              firstName: '',
              lastName: '',
              role: 'admin',
              organizationId: '00000000-0000-0000-0000-000000000001',
            };
            setUser(simpleUser);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    signUp,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
