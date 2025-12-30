import React from 'react';
import { cn } from '@/lib/utils';
import { SignerAvatar } from './SignerAvatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  default: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

const overlapClasses = {
  xs: '-space-x-2',
  sm: '-space-x-2.5',
  default: '-space-x-3',
  lg: '-space-x-4',
};

/**
 * Group of signer avatars with overlap and overflow indicator
 */
export function SignerAvatarGroup({
  signers = [],
  maxVisible = 4,
  size = 'default',
  showStatus = true,
  showTooltip = true,
  className,
}) {
  if (!signers || signers.length === 0) {
    return null;
  }

  const visible = signers.slice(0, maxVisible);
  const remaining = signers.length - maxVisible;
  const hiddenSigners = signers.slice(maxVisible);

  return (
    <div className={cn(
      'flex items-center',
      overlapClasses[size],
      className
    )}>
      {visible.map((signer, index) => (
        <SignerAvatar
          key={signer.id || signer.email || index}
          signer={signer}
          size={size}
          showStatus={showStatus}
          showTooltip={showTooltip}
        />
      ))}

      {remaining > 0 && (
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <div className={cn(
                'relative rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium ring-2 ring-white cursor-default',
                sizeClasses[size]
              )}>
                +{remaining}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-[200px]">
              <div className="font-medium mb-1">+{remaining} more</div>
              {hiddenSigners.map((signer, index) => (
                <div key={index} className="text-slate-400 truncate">
                  {signer.name || signer.email}
                </div>
              ))}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

/**
 * Vertical list of signers with full info
 */
export function SignerList({
  signers = [],
  size = 'default',
  showStatus = true,
  className,
}) {
  if (!signers || signers.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {signers.map((signer, index) => (
        <div key={signer.id || signer.email || index} className="flex items-center gap-3">
          <SignerAvatar
            signer={signer}
            size={size}
            showStatus={showStatus}
            showTooltip={false}
          />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-slate-900 truncate">
              {signer.name || 'Unknown'}
            </div>
            {signer.email && (
              <div className="text-sm text-slate-500 truncate">
                {signer.email}
              </div>
            )}
          </div>
          {signer.status && (
            <span className={cn(
              'text-xs font-medium capitalize px-2 py-0.5 rounded-full',
              signer.status === 'signed' && 'bg-emerald-100 text-emerald-700',
              signer.status === 'pending' && 'bg-amber-100 text-amber-700',
              signer.status === 'viewed' && 'bg-indigo-100 text-indigo-700',
              signer.status === 'sent' && 'bg-blue-100 text-blue-700',
              signer.status === 'declined' && 'bg-red-100 text-red-700',
              signer.status === 'expired' && 'bg-slate-100 text-slate-700',
            )}>
              {signer.status}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default SignerAvatarGroup;
