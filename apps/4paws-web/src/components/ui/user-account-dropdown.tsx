/**
 * USER ACCOUNT DROPDOWN COMPONENT
 * 
 * PURPOSE:
 * Provides a clean, intuitive user account section with logout functionality
 * that integrates seamlessly with the authentication system.
 * 
 * FEATURES:
 * 1. USER INFO DISPLAY - Shows user name, email, and role
 * 2. LOGOUT FUNCTIONALITY - Clean sign out with proper state management
 * 3. DROPDOWN MENU - Additional account options (future expansion)
 * 4. RESPONSIVE DESIGN - Works on both desktop and mobile
 * 5. ACCESSIBILITY - Proper ARIA labels and keyboard navigation
 * 6. LOADING STATES - Handles logout loading state gracefully
 */

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../lib/auth-context-simple';
import { useToast } from '../../hooks/use-toast';
import { Button } from './button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { 
  User, 
  LogOut, 
  Settings, 
  ChevronDown,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface UserAccountDropdownProps {
  variant?: 'sidebar' | 'mobile';
  className?: string;
}

export default function UserAccountDropdown({ 
  variant = 'sidebar', 
  className 
}: UserAccountDropdownProps) {
  const { user, signOut, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle logout with proper loading state and error handling
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
      
      // Redirect to login page
      setLocation('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred while signing out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handle settings navigation
  const handleSettings = () => {
    setLocation('/settings');
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Get user role display
  const getUserRole = () => {
    if (user?.role) {
      return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
    return 'User';
  };

  if (!user) {
    return null;
  }

  // Sidebar variant - integrated into sidebar layout
  if (variant === 'sidebar') {
    return (
      <div className={cn("p-4 border-t border-border", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto hover:bg-muted transition-colors"
              data-testid="button-user-menu"
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">
                    {getUserInitials(getUserDisplayName())}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-foreground truncate" data-testid="text-user-name">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-muted-foreground truncate" data-testid="text-user-role">
                    {getUserRole()}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="cursor-pointer text-destructive focus:text-destructive"
              disabled={isLoggingOut || loading}
            >
              {isLoggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Mobile variant - compact for mobile navigation
  if (variant === 'mobile') {
    return (
      <div className={cn("p-4 border-t border-gray-200", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto hover:bg-muted/50 transition-colors"
              data-testid="button-user-menu-mobile"
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="w-8 h-8 bg-kirby-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-kirby-primary-dark">
                    {getUserInitials(getUserDisplayName())}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {getUserRole()}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="cursor-pointer text-red-600 focus:text-red-600"
              disabled={isLoggingOut || loading}
            >
              {isLoggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return null;
}
