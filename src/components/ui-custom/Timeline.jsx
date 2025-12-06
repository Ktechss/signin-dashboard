import React from 'react';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Mail, 
  Eye, 
  Pen, 
  Shield,
  FileText
} from 'lucide-react';

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  pending: Clock,
  warning: AlertCircle,
  email: Mail,
  view: Eye,
  sign: Pen,
  verify: Shield,
  document: FileText,
};

const colorMap = {
  success: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  error: 'bg-red-100 text-red-600 border-red-200',
  pending: 'bg-amber-100 text-amber-600 border-amber-200',
  warning: 'bg-amber-100 text-amber-600 border-amber-200',
  info: 'bg-blue-100 text-blue-600 border-blue-200',
  default: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function Timeline({ items, className }) {
  return (
    <div className={cn('space-y-0', className)}>
      {items.map((item, index) => {
        const Icon = iconMap[item.icon] || iconMap.default || Clock;
        const colorClass = colorMap[item.type] || colorMap.default;
        const isLast = index === items.length - 1;
        
        return (
          <div key={item.id || index} className="relative flex gap-4">
            {/* Line */}
            {!isLast && (
              <div className="absolute left-[17px] top-10 w-px h-[calc(100%-16px)] bg-slate-200" />
            )}
            
            {/* Icon */}
            <div className={cn(
              'relative z-10 flex-shrink-0 w-9 h-9 rounded-full border flex items-center justify-center',
              colorClass
            )}>
              <Icon className="w-4 h-4" />
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
                  {item.metadata && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.metadata.map((meta, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 rounded text-xs text-slate-500">
                          {meta}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">{item.timestamp}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}