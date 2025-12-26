import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function ChartCard({
  title,
  subtitle,
  badge,
  children,
  loading = false,
  height = 'h-64',
  className,
  headerClassName,
  contentClassName,
  actions
}) {
  return (
    <div className={cn(
      'bg-white rounded-xl border border-slate-200/60 overflow-hidden',
      className
    )}>
      {/* Header */}
      {(title || actions) && (
        <div className={cn(
          'flex items-center justify-between p-5 pb-0',
          headerClassName
        )}>
          <div>
            {title && (
              <h3 className="font-semibold text-slate-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                {badge}
              </span>
            )}
            {actions}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={cn('p-5', contentClassName)}>
        {loading ? (
          <div className={cn('flex items-center justify-center', height)}>
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
