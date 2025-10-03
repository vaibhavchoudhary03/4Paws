/**
 * TOUCH-FRIENDLY BUTTON COMPONENT
 * 
 * PURPOSE:
 * Provides touch-optimized buttons with proper touch targets
 * and mobile-friendly interactions.
 * 
 * FEATURES:
 * 1. TOUCH TARGETS - Minimum 44px touch area
 * 2. TOUCH FEEDBACK - Visual feedback on touch
 * 3. ACCESSIBILITY - Screen reader support
 * 4. RESPONSIVE - Adapts to different screen sizes
 * 5. LOADING STATES - Loading indicators for async actions
 * 6. ICON SUPPORT - Icons with proper spacing
 */

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button, ButtonProps } from './button';
import { cn } from '../../lib/utils';

interface TouchButtonProps extends Omit<ButtonProps, 'size'> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  touchTarget?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  size = 'md',
  touchTarget = true,
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getSizeClasses = () => {
    const baseClasses = 'font-medium transition-all duration-200';
    
    if (touchTarget) {
      // Ensure minimum 44px touch target
      switch (size) {
        case 'sm':
          return `${baseClasses} px-3 py-2 min-h-[44px] min-w-[44px] text-sm`;
        case 'md':
          return `${baseClasses} px-4 py-3 min-h-[44px] min-w-[44px] text-base`;
        case 'lg':
          return `${baseClasses} px-6 py-4 min-h-[48px] min-w-[48px] text-lg`;
        case 'xl':
          return `${baseClasses} px-8 py-5 min-h-[52px] min-w-[52px] text-xl`;
        default:
          return `${baseClasses} px-4 py-3 min-h-[44px] min-w-[44px] text-base`;
      }
    } else {
      // Standard button sizes without touch target enforcement
      switch (size) {
        case 'sm':
          return `${baseClasses} px-2 py-1 text-sm`;
        case 'md':
          return `${baseClasses} px-4 py-2 text-base`;
        case 'lg':
          return `${baseClasses} px-6 py-3 text-lg`;
        case 'xl':
          return `${baseClasses} px-8 py-4 text-xl`;
        default:
          return `${baseClasses} px-4 py-2 text-base`;
      }
    }
  };

  const getTouchFeedbackClasses = () => {
    if (isPressed) {
      return 'transform scale-95 shadow-inner';
    }
    return 'active:scale-95 active:shadow-inner';
  };

  const handleTouchStart = () => {
    setIsPressed(true);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  return (
    <Button
      className={cn(
        getSizeClasses(),
        getTouchFeedbackClasses(),
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div className="flex items-center justify-center space-x-2">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{loadingText || 'Loading...'}</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="flex-shrink-0">{icon}</span>
            )}
            <span className="flex-1 text-center">{children}</span>
            {icon && iconPosition === 'right' && (
              <span className="flex-shrink-0">{icon}</span>
            )}
          </>
        )}
      </div>
    </Button>
  );
};

// Pre-configured touch buttons for common use cases
export const TouchIconButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: ButtonProps['variant'];
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}> = ({ icon, label, onClick, variant = 'default', size = 'md', disabled, loading, className }) => (
  <TouchButton
    variant={variant}
    size={size}
    onClick={onClick}
    disabled={disabled}
    loading={loading}
    className={cn('flex-col space-y-1', className)}
    aria-label={label}
  >
    <span className="flex-shrink-0">{icon}</span>
    <span className="text-xs font-medium">{label}</span>
  </TouchButton>
);

export const TouchFloatingButton: React.FC<{
  icon: React.ReactNode;
  onClick?: () => void;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ 
  icon, 
  onClick, 
  label, 
  position = 'bottom-right', 
  size = 'lg',
  className 
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'fixed bottom-20 right-4 z-40';
      case 'bottom-left':
        return 'fixed bottom-20 left-4 z-40';
      case 'top-right':
        return 'fixed top-20 right-4 z-40';
      case 'top-left':
        return 'fixed top-20 left-4 z-40';
      default:
        return 'fixed bottom-20 right-4 z-40';
    }
  };

  return (
    <TouchButton
      size={size}
      onClick={onClick}
      className={cn(
        'rounded-full shadow-lg hover:shadow-xl',
        getPositionClasses(),
        className
      )}
      aria-label={label}
    >
      {icon}
    </TouchButton>
  );
};

export const TouchActionButton: React.FC<{
  action: 'create' | 'edit' | 'delete' | 'save' | 'cancel' | 'submit';
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: React.ReactNode;
}> = ({ 
  action, 
  onClick, 
  loading, 
  disabled, 
  fullWidth, 
  size = 'md',
  className,
  children 
}) => {
  const getActionConfig = () => {
    switch (action) {
      case 'create':
        return {
          variant: 'default' as const,
          icon: '+',
          text: 'Create',
          color: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'edit':
        return {
          variant: 'outline' as const,
          icon: '✏️',
          text: 'Edit',
          color: 'bg-gray-100 hover:bg-gray-200'
        };
      case 'delete':
        return {
          variant: 'destructive' as const,
          icon: '🗑️',
          text: 'Delete',
          color: 'bg-red-600 hover:bg-red-700'
        };
      case 'save':
        return {
          variant: 'default' as const,
          icon: '💾',
          text: 'Save',
          color: 'bg-green-600 hover:bg-green-700'
        };
      case 'cancel':
        return {
          variant: 'outline' as const,
          icon: '❌',
          text: 'Cancel',
          color: 'bg-gray-100 hover:bg-gray-200'
        };
      case 'submit':
        return {
          variant: 'default' as const,
          icon: '✅',
          text: 'Submit',
          color: 'bg-blue-600 hover:bg-blue-700'
        };
      default:
        return {
          variant: 'default' as const,
          icon: '🔘',
          text: 'Action',
          color: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const config = getActionConfig();

  return (
    <TouchButton
      variant={config.variant}
      size={size}
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      className={cn(config.color, className)}
    >
      {children || config.text}
    </TouchButton>
  );
};

export default TouchButton;
