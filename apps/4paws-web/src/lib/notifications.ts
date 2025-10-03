/**
 * NOTIFICATION SYSTEM - Centralized notification management
 * 
 * PURPOSE:
 * Manages all notifications and alerts for the 4Paws shelter management system.
 * Provides real-time updates, categorization, and user interaction capabilities.
 * 
 * KEY FEATURES:
 * 1. NOTIFICATION TYPES
 *    - Medical: Overdue tasks, upcoming appointments, health alerts
 *    - Adoption: New applications, status changes, completion alerts
 *    - Foster: Assignment updates, capacity alerts, completion notifications
 *    - Volunteer: Activity logs, schedule updates, recognition alerts
 *    - System: General alerts, maintenance notifications, updates
 * 
 * 2. NOTIFICATION STATES
 *    - Unread: New notifications that require attention
 *    - Read: Notifications that have been viewed
 *    - Dismissed: Notifications that have been dismissed by user
 *    - Archived: Old notifications moved to archive
 * 
 * 3. PRIORITY LEVELS
 *    - Critical: Requires immediate action (overdue medical tasks)
 *    - High: Important but not urgent (new adoption applications)
 *    - Medium: Informational updates (volunteer activities)
 *    - Low: General notifications (system updates)
 * 
 * 4. REAL-TIME UPDATES
 *    - Live notification generation based on data changes
 *    - Automatic categorization and prioritization
 *    - User-specific filtering and customization
 */

