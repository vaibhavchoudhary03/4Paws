/**
 * MICRO-INTERACTIONS COMPONENT
 * 
 * PURPOSE:
 * Provides subtle but delightful micro-interactions throughout the application.
 * Makes every user interaction feel responsive and engaging.
 * 
 * FEATURES:
 * 1. HOVER EFFECTS - Smooth hover animations and state changes
 * 2. FOCUS STATES - Clear focus indicators for accessibility
 * 3. CLICK FEEDBACK - Visual feedback for button clicks and interactions
 * 4. LOADING STATES - Smooth transitions between loading and loaded states
 * 5. FORM VALIDATION - Real-time validation feedback
 * 6. CARD INTERACTIONS - Hover, focus, and selection animations
 * 7. ACCESSIBILITY - Screen reader support and keyboard navigation
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

// Hover effect wrapper
interface HoverEffectProps {
  children: React.ReactNode;
  effect?: 'lift' | 'glow' | 'scale' | 'rotate' | 'fade';
  intensity?: 'subtle' | 'medium' | 'strong';
  className?: string;
}

export const HoverEffect: React.FC<HoverEffectProps> = ({
  children,
  effect = 'lift',
  intensity = 'medium',
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getEffectClasses = () => {
    const baseClasses = 'transition-all duration-200 ease-in-out';
    
    switch (effect) {
      case 'lift':
        return cn(
          baseClasses,
          isHovered && intensity === 'subtle' && 'transform -translate-y-0.5 shadow-md',
          isHovered && intensity === 'medium' && 'transform -translate-y-1 shadow-lg',
          isHovered && intensity === 'strong' && 'transform -translate-y-2 shadow-xl'
        );
      case 'glow':
        return cn(
          baseClasses,
          isHovered && intensity === 'subtle' && 'shadow-md shadow-primary/20',
          isHovered && intensity === 'medium' && 'shadow-lg shadow-primary/30',
          isHovered && intensity === 'strong' && 'shadow-xl shadow-primary/40'
        );
      case 'scale':
        return cn(
          baseClasses,
          isHovered && intensity === 'subtle' && 'transform scale-105',
          isHovered && intensity === 'medium' && 'transform scale-110',
          isHovered && intensity === 'strong' && 'transform scale-115'
        );
      case 'rotate':
        return cn(
          baseClasses,
          isHovered && intensity === 'subtle' && 'transform rotate-1',
          isHovered && intensity === 'medium' && 'transform rotate-2',
          isHovered && intensity === 'strong' && 'transform rotate-3'
        );
      case 'fade':
        return cn(
          baseClasses,
          isHovered && intensity === 'subtle' && 'opacity-90',
          isHovered && intensity === 'medium' && 'opacity-80',
          isHovered && intensity === 'strong' && 'opacity-70'
        );
      default:
        return baseClasses;
    }
  };

  return (
    <div
      className={cn(getEffectClasses(), className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

// Focus ring component for accessibility
interface FocusRingProps {
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export const FocusRing: React.FC<FocusRingProps> = ({
  children,
  color = 'primary',
  className
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getFocusClasses = () => {
    const baseClasses = 'transition-all duration-150 ease-in-out';
    
    switch (color) {
      case 'primary':
        return cn(
          baseClasses,
          isFocused && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
        );
      case 'secondary':
        return cn(
          baseClasses,
          isFocused && 'ring-2 ring-secondary ring-offset-2 ring-offset-background'
        );
      case 'success':
        return cn(
          baseClasses,
          isFocused && 'ring-2 ring-green-500 ring-offset-2 ring-offset-background'
        );
      case 'warning':
        return cn(
          baseClasses,
          isFocused && 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-background'
        );
      case 'destructive':
        return cn(
          baseClasses,
          isFocused && 'ring-2 ring-red-500 ring-offset-2 ring-offset-background'
        );
      default:
        return baseClasses;
    }
  };

  return (
    <div
      className={cn(getFocusClasses(), className)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {children}
    </div>
  );
};

// Click feedback component
interface ClickFeedbackProps {
  children: React.ReactNode;
  effect?: 'ripple' | 'scale' | 'glow' | 'bounce';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
  className?: string;
  onClick?: () => void;
}

export const ClickFeedback: React.FC<ClickFeedbackProps> = ({
  children,
  effect = 'ripple',
  color = 'primary',
  className,
  onClick
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    setIsClicked(true);
    
    if (effect === 'ripple' && elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = {
        id: Date.now(),
        x,
        y
      };
      
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }
    
    setTimeout(() => setIsClicked(false), 200);
    onClick?.();
  };

  const getClickClasses = () => {
    const baseClasses = 'relative overflow-hidden transition-all duration-150 ease-in-out';
    
    switch (effect) {
      case 'ripple':
        return baseClasses;
      case 'scale':
        return cn(
          baseClasses,
          isClicked && 'transform scale-95'
        );
      case 'glow':
        return cn(
          baseClasses,
          isClicked && 'shadow-lg shadow-primary/30'
        );
      case 'bounce':
        return cn(
          baseClasses,
          isClicked && 'animate-bounce'
        );
      default:
        return baseClasses;
    }
  };

  const getRippleColor = () => {
    switch (color) {
      case 'primary': return 'bg-primary/20';
      case 'secondary': return 'bg-secondary/20';
      case 'success': return 'bg-green-500/20';
      case 'warning': return 'bg-yellow-500/20';
      case 'destructive': return 'bg-red-500/20';
      default: return 'bg-primary/20';
    }
  };

  return (
    <div
      ref={elementRef}
      className={cn(getClickClasses(), className)}
      onClick={handleClick}
    >
      {children}
      {effect === 'ripple' && ripples.map(ripple => (
        <div
          key={ripple.id}
          className={cn(
            'absolute rounded-full animate-ripple',
            getRippleColor()
          )}
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20
          }}
        />
      ))}
    </div>
  );
};

// Form validation feedback
interface ValidationFeedbackProps {
  isValid: boolean;
  message?: string;
  showIcon?: boolean;
  className?: string;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  isValid,
  message,
  showIcon = true,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!message || !isVisible) return null;

  return (
    <div
      className={cn(
        'flex items-center space-x-2 text-sm transition-all duration-200 ease-in-out',
        isValid ? 'text-green-600' : 'text-red-600',
        className
      )}
    >
      {showIcon && (
        <div className={cn(
          'w-4 h-4 rounded-full flex items-center justify-center',
          isValid ? 'bg-green-100' : 'bg-red-100'
        )}>
          {isValid ? (
            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      )}
      <span>{message}</span>
    </div>
  );
};

// Card interaction wrapper
interface CardInteractionProps {
  children: React.ReactNode;
  isSelected?: boolean;
  isHoverable?: boolean;
  isClickable?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CardInteraction: React.FC<CardInteractionProps> = ({
  children,
  isSelected = false,
  isHoverable = true,
  isClickable = false,
  onClick,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCardClasses = () => {
    const baseClasses = 'transition-all duration-200 ease-in-out';
    
    let classes = baseClasses;
    
    if (isHoverable) {
      classes = cn(classes, 'hover:shadow-md hover:scale-105');
    }
    
    if (isClickable) {
      classes = cn(classes, 'cursor-pointer active:scale-95');
    }
    
    if (isSelected) {
      classes = cn(classes, 'ring-2 ring-primary ring-offset-2');
    }
    
    if (isHovered && isHoverable) {
      classes = cn(classes, 'shadow-lg');
    }
    
    return classes;
  };

  return (
    <div
      className={cn(getCardClasses(), className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Loading state transition
interface LoadingTransitionProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  className?: string;
}

export const LoadingTransition: React.FC<LoadingTransitionProps> = ({
  isLoading,
  children,
  loadingComponent,
  className
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsTransitioning(true);
    } else {
      const timer = setTimeout(() => setIsTransitioning(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div className={cn('relative', className)}>
      {isLoading ? (
        <div className="animate-fade-in">
          {loadingComponent || (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      ) : (
        <div className={cn(
          'animate-fade-in',
          isTransitioning && 'opacity-0'
        )}>
          {children}
        </div>
      )}
    </div>
  );
};

// Hook for managing micro-interactions
export const useMicroInteractions = () => {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const [clickedElement, setClickedElement] = useState<string | null>(null);

  const handleHover = (elementId: string) => {
    setHoveredElement(elementId);
  };

  const handleFocus = (elementId: string) => {
    setFocusedElement(elementId);
  };

  const handleClick = (elementId: string) => {
    setClickedElement(elementId);
    setTimeout(() => setClickedElement(null), 200);
  };

  const isHovered = (elementId: string) => hoveredElement === elementId;
  const isFocused = (elementId: string) => focusedElement === elementId;
  const isClicked = (elementId: string) => clickedElement === elementId;

  return {
    handleHover,
    handleFocus,
    handleClick,
    isHovered,
    isFocused,
    isClicked
  };
};

export default {
  HoverEffect,
  FocusRing,
  ClickFeedback,
  ValidationFeedback,
  CardInteraction,
  LoadingTransition,
  useMicroInteractions
};
