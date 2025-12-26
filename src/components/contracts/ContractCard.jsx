import React from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import {
  MoreHorizontal,
  Eye,
  Bell,
  Calendar,
  Clock,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import ProgressBar from '@/components/ui-custom/ProgressBar';
import { PartyStatusGroup } from '@/components/ui-custom/PartyStatusIcon';

export default function ContractCard({ contract, onClick, className }) {
  const { t } = useTranslation();
  const {
    id,
    name,
    reference,
    status,
    template,
    signedCount,
    totalParties,
    parties,
    expiresIn,
    createdAt,
    priority
  } = contract;

  return (
    <div 
      className={cn(
        'group bg-white rounded-xl border border-slate-200/60 p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300/60 transition-all duration-300 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {name}
            </h3>
            <p className="text-sm text-slate-500">{reference}</p>
          </div>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>
      
      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-500">{t('contracts.signingProgress', 'Signing Progress')}</span>
          <span className="font-medium text-slate-700">{signedCount}/{totalParties}</span>
        </div>
        <ProgressBar value={signedCount} max={totalParties} />
      </div>
      
      {/* Parties */}
      <div className="flex items-center justify-between mb-4">
        <PartyStatusGroup parties={parties} />
        <div className="flex items-center gap-4 text-xs text-slate-500">
          {expiresIn && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{expiresIn}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{createdAt}</span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="text-xs text-slate-400">{template}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
            <Bell className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{t('contracts.viewDetails', 'View Details')}</DropdownMenuItem>
              <DropdownMenuItem>{t('contracts.sendReminder', 'Send Reminder')}</DropdownMenuItem>
              <DropdownMenuItem>{t('contracts.downloadPdf', 'Download PDF')}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">{t('contracts.cancelContract', 'Cancel Contract')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}