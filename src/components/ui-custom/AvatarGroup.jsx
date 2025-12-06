import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function AvatarGroup({ 
  users, 
  max = 4, 
  size = 'default',
  showTooltip = true,
  className 
}) {
  const visible = users.slice(0, max);
  const remaining = users.length - max;
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    default: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };
  
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  const colors = [
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-purple-100 text-purple-700',
    'bg-cyan-100 text-cyan-700',
  ];
  
  const renderAvatar = (user, index) => {
    const avatar = (
      <Avatar 
        key={user.id || index} 
        className={cn(
          sizeClasses[size],
          'border-2 border-white ring-0',
          index > 0 && '-ml-2'
        )}
      >
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className={colors[index % colors.length]}>
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
    );
    
    if (!showTooltip) return avatar;
    
    return (
      <TooltipProvider key={user.id || index}>
        <Tooltip>
          <TooltipTrigger asChild>
            {avatar}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs font-medium">{user.name}</p>
            {user.role && <p className="text-xs text-slate-400">{user.role}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  return (
    <div className={cn('flex items-center', className)}>
      {visible.map((user, index) => renderAvatar(user, index))}
      {remaining > 0 && (
        <div className={cn(
          sizeClasses[size],
          'rounded-full bg-slate-100 flex items-center justify-center font-medium text-slate-600 border-2 border-white -ml-2'
        )}>
          +{remaining}
        </div>
      )}
    </div>
  );
}