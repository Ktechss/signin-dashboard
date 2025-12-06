import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  FileText
} from 'lucide-react';

export default function DocumentViewer({ 
  pages = [],
  currentPage = 1,
  onPageChange,
  showControls = true,
  className 
}) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  
  const totalPages = pages.length || 3; // Mock pages
  
  return (
    <div className={cn('flex flex-col bg-slate-100 rounded-xl overflow-hidden', className)}>
      {/* Toolbar */}
      {showControls && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 50}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-slate-600 min-w-[3rem] text-center">
              {zoom}%
            </span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 200}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <div className="w-px h-5 bg-slate-200 mx-2" />
            <Button variant="ghost" size="icon" onClick={handleRotate}>
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Document Area */}
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center min-h-[400px]">
        <div 
          className="bg-white shadow-lg rounded-sm transition-transform duration-300"
          style={{ 
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'center center'
          }}
        >
          {/* Mock Document Page */}
          <div className="w-[595px] h-[842px] p-12 relative">
            <div className="space-y-6">
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-5/6" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-4/6" />
              <div className="mt-8 space-y-4">
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
              </div>
              <div className="mt-12 space-y-4">
                <div className="h-6 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-full" />
              </div>
            </div>
            
            {/* Signature Placeholder */}
            <div className="absolute bottom-24 right-12 w-48 h-16 border-2 border-dashed border-indigo-300 rounded-lg flex items-center justify-center bg-indigo-50/50">
              <span className="text-xs text-indigo-500 font-medium">Signature Here</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Page Navigation */}
      <div className="flex items-center justify-center gap-4 px-4 py-3 bg-white border-t border-slate-200">
        <Button 
          variant="ghost" 
          size="icon"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-slate-600">
          Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
        </span>
        <Button 
          variant="ghost" 
          size="icon"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}