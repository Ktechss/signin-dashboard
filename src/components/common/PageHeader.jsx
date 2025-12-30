import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Reusable page header component with breadcrumbs and action buttons
 */
export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  className,
}) {
  const { isRTL } = useLanguage();

  return (
    <div className={cn('mb-6', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-slate-500 mb-2">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.label}>
              {index > 0 && (
                <ChevronRight className={cn(
                  'w-4 h-4',
                  isRTL && 'rotate-180'
                )} />
              )}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-slate-900 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-900">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header content */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
