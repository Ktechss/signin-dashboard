import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Building2,
  MapPin,
  Crown,
  UserCheck,
  Banknote,
  FileText,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ESTABLISHMENT_FIELDS,
  FIELD_CATEGORIES,
  FIELD_PRESETS,
  DEFAULT_ESTABLISHMENT_FIELDS,
  getFieldsByCategory,
} from '@/constants/establishmentFields';

// Icon mapping for categories
const CATEGORY_ICONS = {
  company: Building2,
  address: MapPin,
  owner: Crown,
  representative: UserCheck,
  capital: Banknote,
  documents: FileText,
};

/**
 * EstablishmentFieldsConfig - Configure which e-Channel fields are required for a blueprint
 *
 * @param {Array} selectedFields - Array of selected field IDs
 * @param {Function} onChange - Callback when selection changes: (fieldIds) => void
 * @param {boolean} compact - Show compact view
 */
export default function EstablishmentFieldsConfig({
  selectedFields = DEFAULT_ESTABLISHMENT_FIELDS,
  onChange,
  compact = false,
}) {
  const [expandedCategories, setExpandedCategories] = useState(
    Object.keys(FIELD_CATEGORIES).reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
  );

  // Track which preset is active
  const activePreset = useMemo(() => {
    for (const [presetId, preset] of Object.entries(FIELD_PRESETS)) {
      if (
        preset.fields.length === selectedFields.length &&
        preset.fields.every(f => selectedFields.includes(f))
      ) {
        return presetId;
      }
    }
    return null;
  }, [selectedFields]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleField = (fieldId) => {
    const field = ESTABLISHMENT_FIELDS[fieldId];
    // Don't allow unchecking required fields
    if (field.required && selectedFields.includes(fieldId)) return;

    const newSelection = selectedFields.includes(fieldId)
      ? selectedFields.filter(f => f !== fieldId)
      : [...selectedFields, fieldId];

    onChange(newSelection);
  };

  const toggleCategoryFields = (categoryId, checked) => {
    const categoryFields = getFieldsByCategory(categoryId);
    const categoryFieldIds = categoryFields.map(f => f.id);

    let newSelection;
    if (checked) {
      // Add all category fields
      newSelection = [...new Set([...selectedFields, ...categoryFieldIds])];
    } else {
      // Remove non-required category fields
      newSelection = selectedFields.filter(
        f => !categoryFieldIds.includes(f) || ESTABLISHMENT_FIELDS[f].required
      );
    }

    onChange(newSelection);
  };

  const applyPreset = (presetId) => {
    const preset = FIELD_PRESETS[presetId];
    if (preset) {
      onChange([...preset.fields]);
    }
  };

  const getCategoryState = (categoryId) => {
    const categoryFields = getFieldsByCategory(categoryId);
    const selectedCount = categoryFields.filter(f => selectedFields.includes(f.id)).length;
    return {
      selected: selectedCount,
      total: categoryFields.length,
      allSelected: selectedCount === categoryFields.length,
      someSelected: selectedCount > 0 && selectedCount < categoryFields.length,
    };
  };

  return (
    <div className={cn('space-y-4', compact && 'space-y-3')}>
      {/* Header with Presets */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-700">Establishment Fields</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select which company fields are required for this blueprint
          </p>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  These fields will be auto-populated from the e-Channel government data
                  when creating contracts from this blueprint.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {Object.values(FIELD_PRESETS).map(preset => (
          <TooltipProvider key={preset.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activePreset === preset.id ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'h-7 text-xs gap-1.5',
                    activePreset === preset.id && 'bg-blue-600 hover:bg-blue-700'
                  )}
                  onClick={() => applyPreset(preset.id)}
                >
                  <Sparkles className="w-3 h-3" />
                  {preset.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs font-medium">{preset.label}</p>
                <p className="text-xs text-slate-400">{preset.description}</p>
                <p className="text-xs text-slate-400 mt-1">{preset.fields.length} fields</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* Field Selection Summary */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs font-medium text-slate-600">
            {selectedFields.length} fields selected
          </span>
        </div>
        <span className="text-xs text-slate-400">
          ({DEFAULT_ESTABLISHMENT_FIELDS.length} required)
        </span>
      </div>

      {/* Category Groups */}
      <div className="space-y-2">
        {Object.values(FIELD_CATEGORIES).map(category => {
          const CategoryIcon = CATEGORY_ICONS[category.id];
          const isExpanded = expandedCategories[category.id];
          const categoryState = getCategoryState(category.id);
          const categoryFields = getFieldsByCategory(category.id);

          return (
            <div
              key={category.id}
              className="border border-slate-200 rounded-lg overflow-hidden"
            >
              {/* Category Header */}
              <div
                className={cn(
                  'flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors',
                  categoryState.allSelected && 'bg-blue-50/50'
                )}
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  <button
                    className="p-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(category.id);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    categoryState.someSelected || categoryState.allSelected
                      ? 'bg-blue-100'
                      : 'bg-slate-100'
                  )}>
                    <CategoryIcon className={cn(
                      'w-4 h-4',
                      categoryState.someSelected || categoryState.allSelected
                        ? 'text-blue-600'
                        : 'text-slate-500'
                    )} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{category.label}</p>
                    <p className="text-xs text-slate-400">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {categoryState.selected}/{categoryState.total}
                  </span>
                  <Checkbox
                    checked={categoryState.allSelected}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = categoryState.someSelected;
                      }
                    }}
                    onCheckedChange={(checked) => {
                      toggleCategoryFields(category.id, checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>

              {/* Category Fields */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50">
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {categoryFields.map(field => {
                      const isSelected = selectedFields.includes(field.id);
                      const isRequired = field.required;

                      return (
                        <div
                          key={field.id}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors',
                            isSelected ? 'bg-blue-50' : 'hover:bg-white',
                            isRequired && 'cursor-not-allowed'
                          )}
                          onClick={() => toggleField(field.id)}
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={isRequired}
                            onCheckedChange={() => toggleField(field.id)}
                            className={cn(
                              'data-[state=checked]:bg-blue-600',
                              isRequired && 'opacity-50'
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-xs font-medium truncate',
                              isSelected ? 'text-blue-700' : 'text-slate-600'
                            )}>
                              {field.label}
                            </p>
                          </div>
                          {isRequired && (
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              Required
                            </span>
                          )}
                          {field.editable && (
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                              Editable
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact version for displaying selected fields (read-only)
 */
export function EstablishmentFieldsSummary({ selectedFields = [] }) {
  const groupedFields = useMemo(() => {
    const groups = {};
    for (const fieldId of selectedFields) {
      const field = ESTABLISHMENT_FIELDS[fieldId];
      if (field) {
        if (!groups[field.category]) {
          groups[field.category] = [];
        }
        groups[field.category].push(field);
      }
    }
    return groups;
  }, [selectedFields]);

  if (selectedFields.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic">No establishment fields configured</p>
    );
  }

  return (
    <div className="space-y-2">
      {Object.entries(groupedFields).map(([categoryId, fields]) => {
        const category = FIELD_CATEGORIES[categoryId];
        const CategoryIcon = CATEGORY_ICONS[categoryId];

        return (
          <div key={categoryId} className="flex items-start gap-2">
            <CategoryIcon className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-slate-600">{category.label}</p>
              <p className="text-xs text-slate-400">
                {fields.map(f => f.label).join(', ')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
