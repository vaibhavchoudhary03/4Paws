/**
 * NOTIFICATIONS PAGE
 * 
 * PURPOSE:
 * Full-page view of all notifications with advanced filtering and management.
 * Provides comprehensive notification management capabilities.
 * 
 * FEATURES:
 * 1. NOTIFICATION LIST with all notifications
 * 2. FILTERING by type, priority, and read status
 * 3. BULK ACTIONS (mark all read, clear all, etc.)
 * 4. NOTIFICATION DETAILS with full information
 * 5. SEARCH functionality
 * 6. PAGINATION for large notification lists
 */

import React, { useState, useEffect } from 'react';
import { Bell, Filter, Search, CheckCheck, Trash2, AlertTriangle, Heart, Home, Users, Settings, Clock, ExternalLink, X } from 'lucide-react';
import AppLayout from '../../components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { notificationService, Notification } from '../../lib/notifications';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  useEffect(() => {
    const loadNotifications = () => {
      const allNotifications = notificationService.getNotifications();
      setNotifications(allNotifications);
    };

    loadNotifications();

    // Subscribe to updates
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let filtered = [...notifications];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(n => n.priority === priorityFilter);
    }

    // Apply status filter
    if (statusFilter === 'unread') {
      filtered = filtered.filter(n => !n.isRead && !n.isDismissed);
    } else if (statusFilter === 'read') {
      filtered = filtered.filter(n => n.isRead && !n.isDismissed);
    } else if (statusFilter === 'dismissed') {
      filtered = filtered.filter(n => n.isDismissed);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, typeFilter, priorityFilter, statusFilter]);

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

  const handleBulkAction = (action: 'read' | 'dismiss') => {
    selectedNotifications.forEach(id => {
      if (action === 'read') {
        notificationService.markAsRead(id);
      } else {
        notificationService.dismissNotification(id);
      }
    });
    setSelectedNotifications([]);
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = "w-5 h-5";
    
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
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high':
        return 'bg-kirby-primary/10 text-kirby-primary-dark border-kirby-primary/20';
      case 'medium':
        return 'bg-kirby-secondary/10 text-kirby-secondary-dark border-kirby-secondary/20';
      case 'low':
        return 'bg-kirby-accent/10 text-kirby-accent-dark border-kirby-accent/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
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

  const getNotificationsByType = (type: string) => {
    return filteredNotifications.filter(n => n.type === type);
  };

  const unreadCount = notifications.filter(n => !n.isRead && !n.isDismissed).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.isRead && !n.isDismissed).length;

  return (
    <AppLayout title="Notifications" subtitle="Stay updated with all shelter activities and alerts">
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCheck className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Unread</p>
                  <p className="text-2xl font-bold text-green-600">{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <X className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Dismissed</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {notifications.filter(n => n.isDismissed).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                    data-testid="search-notifications"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="adoption">Adoption</SelectItem>
                    <SelectItem value="foster">Foster</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                {selectedNotifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('read')}
                      data-testid="bulk-mark-read"
                    >
                      <CheckCheck className="w-4 h-4 mr-1" />
                      Mark Read ({selectedNotifications.length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('dismiss')}
                      data-testid="bulk-dismiss"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Dismiss ({selectedNotifications.length})
                    </Button>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  data-testid="mark-all-read"
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Mark All Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  data-testid="clear-all"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Notifications ({filteredNotifications.length})
              </CardTitle>
              {filteredNotifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  data-testid="select-all"
                >
                  {selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No notifications found</h3>
                <p className="text-sm text-gray-400">
                  {searchTerm || typeFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters to see more notifications.'
                    : 'You\'re all caught up! New notifications will appear here.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      !notification.isRead ? 'bg-kirby-primary/5 border-l-4 border-l-kirby-primary' : ''
                    } ${selectedNotifications.includes(notification.id) ? 'bg-kirby-primary/10' : ''}`}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="mt-1"
                        data-testid={`checkbox-${notification.id}`}
                      />

                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className={`text-lg font-medium ${
                                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h3>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getPriorityColor(notification.priority)}`}
                              >
                                {notification.priority}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {notification.type}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatTimestamp(notification.timestamp)}</span>
                              </div>
                              {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                                <div className="text-xs text-gray-400">
                                  {Object.entries(notification.metadata).map(([key, value]) => (
                                    <span key={key} className="mr-2">
                                      {key}: {value}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {notification.actionUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  window.location.href = notification.actionUrl!;
                                }}
                                data-testid={`action-${notification.id}`}
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                {notification.actionText || 'View'}
                              </Button>
                            )}
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                data-testid={`mark-read-${notification.id}`}
                              >
                                <CheckCheck className="w-4 h-4 mr-1" />
                                Mark Read
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDismiss(notification.id)}
                              data-testid={`dismiss-${notification.id}`}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
