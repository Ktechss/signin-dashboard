import React from 'react';
import { cn } from '@/lib/utils';
import { 
  MoreHorizontal, 
  Copy, 
  Edit, 
  Archive, 
  Eye,
  FileText,
  Users,
  Clock
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

export default function TemplateCard({ template, onClick, className }) {
  const {
    id,
    name,
    category,
    status,
    version,
    usageCount,
    lastModified,
    preview,
    filePreview
  } = template;

  const thumbnailSrc = filePreview || preview;

  return (
    <div
      className={cn(
        'group bg-white rounded-xl border border-slate-200/60 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300/60 transition-all duration-300 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="absolute inset-4 bg-white rounded-lg shadow-sm flex items-center justify-center">
            <div className="w-3/4 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-2/3" />
              <div className="h-2 bg-slate-100 rounded w-full" />
              <div className="h-2 bg-slate-100 rounded w-5/6" />
              <div className="h-2 bg-slate-100 rounded w-full" />
              <div className="h-2 bg-slate-100 rounded w-3/4" />
              <div className="mt-4 h-2 bg-slate-100 rounded w-full" />
              <div className="h-2 bg-slate-100 rounded w-full" />
            </div>
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button size="sm" className="gap-2 bg-white text-slate-900 hover:bg-slate-100" onClick={(e) => e.stopPropagation()}>
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {name}
            </h3>
            <p className="text-sm text-slate-500">{category}</p>
          </div>
          <StatusBadge status={status} size="sm" showDot={false} />
        </div>
        
        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              v{version}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {usageCount} uses
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {lastModified}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
            <Copy className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Create Contract</DropdownMenuItem>
              <DropdownMenuItem>Version History</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-amber-600">Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}