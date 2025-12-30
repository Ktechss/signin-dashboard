// WorkflowCanvas - Zoomable/pannable canvas for workflow visualization
// Provides the canvas background, controls, and status bar

import React, { useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * WorkflowCanvas - Canvas container with zoom/pan controls
 * @param {object} controls - Canvas control state from useCanvasControls hook
 * @param {boolean} isFullscreen - Whether canvas is in fullscreen mode
 * @param {function} onToggleFullscreen - Handler to toggle fullscreen
 * @param {boolean} hasSidebar - Whether sidebar is open (adjusts layout)
 * @param {number} nodeCount - Number of nodes (for status bar)
 * @param {number} connectionCount - Number of connections (for status bar)
 * @param {React.ReactNode} children - Canvas content (nodes, connections)
 * @param {React.ReactNode} sidebar - Sidebar content (rendered outside transform)
 */
export function WorkflowCanvas({
  controls,
  isFullscreen,
  onToggleFullscreen,
  hasSidebar = false,
  nodeCount = 0,
  connectionCount = 0,
  children,
  sidebar,
}) {
  const canvasRef = useRef(null);

  const {
    zoom,
    position,
    isDragging,
    handleZoomIn,
    handleZoomOut,
    handleResetView,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    canZoomIn,
    canZoomOut,
    zoomPercentage,
  } = controls;

  return (
    <div
      className={cn(
        'relative bg-slate-50 overflow-hidden transition-all w-full h-full',
        isFullscreen ? 'fixed inset-0 z-50' : 'rounded-lg border border-slate-200'
      )}
    >
      {/* Dot Grid Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3">
        {/* Left - Title */}
        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Workflow Settings</h2>
          <p className="text-[10px] text-slate-500">Click on a node to configure</p>
        </div>

        {/* Right - Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm p-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              onClick={handleZoomOut}
              disabled={!canZoomOut}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="px-2 py-1 text-xs text-slate-600 font-mono min-w-[50px] text-center">
              {zoomPercentage}%
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              onClick={handleZoomIn}
              disabled={!canZoomIn}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-slate-300" />

          {/* Reset & Fullscreen */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            onClick={handleResetView}
            title="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={canvasRef}
        className={cn(
          'absolute inset-0 pt-16 canvas-bg',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
          hasSidebar && 'pr-80'
        )}
        onWheel={handleWheel}
        onMouseDown={(e) => handleMouseDown(e, canvasRef)}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Transform container */}
        <div
          className="absolute"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            left: '50%',
            top: '50%',
            marginLeft: hasSidebar ? -700 : -600,
            marginTop: -80,
          }}
        >
          {children}
        </div>
      </div>

      {/* Sidebar - rendered outside transform container */}
      {sidebar}

      {/* Bottom Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-9 bg-white/90 backdrop-blur-sm border-t border-slate-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-600">Ready</span>
          </div>
          <div className="text-xs text-slate-500">
            {nodeCount} nodes • {connectionCount} connections
          </div>
        </div>
        <div className="text-xs text-slate-500">
          Ctrl + Scroll to zoom • Drag to pan
        </div>
      </div>
    </div>
  );
}

export default WorkflowCanvas;
