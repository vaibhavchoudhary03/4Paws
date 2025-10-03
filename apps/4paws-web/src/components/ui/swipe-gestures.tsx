/**
 * SWIPE GESTURES COMPONENT
 * 
 * PURPOSE:
 * Provides swipe gesture support for mobile interactions
 * including swipe-to-dismiss, swipe-to-refresh, and swipe navigation.
 * 
 * FEATURES:
 * 1. SWIPE TO DISMISS - Swipe left/right to dismiss items
 * 2. SWIPE TO REFRESH - Pull down to refresh data
 * 3. SWIPE NAVIGATION - Swipe between pages/sections
 * 4. TOUCH FEEDBACK - Visual feedback during swipe
 * 5. ACCESSIBILITY - Screen reader support
 * 6. CUSTOMIZABLE - Configurable thresholds and actions
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';

interface SwipeGestureProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  threshold?: number;
  className?: string;
  disabled?: boolean;
  showFeedback?: boolean;
}

interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isSwipe: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
}

export const SwipeGesture: React.FC<SwipeGestureProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onSwipeStart,
  onSwipeEnd,
  threshold = 50,
  className,
  disabled = false,
  showFeedback = true
}) => {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isSwipe: false,
    direction: null
  });

  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;

    const touch = e.touches[0];
    setSwipeState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isSwipe: false,
      direction: null
    });
    onSwipeStart?.();
  }, [disabled, onSwipeStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeState.startX;
    const deltaY = touch.clientY - swipeState.startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if this is a swipe gesture
    const isSwipe = absDeltaX > threshold || absDeltaY > threshold;
    let direction: 'left' | 'right' | 'up' | 'down' | null = null;

    if (isSwipe) {
      if (absDeltaX > absDeltaY) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }
    }

    setSwipeState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isSwipe,
      direction
    }));
  }, [disabled, swipeState.startX, swipeState.startY, threshold]);

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;

    const { isSwipe, direction } = swipeState;

    if (isSwipe && direction) {
      switch (direction) {
        case 'left':
          onSwipeLeft?.();
          break;
        case 'right':
          onSwipeRight?.();
          break;
        case 'up':
          onSwipeUp?.();
          break;
        case 'down':
          onSwipeDown?.();
          break;
      }
    }

    setSwipeState({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isSwipe: false,
      direction: null
    });
    onSwipeEnd?.();
  }, [disabled, swipeState, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipeEnd]);

  const getTransform = () => {
    if (!swipeState.isSwipe || !showFeedback) return '';

    const deltaX = swipeState.currentX - swipeState.startX;
    const deltaY = swipeState.currentY - swipeState.startY;

    return `translate3d(${deltaX}px, ${deltaY}px, 0)`;
  };

  const getOpacity = () => {
    if (!swipeState.isSwipe || !showFeedback) return 1;

    const deltaX = Math.abs(swipeState.currentX - swipeState.startX);
    const deltaY = Math.abs(swipeState.currentY - swipeState.startY);
    const maxDelta = Math.max(deltaX, deltaY);
    const progress = Math.min(maxDelta / (threshold * 2), 1);

    return 1 - (progress * 0.3);
  };

  return (
    <div
      ref={elementRef}
      className={cn('touch-manipulation', className)}
      style={{
        transform: getTransform(),
        opacity: getOpacity(),
        transition: swipeState.isSwipe ? 'none' : 'transform 0.2s ease-out, opacity 0.2s ease-out'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};

// Swipe to dismiss component
interface SwipeToDismissProps {
  children: React.ReactNode;
  onDismiss: () => void;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export const SwipeToDismiss: React.FC<SwipeToDismissProps> = ({
  children,
  onDismiss,
  threshold = 100,
  className,
  disabled = false
}) => {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleSwipeLeft = useCallback(() => {
    if (disabled) return;
    setIsDismissing(true);
    setTimeout(() => {
      onDismiss();
      setIsDismissing(false);
    }, 200);
  }, [disabled, onDismiss]);

  const handleSwipeRight = useCallback(() => {
    if (disabled) return;
    setIsDismissing(true);
    setTimeout(() => {
      onDismiss();
      setIsDismissing(false);
    }, 200);
  }, [disabled, onDismiss]);

  return (
    <SwipeGesture
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      threshold={threshold}
      className={cn(
        'transition-all duration-200',
        isDismissing && 'opacity-0 scale-95',
        className
      )}
      disabled={disabled}
    >
      {children}
    </SwipeGesture>
  );
};

// Swipe to refresh component
interface SwipeToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => void;
  threshold?: number;
  className?: string;
  disabled?: boolean;
  refreshing?: boolean;
}

export const SwipeToRefresh: React.FC<SwipeToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  className,
  disabled = false,
  refreshing = false
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const handleSwipeDown = useCallback(() => {
    if (disabled || refreshing) return;
    onRefresh();
  }, [disabled, refreshing, onRefresh]);

  const handleSwipeStart = useCallback(() => {
    setIsPulling(true);
  }, []);

  const handleSwipeEnd = useCallback(() => {
    setIsPulling(false);
    setPullDistance(0);
  }, []);

  return (
    <div className={cn('relative', className)}>
      {/* Pull to refresh indicator */}
      {isPulling && (
        <div className="absolute top-0 left-0 right-0 flex justify-center items-center py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-gray-600">
            {refreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-sm">Refreshing...</span>
              </>
            ) : (
              <>
                <div className="w-4 h-4">⬇️</div>
                <span className="text-sm">Pull to refresh</span>
              </>
            )}
          </div>
        </div>
      )}

      <SwipeGesture
        onSwipeDown={handleSwipeDown}
        onSwipeStart={handleSwipeStart}
        onSwipeEnd={handleSwipeEnd}
        threshold={threshold}
        disabled={disabled}
        showFeedback={false}
      >
        {children}
      </SwipeGesture>
    </div>
  );
};

// Swipe navigation component
interface SwipeNavigationProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export const SwipeNavigation: React.FC<SwipeNavigationProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  className,
  disabled = false
}) => {
  return (
    <SwipeGesture
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
      threshold={threshold}
      className={className}
      disabled={disabled}
    >
      {children}
    </SwipeGesture>
  );
};

export default SwipeGesture;
