// Canvas Controls Hook
// Provides zoom, pan, and drag functionality for canvas-based UIs

import { useState, useCallback } from 'react';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

/**
 * Hook for managing canvas zoom and pan controls
 * @param {number} initialZoom - Initial zoom level (default: 0.9)
 * @returns {object} Canvas control state and handlers
 */
export function useCanvasControls(initialZoom = 0.9) {
  const [zoom, setZoom] = useState(initialZoom);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Zoom in
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  // Zoom out
  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  // Reset view to initial state
  const handleResetView = useCallback(() => {
    setZoom(initialZoom);
    setPosition({ x: 0, y: 0 });
  }, [initialZoom]);

  // Mouse wheel zoom (Ctrl/Cmd + scroll)
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
    }
  }, []);

  // Start panning
  const handleMouseDown = useCallback((e, canvasRef) => {
    // Only start drag if clicking on canvas background
    if (e.target === canvasRef?.current || e.target.classList.contains('canvas-bg')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [position]);

  // Pan while dragging
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  // Stop panning
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Set zoom to specific value
  const setZoomLevel = useCallback((level) => {
    setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level)));
  }, []);

  // Set position to specific coordinates
  const setPositionTo = useCallback((x, y) => {
    setPosition({ x, y });
  }, []);

  return {
    // State
    zoom,
    position,
    isDragging,

    // Handlers
    handleZoomIn,
    handleZoomOut,
    handleResetView,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,

    // Setters
    setZoomLevel,
    setPositionTo,

    // Computed
    canZoomIn: zoom < MAX_ZOOM,
    canZoomOut: zoom > MIN_ZOOM,
    zoomPercentage: Math.round(zoom * 100),

    // Constants (exposed for flexibility)
    MIN_ZOOM,
    MAX_ZOOM,
    ZOOM_STEP,
  };
}

export default useCanvasControls;
