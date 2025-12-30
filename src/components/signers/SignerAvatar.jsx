import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Clock, Eye, X, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getInitials } from '@/utils/formatters';

// Signer status configuration
const statusConfig = {
  signed: { icon: Check, bg: 'bg-emerald-500', ring: 'ring-emerald-200', label: 'Signed' },
  completed: { icon: Check, bg: 'bg-emerald-500', ring: 'ring-emerald-200', label: 'Completed' },
  pending: { icon: Clock, bg: 'bg-amber-500', ring: 'ring-amber-200', label: 'Pending' },
  sent: { icon: Clock, bg: 'bg-blue-500', ring: 'ring-blue-200', label: 'Sent' },
  viewed: { icon: Eye, bg: 'bg-indigo-500', ring: 'ring-indigo-200', label: 'Viewed' },
  declined: { icon: X, bg: 'bg-red-500', ring: 'ring-red-200', label: 'Declined' },
  failed: { icon: X, bg: 'bg-red-500', ring: 'ring-red-200', label: 'Failed' },
  expired: { icon: AlertTriangle, bg: 'bg-slate-500', ring: 'ring-slate-200', label: 'Expired' },
};

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  default: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

const statusBadgeSizes = {
  xs: 'w-3 h-3 -bottom-0.5 -right-0.5',
  sm: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
  default: 'w-4 h-4 -bottom-0.5 -right-0.5',
  lg: 'w-5 h-5 -bottom-1 -right-1',
};

const statusIconSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  default: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
};

/**
 * Single signer avatar with optional status indicator
 */
export function SignerAvatar({
  signer,
  size = 'default',
  showStatus = true,
  showTooltip = true,
  className,
}) {
  const name = signer?.name || signer?.firstName || 'Unknown';
  const email = signer?.email || '';
  const status = signer?.status?.toLowerCase();
  const imageUrl = signer?.avatar || signer?.imageUrl;
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  const avatar = (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={cn(
        sizeClasses[size],
        'ring-2 ring-white'
      )}>
        {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
        <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      {/* Status indicator badge */}
      {showStatus && status && (
        <span className={cn(
          'absolute rounded-full flex items-center justify-center',
          config.bg,
          statusBadgeSizes[size]
        )}>
          <Icon className={cn('text-white', statusIconSizes[size])} />
        </span>
      )}
    </div>
  );

  if (!showTooltip) return avatar;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {avatar}
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="font-medium">{name}</div>
          {email && <div className="text-slate-400">{email}</div>}
          {status && <div className="text-slate-400 capitalize">{config.label}</div>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default SignerAvatar;
