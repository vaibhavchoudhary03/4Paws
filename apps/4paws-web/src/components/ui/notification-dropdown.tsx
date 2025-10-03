/**
 * NOTIFICATION DROPDOWN COMPONENT
 * 
 * PURPOSE:
 * Provides a bell icon dropdown with all notifications and alerts.
 * Displays recent notifications at the top with proper categorization.
 * 
 * FEATURES:
 * 1. BELL ICON with notification count badge
 * 2. DROPDOWN with notification list
 * 3. NOTIFICATION CATEGORIES (Medical, Adoption, Foster, Volunteer, System)
 * 4. PRIORITY INDICATORS (Critical, High, Medium, Low)
 * 5. ACTION BUTTONS (Mark as read, dismiss, view details)
 * 6. REAL-TIME UPDATES
 * 7. RESPONSIVE DESIGN
 */

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, AlertTriangle, Heart, Home, Users, Settings, Clock, ExternalLink } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { ScrollArea } from './scroll-area';
import { Separator } from './separator';
import { notificationService, Notification } from '../../lib/notifications';

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({ className }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);

  useEffect(() => {
    // Load initial notifications
    const loadNotifications = () => {
      const allNotifications = notificationService.getNotifications();
      setNotifications(allNotifications);
      setUnreadCount(notificationService.getUnreadCount());
      setCriticalCount(notificationService.getCriticalCount());
    };

    loadNotifications();

    // Subscribe to updates
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
      setUnreadCount(notificationService.getUnreadCount());
      setCriticalCount(notificationService.getCriticalCount());
    });

    return unsubscribe;
  }, []);

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
  };

  const handleDismiss = (notificationId: string) => {
    notificationService.dismissNotification(notificationId);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const handleClearAll = () => {
    notificationService.clearAll();
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = "w-4 h-4";
    
    if (priority === 'critical') {
      return <AlertTriangle className={`${iconClass} text-red-500`} />;
    }

    switch (type) {
      case 'medical':
        return <Heart className={`${iconClass} text-red-400`} />;
      case 'adoption':
        return <Heart className={`${iconClass} text-green-500`} />;
      case 'foster':
        return <Home className={`${iconClass} text-blue-500`} />;
      case 'volunteer':
        return <Users className={`${iconClass} text-purple-500`} />;
      case 'system':
        return <Settings className={`${iconClass} text-gray-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-400`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return notificationDate.toLocaleDateString();
  };

  const visibleNotifications = notifications.filter(n => !n.isDismissed);

  return (
    <div className={`relative ${className}`}>
      {/* Bell Icon Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="notification-bell"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            data-testid="notification-count"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        {criticalCount > 0 && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {unreadCount} new
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs"
                      data-testid="mark-all-read"
                    >
                      <CheckCheck className="w-3 h-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="p-1"
                    data-testid="close-dropdown"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {visibleNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No notifications</p>
                  <p className="text-xs text-gray-400">You're all caught up!</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-1">
                    {visibleNotifications.map((notification, index) => (
                      <div
                        key={notification.id}
                        className={`p-3 hover:bg-gray-50 transition-colors ${
                          !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        data-testid={`notification-${notification.id}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type, notification.priority)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`text-sm font-medium ${
                                    !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getPriorityColor(notification.priority)}`}
                                  >
                                    {notification.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTimestamp(notification.timestamp)}</span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1">
                                {notification.actionUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-6 w-6"
                                    onClick={() => {
                                      window.location.href = notification.actionUrl!;
                                      setIsOpen(false);
                                    }}
                                    data-testid={`action-${notification.id}`}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                )}
                                {!notification.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-6 w-6"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    data-testid={`mark-read-${notification.id}`}
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-6 w-6"
                                  onClick={() => handleDismiss(notification.id)}
                                  data-testid={`dismiss-${notification.id}`}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {index < visibleNotifications.length - 1 && (
                          <Separator className="mt-3" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Footer */}
              {visibleNotifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="text-xs text-gray-600 hover:text-red-600"
                      data-testid="clear-all"
                    >
                      Clear all
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = '/notifications'}
                      className="text-xs"
                      data-testid="view-all"
                    >
                      View all notifications
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          data-testid="notification-backdrop"
        />
      )}
    </div>
  );
}
