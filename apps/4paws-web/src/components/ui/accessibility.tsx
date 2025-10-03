/**
 * ACCESSIBILITY ENHANCEMENTS
 * 
 * PURPOSE:
 * Provides comprehensive accessibility features including:
 * - Keyboard navigation utilities
 * - Screen reader support
 * - Focus management
 * - ARIA helpers
 * - Skip links
 * - Live regions
 */

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

// ============================================================================
// 1. SKIP LINKS
// ============================================================================

export const SkipLink: React.FC<{
  href: string;
  children: React.ReactNode;
  className?: string;
}> = ({ href, children, className }) => (
  <a
    href={href}
    className={cn(
      "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
      "bg-primary text-primary-foreground px-4 py-2 rounded-md",
      "z-50 focus:z-50 focus:outline-none focus:ring-2 focus:ring-ring",
      className
    )}
  >
    {children}
  </a>
);

// ============================================================================
// 2. FOCUS MANAGEMENT
// ============================================================================

export const FocusTrap: React.FC<{
  children: React.ReactNode;
  active: boolean;
  className?: string;
}> = ({ children, active, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (active) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the first focusable element in the trap
      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    } else {
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [active]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// ============================================================================
// 3. LIVE REGIONS
// ============================================================================

export const LiveRegion: React.FC<{
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  className?: string;
}> = ({ children, politeness = 'polite', className }) => (
  <div
    role="status"
    aria-live={politeness}
    aria-atomic="true"
    className={cn("sr-only", className)}
  >
    {children}
  </div>
);

// ============================================================================
// 4. SCREEN READER UTILITIES
// ============================================================================

export const ScreenReaderOnly: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <span className={cn("sr-only", className)}>
    {children}
  </span>
);

export const VisuallyHidden: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <span className={cn("sr-only", className)}>
    {children}
  </span>
);

// ============================================================================
// 5. ARIA HELPERS
// ============================================================================

export const AriaLabel: React.FC<{
  children: React.ReactNode;
  label: string;
  className?: string;
}> = ({ children, label, className }) => (
  <div aria-label={label} className={className}>
    {children}
  </div>
);

export const AriaDescribedBy: React.FC<{
  children: React.ReactNode;
  description: string;
  className?: string;
}> = ({ children, description, className }) => {
  const id = `description-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <>
      <div aria-describedby={id} className={className}>
        {children}
      </div>
      <div id={id} className="sr-only">
        {description}
      </div>
    </>
  );
};

// ============================================================================
// 6. KEYBOARD NAVIGATION
// ============================================================================

export const KeyboardNavigation: React.FC<{
  children: React.ReactNode;
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  className?: string;
}> = ({
  children,
  onEscape,
  onEnter,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  className
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        onEscape?.();
        break;
      case 'Enter':
      case ' ':
        onEnter?.();
        break;
      case 'ArrowUp':
        onArrowUp?.();
        break;
      case 'ArrowDown':
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        onArrowRight?.();
        break;
    }
  };

  return (
    <div onKeyDown={handleKeyDown} className={className}>
      {children}
    </div>
  );
};

// ============================================================================
// 7. ACCESSIBLE BUTTON
// ============================================================================

export const AccessibleButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
}> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  className
}) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    aria-busy={loading}
    className={cn(
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
  >
    {loading ? (
      <>
        <span className="sr-only">Loading...</span>
        <span aria-hidden="true">{children}</span>
      </>
    ) : (
      children
    )}
  </button>
);

// ============================================================================
// 8. ACCESSIBLE FORM FIELD
// ============================================================================

export const AccessibleFormField: React.FC<{
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ label, error, required = false, children, className }) => {
  const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `error-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      <div>
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-invalid': !!error,
          'aria-describedby': error ? errorId : undefined,
          required
        })}
      </div>
      {error && (
        <div
          id={errorId}
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 9. ACCESSIBLE TABLE
// ============================================================================

export const AccessibleTable: React.FC<{
  caption: string;
  children: React.ReactNode;
  className?: string;
}> = ({ caption, children, className }) => (
  <div className="overflow-x-auto">
    <table
      role="table"
      className={cn("w-full border-collapse", className)}
    >
      <caption className="sr-only">
        {caption}
      </caption>
      {children}
    </table>
  </div>
);

// ============================================================================
// 10. ACCESSIBILITY PROVIDER
// ============================================================================

interface AccessibilityContextType {
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
  setFocus: (element: HTMLElement | null) => void;
}

const AccessibilityContext = React.createContext<AccessibilityContextType | null>(null);

export const AccessibilityProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [liveRegion, setLiveRegion] = useState<string>('');

  const announce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    setLiveRegion(message);
    // Clear the message after a short delay to allow re-announcement
    setTimeout(() => setLiveRegion(''), 100);
  };

  const setFocus = (element: HTMLElement | null) => {
    if (element) {
      element.focus();
    }
  };

  return (
    <AccessibilityContext.Provider value={{ announce, setFocus }}>
      {children}
      <LiveRegion politeness="polite">
        {liveRegion}
      </LiveRegion>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export default AccessibilityProvider;
