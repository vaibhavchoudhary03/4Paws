/**
 * ERROR STATE COMPONENT
 * 
 * PURPOSE:
 * Provides consistent error states across the application.
 * Handles different types of errors with appropriate recovery options.
 * 
 * FEATURES:
 * 1. ERROR TYPES - Different error states for different scenarios
 * 2. RECOVERY ACTIONS - Retry, refresh, and navigation options
 * 3. USER-FRIENDLY MESSAGES - Clear, actionable error descriptions
 * 4. ACCESSIBILITY - Screen reader announcements
 * 5. CONSISTENT STYLING - Matches design system
 */

import React from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Wifi, 
  WifiOff, 
  FileX, 
  Shield, 
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '../../lib/utils';

interface ErrorStateProps {
  type?: 'network' | 'notFound' | 'permission' | 'server' | 'generic';
  title?: string;
  message?: string;
  details?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  showDetails?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'generic',
  title,
  message,
  details,
  onRetry,
  onGoHome,
  onGoBack,
  showDetails = false,
  className
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: WifiOff,
          defaultTitle: 'Connection Error',
          defaultMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
        iconColor: 'text-kirby-secondary-dark',
        bgColor: 'bg-kirby-secondary/10',
        borderColor: 'border-kirby-secondary/20'
        };
      case 'notFound':
        return {
          icon: FileX,
          defaultTitle: 'Not Found',
          defaultMessage: 'The requested resource could not be found. It may have been moved or deleted.',
        iconColor: 'text-kirby-primary-dark',
        bgColor: 'bg-kirby-primary/10',
        borderColor: 'border-kirby-primary/20'
        };
      case 'permission':
        return {
          icon: Shield,
          defaultTitle: 'Access Denied',
          defaultMessage: 'You don\'t have permission to access this resource. Please contact your administrator.',
        iconColor: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/20'
        };
      case 'server':
        return {
          icon: AlertTriangle,
          defaultTitle: 'Server Error',
          defaultMessage: 'Something went wrong on our end. We\'re working to fix it. Please try again later.',
        iconColor: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/20'
        };
      default:
        return {
          icon: AlertTriangle,
          defaultTitle: 'Something went wrong',
          defaultMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
        iconColor: 'text-muted-foreground',
        bgColor: 'bg-muted',
        borderColor: 'border-border'
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className={cn(
            'mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full',
            config.bgColor
          )}>
            <Icon className={cn('h-6 w-6', config.iconColor)} />
          </div>
          <CardTitle className="text-xl">
            {title || config.defaultTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {message || config.defaultMessage}
          </p>
          
          {showDetails && details && (
            <details className="rounded-md bg-muted p-3">
              <summary className="cursor-pointer text-sm font-medium">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs text-muted-foreground overflow-auto">
                {details}
              </pre>
            </details>
          )}

          <div className="flex flex-col space-y-2">
            {onRetry && (
              <Button onClick={onRetry} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            {onGoBack && (
              <Button variant="outline" onClick={onGoBack} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            )}
            {onGoHome && (
              <Button variant="outline" onClick={onGoHome} className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Need help? Contact support or check our documentation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Specific error states for common scenarios
export const NetworkErrorState: React.FC<{
  onRetry?: () => void;
  onGoHome?: () => void;
}> = ({ onRetry, onGoHome }) => (
  <ErrorState
    type="network"
    onRetry={onRetry}
    onGoHome={onGoHome}
  />
);

export const NotFoundErrorState: React.FC<{
  resource?: string;
  onGoBack?: () => void;
  onGoHome?: () => void;
}> = ({ resource = 'page', onGoBack, onGoHome }) => (
  <ErrorState
    type="notFound"
    title={`${resource.charAt(0).toUpperCase() + resource.slice(1)} Not Found`}
    message={`The ${resource} you're looking for doesn't exist or has been moved.`}
    onGoBack={onGoBack}
    onGoHome={onGoHome}
  />
);

export const PermissionErrorState: React.FC<{
  resource?: string;
  onGoHome?: () => void;
}> = ({ resource = 'resource', onGoHome }) => (
  <ErrorState
    type="permission"
    title="Access Denied"
    message={`You don't have permission to access this ${resource}. Please contact your administrator.`}
    onGoHome={onGoHome}
  />
);

export const ServerErrorState: React.FC<{
  onRetry?: () => void;
  onGoHome?: () => void;
  details?: string;
}> = ({ onRetry, onGoHome, details }) => (
  <ErrorState
    type="server"
    onRetry={onRetry}
    onGoHome={onGoHome}
    details={details}
    showDetails={!!details}
  />
);

// Inline error state for forms and small elements
export const InlineErrorState: React.FC<{
  message: string;
  onRetry?: () => void;
  className?: string;
}> = ({ message, onRetry, className }) => (
  <div className={cn('flex items-center space-x-2 text-destructive', className)}>
    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
    <span className="text-sm">{message}</span>
    {onRetry && (
      <Button variant="ghost" size="sm" onClick={onRetry}>
        <RefreshCw className="h-3 w-3" />
      </Button>
    )}
  </div>
);

// Error state for empty states
export const EmptyErrorState: React.FC<{
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ title, message, action }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
      <HelpCircle className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold mb-2">
      {title || 'No data available'}
    </h3>
    <p className="text-muted-foreground mb-4">
      {message || 'There\'s nothing to show here yet.'}
    </p>
    {action && (
      <Button onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </div>
);

// Data loading state
export const DataLoadingState: React.FC<{
  message?: string;
  className?: string;
}> = ({ message = "Loading data...", className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto bg-kirby-primary/10 rounded-full flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-kirby-primary-dark animate-spin" />
        </div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

// Error boundary fallback
export const ErrorBoundaryFallback: React.FC<{
  error?: Error;
  resetError?: () => void;
}> = ({ error, resetError }) => (
  <ErrorState
    type="generic"
    title="Something went wrong"
    message="An unexpected error occurred. Please try refreshing the page."
    details={error?.message}
    onRetry={resetError}
    showDetails={!!error}
  />
);
