import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Clock, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const statusConfig = {
  signed: { icon: Check, bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'Signed' },
  failed: { icon: X, bg: 'bg-red-100', text: 'text-red-600', label: 'Failed' },
  pending: { icon: Clock, bg: 'bg-amber-100', text: 'text-amber-600', label: 'Pending' },
  expired: { icon: AlertTriangle, bg: 'bg-slate-100', text: 'text-slate-600', label: 'Expired' },
};

export default function PartyStatusIcon({ status, name, showTooltip = true, size = 'default' }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  const iconElement = (
    <div className={cn(
      'rounded-full flex items-center justify-center',
      config.bg,
      size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'
    )}>
      <Icon className={cn(config.text, size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
    </div>
  );
  
  if (!showTooltip) return iconElement;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {iconElement}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{name}: {config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function PartyStatusGroup({ parties }) {
  const maxVisible = 4;
  const visible = parties.slice(0, maxVisible);
  const remaining = parties.length - maxVisible;
  
  return (
    <div className="flex items-center -space-x-1">
      {visible.map((party, index) => (
        <PartyStatusIcon 
          key={party.id || index} 
          status={party.status} 
          name={party.name}
          size="sm"
        />
      ))}
      {remaining > 0 && (
        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-600 font-medium">
          +{remaining}
        </div>
      )}
    </div>
  );
}