export interface Notification {
  id: string;
  type: 'medical' | 'adoption' | 'foster' | 'volunteer' | 'system';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isDismissed: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilters {
  type?: string;
  priority?: string;
  isRead?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  constructor() {
    this.loadNotifications();
  }

  // Load notifications from localStorage or API
  private loadNotifications() {
    try {
      const stored = localStorage.getItem('4paws-notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      } else {
        this.notifications = this.generateInitialNotifications();
        this.saveNotifications();
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.notifications = this.generateInitialNotifications();
    }
  }

  // Save notifications to localStorage
  private saveNotifications() {
    try {
      localStorage.setItem('4paws-notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  // Generate initial notifications based on current data
  private generateInitialNotifications(): Notification[] {
    const now = new Date();
    const notifications: Notification[] = [];

    // Medical notifications (simulated based on typical shelter data)
    notifications.push({
      id: 'med-001',
      type: 'medical',
      priority: 'critical',
      title: 'Overdue Medical Task',
      message: 'Buddy needs vaccination - 2 days overdue',
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      isDismissed: false,
      actionUrl: '/medical',
      actionText: 'View Task',
      metadata: { animalId: '550e8400-e29b-41d4-a716-446655440001', taskId: 'med-task-001' }
    });

    notifications.push({
      id: 'med-002',
      type: 'medical',
      priority: 'high',
      title: 'Medical Checkup Due',
      message: 'Shadow needs routine checkup tomorrow',
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      isDismissed: false,
      actionUrl: '/medical',
      actionText: 'Schedule',
      metadata: { animalId: '550e8400-e29b-41d4-a716-446655440002', taskId: 'med-task-002' }
    });

    // Adoption notifications
    notifications.push({
      id: 'adopt-001',
      type: 'adoption',
      priority: 'high',
      title: 'New Adoption Application',
      message: 'Sarah Johnson applied to adopt Misty',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      isDismissed: false,
      actionUrl: '/adoptions',
      actionText: 'Review Application',
      metadata: { applicationId: 'app-001', animalId: '550e8400-e29b-41d4-a716-446655440001' }
    });

    notifications.push({
      id: 'adopt-002',
      type: 'adoption',
      priority: 'medium',
      title: 'Adoption Completed',
      message: 'Bear has been successfully adopted by the Smith family',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      isDismissed: false,
      actionUrl: '/adoptions',
      actionText: 'View Details',
      metadata: { applicationId: 'app-002', animalId: '550e8400-e29b-41d4-a716-446655440004' }
    });

    // Foster notifications
    notifications.push({
      id: 'foster-001',
      type: 'foster',
      priority: 'medium',
      title: 'Foster Assignment',
      message: 'Harley has been assigned to the Johnson family',
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      isDismissed: false,
      actionUrl: '/fosters',
      actionText: 'View Assignment',
      metadata: { fosterId: 'foster-001', animalId: '550e8400-e29b-41d4-a716-446655440003' }
    });

    // Volunteer notifications
    notifications.push({
      id: 'vol-001',
      type: 'volunteer',
      priority: 'low',
      title: 'Volunteer Activity Logged',
      message: 'John Doe completed 2 hours of dog walking',
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      isDismissed: false,
      actionUrl: '/volunteers',
      actionText: 'View Activity',
      metadata: { volunteerId: 'vol-001', activityId: 'activity-001' }
    });

    // System notifications
    notifications.push({
      id: 'sys-001',
      type: 'system',
      priority: 'low',
      title: 'System Update',
      message: 'New reporting features are now available',
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      isDismissed: false,
      actionUrl: '/reports',
      actionText: 'Explore Features',
      metadata: { version: '1.2.0' }
    });

    return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get all notifications
  getNotifications(filters?: NotificationFilters): Notification[] {
    let filtered = [...this.notifications];

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(n => n.type === filters.type);
      }
      if (filters.priority) {
        filtered = filtered.filter(n => n.priority === filters.priority);
      }
      if (filters.isRead !== undefined) {
        filtered = filtered.filter(n => n.isRead === filters.isRead);
      }
      if (filters.dateRange) {
        filtered = filtered.filter(n => {
          const notificationDate = new Date(n.timestamp);
          return notificationDate >= filters.dateRange!.start && notificationDate <= filters.dateRange!.end;
        });
      }
    }

    return filtered;
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead && !n.isDismissed).length;
  }

  // Get critical count
  getCriticalCount(): number {
    return this.notifications.filter(n => n.priority === 'critical' && !n.isRead && !n.isDismissed).length;
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Mark all as read
  markAllAsRead(): void {
    this.notifications.forEach(n => {
      if (!n.isDismissed) {
        n.isRead = true;
      }
    });
    this.saveNotifications();
    this.notifyListeners();
  }

  // Dismiss notification
  dismissNotification(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isDismissed = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
  }

  // Add new notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Subscribe to notification updates
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Generate notifications based on current data
  generateNotificationsFromData(data: {
    animals?: any[];
    medicalTasks?: any[];
    applications?: any[];
    fosters?: any[];
    volunteerActivities?: any[];
  }): void {
    const newNotifications: Omit<Notification, 'id' | 'timestamp'>[] = [];

    // Generate medical notifications
    if (data.medicalTasks) {
      data.medicalTasks.forEach(task => {
        if (task.status === 'pending' && new Date(task.due_date) < new Date()) {
          newNotifications.push({
            type: 'medical',
            priority: 'critical',
            title: 'Overdue Medical Task',
            message: `${task.animal_name || 'Animal'} needs ${task.task_type} - overdue`,
            isRead: false,
            isDismissed: false,
            actionUrl: '/medical',
            actionText: 'View Task',
            metadata: { taskId: task.id, animalId: task.animal_id }
          });
        }
      });
    }

    // Generate adoption notifications
    if (data.applications) {
      data.applications.forEach(app => {
        if (app.status === 'pending') {
          newNotifications.push({
            type: 'adoption',
            priority: 'high',
            title: 'New Adoption Application',
            message: `${app.applicant_name || 'Applicant'} applied to adopt ${app.animal_name || 'animal'}`,
            isRead: false,
            isDismissed: false,
            actionUrl: '/adoptions',
            actionText: 'Review Application',
            metadata: { applicationId: app.id, animalId: app.animal_id }
          });
        }
      });
    }

    // Add new notifications
    newNotifications.forEach(notification => {
      this.addNotification(notification);
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// React hook for using notifications
export const useNotifications = () => {
  return {
    notifications: notificationService.getNotifications(),
    unreadCount: notificationService.getUnreadCount(),
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'status'>) => 
      notificationService.addNotification(notification),
    markAsRead: (id: string) => notificationService.markAsRead(id),
    markAllAsRead: () => notificationService.markAllAsRead(),
    dismissNotification: (id: string) => notificationService.dismissNotification(id),
    clearAllNotifications: () => notificationService.clearAll(),
    getFilteredNotifications: (filters: NotificationFilters) => 
      notificationService.getNotifications().filter(notification => {
        if (filters.type && notification.type !== filters.type) return false;
        if (filters.priority && notification.priority !== filters.priority) return false;
        if (filters.status && notification.status !== filters.status) return false;
        return true;
      }),
  };
};
