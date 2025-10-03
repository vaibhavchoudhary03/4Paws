/**
 * PROGRESS COMPONENT
 * 
 * PURPOSE:
 * Displays progress indicators for long-running operations.
 * Provides visual feedback for uploads, downloads, and other processes.
 * 
 * FEATURES:
 * 1. PROGRESS BARS - Linear progress indicators
 * 2. CIRCULAR PROGRESS - Circular progress indicators
 * 3. ANIMATIONS - Smooth progress animations
 * 4. ACCESSIBILITY - Screen reader support
 * 5. CUSTOMIZABLE - Various sizes and styles
 */

import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  showValue?: boolean;
  animated?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    size = 'md',
    variant = 'default',
    showValue = false,
    animated = true,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3'
    };

    const variantClasses = {
      default: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      destructive: 'bg-red-500'
    };

    return (
      <div className="w-full space-y-2">
        {showValue && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          ref={ref}
          className={cn(
            'w-full overflow-hidden rounded-full bg-muted',
            sizeClasses[size],
            className
          )}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`Progress: ${Math.round(percentage)}%`}
          {...props}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 ease-in-out',
              variantClasses[variant],
              animated && 'animate-pulse'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = 'Progress';

// Circular progress component
interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  showValue?: boolean;
  animated?: boolean;
}

export const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    size = 40,
    strokeWidth = 4,
    variant = 'default',
    showValue = false,
    animated = true,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    const variantClasses = {
      default: 'text-primary',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      destructive: 'text-red-500'
    };

    return (
      <div className={cn('relative inline-flex items-center justify-center', className)} ref={ref} {...props}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              'transition-all duration-300 ease-in-out',
              variantClasses[variant],
              animated && 'animate-pulse'
            )}
            strokeLinecap="round"
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    );
  }
);
CircularProgress.displayName = 'CircularProgress';

// Step progress component
interface StepProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: string[];
  currentStep: number;
  completed?: boolean;
}

export const StepProgress = React.forwardRef<HTMLDivElement, StepProgressProps>(
  ({ className, steps, currentStep, completed = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center space-x-4', className)}
        {...props}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep || (completed && index === currentStep);
          const isCurrent = index === currentStep && !completed;
          const isUpcoming = index > currentStep;

          return (
            <div key={index} className="flex items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary/10 text-primary border-2 border-primary',
                  isUpcoming && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  'ml-2 text-sm',
                  isCompleted && 'text-primary font-medium',
                  isCurrent && 'text-primary font-medium',
                  isUpcoming && 'text-muted-foreground'
                )}
              >
                {step}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'ml-4 h-0.5 w-8',
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }
);
StepProgress.displayName = 'StepProgress';

export { Progress };