import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Reusable loading state component with multiple variants
 */
export function LoadingState({
  variant = 'default',
  size = 'default',
  text,
  className,
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    default: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  // Full page loading overlay
  if (variant === 'fullPage') {
    return (
      <div className={cn(
        'fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50',
        className
      )}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className={cn('animate-spin text-cyan-600', sizeClasses.xl)} />
          {text && (
            <p className={cn('text-slate-600', textSizeClasses.lg)}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Page content loading (for replacing main content area)
  if (variant === 'page') {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center py-16 px-4',
        className
      )}>
        <Loader2 className={cn('animate-spin text-cyan-600', sizeClasses.lg)} />
        {text && (
          <p className={cn('mt-3 text-slate-500', textSizeClasses.default)}>
            {text}
          </p>
        )}
      </div>
    );
  }

  // Card/section loading
  if (variant === 'card') {
    return (
      <div className={cn(
        'flex items-center justify-center p-8',
        className
      )}>
        <Loader2 className={cn('animate-spin text-slate-400', sizeClasses.default)} />
        {text && (
          <span className={cn('ml-2 text-slate-500', textSizeClasses.default)}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Inline loading (for buttons, etc.)
  if (variant === 'inline') {
    return (
      <span className={cn('inline-flex items-center gap-2', className)}>
        <Loader2 className={cn('animate-spin', sizeClasses[size])} />
        {text && <span className={textSizeClasses[size]}>{text}</span>}
      </span>
    );
  }

  // Default: simple spinner
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-slate-400', sizeClasses[size])} />
      {text && (
        <span className={cn('ml-2 text-slate-500', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );
}

/**
 * Skeleton loading placeholder
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse bg-slate-200 rounded', className)}
      {...props}
    />
  );
}

/**
 * Table row skeleton for loading tables
 */
export function TableRowSkeleton({ columns = 5, className }) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Card skeleton for loading card grids
 */
export function CardSkeleton({ className }) {
  return (
    <div className={cn('rounded-lg border border-slate-200 p-4', className)}>
      <Skeleton className="h-4 w-3/4 mb-3" />
      <Skeleton className="h-3 w-1/2 mb-2" />
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export default LoadingState;
