import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FIELD_TYPES, FIELD_VALIDATIONS } from './FieldOverlay';

// Get field type info from FIELD_TYPES
const getFieldTypeInfo = (type) => FIELD_TYPES[type] || FIELD_TYPES.text;

/**
 * FieldPropertiesCard - Reusable component for displaying and editing field properties
 *
 * @param {Object} field - The field object with properties like id, type, label, validation, etc.
 * @param {Function} onUpdate - Callback when field is updated: (fieldId, updates) => void
 * @param {Function} onDelete - Callback when field is deleted: (fieldId) => void
 * @param {boolean} isSelected - Whether this field is currently selected
 * @param {boolean} isExpanded - Whether the field details are expanded
 * @param {Function} onToggleExpand - Callback to toggle expand state
 * @param {Function} onSelect - Callback when field is selected
 * @param {number} totalPages - Total number of pages (for page selector)
 * @param {Function} onPageChange - Callback when page is changed
 * @param {number} index - Index of the field in the list (for display)
 */
export default function FieldPropertiesCard({
  field,
  onUpdate,
  onDelete,
  isSelected = false,
  isExpanded = true,
  onToggleExpand,
  onSelect,
  totalPages = 1,
  onPageChange,
  index = 0,
}) {
  const [activeTab, setActiveTab] = useState('details');
  const [showPositionSize, setShowPositionSize] = useState(false);

  const fieldType = getFieldTypeInfo(field.type);

  const handleUpdate = (updates) => {
    onUpdate?.(field.id, updates);
  };

  const handleValidationUpdate = (key, value) => {
    handleUpdate({
      validation: { ...field.validation, [key]: value }
    });
  };

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden transition-all',
        isSelected ? 'bg-slate-50 ring-1 ring-slate-300' : 'hover:bg-slate-50/50'
      )}
    >
      {/* Field Header */}
      <button
        className="w-full flex items-center justify-between p-2.5 transition-colors"
        onClick={() => {
          onToggleExpand?.();
          onSelect?.();
        }}
      >
        <div className="flex items-center gap-2">
          {fieldType && <fieldType.icon className="w-4 h-4 text-slate-400" />}
          <span className="text-sm font-medium text-slate-700">
            {field.label || fieldType?.label || `Field ${index + 1}`}
          </span>
          {totalPages > 1 && (
            <span className="text-xs text-slate-400">
              P{field.page || 1}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-slate-400 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(field.id);
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

      {/* Expanded Properties with Tabs */}
      {isExpanded && (
        <div className="px-2.5 pb-3">
          {/* Tab Headers - Pill style */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-3">
            <button
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                activeTab === 'details'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('details');
              }}
            >
              Details
            </button>
            <button
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                activeTab === 'validation'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('validation');
              }}
            >
              Validation
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-3">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <>
                {/* Field Name */}
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Field Name</Label>
                  <Input
                    className="h-8 text-sm"
                    value={field.label || ''}
                    onChange={(e) => handleUpdate({ label: e.target.value })}
                    placeholder="Enter field name..."
                  />
                </div>

                {/* Required Toggle - in Details tab */}
                {FIELD_VALIDATIONS[field.type]?.required && (
                  <div className="flex items-center justify-between py-1">
                    <Label className="text-xs text-slate-600">Required</Label>
                    <Switch
                      checked={field.validation?.required || false}
                      onCheckedChange={(checked) => handleValidationUpdate('required', checked)}
                    />
                  </div>
                )}

                {/* Page selector for multi-page documents */}
                {totalPages > 1 && (
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Page</Label>
                    <Select
                      value={(field.page || 1).toString()}
                      onValueChange={(value) => {
                        handleUpdate({ page: parseInt(value) });
                        onPageChange?.(parseInt(value));
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            Page {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {/* Validation Tab */}
            {activeTab === 'validation' && (
              <div className="space-y-3">
                {/* Field Type Info */}
                <p className="text-xs text-slate-400">
                  {fieldType?.label} • {fieldType?.description}
                </p>

                {/* Validation rules (excluding required which is in Details) */}
                {FIELD_VALIDATIONS[field.type] && Object.entries(FIELD_VALIDATIONS[field.type])
                  .filter(([key]) => key !== 'required')
                  .map(([key, config]) => {
                    const currentValue = field.validation?.[key] ?? config.default;

                    return (
                      <div key={key}>
                        {config.type === 'boolean' && (
                          <div className="flex items-center justify-between py-1">
                            <Label className="text-xs text-slate-600">{config.label}</Label>
                            <Switch
                              checked={currentValue || false}
                              onCheckedChange={(checked) => handleValidationUpdate(key, checked)}
                            />
                          </div>
                        )}

                        {config.type === 'number' && (
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500">{config.label}</Label>
                            <Input
                              type="number"
                              className="h-8 text-sm"
                              value={currentValue ?? ''}
                              min={config.min}
                              max={config.max}
                              placeholder={config.default !== null ? `Default: ${config.default}` : 'No limit'}
                              onChange={(e) => {
                                const val = e.target.value ? parseInt(e.target.value) : null;
                                handleValidationUpdate(key, val);
                              }}
                            />
                          </div>
                        )}

                        {config.type === 'select' && (
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500">{config.label}</Label>
                            <Select
                              value={currentValue || config.default}
                              onValueChange={(value) => handleValidationUpdate(key, value)}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {config.options.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {/* Position & Size */}
                <PositionSizeSection
                  field={field}
                  isOpen={showPositionSize}
                  onToggle={() => setShowPositionSize(!showPositionSize)}
                  onUpdate={handleUpdate}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * PositionSizeSection - Collapsible section for position and size controls
 */
function PositionSizeSection({ field, isOpen, onToggle, onUpdate }) {
  return (
    <div className="pt-1">
      <button
        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {isOpen ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        Position & Size
      </button>

      {isOpen && (
        <div className="space-y-2 pt-2 mt-2 bg-slate-50 rounded-lg p-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">X</Label>
              <Input
                type="number"
                className="h-7 text-xs"
                value={Math.round(field.x)}
                onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Y</Label>
              <Input
                type="number"
                className="h-7 text-xs"
                value={Math.round(field.y)}
                onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Width</Label>
              <Input
                type="number"
                className="h-7 text-xs"
                value={Math.round(field.width)}
                onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 120 })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Height</Label>
              <Input
                type="number"
                className="h-7 text-xs"
                value={Math.round(field.height)}
                onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 30 })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
