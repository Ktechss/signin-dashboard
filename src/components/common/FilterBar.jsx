import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

/**
 * Reusable filter bar component with search, status filter, and custom filters
 */
export function FilterBar({
  // Search props
  searchValue = '',
  onSearchChange,
  searchPlaceholder,

  // Status filter props
  statusValue,
  onStatusChange,
  statusOptions = [],
  statusPlaceholder,

  // Additional filters (array of filter configs)
  filters = [],

  // Clear functionality
  onClearFilters,
  showClearButton = true,

  // Custom actions (right side)
  actions,

  // Styling
  className,
}) {
  const { t } = useTranslation();

  const hasActiveFilters = Boolean(
    searchValue ||
    (statusValue && statusValue !== 'all') ||
    filters.some(f => f.value && f.value !== 'all')
  );

  return (
    <div className={cn(
      'flex flex-wrap items-center gap-3',
      className
    )}>
      {/* Search input */}
      {onSearchChange && (
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder={searchPlaceholder || t('common.search')}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Status filter */}
      {onStatusChange && statusOptions.length > 0 && (
        <Select value={statusValue || 'all'} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={statusPlaceholder || t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all_statuses')}</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Additional custom filters */}
      {filters.map((filter) => (
        <Select
          key={filter.id}
          value={filter.value || 'all'}
          onValueChange={filter.onChange}
        >
          <SelectTrigger className={cn('w-[160px]', filter.className)}>
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {filter.allLabel && (
              <SelectItem value="all">{filter.allLabel}</SelectItem>
            )}
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* Clear filters button */}
      {showClearButton && hasActiveFilters && onClearFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-slate-500 hover:text-slate-700"
        >
          <X className="w-4 h-4 mr-1" />
          {t('common.clear_filters')}
        </Button>
      )}

      {/* Spacer */}
      {actions && <div className="flex-1" />}

      {/* Custom actions */}
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * Compact filter toggle button (for mobile or minimal UI)
 */
export function FilterToggle({ isOpen, onClick, activeCount = 0, className }) {
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn('gap-2', className)}
    >
      <Filter className="w-4 h-4" />
      {t('common.filters')}
      {activeCount > 0 && (
        <span className="bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded-full text-xs font-medium">
          {activeCount}
        </span>
      )}
    </Button>
  );
}

export default FilterBar;
