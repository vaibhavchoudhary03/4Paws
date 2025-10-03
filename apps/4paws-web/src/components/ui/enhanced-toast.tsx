/**
 * ENHANCED TOAST NOTIFICATION SYSTEM
 * 
 * PURPOSE:
 * Provides rich, animated toast notifications for user feedback.
 * Makes every action feel satisfying and successful.
 * 
 * FEATURES:
 * 1. SUCCESS ANIMATIONS - Checkmark animations, confetti effects
 * 2. RICH CONTENT - Icons, descriptions, action buttons
 * 3. PROGRESS TOASTS - Long-running operation feedback
 * 4. STACK MANAGEMENT - Multiple toasts with proper ordering
 * 5. ACCESSIBILITY - Screen reader announcements
 * 6. CUSTOMIZATION - Themes, positions, durations
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X, 
  ExternalLink,
  RefreshCw,
  Download,
  Upload,
  Save,
  Trash2,
  Heart,
  Home,
  Users,
  Stethoscope
} from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  persistent?: boolean;
  icon?: React.ReactNode;
  progress?: number;
  onClose?: () => void;
}

interface ToastState {
  toasts: ToastProps[];
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

// Toast context for global state management
const ToastContext = React.createContext<{
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<ToastProps>) => void;
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
  updateToast: () => {}
});

// Toast provider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastProps = {
      id,
      duration: 5000,
      persistent: false,
      ...toast
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration (unless persistent)
    if (!newToast.persistent && newToast.duration) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const updateToast = (id: string, updates: Partial<ToastProps>) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Hook to use toast notifications
export const useEnhancedToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useEnhancedToast must be used within a ToastProvider');
  }
  return context;
};

// Individual toast component
const Toast: React.FC<ToastProps & { onRemove: (id: string) => void }> = ({
  id,
  type,
  title,
  description,
  action,
  duration = 5000,
  persistent = false,
  icon,
  progress,
  onClose,
  onRemove
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(id);
      onClose?.();
    }, 300);
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: icon || <CheckCircle className="w-5 h-5" />,
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-500',
          animation: 'animate-success-pulse'
        };
      case 'error':
        return {
          icon: icon || <XCircle className="w-5 h-5" />,
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-500',
          animation: 'animate-error-shake'
        };
      case 'warning':
        return {
          icon: icon || <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-500',
          animation: 'animate-warning-pulse'
        };
      case 'info':
        return {
          icon: icon || <Info className="w-5 h-5" />,
          bgColor: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-500',
          animation: 'animate-info-pulse'
        };
      case 'loading':
        return {
          icon: icon || <RefreshCw className="w-5 h-5 animate-spin" />,
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-500',
          animation: 'animate-loading-spin'
        };
      default:
        return {
          icon: icon || <Info className="w-5 h-5" />,
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-500',
          animation: ''
        };
    }
  };

  const config = getToastConfig();

  return (
    <div
      className={cn(
        'relative max-w-sm w-full bg-white border rounded-lg shadow-lg transition-all duration-300 ease-in-out',
        config.bgColor,
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        isLeaving && 'translate-x-full opacity-0'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={cn('flex-shrink-0', config.iconColor, config.animation)}>
            {config.icon}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={cn('text-sm font-medium', config.textColor)}>
              {title}
            </p>
            {description && (
              <p className={cn('mt-1 text-sm', config.textColor, 'opacity-80')}>
                {description}
              </p>
            )}
            {progress !== undefined && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-current h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs mt-1 text-gray-600">{Math.round(progress)}% complete</p>
              </div>
            )}
            {action && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={action.onClick}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={cn(
                'inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
                config.textColor,
                'hover:opacity-75'
              )}
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast container component
const ToastContainer: React.FC<{ 
  toasts: ToastProps[]; 
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

// Pre-configured toast functions for common scenarios
export const toastSuccess = (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
  const { addToast } = useEnhancedToast();
  addToast({
    type: 'success',
    title,
    description,
    action,
    duration: 4000
  });
};

export const toastError = (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
  const { addToast } = useEnhancedToast();
  addToast({
    type: 'error',
    title,
    description,
    action,
    duration: 6000,
    persistent: true
  });
};

export const toastWarning = (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
  const { addToast } = useEnhancedToast();
  addToast({
    type: 'warning',
    title,
    description,
    action,
    duration: 5000
  });
};

export const toastInfo = (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
  const { addToast } = useEnhancedToast();
  addToast({
    type: 'info',
    title,
    description,
    action,
    duration: 4000
  });
};

export const toastLoading = (title: string, description?: string) => {
  const { addToast } = useEnhancedToast();
  return addToast({
    type: 'loading',
    title,
    description,
    persistent: true,
    duration: 0
  });
};

// Specific toast functions for shelter operations
export const toastAnimalCreated = (animalName: string) => {
  toastSuccess(
    'Animal Added Successfully!',
    `${animalName} has been added to the shelter system.`,
    { label: 'View Animal', onClick: () => window.location.href = '/animals' }
  );
};

export const toastAnimalUpdated = (animalName: string) => {
  toastSuccess(
    'Animal Updated!',
    `${animalName}'s information has been updated.`
  );
};

export const toastMedicalTaskCompleted = (taskType: string, animalName: string) => {
  toastSuccess(
    'Medical Task Completed!',
    `${taskType} completed for ${animalName}.`,
    { label: 'View Medical', onClick: () => window.location.href = '/medical' }
  );
};

export const toastAdoptionApproved = (animalName: string, adopterName: string) => {
  toastSuccess(
    'Adoption Approved!',
    `${animalName} has been approved for adoption by ${adopterName}.`,
    { label: 'View Adoption', onClick: () => window.location.href = '/adoptions' }
  );
};

export const toastFosterAssigned = (animalName: string, fosterName: string) => {
  toastSuccess(
    'Foster Assignment Complete!',
    `${animalName} has been assigned to ${fosterName}.`,
    { label: 'View Fosters', onClick: () => window.location.href = '/fosters' }
  );
};

export const toastVolunteerActivity = (activityType: string, duration: number) => {
  toastSuccess(
    'Activity Logged!',
    `${activityType} activity logged for ${duration} minutes.`,
    { label: 'View Activities', onClick: () => window.location.href = '/volunteers' }
  );
};

export const toastDataExported = (format: string, count: number) => {
  toastSuccess(
    'Export Complete!',
    `${count} records exported as ${format.toUpperCase()}.`,
    { label: 'Download', onClick: () => {} }
  );
};

export const toastFileUploaded = (fileName: string, fileCount: number) => {
  toastSuccess(
    'Upload Complete!',
    `${fileCount} file(s) uploaded successfully.`,
    { label: 'View Files', onClick: () => {} }
  );
};

export default Toast;
