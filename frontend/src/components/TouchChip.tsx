import { useState, useCallback } from 'react';

interface TouchChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  onLongPress?: () => void;
  draggable?: boolean;
  onDragStart?: () => void;
  onDrop?: () => void;
  className?: string;
  title?: string;
  disabled?: boolean;
  isDragging?: boolean;
  isDraggedOver?: boolean;
  dragProps?: Record<string, any>;
}

export default function TouchChip({
  children,
  active = false,
  onClick,
  onLongPress,
  draggable = false,
  onDragStart,
  onDrop,
  className = '',
  title,
  disabled = false,
  isDragging = false,
  isDraggedOver = false,
  dragProps = {}
}: TouchChipProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleTouchStart = useCallback((_e: React.TouchEvent) => {
    if (disabled) return;
    
    setIsPressed(true);
    
    // Start long press timer
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
        // Provide haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 500);
      setLongPressTimer(timer);
    }
  }, [disabled, onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(false);
    
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [disabled, longPressTimer]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Add visual feedback
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    if (onClick) {
      onClick();
    }
  }, [disabled, onClick]);

  const handleDragStart = useCallback(() => {
    if (disabled || !draggable) return;
    
    if (onDragStart) {
      onDragStart();
    }
  }, [disabled, draggable, onDragStart]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (disabled || !draggable) return;
    
    e.preventDefault();
    setIsDragOver(true);
  }, [disabled, draggable]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (disabled || !draggable) return;
    
    e.preventDefault();
    setIsDragOver(false);
    
    if (onDrop) {
      onDrop();
    }
  }, [disabled, draggable, onDrop]);

  const baseClasses = `
    inline-flex items-center justify-center
    px-4 py-3 min-h-[44px] min-w-[44px]
    rounded-full border text-sm font-medium
    cursor-pointer select-none
    transition-all duration-200 ease-out
    touch-manipulation
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  const stateClasses = `
    ${active 
      ? 'bg-[var(--accent)] text-black border-[var(--accent)] shadow-md' 
      : 'border-[var(--border)] text-[var(--text-primary)] bg-[var(--bg-elevated)]'
    }
    ${isPressed && !disabled
      ? 'scale-95 shadow-inner bg-[var(--accent)]/20'
      : 'hover:shadow-lg hover:scale-105'
    }
    ${(isDragOver || isDraggedOver) && !disabled
      ? 'ring-2 ring-[var(--accent)] ring-opacity-50 scale-105'
      : ''
    }
    ${isDragging && !disabled
      ? 'opacity-50 scale-110 shadow-2xl z-50'
      : ''
    }
  `;

  const responsiveClasses = `
    text-sm sm:text-base
    px-3 py-2 sm:px-4 sm:py-3
    min-h-[40px] sm:min-h-[44px]
    min-w-[40px] sm:min-w-[44px]
  `;

  return (
    <div
      className={`${baseClasses} ${stateClasses} ${responsiveClasses} ${className}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      draggable={draggable && !disabled}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      title={title}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={active}
      aria-disabled={disabled}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onClick) onClick();
        }
      }}
      {...dragProps}
    >
      {children}
      
      {/* Visual indicator for draggable items */}
      {draggable && !disabled && (
        <div className="ml-2 opacity-50">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="3" cy="3" r="1"/>
            <circle cx="9" cy="3" r="1"/>
            <circle cx="3" cy="6" r="1"/>
            <circle cx="9" cy="6" r="1"/>
            <circle cx="3" cy="9" r="1"/>
            <circle cx="9" cy="9" r="1"/>
          </svg>
        </div>
      )}
    </div>
  );
}