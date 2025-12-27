import React from 'react';
import { cn } from '@/lib/utils';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  Building2,
  User,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FIELD_TYPES, getFieldTypeInfo } from './FieldOverlay';

// Dot colors for signer identification
const DOT_COLORS = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-amber-500',
];

// Signer types with their configuration
export const SIGNER_TYPES = {
  external: {
    id: 'external',
    label: 'External Signer',
    shortLabel: 'External',
    icon: User,
    description: 'Person outside the organization (e.g., candidate, client)',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  internal: {
    id: 'internal',
    label: 'Internal Signer',
    shortLabel: 'Internal',
    icon: Building2,
    description: 'Signs on behalf of the company (e.g., CTO, Manager)',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
};

// Field types available in the grid
const SIDEBAR_FIELD_TYPES = [
  FIELD_TYPES.signature,
  FIELD_TYPES.text,
  FIELD_TYPES.email,
  FIELD_TYPES.phone,
  FIELD_TYPES.date,
  FIELD_TYPES.number,
];

/**
 * SignerCard - Reusable component for displaying a signer with their fields
 *
 * @param {Object} signer - The signer object with id, name, signerType, etc.
 * @param {number} index - Index of the signer (for color assignment)
 * @param {Array} fields - Fields assigned to this signer
 * @param {boolean} isSelected - Whether this signer is currently selected
 * @param {boolean} isExpanded - Whether the card content is expanded
 * @param {boolean} showChevron - Whether to show the expand/collapse chevron
 * @param {string} selectedFieldId - ID of the currently selected field
 * @param {Function} onSelect - Callback when signer is selected
 * @param {Function} onToggleExpand - Callback to toggle expand state
 * @param {Function} onDelete - Callback when signer is deleted
 * @param {Function} onUpdate - Callback when signer properties change: (signerId, updates) => void
 * @param {Function} onAddField - Callback when a field is added: (fieldType, signerRole) => void
 * @param {Function} onFieldSelect - Callback when a field is selected
 * @param {Function} onFieldDelete - Callback when a field is deleted
 * @param {Function} onDragStart - Callback when dragging starts from field type grid
 */
export default function SignerCard({
  signer,
  index = 0,
  fields = [],
  isSelected = false,
  isExpanded = true,
  showChevron = false,
  selectedFieldId = null,
  onSelect,
  onToggleExpand,
  onDelete,
  onUpdate,
  onAddField,
  onFieldSelect,
  onFieldDelete,
  onDragStart,
}) {
  const dotColor = DOT_COLORS[index % DOT_COLORS.length];
  const signerType = SIGNER_TYPES[signer.signerType] || SIGNER_TYPES.external;
  const SignerTypeIcon = signerType.icon;

  const handleHeaderClick = () => {
    onSelect?.();
    onToggleExpand?.();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete?.(signer, fields.length);
  };

  const handleSignerTypeChange = (newType) => {
    onUpdate?.(signer.id, { signerType: newType });
  };

  const handleFieldTypeClick = (e, fieldType) => {
    e.stopPropagation();
    onAddField?.(fieldType.id, signer.id.toString());
  };

  const handleFieldTypeDragStart = (e, fieldType) => {
    e.dataTransfer.setData('fieldType', fieldType.id);
    e.dataTransfer.setData('signerRole', signer.id.toString());
    onDragStart?.(fieldType.id, signer.id.toString());
  };

  const handleFieldClick = (e, field) => {
    e.stopPropagation();
    onFieldSelect?.(field);
  };

  const handleFieldDeleteClick = (e, field) => {
    e.stopPropagation();
    onFieldDelete?.(field);
  };

  return (
    <div
      className={cn(
        'rounded-lg border bg-white transition-all',
        isSelected ? 'border-slate-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'
      )}
    >
      {/* Signer Header */}
      <div
        className="p-3 cursor-pointer"
        onClick={handleHeaderClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showChevron && (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )
            )}
            <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', dotColor)} />
            <span className="text-sm font-medium text-slate-700">
              {signer.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{fields.length} fields</span>
            <button
              onClick={handleDeleteClick}
              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {/* Signer Type Badge */}
        <div className="flex items-center gap-1.5 mt-2 ml-6">
          <div className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
            signerType.bgColor,
            signerType.color
          )}>
            <SignerTypeIcon className="w-3 h-3" />
            {signerType.shortLabel}
          </div>
        </div>
      </div>

      {/* Fields Content - visible when expanded */}
      {isExpanded && (
        <div className="p-3 pt-0 space-y-3">
          {/* Signer Type Selector */}
          <div className="space-y-1.5">
            <p className="text-xs text-slate-500 font-medium">Signer Role</p>
            <Select
              value={signer.signerType || 'external'}
              onValueChange={handleSignerTypeChange}
            >
              <SelectTrigger
                className="h-8 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(SIGNER_TYPES).map((type) => {
                  const TypeIcon = type.icon;
                  return (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <TypeIcon className={cn('w-3.5 h-3.5', type.color)} />
                        <div>
                          <span className="text-xs font-medium">{type.label}</span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-slate-400">{signerType.description}</p>
          </div>

          {/* Add Field - Grid of field types */}
          <div className="grid grid-cols-3 gap-1.5">
            {SIDEBAR_FIELD_TYPES.map(fieldType => (
              <div
                key={fieldType.id}
                className="group relative flex flex-col items-center p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-all"
                draggable
                onDragStart={(e) => handleFieldTypeDragStart(e, fieldType)}
                onClick={(e) => handleFieldTypeClick(e, fieldType)}
              >
                {/* Add button on hover */}
                <div className="absolute -top-0.5 -right-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center">
                    <Plus className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                {/* Icon */}
                <fieldType.icon className="w-5 h-5 text-slate-500 group-hover:text-slate-700 transition-colors" />
                {/* Label */}
                <span className="text-[10px] text-slate-500 group-hover:text-slate-700 mt-1 text-center leading-tight">
                  {fieldType.label}
                </span>
              </div>
            ))}
          </div>

          {/* Assigned Fields List */}
          {fields.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-slate-500 font-medium">Assigned Fields</p>
              {fields.map((field) => {
                const fieldInfo = getFieldTypeInfo(field.type);
                return (
                  <div
                    key={field.id}
                    className={cn(
                      'flex items-center justify-between p-2 rounded text-xs bg-slate-50',
                      selectedFieldId === field.id && 'ring-1 ring-slate-300'
                    )}
                    onClick={(e) => handleFieldClick(e, field)}
                  >
                    <div className="flex items-center gap-2">
                      <fieldInfo.icon className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-600 truncate max-w-[100px]">
                        {field.label || field.placeholder || fieldInfo.label}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleFieldDeleteClick(e, field)}
                      className="text-slate-400 hover:text-red-500 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Export constants for external use
export { DOT_COLORS, SIDEBAR_FIELD_TYPES };
