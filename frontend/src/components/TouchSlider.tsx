import { useState, useRef, useCallback } from 'react';

interface TouchSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  className?: string;
  disabled?: boolean;
}

export default function TouchSlider({ 
  min, 
  max, 
  value, 
  onChange, 
  formatValue = (v) => String(v),
  className = '',
  disabled = false
}: TouchSliderProps) {
  const sliderRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleTouchStart = useCallback(() => {
    setIsDragging(true);
    setHasInteracted(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    onChange(newValue);
  }, [onChange]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current || disabled) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newValue = Math.round(min + (max - min) * percentage);
    const clampedValue = Math.max(min, Math.min(max, newValue));
    
    onChange(clampedValue);
    setHasInteracted(true);
  }, [min, max, onChange, disabled]);

  const progressPercentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`touch-slider-container ${className}`}>
      <div 
        className={`
          relative w-full h-12 flex items-center cursor-pointer select-none
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={handleClick}
      >
        {/* Track */}
        <div className="absolute w-full h-2 bg-[var(--border)] rounded-full">
          {/* Progress */}
          <div 
            className="absolute h-2 bg-[var(--accent)] rounded-full transition-all duration-150"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Thumb */}
        <div 
          className={`
            relative w-6 h-6 bg-[var(--accent)] rounded-full shadow-lg border-2 border-white
            transform transition-all duration-150 z-10
            ${isDragging ? 'scale-125 shadow-xl' : hasInteracted ? 'scale-110' : ''}
            ${disabled ? 'bg-gray-400' : ''}
          `}
          style={{ 
            left: `calc(${progressPercentage}% - 12px)`,
            transform: `translateX(0) ${isDragging ? 'scale(1.25)' : hasInteracted ? 'scale(1.1)' : 'scale(1)'}`
          }}
        />
        
        {/* Hidden native input for accessibility */}
        <input
          ref={sliderRef}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          disabled={disabled}
          className="absolute w-full h-full opacity-0 cursor-pointer touch-manipulation"
          style={{ 
            WebkitAppearance: 'none',
            background: 'transparent'
          }}
          aria-label="Slider control"
        />
      </div>
      
      {/* Value display */}
      <div className="text-center mt-3">
        <span className={`
          text-lg font-semibold px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)]
          ${isDragging ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-primary)]'}
          transition-all duration-150
        `}>
          {formatValue(value)}
        </span>
      </div>
      
      {/* Touch hints for first-time users */}
      {!hasInteracted && (
        <div className="text-xs text-[var(--text-muted)] text-center mt-2 animate-pulse">
          Tap anywhere on the slider or drag
        </div>
      )}
    </div>
  );
}