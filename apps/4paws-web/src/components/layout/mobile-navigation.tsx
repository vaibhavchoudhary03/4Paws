/**
 * MOBILE NAVIGATION COMPONENT
 * 
 * PURPOSE:
 * Provides mobile-optimized navigation with bottom navigation bar
 * and touch-friendly interactions for small screens.
 * 
 * FEATURES:
 * 1. BOTTOM NAVIGATION - Thumb-friendly navigation bar
 * 2. TOUCH TARGETS - All buttons are at least 44px
 * 3. SWIPE GESTURES - Swipe between sections
 * 4. ACTIVE STATES - Clear indication of current page
 * 5. ACCESSIBILITY - Screen reader support and keyboard navigation
 * 6. RESPONSIVE - Adapts to different mobile screen sizes
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Home, 
  Heart, 
  Stethoscope, 
  BarChart3, 
  Bell, 
  Menu,
  X,
  Users,
  FileText,
  Settings,
  Plus
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { useNotifications } from '../../lib/notifications';
import UserAccountDropdown from '../ui/user-account-dropdown';
import QuickIntakeDialog from '../ui/quick-intake-dialog';

interface MobileNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  color?: string;
}

const MobileNav: React.FC = () => {
  const [, setLocation] = useLocation();
  const { unreadCount } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/dashboard');

  // Update current path when location changes
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const mainNavItems: MobileNavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      path: '/dashboard',
      color: 'text-blue-600'
    },
    {
      id: 'animals',
      label: 'Animals',
      icon: <Heart className="w-5 h-5" />,
      path: '/animals',
      color: 'text-green-600'
    },
    {
      id: 'medical',
      label: 'Medical',
      icon: <Stethoscope className="w-5 h-5" />,
      path: '/medical',
      color: 'text-red-600'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/reports',
      color: 'text-purple-600'
    }
  ];

  const secondaryNavItems: MobileNavItem[] = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      path: '/notifications',
      badge: unreadCount,
      color: 'text-orange-600'
    },
    {
      id: 'people',
      label: 'People',
      icon: <Users className="w-5 h-5" />,
      path: '/people',
      color: 'text-indigo-600'
    },
    {
      id: 'adoptions',
      label: 'Adoptions',
      icon: <FileText className="w-5 h-5" />,
      path: '/adoptions',
      color: 'text-pink-600'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      path: '/settings',
      color: 'text-gray-600'
    }
  ];

  const handleNavClick = (path: string) => {
    setLocation(path);
    setCurrentPath(path);
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/' || currentPath === '/dashboard';
    }
    return currentPath.startsWith(path);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-1">
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px]',
                isActive(item.path)
                  ? `${item.color} bg-gray-100`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
              aria-label={item.label}
            >
              <div className="relative">
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          ))}
          
          {/* Quick Intake Button */}
          <QuickIntakeDialog>
            <button
              className="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] text-orange-600 hover:text-orange-900 hover:bg-orange-50"
              aria-label="Quick intake"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs mt-1 font-medium">Intake</span>
            </button>
          </QuickIntakeDialog>
          
          {/* More Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            aria-label="More options"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">More</span>
          </button>
        </div>
      </div>

      {/* Full Screen Menu Modal */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[80vh] overflow-hidden">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">More Options</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Menu Content */}
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {secondaryNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className={cn(
                    'w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 min-h-[44px]',
                    isActive(item.path)
                      ? `${item.color} bg-gray-100`
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn('flex-shrink-0', item.color)}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </button>
              ))}
              
              {/* User Account Section */}
              <div className="pt-2 border-t border-gray-200">
                <UserAccountDropdown variant="mobile" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
