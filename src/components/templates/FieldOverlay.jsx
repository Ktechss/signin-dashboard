import React from 'react';
import { Pen, Type, Calendar, CheckSquare, Hash, Mail, Phone, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

// Validation configurations for each field type
export const FIELD_VALIDATIONS = {
  signature: {
    required: { type: 'boolean', default: true, label: 'Required' },
  },
  initials: {
    required: { type: 'boolean', default: true, label: 'Required' },
  },
  text: {
    required: { type: 'boolean', default: false, label: 'Required' },
    minLength: { type: 'number', default: null, label: 'Min Characters', min: 1, max: 500 },
    maxLength: { type: 'number', default: null, label: 'Max Characters', min: 1, max: 500 },
  },
  email: {
    required: { type: 'boolean', default: false, label: 'Required' },
  },
  phone: {
    required: { type: 'boolean', default: false, label: 'Required' },
    format: { type: 'select', default: 'international', label: 'Format', options: [
      { value: 'international', label: 'International (+XXX...)' },
      { value: 'uae', label: 'UAE (+971...)' },
      { value: 'us', label: 'US (+1...)' },
      { value: 'any', label: 'Any Format' },
    ]},
    minDigits: { type: 'number', default: 7, label: 'Min Digits', min: 5, max: 15 },
    maxDigits: { type: 'number', default: 15, label: 'Max Digits', min: 5, max: 20 },
  },
  date: {
    required: { type: 'boolean', default: false, label: 'Required' },
    format: { type: 'select', default: 'DD/MM/YYYY', label: 'Format', options: [
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    ]},
  },
  number: {
    required: { type: 'boolean', default: false, label: 'Required' },
    min: { type: 'number', default: null, label: 'Min Value' },
    max: { type: 'number', default: null, label: 'Max Value' },
    decimals: { type: 'number', default: 0, label: 'Decimal Places', min: 0, max: 4 },
  },
  checkbox: {
    required: { type: 'boolean', default: false, label: 'Must be checked' },
  },
};

// Field type configurations
export const FIELD_TYPES = {
  signature: {
    id: 'signature',
    icon: Pen,
    label: 'Signature',
    color: 'bg-indigo-500',
    description: 'Digital signature field',
    category: 'signing',
  },
  initials: {
    id: 'initials',
    icon: Type,
    label: 'Initials',
    color: 'bg-purple-500',
    description: 'Initials field',
    category: 'signing',
  },
  text: {
    id: 'text',
    icon: Type,
    label: 'Text',
    color: 'bg-blue-500',
    description: 'Plain text input',
    category: 'input',
  },
  email: {
    id: 'email',
    icon: Mail,
    label: 'Email',
    color: 'bg-cyan-500',
    description: 'Email address with validation',
    category: 'input',
  },
  phone: {
    id: 'phone',
    icon: Phone,
    label: 'Phone',
    color: 'bg-green-500',
    description: 'Phone number with format',
    category: 'input',
  },
  date: {
    id: 'date',
    icon: Calendar,
    label: 'Date',
    color: 'bg-emerald-500',
    description: 'Date picker field',
    category: 'input',
  },
  number: {
    id: 'number',
    icon: Hash,
    label: 'Number',
    color: 'bg-rose-500',
    description: 'Numeric input',
    category: 'input',
  },
  checkbox: {
    id: 'checkbox',
    icon: CheckSquare,
    label: 'Checkbox',
    color: 'bg-amber-500',
    description: 'Yes/No checkbox',
    category: 'input',
  },
};

// Get default validation for a field type
export const getDefaultValidation = (type) => {
  const validations = FIELD_VALIDATIONS[type] || {};
  const defaults = {};
  Object.entries(validations).forEach(([key, config]) => {
    defaults[key] = config.default;
  });
  return defaults;
};

// Role-based color schemes for field overlays
export const ROLE_COLORS = [
  { border: 'border-indigo-400', bg: 'bg-indigo-100/70', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  { border: 'border-emerald-400', bg: 'bg-emerald-100/70', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  { border: 'border-purple-400', bg: 'bg-purple-100/70', text: 'text-purple-700', dot: 'bg-purple-500' },
  { border: 'border-amber-400', bg: 'bg-amber-100/70', text: 'text-amber-700', dot: 'bg-amber-500' },
];

// Get color scheme based on role index
export const getRoleColorScheme = (role) => {
  const roleIndex = role ? parseInt(role) - 1 : 0;
  return ROLE_COLORS[roleIndex % ROLE_COLORS.length];
};

// Get field type info
export const getFieldTypeInfo = (type) => {
  return FIELD_TYPES[type] || FIELD_TYPES.text;
};

// Get display label for a field
export const getFieldDisplayLabel = (field) => {
  const fieldInfo = getFieldTypeInfo(field.type);
  return field.label || field.placeholder || fieldInfo.label;
};

// Single field overlay component
export function FieldOverlay({
  field,
  documentWidth = 595,
  documentHeight = 842,
  className
}) {
  const colorScheme = getRoleColorScheme(field.role);
  const displayLabel = getFieldDisplayLabel(field);

  return (
    <div
      className={cn(
        'absolute border-2 border-dashed rounded flex items-center justify-center',
        colorScheme.border,
        colorScheme.bg,
        className
      )}
      style={{
        left: `${(field.x / documentWidth) * 100}%`,
        top: `${(field.y / documentHeight) * 100}%`,
        width: `${(field.width / documentWidth) * 100}%`,
        height: `${(field.height / documentHeight) * 100}%`,
      }}
    >
      <span className={cn('text-xs font-medium truncate px-2', colorScheme.text)}>
        {displayLabel}
      </span>
    </div>
  );
}

// Render multiple field overlays
export function FieldOverlayList({
  fields = [],
  documentWidth = 595,
  documentHeight = 842,
  className
}) {
  if (!fields || !Array.isArray(fields) || fields.length === 0) {
    return null;
  }

  return (
    <>
      {fields.map((field) => (
        <FieldOverlay
          key={field.id}
          field={field}
          documentWidth={documentWidth}
          documentHeight={documentHeight}
          className={className}
        />
      ))}
    </>
  );
}

export default FieldOverlay;
