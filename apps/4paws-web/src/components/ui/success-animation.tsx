/**
 * SUCCESS ANIMATION COMPONENT
 * 
 * PURPOSE:
 * Provides satisfying success animations for user actions.
 * Makes every successful action feel rewarding and delightful.
 * 
 * FEATURES:
 * 1. CHECKMARK ANIMATIONS - Animated checkmarks for completions
 * 2. CONFETTI EFFECTS - Celebration animations for major milestones
 * 3. PULSE EFFECTS - Subtle pulse animations for status changes
 * 4. PROGRESS CELEBRATIONS - Animated progress completions
 * 5. CUSTOMIZABLE - Colors, sizes, and timing options
 * 6. ACCESSIBILITY - Screen reader announcements
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, Heart, Star, Zap, Trophy, Gift } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SuccessAnimationProps {
  type?: 'checkmark' | 'confetti' | 'pulse' | 'heart' | 'star' | 'trophy' | 'gift';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'pink' | 'yellow';
  duration?: number;
  onComplete?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  type = 'checkmark',
  size = 'md',
  color = 'green',
  duration = 2000,
  onComplete,
  className,
  children
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    
    const timer = setTimeout(() => {
      setIsAnimating(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-6 h-6';
      case 'md': return 'w-8 h-8';
      case 'lg': return 'w-12 h-12';
      case 'xl': return 'w-16 h-16';
      default: return 'w-8 h-8';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'green': return 'text-green-500';
      case 'blue': return 'text-blue-500';
      case 'purple': return 'text-purple-500';
      case 'orange': return 'text-orange-500';
      case 'pink': return 'text-pink-500';
      case 'yellow': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  const getAnimationClasses = () => {
    switch (type) {
      case 'checkmark':
        return isAnimating ? 'animate-checkmark-bounce' : '';
      case 'confetti':
        return isAnimating ? 'animate-confetti-explosion' : '';
      case 'pulse':
        return isAnimating ? 'animate-success-pulse' : '';
      case 'heart':
        return isAnimating ? 'animate-heart-beat' : '';
      case 'star':
        return isAnimating ? 'animate-star-sparkle' : '';
      case 'trophy':
        return isAnimating ? 'animate-trophy-glow' : '';
      case 'gift':
        return isAnimating ? 'animate-gift-shake' : '';
      default:
        return isAnimating ? 'animate-checkmark-bounce' : '';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'checkmark':
        return <CheckCircle className={cn(getSizeClasses(), getColorClasses(), getAnimationClasses())} />;
      case 'confetti':
        return <Zap className={cn(getSizeClasses(), getColorClasses(), getAnimationClasses())} />;
      case 'pulse':
        return <CheckCircle className={cn(getSizeClasses(), getColorClasses(), getAnimationClasses())} />;
      case 'heart':
        return <Heart className={cn(getSizeClasses(), getColorClasses(), getAnimationClasses())} />;
      case 'star':
        return <Star className={cn(getSizeClasses(), getColorClasses(), getAnimationClasses())} />;
      case 'trophy':
        return <Trophy className={cn(getSizeClasses(), getColorClasses(), getAnimationClasses())} />;
      case 'gift':
        return <Gift className={cn(getSizeClasses(), getColorClasses(), getAnimationClasses())} />;
      default:
        return <CheckCircle className={cn(getSizeClasses(), getColorClasses(), getAnimationClasses())} />;
    }
  };

  const renderConfetti = () => {
    if (type !== 'confetti' || !isAnimating) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'absolute w-2 h-2 rounded-full animate-confetti-particle',
              color === 'green' ? 'bg-green-400' :
              color === 'blue' ? 'bg-blue-400' :
              color === 'purple' ? 'bg-purple-400' :
              color === 'orange' ? 'bg-orange-400' :
              color === 'pink' ? 'bg-pink-400' :
              color === 'yellow' ? 'bg-yellow-400' : 'bg-green-400'
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${1 + Math.random() * 0.5}s`
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      {getIcon()}
      {renderConfetti()}
      {children}
    </div>
  );
};

// Pre-configured success animations for common scenarios
export const CheckmarkSuccess: React.FC<{ 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onComplete?: () => void;
}> = ({ size = 'md', onComplete }) => (
  <SuccessAnimation
    type="checkmark"
    size={size}
    color="green"
    duration={1500}
    onComplete={onComplete}
  />
);

export const ConfettiSuccess: React.FC<{ 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'pink' | 'yellow';
  onComplete?: () => void;
}> = ({ size = 'lg', color = 'green', onComplete }) => (
  <SuccessAnimation
    type="confetti"
    size={size}
    color={color}
    duration={3000}
    onComplete={onComplete}
  />
);

export const HeartSuccess: React.FC<{ 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onComplete?: () => void;
}> = ({ size = 'md', onComplete }) => (
  <SuccessAnimation
    type="heart"
    size={size}
    color="pink"
    duration={2000}
    onComplete={onComplete}
  />
);

export const StarSuccess: React.FC<{ 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onComplete?: () => void;
}> = ({ size = 'md', onComplete }) => (
  <SuccessAnimation
    type="star"
    size={size}
    color="yellow"
    duration={2000}
    onComplete={onComplete}
  />
);

export const TrophySuccess: React.FC<{ 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onComplete?: () => void;
}> = ({ size = 'lg', onComplete }) => (
  <SuccessAnimation
    type="trophy"
    size={size}
    color="orange"
    duration={2500}
    onComplete={onComplete}
  />
);

// Success animation for specific shelter operations
export const AnimalCreatedSuccess: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => (
  <ConfettiSuccess color="green" size="lg" onComplete={onComplete} />
);

export const AdoptionApprovedSuccess: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => (
  <HeartSuccess size="lg" onComplete={onComplete} />
);

export const MedicalTaskCompletedSuccess: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => (
  <CheckmarkSuccess size="md" onComplete={onComplete} />
);

export const FosterAssignedSuccess: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => (
  <StarSuccess size="md" onComplete={onComplete} />
);

export const VolunteerActivitySuccess: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => (
  <TrophySuccess size="md" onComplete={onComplete} />
);

export const DataExportedSuccess: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => (
  <CheckmarkSuccess size="md" onComplete={onComplete} />
);

// Hook for triggering success animations
export const useSuccessAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerAnimation = (type: 'checkmark' | 'confetti' | 'heart' | 'star' | 'trophy' = 'checkmark') => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 2000);
  };

  return { isAnimating, triggerAnimation };
};

export default SuccessAnimation;
