import React from 'react';
import { cn } from '@/lib/utils';

export default function ProgressBar({ 
  value = 0, 
  max = 100, 
  showLabel = false, 
  size = 'default',
  variant = 'default',
  className 
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const variants = {
    default: 'bg-indigo-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  };
  
  const getVariant = () => {
    if (variant !== 'default') return variants[variant];
    if (percentage === 100) return variants.success;
    if (percentage >= 50) return variants.default;
    if (percentage >= 25) return variants.warning;
    return variants.danger;
  };
  
  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        'w-full bg-slate-100 rounded-full overflow-hidden',
        size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'
      )}>
        <div 
          className={cn('h-full rounded-full transition-all duration-500 ease-out', getVariant())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-slate-500">
          <span>{value} of {max}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}