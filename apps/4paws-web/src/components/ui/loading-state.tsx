/**
 * LOADING STATE COMPONENT
 * 
 * PURPOSE:
 * Provides consistent loading states across the application.
 * Handles different types of loading scenarios with appropriate UI feedback.
 * 
 * FEATURES:
 * 1. LOADING TYPES - Different loading states for different scenarios
 * 2. PROGRESS INDICATORS - Visual progress for long operations
 * 3. CANCELLATION - Allow users to cancel long operations
 * 4. ACCESSIBILITY - Screen reader announcements
 * 5. CONSISTENT STYLING - Matches design system
 */

import React from 'react';
import { Loader2, RefreshCw, Upload, Download, Save } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Progress } from './progress';
import { cn } from '../../lib/utils';

interface LoadingStateProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'progress';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  progress?: number;
  onCancel?: () => void;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'spinner',
  size = 'md',
  message,
  progress,
  onCancel,
  className
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const renderSpinner = () => (
    <Loader2 className={cn('animate-spin', sizeClasses[size])} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full bg-current animate-pulse',
            size === 'sm' ? 'h-1 w-1' : size === 'md' ? 'h-2 w-2' : 'h-3 w-3'
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={cn('rounded-full bg-current animate-pulse', sizeClasses[size])} />
  );

  const renderProgress = () => (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>{message || 'Loading...'}</span>
        <span>{progress !== undefined ? `${Math.round(progress)}%` : ''}</span>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'progress':
        return renderProgress();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      {renderContent()}
      {message && type !== 'progress' && (
        <p className="text-sm text-muted-foreground text-center">{message}</p>
      )}
      {onCancel && (
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
};

// Specific loading states for common scenarios
export const PageLoadingState: React.FC<{ message?: string }> = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center">
    <Card className="w-full max-w-sm">
      <CardContent className="p-8">
        <LoadingState
          type="spinner"
          size="lg"
          message={message || 'Loading page...'}
        />
      </CardContent>
    </Card>
  </div>
);

export const DataLoadingState: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex items-center justify-center p-8">
    <LoadingState
      type="dots"
      size="md"
      message={message || 'Loading data...'}
    />
  </div>
);

export const ActionLoadingState: React.FC<{ 
  action: string; 
  progress?: number; 
  onCancel?: () => void;
}> = ({ action, progress, onCancel }) => (
  <div className="flex items-center justify-center p-4">
    <LoadingState
      type="progress"
      message={`${action}...`}
      progress={progress}
      onCancel={onCancel}
    />
  </div>
);

export const UploadLoadingState: React.FC<{ 
  progress?: number; 
  onCancel?: () => void;
}> = ({ progress, onCancel }) => (
  <div className="flex items-center justify-center p-4">
    <div className="flex items-center space-x-3">
      <Upload className="h-5 w-5 animate-pulse" />
      <LoadingState
        type="progress"
        message="Uploading files..."
        progress={progress}
        onCancel={onCancel}
      />
    </div>
  </div>
);

export const SaveLoadingState: React.FC<{ 
  progress?: number; 
  onCancel?: () => void;
}> = ({ progress, onCancel }) => (
  <div className="flex items-center justify-center p-4">
    <div className="flex items-center space-x-3">
      <Save className="h-5 w-5 animate-pulse" />
      <LoadingState
        type="progress"
        message="Saving changes..."
        progress={progress}
        onCancel={onCancel}
      />
    </div>
  </div>
);

export const RefreshLoadingState: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex items-center justify-center p-4">
    <div className="flex items-center space-x-3">
      <RefreshCw className="h-5 w-5 animate-spin" />
      <span className="text-sm text-muted-foreground">
        {message || 'Refreshing...'}
      </span>
    </div>
  </div>
);

// Loading overlay for blocking operations
export const LoadingOverlay: React.FC<{
  isVisible: boolean;
  message?: string;
  onCancel?: () => void;
}> = ({ isVisible, message, onCancel }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-sm">
        <CardContent className="p-8">
          <LoadingState
            type="spinner"
            size="lg"
            message={message || 'Processing...'}
            onCancel={onCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
};

// Inline loading state for buttons and small elements
export const InlineLoadingState: React.FC<{ 
  message?: string; 
  size?: 'sm' | 'md' | 'lg';
}> = ({ message, size = 'sm' }) => (
  <div className="flex items-center space-x-2">
    <LoadingState type="spinner" size={size} />
    {message && (
      <span className="text-sm text-muted-foreground">{message}</span>
    )}
  </div>
);
