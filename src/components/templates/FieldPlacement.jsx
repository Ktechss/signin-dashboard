import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Pen,
  Type,
  Move,
  ZoomIn,
  ZoomOut,
  Trash2,
  Copy,
  Upload,
  Plus,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  FileText,
  AlertTriangle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FIELD_TYPES, FIELD_VALIDATIONS, ROLE_COLORS, SIGNER_TYPE_CONFIG, getFieldTypeInfo, getRoleColorScheme, getDefaultValidation } from './FieldOverlay';
import FieldPropertiesCard from './FieldPropertiesCard';
import SignerCard, { SIGNER_TYPES } from './SignerCard';

// Configure PDF.js worker to match react-pdf's version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Convert FIELD_TYPES object to array for dropdown
const allFieldTypes = Object.values(FIELD_TYPES);

export default function FieldPlacement({ className, documentPreview, onFieldsChange, parties = [], initialFields = [], onAddSigner, onDeleteSigner, onUpdateSigner }) {
  const [zoom, setZoom] = useState(100);
  const [fields, setFields] = useState(initialFields);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedFields, setSelectedFields] = useState([]);  // Multi-select support
  const [draggedType, setDraggedType] = useState(null);
  const [selectedFieldType, setSelectedFieldType] = useState({});  // Track selected field type per signer
  const [draggingField, setDraggingField] = useState(null);
  const [draggingMultiple, setDraggingMultiple] = useState(false);  // Track if dragging multiple fields
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragOffsets, setDragOffsets] = useState({});  // Store offsets for all selected fields
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [expandedSigners, setExpandedSigners] = useState({});
  const [selectedSigner, setSelectedSigner] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [initialized, setInitialized] = useState(false);
  const [detectedNumPages, setDetectedNumPages] = useState(null);

  // Marquee selection state
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState({ x: 0, y: 0 });
  const [marqueeEnd, setMarqueeEnd] = useState({ x: 0, y: 0 });
  const canvasRef = React.useRef(null);

  // Resizable right panel state
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [isResizingPanel, setIsResizingPanel] = useState(false);

  // Delete signer confirmation dialog state
  const [deleteSignerDialog, setDeleteSignerDialog] = useState({ open: false, signer: null, fieldCount: 0 });

  // Initialize fields from initialFields when component mounts or initialFields changes
  useEffect(() => {
    if (initialFields.length > 0 && !initialized) {
      setFields(initialFields);
      setInitialized(true);
    }
  }, [initialFields, initialized]);

  // Track which signer card is expanded (only one at a time, latest by default)
  const [expandedSignerCard, setExpandedSignerCard] = useState(null);

  // Auto-select and expand newly added signer
  useEffect(() => {
    if (parties.length > 0) {
      const lastParty = parties[parties.length - 1];
      setSelectedSigner(lastParty.id.toString());
      setExpandedSignerCard(lastParty.id.toString());
    }
  }, [parties.length]);

  // Get total pages - prefer detected from PDF, then from preview prop
  const totalPages = detectedNumPages || documentPreview?.numPages || 1;

  // Handle PDF load success to get actual page count
  const handlePdfLoadSuccess = ({ numPages }) => {
    setDetectedNumPages(numPages);
  };

  // Filter fields for current page only
  const currentPageFields = fields.filter(f => (f.page || 1) === currentPage);

  // Detect OS for proper key bindings
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  // Helper to check if modifier key is pressed (Cmd on Mac, Ctrl on Windows/Linux)
  const isModifierKey = (e) => isMac ? e.metaKey : e.ctrlKey;

  // Keyboard shortcuts for field management
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape to deselect all
      if (e.key === 'Escape') {
        setSelectedFields([]);
        setSelectedField(null);
        setIsMarqueeSelecting(false);
      }

      // Delete/Backspace to delete selected fields
      // Mac: Backspace (labeled Delete on Mac keyboards)
      // Windows/Linux: Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFields.length > 0) {
        // Don't delete if focus is on an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        updateFields(fields.filter(f => !selectedFields.includes(f.id)));
        setSelectedFields([]);
        setSelectedField(null);
      }

      // Select all fields on current page: Cmd+A (Mac) or Ctrl+A (Windows/Linux)
      if (e.key === 'a' && isModifierKey(e)) {
        // Don't select all if focus is on an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        const currentPageFieldIds = currentPageFields.map(f => f.id);
        setSelectedFields(currentPageFieldIds);
        if (currentPageFieldIds.length > 0) {
          setSelectedField(currentPageFieldIds[0]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFields, fields, currentPageFields, isMac]);

  // Panel resize handlers
  const handlePanelResizeStart = (e) => {
    e.preventDefault();
    setIsResizingPanel(true);
  };

  useEffect(() => {
    const handlePanelResize = (e) => {
      if (isResizingPanel) {
        const newWidth = window.innerWidth - e.clientX;
        setRightPanelWidth(Math.min(Math.max(280, newWidth), 500));
      }
    };

    const handlePanelResizeEnd = () => {
      setIsResizingPanel(false);
    };

    if (isResizingPanel) {
      window.addEventListener('mousemove', handlePanelResize);
      window.addEventListener('mouseup', handlePanelResizeEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handlePanelResize);
      window.removeEventListener('mouseup', handlePanelResizeEnd);
    };
  }, [isResizingPanel]);

  // Group fields by signer/role
  const getFieldsGroupedBySigner = () => {
    const grouped = {};
    fields.forEach(field => {
      const role = field.role || 'unassigned';
      if (!grouped[role]) {
        grouped[role] = [];
      }
      grouped[role].push(field);
    });
    return grouped;
  };

  // Toggle signer group expansion
  const toggleSignerExpanded = (role) => {
    setExpandedSigners(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };

  // Get signer name from parties or generate default
  const getSignerName = (role) => {
    const party = parties.find(p => p.id.toString() === role);
    return party ? party.name : `Signer ${role}`;
  };

  // Handle signer deletion with confirmation
  const handleDeleteSignerClick = (party, fieldCount) => {
    if (fieldCount > 0) {
      // Show confirmation dialog
      setDeleteSignerDialog({ open: true, signer: party, fieldCount });
    } else {
      // No fields, delete directly
      onDeleteSigner?.(party.id);
    }
  };

  // Confirm signer deletion
  const confirmDeleteSigner = () => {
    if (deleteSignerDialog.signer) {
      // Remove all fields assigned to this signer
      const signerRole = deleteSignerDialog.signer.id.toString();
      updateFields(fields.filter(f => f.role !== signerRole));
      // Delete the signer
      onDeleteSigner?.(deleteSignerDialog.signer.id);
      // Reset selected signer if it was the deleted one
      if (selectedSigner === signerRole) {
        setSelectedSigner(null);
      }
    }
    setDeleteSignerDialog({ open: false, signer: null, fieldCount: 0 });
  };

  // Handle signer property updates
  const handleUpdateSigner = (signerId, updates) => {
    onUpdateSigner?.(signerId, updates);
  };

  // Notify parent when fields change
  const updateFields = (newFields) => {
    setFields(newFields);
    if (onFieldsChange) {
      onFieldsChange(newFields);
    }
  };

  // Update a specific field
  const updateField = (fieldId, updates) => {
    updateFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const handleDragStart = (type) => {
    setDraggedType(type);
  };

  // Handle field click with multi-select support
  // Shift+Click: Add to selection (range-like behavior)
  // Cmd+Click (Mac) / Ctrl+Click (Windows/Linux): Toggle individual field
  const handleFieldClick = (e, fieldId) => {
    e.stopPropagation();

    if (e.shiftKey || isModifierKey(e)) {
      // Multi-select: toggle field in selection
      setSelectedFields(prev => {
        if (prev.includes(fieldId)) {
          return prev.filter(id => id !== fieldId);
        } else {
          return [...prev, fieldId];
        }
      });
      setSelectedField(fieldId);
    } else {
      // Single select
      setSelectedFields([fieldId]);
      setSelectedField(fieldId);
    }
  };

  const handleFieldMouseDown = (e, fieldId) => {
    e.stopPropagation();
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      // Check if this field is part of multi-selection
      const isMultiSelected = selectedFields.includes(fieldId) && selectedFields.length > 1;

      if (isMultiSelected) {
        // Dragging multiple fields
        setDraggingMultiple(true);
        setDraggingField(fieldId);

        // Calculate offsets for all selected fields relative to mouse position
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const mouseX = (e.clientX - rect.left) / (zoom / 100);
          const mouseY = (e.clientY - rect.top) / (zoom / 100);

          const offsets = {};
          selectedFields.forEach(id => {
            const f = fields.find(field => field.id === id);
            if (f) {
              offsets[id] = { x: f.x - mouseX, y: f.y - mouseY };
            }
          });
          setDragOffsets(offsets);
        }
      } else {
        // Single field drag
        setDraggingField(fieldId);
        setDraggingMultiple(false);
        if (!e.shiftKey && !isModifierKey(e)) {
          setSelectedFields([fieldId]);
          setSelectedField(fieldId);
        }
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleResizeStart = (e, fieldId) => {
    e.stopPropagation();
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      setIsResizing(true);
      setDraggingField(fieldId);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: field.width,
        height: field.height
      });
    }
  };

  // Marquee selection handlers
  const handleCanvasMouseDown = (e) => {
    // Only start marquee if clicking on empty canvas area
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-bg')) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / (zoom / 100);
      const y = (e.clientY - rect.top) / (zoom / 100);

      setIsMarqueeSelecting(true);
      setMarqueeStart({ x, y });
      setMarqueeEnd({ x, y });

      // Clear selection if not holding shift
      if (!e.shiftKey) {
        setSelectedFields([]);
        setSelectedField(null);
      }
    }
  };

  const handleMouseMove = (e) => {
    // Marquee selection
    if (isMarqueeSelecting && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / (zoom / 100);
      const y = (e.clientY - rect.top) / (zoom / 100);
      setMarqueeEnd({ x, y });

      // Calculate which fields are within the marquee
      const minX = Math.min(marqueeStart.x, x);
      const maxX = Math.max(marqueeStart.x, x);
      const minY = Math.min(marqueeStart.y, y);
      const maxY = Math.max(marqueeStart.y, y);

      const fieldsInMarquee = currentPageFields.filter(field => {
        const fieldRight = field.x + field.width;
        const fieldBottom = field.y + field.height;
        return field.x < maxX && fieldRight > minX && field.y < maxY && fieldBottom > minY;
      }).map(f => f.id);

      setSelectedFields(fieldsInMarquee);
      if (fieldsInMarquee.length > 0) {
        setSelectedField(fieldsInMarquee[0]);
      }
      return;
    }

    if (draggingField && isResizing) {
      // Resizing
      const deltaX = (e.clientX - resizeStart.x) / (zoom / 100);
      const deltaY = (e.clientY - resizeStart.y) / (zoom / 100);

      updateFields(fields.map(field =>
        field.id === draggingField
          ? {
              ...field,
              width: Math.max(20, resizeStart.width + deltaX),
              height: Math.max(12, resizeStart.height + deltaY)
            }
          : field
      ));
    } else if (draggingField && draggingMultiple) {
      // Dragging multiple fields
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / (zoom / 100);
        const mouseY = (e.clientY - rect.top) / (zoom / 100);

        updateFields(fields.map(field => {
          if (selectedFields.includes(field.id) && dragOffsets[field.id]) {
            return {
              ...field,
              x: Math.max(0, mouseX + dragOffsets[field.id].x),
              y: Math.max(0, mouseY + dragOffsets[field.id].y)
            };
          }
          return field;
        }));
      }
    } else if (draggingField) {
      // Dragging single field
      const canvas = canvasRef.current || e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - dragOffset.x) / (zoom / 100);
      const y = (e.clientY - rect.top - dragOffset.y) / (zoom / 100);

      updateFields(fields.map(field =>
        field.id === draggingField
          ? { ...field, x: Math.max(0, x), y: Math.max(0, y) }
          : field
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggingField(null);
    setIsResizing(false);
    setIsMarqueeSelecting(false);
    setDraggingMultiple(false);
    setDragOffsets({});
  };

  // Copy a signature field
  const copyField = (fieldId) => {
    const fieldToCopy = fields.find(f => f.id === fieldId);
    if (fieldToCopy) {
      const newField = {
        ...fieldToCopy,
        id: Date.now(),
        x: fieldToCopy.x + 20, // Offset slightly so it's visible
        y: fieldToCopy.y + 20,
        page: currentPage, // Copy to current page
      };
      updateFields([...fields, newField]);
      setSelectedField(newField.id);
    }
  };

  // Add a new field at center of canvas
  const addField = (fieldType, signerRole = null) => {
    // Determine role - use provided role or auto-assign based on field type
    let assignedRole;
    if (signerRole) {
      assignedRole = signerRole;
    } else if (fieldType === 'signature' || fieldType === 'initials') {
      const signatureFields = fields.filter(f => f.type === 'signature' || f.type === 'initials');
      assignedRole = ((signatureFields.length % (parties.length || 1)) + 1).toString();
    } else {
      assignedRole = selectedSigner || '1';
    }

    // Set dimensions based on field type (sizes optimized for typical PDF text: 12-16px)
    const dimensions = {
      signature: { width: 150, height: 40 },
      initials: { width: 50, height: 20 },
      text: { width: 120, height: 16 },
      email: { width: 150, height: 16 },
      phone: { width: 120, height: 16 },
      date: { width: 80, height: 16 },
      number: { width: 60, height: 16 },
      checkbox: { width: 14, height: 14 },
    };
    const { width, height } = dimensions[fieldType] || { width: 100, height: 16 };

    // Get default label based on field type
    const defaultLabels = {
      signature: 'Signature',
      initials: 'Initials',
      text: 'Text Field',
      email: 'Email Address',
      phone: 'Phone Number',
      date: 'Date',
      number: 'Number',
      checkbox: 'Checkbox',
    };

    const newField = {
      id: Date.now(),
      type: fieldType,
      x: 200,
      y: 400,
      width,
      height,
      role: assignedRole,
      page: currentPage,
      label: defaultLabels[fieldType] || '',
      validation: getDefaultValidation(fieldType),
    };

    updateFields([...fields, newField]);
    setSelectedField(newField.id);
  };

  // Legacy function for backwards compatibility
  const addSignature = () => addField('signature');

  return (
    <div className={cn('flex h-full bg-slate-50 overflow-hidden border border-slate-200', className)}>
      {/* Left Panel - Signers & Fields */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4">
          <h3 className="font-semibold text-slate-900">Signers & Fields</h3>
          <p className="text-xs text-slate-500 mt-1">Select a signer, then add fields for them</p>
        </div>

        {/* Signers List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {parties.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 mb-1">No signers yet</p>
              <p className="text-xs text-slate-400 mb-3">Add signers to assign fields</p>
            </div>
          ) : (
            parties.map((party, index) => {
              const signerFields = fields.filter(f => f.role === party.id.toString() || f.role === (index + 1).toString());
              const isSelected = selectedSigner === party.id.toString();
              const isExpanded = expandedSignerCard === party.id.toString() || parties.length === 1;

              // Establishment signers are protected - cannot be deleted or modified
              const isProtected = party.signerType === 'establishment';

              return (
                <SignerCard
                  key={party.id}
                  signer={party}
                  index={index}
                  fields={signerFields}
                  isSelected={isSelected}
                  isExpanded={isExpanded}
                  showChevron={parties.length > 1}
                  selectedFieldId={selectedField}
                  isProtected={isProtected}
                  onSelect={() => setSelectedSigner(party.id.toString())}
                  onToggleExpand={() => {
                    setExpandedSignerCard(isExpanded && parties.length > 1 ? null : party.id.toString());
                  }}
                  onDelete={isProtected ? undefined : handleDeleteSignerClick}
                  onUpdate={isProtected ? undefined : handleUpdateSigner}
                  onAddField={addField}
                  onFieldSelect={(field) => {
                    setSelectedField(field.id);
                    if (field.page !== currentPage) setCurrentPage(field.page);
                  }}
                  onFieldDelete={(field) => {
                    updateFields(fields.filter(f => f.id !== field.id));
                    if (selectedField === field.id) setSelectedField(null);
                  }}
                />
              );
            })
          )}
        </div>

        {/* Add Signer Button */}
        <div className="p-3">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={onAddSigner}
          >
            <Plus className="w-4 h-4" />
            Add Signer
          </Button>
        </div>
      </div>
      
      {/* Center - Document Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Canvas */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center relative">
          {!documentPreview?.data ? (
            <div className="text-center py-12 max-w-md">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">No Document Uploaded</h3>
              <p className="text-sm text-slate-500 mb-4">
                Please go back to the previous step and upload a document before placing signature fields.
              </p>
            </div>
          ) : (
            <div
              ref={canvasRef}
              className="bg-white shadow-xl rounded relative select-none canvas-bg"
              style={{
                width: 595 * (zoom / 100),
                height: 842 * (zoom / 100),
              }}
              onMouseDown={handleCanvasMouseDown}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                // Get field type from dataTransfer (from grid drag) or state (legacy)
                const fieldType = e.dataTransfer.getData('fieldType') || draggedType;
                const signerRole = e.dataTransfer.getData('signerRole');

                if (fieldType) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / (zoom / 100);
                  const y = (e.clientY - rect.top) / (zoom / 100);

                  // Use signer from drag data, selected signer, or auto-assign
                  let assignedRole;
                  if (signerRole) {
                    assignedRole = signerRole;
                  } else if (selectedSigner) {
                    assignedRole = selectedSigner;
                  } else if (fieldType === 'signature' || fieldType === 'initials') {
                    // Auto-assign signatures to rotate through signers
                    const signatureFields = fields.filter(f => f.type === 'signature' || f.type === 'initials');
                    assignedRole = ((signatureFields.length % (parties.length || 1)) + 1).toString();
                  } else {
                    assignedRole = parties[0]?.id.toString() || '1';
                  }

                  // Set dimensions based on field type (sizes optimized for typical PDF text: 12-16px)
                  const dimensions = {
                    signature: { width: 150, height: 40 },
                    initials: { width: 50, height: 20 },
                    text: { width: 120, height: 16 },
                    email: { width: 150, height: 16 },
                    phone: { width: 120, height: 16 },
                    date: { width: 80, height: 16 },
                    number: { width: 60, height: 16 },
                    checkbox: { width: 14, height: 14 },
                  };
                  const { width, height } = dimensions[fieldType] || { width: 100, height: 16 };

                  // Get default label
                  const defaultLabels = {
                    signature: 'Signature',
                    initials: 'Initials',
                    text: 'Text Field',
                    email: 'Email Address',
                    phone: 'Phone Number',
                    date: 'Date',
                    number: 'Number',
                    checkbox: 'Checkbox',
                  };

                  updateFields([...fields, {
                    id: Date.now(),
                    type: fieldType,
                    x,
                    y,
                    width,
                    height,
                    role: assignedRole,
                    page: currentPage,
                    label: defaultLabels[fieldType] || '',
                    validation: getDefaultValidation(fieldType),
                  }]);
                  setDraggedType(null);
                }
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Document Content */}
              {documentPreview?.data ? (
                documentPreview.type === 'application/pdf' ? (
                  <div className="absolute inset-0 pointer-events-none">
                    <Document
                      file={documentPreview.data}
                      onLoadSuccess={handlePdfLoadSuccess}
                      onLoadError={(error) => console.error('PDF load error:', error)}
                      loading={<div className="absolute inset-0 flex items-center justify-center bg-white"><div className="text-slate-500">Loading PDF...</div></div>}
                    >
                      <Page
                        pageNumber={currentPage}
                        width={595 * (zoom / 100)}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </Document>
                  </div>
                ) : (
                  <img
                    src={documentPreview.data}
                    alt="Document"
                    className="absolute inset-0 w-full h-full object-contain rounded pointer-events-none"
                    draggable={false}
                  />
                )
              ) : (
                <div className="absolute inset-0 p-12 pointer-events-none">
                  <div className="space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-5/6" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-4/6" />
                    <div className="mt-8 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-3/4" />
                    </div>
                  </div>
                </div>
              )}

              {/* Placed Fields - Only show fields for current page */}
              {currentPageFields.map(field => {
                const fieldType = allFieldTypes.find(f => f.id === field.type);

                // Get party info for signer type display
                const party = parties.find(p => p.id.toString() === field.role);
                const signerType = party?.signerType || 'external';
                const signerConfig = SIGNER_TYPE_CONFIG[signerType];
                const SignerTypeIcon = signerConfig?.icon;

                // Get color based on assigned party/role
                const colors = [
                  { border: 'border-indigo-400', bg: 'bg-indigo-50' },
                  { border: 'border-emerald-400', bg: 'bg-emerald-50' },
                  { border: 'border-purple-400', bg: 'bg-purple-50' },
                  { border: 'border-amber-400', bg: 'bg-amber-50' },
                ];
                const roleIndex = parseInt(field.role) - 1;
                const colorScheme = colors[roleIndex % colors.length] || colors[0];
                const roleColor = `${colorScheme.border} ${colorScheme.bg}`;

                const isSelected = selectedField === field.id || selectedFields.includes(field.id);
                const isMultiSelected = selectedFields.includes(field.id) && selectedFields.length > 1;

                return (
                  <div
                    key={field.id}
                    className={cn(
                      'absolute border-2 border-dashed rounded cursor-move flex items-center justify-center transition-all group',
                      roleColor,
                      isSelected && 'ring-2 ring-offset-2',
                      isMultiSelected ? 'ring-blue-500' : isSelected && 'ring-slate-900'
                    )}
                    style={{
                      left: field.x * (zoom / 100),
                      top: field.y * (zoom / 100),
                      width: field.width * (zoom / 100),
                      height: field.height * (zoom / 100),
                    }}
                    onClick={(e) => handleFieldClick(e, field.id)}
                    onMouseDown={(e) => handleFieldMouseDown(e, field.id)}
                  >
                    {/* Signer Type Badge - shown on hover */}
                    {party && signerConfig && (
                      <div
                        className={cn(
                          'absolute -top-6 left-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity z-10',
                          signerConfig.bgColor,
                          signerConfig.color
                        )}
                      >
                        <SignerTypeIcon className="w-2.5 h-2.5" />
                        <span>{party.name}</span>
                        <span className="text-[8px] opacity-70">({signerConfig.label})</span>
                      </div>
                    )}

                    {field.type === 'text' ? (
                      <div className="flex items-center justify-center pointer-events-none px-2 w-full">
                        <span className="text-xs font-medium text-slate-700 truncate">
                          {field.label || 'Text Field'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center pointer-events-none px-2 w-full">
                        <span className="text-xs font-medium text-slate-600 truncate">
                          {field.placeholder || fieldType?.label}
                        </span>
                      </div>
                    )}

                    {/* Resize Handle */}
                    <div
                      className="absolute bottom-0 right-0 w-4 h-4 bg-slate-700 rounded-tl cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleResizeStart(e, field.id)}
                    >
                      <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-r-2 border-b-2 border-white" />
                    </div>

                    {selectedField === field.id && (
                      <div className="absolute -top-8 right-0 flex items-center gap-1 bg-white rounded shadow-lg p-1 z-10">
                        {isMultiSelected && (
                          <span className="text-xs text-slate-500 px-1">{selectedFields.length} selected</span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6"
                          title="Copy field"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyField(field.id);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 text-red-500"
                          title={isMultiSelected ? `Delete ${selectedFields.length} fields` : "Delete field"}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isMultiSelected) {
                              // Delete all selected fields
                              updateFields(fields.filter(f => !selectedFields.includes(f.id)));
                              setSelectedFields([]);
                            } else {
                              updateFields(fields.filter(f => f.id !== field.id));
                            }
                            setSelectedField(null);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Marquee Selection Rectangle */}
              {isMarqueeSelecting && (
                <div
                  className="absolute border-2 border-blue-500 bg-blue-100/30 pointer-events-none"
                  style={{
                    left: Math.min(marqueeStart.x, marqueeEnd.x) * (zoom / 100),
                    top: Math.min(marqueeStart.y, marqueeEnd.y) * (zoom / 100),
                    width: Math.abs(marqueeEnd.x - marqueeStart.x) * (zoom / 100),
                    height: Math.abs(marqueeEnd.y - marqueeStart.y) * (zoom / 100),
                  }}
                />
              )}
            </div>
          )}

          {/* Floating Controls - Bottom Right */}
          {documentPreview?.data && (
            <div className="absolute bottom-6 right-6 flex flex-col items-center gap-2 z-20">
              {/* Page Navigation - Only show for multi-page documents */}
              {totalPages > 1 && (
                <div className="flex flex-col bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden w-11">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-11 h-10 rounded-none flex items-center justify-center"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    <ChevronLeft className="w-4 h-4 rotate-90" />
                  </Button>
                  <div className="h-8 text-xs font-medium text-slate-600 flex items-center justify-center border-y border-slate-100">
                    {currentPage}/{totalPages}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-11 h-10 rounded-none flex items-center justify-center"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </Button>
                </div>
              )}

              {/* Zoom Controls */}
              <div className="flex flex-col bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden w-11">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-11 h-10 rounded-none flex items-center justify-center"
                  onClick={() => setZoom(prev => Math.min(prev + 25, 200))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <div className="h-8 text-xs font-medium text-slate-600 flex items-center justify-center border-y border-slate-100">
                  {zoom}%
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-11 h-10 rounded-none flex items-center justify-center"
                  onClick={() => setZoom(prev => Math.max(prev - 25, 50))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className={cn(
          "w-1 bg-slate-200 hover:bg-slate-400 cursor-col-resize transition-colors flex-shrink-0",
          isResizingPanel && "bg-slate-400"
        )}
        onMouseDown={handlePanelResizeStart}
      />

      {/* Right Panel - Field Properties */}
      <div
        className="bg-white border-l border-slate-200 p-4 overflow-y-auto flex-shrink-0"
        style={{ width: rightPanelWidth }}
      >
        <h3 className="font-semibold text-slate-900 mb-4">Field Properties</h3>

        {fields.length > 0 ? (
          <div className="space-y-4">
            {/* Top-level Signer Dropdown */}
            {(() => {
              const groupedFields = getFieldsGroupedBySigner();
              const availableSigners = Object.keys(groupedFields);
              const currentSigner = selectedSigner || availableSigners[0];
              const currentSignerFields = groupedFields[currentSigner] || [];
              const currentSignerParty = parties.find(p => p.id.toString() === currentSigner);
              const currentSignerType = currentSignerParty?.signerType || 'external';

              return (
                <>
                  {/* Signer Selection Dropdown */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Select Signer</Label>
                    <Select
                      value={currentSigner}
                      onValueChange={(value) => setSelectedSigner(value)}
                    >
                      <SelectTrigger className="border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSigners.map((role) => {
                          const signerFieldCount = groupedFields[role]?.length || 0;
                          return (
                            <SelectItem key={role} value={role}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{getSignerName(role)}</span>
                                <span className="text-slate-400">({signerFieldCount} {signerFieldCount === 1 ? 'field' : 'fields'})</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fields for Selected Signer */}
                  {currentSignerFields.length > 0 ? (
                    <div className="space-y-2">
                      {currentSignerFields.map((field, index) => (
                        <FieldPropertiesCard
                          key={field.id}
                          field={field}
                          index={index}
                          isSelected={selectedField === field.id}
                          isExpanded={expandedSigners[field.id] !== false}
                          totalPages={totalPages}
                          signerType={currentSignerType}
                          onUpdate={updateField}
                          onDelete={(fieldId) => {
                            updateFields(fields.filter(f => f.id !== fieldId));
                            if (selectedField === fieldId) setSelectedField(null);
                          }}
                          onToggleExpand={() => toggleSignerExpanded(field.id)}
                          onSelect={() => {
                            setSelectedField(field.id);
                            if (field.page && field.page !== currentPage) {
                              setCurrentPage(field.page);
                            }
                          }}
                          onPageChange={setCurrentPage}
                        />
                      ))}
                    </div>
                  ) : (
                      <p className="text-sm text-slate-500 text-center py-8">
                        No fields assigned to this signer
                      </p>
                    )}
                </>
              );
            })()}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Move className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">Add signature fields to the document to see them here</p>
          </div>
        )}
      </div>

      {/* Delete Signer Confirmation Dialog */}
      <AlertDialog open={deleteSignerDialog.open} onOpenChange={(open) => !open && setDeleteSignerDialog({ open: false, signer: null, fieldCount: 0 })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Delete Signer
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-slate-700">{deleteSignerDialog.signer?.name}</span>?
              {deleteSignerDialog.fieldCount > 0 && (
                <span className="block mt-2 text-red-600">
                  This will also delete {deleteSignerDialog.fieldCount} field{deleteSignerDialog.fieldCount > 1 ? 's' : ''} assigned to this signer.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSigner}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}