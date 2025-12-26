import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FileText, Search, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  className
}) {
  const { t } = useTranslation();

  const displayTitle = title || t('common.no_items_found');
  const displayDescription = description || t('common.get_started_by_creating_your_first_item');

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-4 text-center',
      className
    )}>
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{displayTitle}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{displayDescription}</p>
      {(actionLabel || secondaryLabel) && (
        <div className="flex items-center gap-3">
          {actionLabel && (
            <Button onClick={onAction} className="gap-2">
              <Plus className="w-4 h-4" />
              {actionLabel}
            </Button>
          )}
          {secondaryLabel && (
            <Button variant="outline" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}