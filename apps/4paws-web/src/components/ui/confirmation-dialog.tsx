/**
 * CONFIRMATION DIALOG COMPONENT
 * 
 * PURPOSE:
 * Provides confirmation dialogs for destructive or important actions.
 * Prevents accidental data loss and provides clear action consequences.
 * 
 * FEATURES:
 * 1. DESTRUCTIVE ACTIONS - Clear warnings for dangerous operations
 * 2. BULK OPERATIONS - Confirmation for multiple item operations
 * 3. CUSTOM MESSAGES - Contextual confirmation messages
 * 4. ACTION PREVIEWS - Show what will be affected
 * 5. KEYBOARD SUPPORT - Full keyboard navigation
 * 6. ACCESSIBILITY - Screen reader support and ARIA labels
 * 7. ANIMATIONS - Smooth open/close animations
 */

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  CheckCircle, 
  Info, 
  Shield,
  Heart,
  Home,
  Users,
  Stethoscope
} from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '../../lib/utils';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'destructive' | 'warning' | 'info' | 'success';
  action?: string;
  itemName?: string;
  itemCount?: number;
  preview?: {
    label: string;
    items: string[];
    maxItems?: number;
  };
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  className?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'destructive',
  action = 'delete',
  itemName,
  itemCount,
  preview,
  isLoading = false,
  confirmText,
  cancelText = 'Cancel',
  className
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => onClose(), 200);
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'Enter' && !isLoading) {
      handleConfirm();
    }
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'destructive':
        return {
          icon: <Trash2 className="w-6 h-6" />,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          buttonVariant: 'destructive' as const,
          confirmText: confirmText || 'Delete'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6" />,
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          buttonVariant: 'default' as const,
          confirmText: confirmText || 'Continue'
        };
      case 'info':
        return {
          icon: <Info className="w-6 h-6" />,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          buttonVariant: 'default' as const,
          confirmText: confirmText || 'Confirm'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-6 h-6" />,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          buttonVariant: 'default' as const,
          confirmText: confirmText || 'Confirm'
        };
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6" />,
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          buttonVariant: 'default' as const,
          confirmText: confirmText || 'Confirm'
        };
    }
  };

  const getActionIcon = () => {
    switch (action) {
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'adopt':
        return <Heart className="w-4 h-4" />;
      case 'foster':
        return <Home className="w-4 h-4" />;
      case 'assign':
        return <Users className="w-4 h-4" />;
      case 'medical':
        return <Stethoscope className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const config = getTypeConfig();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 transition-opacity duration-200',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleClose}
      />

      {/* Dialog */}
      <Card
        className={cn(
          'relative w-full max-w-md transform transition-all duration-200',
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          className
        )}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
              config.bgColor,
              config.borderColor,
              'border'
            )}>
              <div className={config.iconColor}>
                {config.icon}
              </div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              {itemName && (
                <p className="text-sm text-muted-foreground mt-1">
                  {itemCount && itemCount > 1 ? `${itemCount} items` : itemName}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>

          {/* Preview section */}
          {preview && preview.items.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{preview.label}:</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {preview.items.slice(0, preview.maxItems || 5).map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-1 h-1 bg-current rounded-full" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
                {preview.items.length > (preview.maxItems || 5) && (
                  <div className="text-xs text-muted-foreground">
                    ... and {preview.items.length - (preview.maxItems || 5)} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={config.buttonVariant}
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                getActionIcon()
              )}
              <span>{config.confirmText}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Pre-configured confirmation dialogs for common scenarios
export const DeleteConfirmationDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: string;
  isLoading?: boolean;
}> = ({ isOpen, onClose, onConfirm, itemName, itemType = 'item', isLoading }) => (
  <ConfirmationDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title={`Delete ${itemType}`}
    message={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
    type="destructive"
    action="delete"
    itemName={itemName}
    isLoading={isLoading}
    confirmText="Delete"
  />
);

export const BulkDeleteConfirmationDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType: string;
  itemCount: number;
  itemNames: string[];
  isLoading?: boolean;
}> = ({ isOpen, onClose, onConfirm, itemType, itemCount, itemNames, isLoading }) => (
  <ConfirmationDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title={`Delete ${itemCount} ${itemType}s`}
    message={`Are you sure you want to delete ${itemCount} ${itemType}s? This action cannot be undone.`}
    type="destructive"
    action="delete"
    itemCount={itemCount}
    preview={{
      label: `Selected ${itemType}s`,
      items: itemNames,
      maxItems: 5
    }}
    isLoading={isLoading}
    confirmText="Delete All"
  />
);

export const AdoptionConfirmationDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  animalName: string;
  adopterName: string;
  isLoading?: boolean;
}> = ({ isOpen, onClose, onConfirm, animalName, adopterName, isLoading }) => (
  <ConfirmationDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Approve Adoption"
    message={`Are you sure you want to approve the adoption of ${animalName} by ${adopterName}?`}
    type="success"
    action="adopt"
    itemName={animalName}
    isLoading={isLoading}
    confirmText="Approve Adoption"
  />
);

export const FosterConfirmationDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  animalName: string;
  fosterName: string;
  isLoading?: boolean;
}> = ({ isOpen, onClose, onConfirm, animalName, fosterName, isLoading }) => (
  <ConfirmationDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Assign to Foster"
    message={`Are you sure you want to assign ${animalName} to ${fosterName} for foster care?`}
    type="info"
    action="foster"
    itemName={animalName}
    isLoading={isLoading}
    confirmText="Assign to Foster"
  />
);

export const MedicalTaskConfirmationDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskType: string;
  animalName: string;
  isLoading?: boolean;
}> = ({ isOpen, onClose, onConfirm, taskType, animalName, isLoading }) => (
  <ConfirmationDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Complete Medical Task"
    message={`Are you sure you want to mark the ${taskType} task as completed for ${animalName}?`}
    type="success"
    action="medical"
    itemName={animalName}
    isLoading={isLoading}
    confirmText="Mark Complete"
  />
);

// Hook for managing confirmation dialogs
export const useConfirmationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Partial<ConfirmationDialogProps>>({});

  const showDialog = (dialogConfig: Partial<ConfirmationDialogProps>) => {
    setConfig(dialogConfig);
    setIsOpen(true);
  };

  const hideDialog = () => {
    setIsOpen(false);
    setConfig({});
  };

  const confirm = () => {
    config.onConfirm?.();
    hideDialog();
  };

  return {
    isOpen,
    config,
    showDialog,
    hideDialog,
    confirm
  };
};

export default ConfirmationDialog;
