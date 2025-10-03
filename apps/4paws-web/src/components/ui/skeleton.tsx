/**
 * SKELETON LOADER COMPONENT
 * 
 * PURPOSE:
 * Provides skeleton loading states for various UI components.
 * Creates a smooth loading experience while data is being fetched.
 * 
 * FEATURES:
 * 1. ANIMATED SKELETON - Smooth shimmer animation
 * 2. FLEXIBLE SIZING - Customizable width, height, and shape
 * 3. CONSISTENT STYLING - Matches the design system
 * 4. ACCESSIBILITY - Screen reader friendly
 * 5. PERFORMANCE - Lightweight and efficient
 */

import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse rounded-md bg-muted/50",
          className
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

export { Skeleton };

// Pre-configured skeleton components for common use cases
export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("rounded-lg border bg-card p-6", className)}>
    <div className="space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, className }: { rows?: number; className?: string }) => (
  <div className={cn("space-y-3", className)}>
    {/* Table header */}
    <div className="flex space-x-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-16" />
    </div>
    {/* Table rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

export const SkeletonList = ({ items = 3, className }: { items?: number; className?: string }) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonChart = ({ className }: { className?: string }) => (
  <div className={cn("space-y-4", className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-20" />
    </div>
    <Skeleton className="h-64 w-full" />
    <div className="flex justify-center space-x-2">
      <Skeleton className="h-2 w-2 rounded-full" />
      <Skeleton className="h-2 w-2 rounded-full" />
      <Skeleton className="h-2 w-2 rounded-full" />
    </div>
  </div>
);

export const SkeletonForm = ({ fields = 4, className }: { fields?: number; className?: string }) => (
  <div className={cn("space-y-6", className)}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex space-x-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
);

export const SkeletonMetric = ({ className }: { className?: string }) => (
  <div className={cn("space-y-2", className)}>
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-8 w-16" />
    <Skeleton className="h-3 w-24" />
  </div>
);

export const SkeletonNotification = ({ className }: { className?: string }) => (
  <div className={cn("flex items-start space-x-3 p-3", className)}>
    <Skeleton className="h-5 w-5 rounded-full" />
    <div className="space-y-2 flex-1">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

export const SkeletonAnimalCard = ({ className }: { className?: string }) => (
  <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
    <Skeleton className="h-48 w-full" />
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  </div>
);

export const SkeletonDashboard = ({ className }: { className?: string }) => (
  <div className={cn("space-y-6", className)}>
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    
    {/* Quick stats */}
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonMetric key={i} />
      ))}
    </div>
    
    {/* Charts */}
    <div className="grid gap-6 md:grid-cols-2">
      <SkeletonChart />
      <SkeletonChart />
    </div>
    
    {/* Recent activity */}
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <SkeletonList items={5} />
    </div>
  </div>
);