import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Pen,
  Type,
  Calendar,
  CheckSquare,
  Hash,
  Move,
  ZoomIn,
  ZoomOut,
  Trash2,
  Copy,
  Users,
  Upload,
  Plus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
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

// Configure PDF.js worker to match react-pdf's version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Only signature for left sidebar
const fieldTypes = [
  { id: 'signature', icon: Pen, label: 'Signature', color: 'bg-indigo-500' },
];

// All field types for the dropdown selector
const allFieldTypes = [
  { id: 'signature', icon: Pen, label: 'Signature', color: 'bg-indigo-500' },
  { id: 'initials', icon: Type, label: 'Initials', color: 'bg-purple-500' },
  { id: 'date', icon: Calendar, label: 'Date', color: 'bg-emerald-500' },
  { id: 'text', icon: Type, label: 'Text', color: 'bg-blue-500' },
  { id: 'checkbox', icon: CheckSquare, label: 'Checkbox', color: 'bg-amber-500' },
  { id: 'number', icon: Hash, label: 'Number', color: 'bg-rose-500' },
];

export default function FieldPlacement({ className, documentPreview, onFieldsChange, parties = [] }) {
  const [zoom, setZoom] = useState(100);
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [draggedType, setDraggedType] = useState(null);
  const [draggingField, setDraggingField] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [expandedSigners, setExpandedSigners] = useState({});
  const [selectedSigner, setSelectedSigner] = useState(null);

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

  const handleFieldMouseDown = (e, fieldId) => {
    e.stopPropagation();
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      setDraggingField(fieldId);
      setSelectedField(fieldId);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
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

  const handleMouseMove = (e) => {
    if (draggingField && isResizing) {
      // Resizing
      const deltaX = (e.clientX - resizeStart.x) / (zoom / 100);
      const deltaY = (e.clientY - resizeStart.y) / (zoom / 100);

      updateFields(fields.map(field =>
        field.id === draggingField
          ? {
              ...field,
              width: Math.max(50, resizeStart.width + deltaX),
              height: Math.max(20, resizeStart.height + deltaY)
            }
          : field
      ));
    } else if (draggingField) {
      // Dragging
      const canvas = e.currentTarget;
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
      };
      updateFields([...fields, newField]);
      setSelectedField(newField.id);
    }
  };

  // Add a new signature field at center of canvas
  const addSignature = () => {
    const signatureFields = fields.filter(f => f.type === 'signature');
    const nextPartyIndex = signatureFields.length;
    const assignedRole = (nextPartyIndex + 1).toString();

    const newSignature = {
      id: Date.now(),
      type: 'signature',
      x: 200,
      y: 400,
      width: 180,
      height: 60,
      role: assignedRole,
      required: true,
    };

    updateFields([...fields, newSignature]);
    setSelectedField(newSignature.id);
  };

  return (
    <div className={cn('flex h-full bg-slate-50 overflow-hidden border border-slate-200', className)}>
      {/* Left Panel - Signature Tool */}
      <div className="w-64 bg-white border-r border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-4">Signature</h3>
        <div className="space-y-2">
          {fieldTypes.map(field => (
            <div
              key={field.id}
              draggable
              onDragStart={() => handleDragStart(field.id)}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-move hover:bg-slate-100 hover:border-slate-300 transition-colors"
            >
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white', field.color)}>
                <field.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-700">{field.label}</span>
            </div>
          ))}
          <p className="text-xs text-slate-500 mt-4">
            Drag and drop signature field onto the document, or use the + button at bottom right
          </p>
        </div>
        
        {parties.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Assigned Roles</h4>
            <div className="space-y-2">
              {parties.map((party, index) => {
                const colors = [
                  { bg: 'bg-indigo-50', leftBorder: 'border-l-indigo-500', text: 'text-indigo-700' },
                  { bg: 'bg-emerald-50', leftBorder: 'border-l-emerald-500', text: 'text-emerald-700' },
                  { bg: 'bg-purple-50', leftBorder: 'border-l-purple-500', text: 'text-purple-700' },
                  { bg: 'bg-amber-50', leftBorder: 'border-l-amber-500', text: 'text-amber-700' },
                ];
                const color = colors[index % colors.length];
                return (
                  <div key={party.id} className={`p-2.5 rounded-r-lg ${color.bg} border-l-4 ${color.leftBorder}`}>
                    <span className={`text-sm font-medium ${color.text}`}>{party.name}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Parties are auto-created when you add signature fields
            </p>
          </div>
        )}
      </div>
      
      {/* Center - Document Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setZoom(prev => Math.max(prev - 25, 50))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-slate-600 w-12 text-center">{zoom}%</span>
            <Button variant="ghost" size="icon" onClick={() => setZoom(prev => Math.min(prev + 25, 200))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Page 1 of 3</span>
          </div>
        </div>
        
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
              className="bg-white shadow-xl rounded relative select-none"
              style={{
                width: 595 * (zoom / 100),
                height: 842 * (zoom / 100),
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                if (draggedType) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / (zoom / 100);
                  const y = (e.clientY - rect.top) / (zoom / 100);

                  // For signature/initials fields, assign to next available party
                  // Count existing signature/initials fields to determine which party to assign
                  const signatureFields = fields.filter(f => f.type === 'signature' || f.type === 'initials');
                  const nextPartyIndex = signatureFields.length;
                  const assignedRole = (draggedType === 'signature' || draggedType === 'initials')
                    ? (nextPartyIndex + 1).toString()
                    : parties[0]?.id.toString() || 'unassigned';

                  updateFields([...fields, {
                    id: Date.now(),
                    type: draggedType,
                    x,
                    y,
                    width: draggedType === 'signature' ? 180 : 120,
                    height: draggedType === 'signature' ? 60 : 30,
                    role: assignedRole,
                    required: true
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
                      onLoadError={(error) => console.error('PDF load error:', error)}
                      loading={<div className="absolute inset-0 flex items-center justify-center bg-white"><div className="text-slate-500">Loading PDF...</div></div>}
                    >
                      <Page
                        pageNumber={1}
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

              {/* Placed Fields */}
              {fields.map(field => {
                const fieldType = allFieldTypes.find(f => f.id === field.type);

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

                return (
                  <div
                    key={field.id}
                    className={cn(
                      'absolute border-2 border-dashed rounded cursor-move flex items-center justify-center transition-all group',
                      roleColor,
                      selectedField === field.id && 'ring-2 ring-slate-900 ring-offset-2'
                    )}
                    style={{
                      left: field.x * (zoom / 100),
                      top: field.y * (zoom / 100),
                      width: field.width * (zoom / 100),
                      height: field.height * (zoom / 100),
                    }}
                    onClick={() => setSelectedField(field.id)}
                    onMouseDown={(e) => handleFieldMouseDown(e, field.id)}
                  >
                    <div className="flex flex-col items-center gap-1 pointer-events-none px-2 text-center">
                      {fieldType && <fieldType.icon className="w-4 h-4 text-slate-500" />}
                      <span className="text-xs font-medium text-slate-600 line-clamp-2">
                        {field.placeholder || fieldType?.label}
                      </span>
                    </div>

                    {/* Resize Handle */}
                    <div
                      className="absolute bottom-0 right-0 w-4 h-4 bg-slate-700 rounded-tl cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleResizeStart(e, field.id)}
                    >
                      <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-r-2 border-b-2 border-white" />
                    </div>

                    {selectedField === field.id && (
                      <div className="absolute -top-8 right-0 flex items-center gap-1 bg-white rounded shadow-lg p-1 z-10">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6"
                          title="Copy signature"
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
                          onClick={(e) => {
                            e.stopPropagation();
                            updateFields(fields.filter(f => f.id !== field.id));
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
            </div>
          )}

          {/* Add Signature Button - Bottom Right */}
          {documentPreview?.data && (
            <Button
              onClick={addSignature}
              className="absolute bottom-6 right-6 rounded-full w-12 h-12 bg-slate-900 hover:bg-slate-800 shadow-lg z-20"
              size="icon"
              title="Add new signature"
            >
              <Plus className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Right Panel - Field Properties */}
      <div className="w-72 bg-white border-l border-slate-200 p-4 overflow-y-auto">
        <h3 className="font-semibold text-slate-900 mb-4">Field Properties</h3>

        {fields.length > 0 ? (
          <div className="space-y-4">
            {/* Top-level Signer Dropdown */}
            {(() => {
              const groupedFields = getFieldsGroupedBySigner();
              const signerColors = [
                { bg: 'bg-indigo-50', border: 'border-indigo-200', dot: 'bg-indigo-500', text: 'text-indigo-700' },
                { bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-700' },
                { bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500', text: 'text-purple-700' },
                { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', text: 'text-amber-700' },
              ];
              const availableSigners = Object.keys(groupedFields);
              const currentSigner = selectedSigner || availableSigners[0];
              const currentSignerFields = groupedFields[currentSigner] || [];
              const currentSignerIndex = parseInt(currentSigner) - 1;
              const currentColorScheme = signerColors[currentSignerIndex % signerColors.length] || signerColors[0];

              return (
                <>
                  {/* Signer Selection Dropdown */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select Signer</Label>
                    <Select
                      value={currentSigner}
                      onValueChange={(value) => setSelectedSigner(value)}
                    >
                      <SelectTrigger className={`${currentColorScheme.bg} ${currentColorScheme.border} border`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSigners.map((role) => {
                          const roleIndex = parseInt(role) - 1;
                          const colorScheme = signerColors[roleIndex % signerColors.length] || signerColors[0];
                          const signerFieldCount = groupedFields[role]?.length || 0;
                          return (
                            <SelectItem key={role} value={role}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${colorScheme.dot}`} />
                                <span className="font-medium">{getSignerName(role)}</span>
                                <span className="text-slate-400">({signerFieldCount} {signerFieldCount === 1 ? 'signature' : 'signatures'})</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Signatures for Selected Signer */}
                  <div className={`p-3 rounded-lg border ${currentColorScheme.border} ${currentColorScheme.bg}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-3 h-3 rounded-full ${currentColorScheme.dot}`} />
                      <span className={`text-sm font-semibold ${currentColorScheme.text}`}>
                        {getSignerName(currentSigner)}'s Signatures
                      </span>
                    </div>

                    {currentSignerFields.length > 0 ? (
                      <div className="space-y-2">
                        {currentSignerFields.map((field, index) => {
                          const fieldType = allFieldTypes.find(f => f.id === field.type);
                          const isExpanded = expandedSigners[field.id] !== false;
                          const isSelected = selectedField === field.id;

                          return (
                            <div
                              key={field.id}
                              className={cn(
                                'rounded-lg border bg-white overflow-hidden',
                                isSelected ? 'ring-2 ring-slate-900 border-slate-400' : 'border-slate-200'
                              )}
                            >
                              {/* Signature Header */}
                              <button
                                className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 transition-colors"
                                onClick={() => {
                                  toggleSignerExpanded(field.id);
                                  setSelectedField(field.id);
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  {fieldType && <fieldType.icon className="w-4 h-4 text-slate-600" />}
                                  <span className="text-sm font-medium text-slate-700">
                                    {fieldType?.label} {index + 1}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-6 h-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateFields(fields.filter(f => f.id !== field.id));
                                      if (selectedField === field.id) setSelectedField(null);
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                  )}
                                </div>
                              </button>

                              {/* Expanded Properties */}
                              {isExpanded && (
                                <div className="p-3 pt-0 space-y-3 border-t border-slate-100">
                                  {/* Position & Size Display */}
                                  {/* <div className="grid grid-cols-2 gap-2 text-xs pt-3">
                                    <div className="flex items-center justify-between bg-slate-50 rounded px-2 py-1.5">
                                      <span className="text-slate-500">X:</span>
                                      <span className="font-medium text-slate-700">{Math.round(field.x)}px</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-slate-50 rounded px-2 py-1.5">
                                      <span className="text-slate-500">Y:</span>
                                      <span className="font-medium text-slate-700">{Math.round(field.y)}px</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-slate-50 rounded px-2 py-1.5">
                                      <span className="text-slate-500">Width:</span>
                                      <span className="font-medium text-slate-700">{Math.round(field.width)}px</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-slate-50 rounded px-2 py-1.5">
                                      <span className="text-slate-500">Height:</span>
                                      <span className="font-medium text-slate-700">{Math.round(field.height)}px</span>
                                    </div>
                                  </div> */}

                                  {/* Editable Fields */}
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <Label className="text-xs">X Position</Label>
                                        <Input
                                          type="number"
                                          className="h-8 text-xs"
                                          value={Math.round(field.x)}
                                          onChange={(e) => updateField(field.id, { x: parseInt(e.target.value) || 0 })}
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs">Y Position</Label>
                                        <Input
                                          type="number"
                                          className="h-8 text-xs"
                                          value={Math.round(field.y)}
                                          onChange={(e) => updateField(field.id, { y: parseInt(e.target.value) || 0 })}
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <Label className="text-xs">Width</Label>
                                        <Input
                                          type="number"
                                          className="h-8 text-xs"
                                          value={Math.round(field.width)}
                                          onChange={(e) => updateField(field.id, { width: parseInt(e.target.value) || 120 })}
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs">Height</Label>
                                        <Input
                                          type="number"
                                          className="h-8 text-xs"
                                          value={Math.round(field.height)}
                                          onChange={(e) => updateField(field.id, { height: parseInt(e.target.value) || 30 })}
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <Label className="text-xs">Label</Label>
                                      <Input
                                        className="h-8 text-xs"
                                        value={field.placeholder || ''}
                                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                        placeholder="e.g., Sign here..."
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-4">
                        No signatures for this signer
                      </p>
                    )}
                  </div>
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
    </div>
  );
}