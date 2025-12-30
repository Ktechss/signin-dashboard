import React from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { STATUS_COLORS, getStatusColors } from '@/constants';

export default function StatusBadge({ status, showDot = true, size = 'default', className }) {
  const { t } = useTranslation();
  const config = getStatusColors(status);

  // Convert status to translation key (e.g., "In Progress" -> "in_progress")
  const statusKey = status?.toLowerCase()?.replace(/\s+/g, '_');
  const translatedStatus = t(`common.${statusKey}`, { defaultValue: status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) });

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      config.bg, config.text, config.border,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
      className
    )}>
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />}
      {translatedStatus}
    </span>
  );
}