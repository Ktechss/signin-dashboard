import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  FileText,
  MapPin,
  Crown,
  UserCheck,
  Banknote,
  Mail,
  Phone,
  Hash,
  User,
} from 'lucide-react';
import {
  ESTABLISHMENT_FIELDS,
  FIELD_CATEGORIES,
  DEFAULT_ESTABLISHMENT_FIELDS,
  getValueFromPath,
  formatFieldValue,
} from '@/constants/establishmentFields';

// Icon mapping for field types
const FIELD_ICONS = {
  companyName: Building2,
  companyNameAr: Building2,
  tradeName: Building2,
  tradeNameAr: Building2,
  legalType: FileText,
  licenseNumber: FileText,
  establishmentNumber: Hash,
  industry: Building2,
  registrationDate: FileText,
  expiryDate: FileText,
  fullAddress: MapPin,
  street: MapPin,
  area: MapPin,
  city: MapPin,
  emirate: MapPin,
  poBox: MapPin,
  ownerName: Crown,
  ownerNameAr: Crown,
  ownerEmail: Mail,
  ownerPhone: Phone,
  ownerEmiratesId: Hash,
  ownerRole: Crown,
  representedBy: UserCheck,
  representativeDesignation: UserCheck,
  representativeEmail: Mail,
  representativePhone: Phone,
  representativeEmiratesId: Hash,
  authorizedCapital: Banknote,
  paidUpCapital: Banknote,
  tradeLicense: FileText,
  commercialRegistration: FileText,
  taxRegistration: FileText,
};

// Fields that map to establishment object keys (editable representative fields)
const ESTABLISHMENT_KEY_MAP = {
  companyName: 'name',
  tradeName: 'tradeName',
  licenseNumber: 'licenseNumber',
  establishmentNumber: 'establishmentNumber',
  fullAddress: 'address',
  representedBy: 'representedBy',
  representativeEmail: 'representedByEmail',
  representativePhone: 'representedByPhone',
  representativeEmiratesId: 'emiratesId',
};

// Representative fields that are editable
const REPRESENTATIVE_FIELDS = [
  'representedBy',
  'representativeDesignation',
  'representativeEmail',
  'representativePhone',
  'representativeEmiratesId',
];

/**
 * EstablishmentFieldsDisplay - Displays establishment fields based on blueprint configuration
 */
export default function EstablishmentFieldsDisplay({
  companyData,
  establishment,
  configuredFields = DEFAULT_ESTABLISHMENT_FIELDS,
  representatives = [],
  onUpdate,
}) {
  // Separate configured fields into read-only and editable
  const { readOnlyFields, editableFields } = React.useMemo(() => {
    const readOnly = [];
    const editable = [];

    for (const fieldId of configuredFields) {
      const field = ESTABLISHMENT_FIELDS[fieldId];
      if (field) {
        if (REPRESENTATIVE_FIELDS.includes(fieldId)) {
          editable.push(field);
        } else {
          readOnly.push(field);
        }
      }
    }

    return { readOnlyFields: readOnly, editableFields: editable };
  }, [configuredFields]);

  // Get value for a field - check establishment first, then companyData
  const getFieldValue = (fieldId) => {
    const field = ESTABLISHMENT_FIELDS[fieldId];
    if (!field) return '';

    // Check establishment object first (for stored/edited values)
    const establishmentKey = ESTABLISHMENT_KEY_MAP[fieldId];
    if (establishmentKey && establishment?.[establishmentKey] !== undefined) {
      return establishment[establishmentKey];
    }

    // Get from company data using path
    return getValueFromPath(companyData, field.path) || '';
  };

  // Render a read-only field
  const renderReadOnlyField = (field) => {
    const value = getFieldValue(field.id);
    const FieldIcon = FIELD_ICONS[field.id];

    // Special handling for address field
    if (field.id === 'fullAddress') {
      return (
        <div key={field.id} className="col-span-2 space-y-2">
          <Label className="text-xs font-medium text-slate-700">{field.label}</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Textarea
              value={value}
              readOnly
              className="pl-9 bg-slate-100 text-slate-700 min-h-[60px]"
              rows={2}
            />
          </div>
        </div>
      );
    }

    // Currency fields
    if (field.format === 'currency') {
      return (
        <div key={field.id} className="space-y-2">
          <Label className="text-xs font-medium text-slate-700">{field.label}</Label>
          <div className="relative">
            {FieldIcon && (
              <FieldIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            )}
            <Input
              value={formatFieldValue(field.id, value)}
              readOnly
              className={cn(
                "bg-slate-100 text-slate-700",
                FieldIcon && "pl-9"
              )}
            />
          </div>
        </div>
      );
    }

    // Standard read-only field
    return (
      <div key={field.id} className="space-y-2">
        <Label className="text-xs font-medium text-slate-700">{field.label}</Label>
        <div className="relative">
          {FieldIcon && (
            <FieldIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          )}
          <Input
            value={value}
            readOnly
            className={cn(
              "bg-slate-100 text-slate-700",
              FieldIcon && "pl-9"
            )}
          />
        </div>
      </div>
    );
  };

  // Render editable representative field
  const renderEditableField = (field) => {
    const value = getFieldValue(field.id);
    const FieldIcon = FIELD_ICONS[field.id];
    const establishmentKey = ESTABLISHMENT_KEY_MAP[field.id];

    // Special handling for representedBy with dropdown
    if (field.id === 'representedBy' && representatives.length > 0) {
      return (
        <div key={field.id} className="space-y-2">
          <Label className="text-xs font-medium text-slate-700">{field.label} *</Label>
          <Select
            value={value}
            onValueChange={(val) => {
              const rep = representatives.find(r => r.name === val);
              onUpdate?.('representedBy', val);
              if (rep) {
                onUpdate?.('representedByEmail', rep.email || '');
                onUpdate?.('representedByPhone', rep.phone || '');
                onUpdate?.('emiratesId', rep.emiratesId || '');
              }
            }}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select representative" />
            </SelectTrigger>
            <SelectContent>
              {representatives.map((rep) => (
                <SelectItem key={rep.id} value={rep.name}>
                  <div className="flex flex-col">
                    <span>{rep.name}</span>
                    <span className="text-xs text-slate-500">{rep.designation || rep.role}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Determine if required
    const isRequired = ['representedBy', 'representativeEmail'].includes(field.id);
    const inputType = field.id.includes('Email') ? 'email' : 'text';
    const placeholder = getPlaceholder(field.id);

    return (
      <div key={field.id} className="space-y-2">
        <Label className="text-xs font-medium text-slate-700">
          {field.label} {isRequired && '*'}
        </Label>
        <div className="relative">
          {FieldIcon && (
            <FieldIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          )}
          <Input
            type={inputType}
            value={value}
            onChange={(e) => onUpdate?.(establishmentKey || field.id, e.target.value)}
            placeholder={placeholder}
            className={cn("bg-white", FieldIcon && "pl-9")}
          />
        </div>
      </div>
    );
  };

  // Get placeholder text for a field
  const getPlaceholder = (fieldId) => {
    const placeholders = {
      representedBy: "Enter representative's name",
      representativeEmail: "email@company.com",
      representativePhone: "+971 XX XXX XXXX",
      representativeEmiratesId: "784-XXXX-XXXXXXX-X",
    };
    return placeholders[fieldId] || '';
  };

  // No fields configured
  if (configuredFields.length === 0) {
    return (
      <div className="text-center py-4 text-slate-400 text-sm">
        No establishment fields configured for this blueprint
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Read-only Company Fields */}
      {readOnlyFields.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {readOnlyFields.map(renderReadOnlyField)}
        </div>
      )}

      {/* Editable Representative Fields */}
      {editableFields.length > 0 && (
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-blue-500" />
            <h4 className="text-sm font-medium text-slate-900">Represented By</h4>
            <span className="text-xs text-slate-400">— person signing on behalf of company</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {editableFields.map(renderEditableField)}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact display showing just the field values
 */
export function EstablishmentFieldsSummaryCard({
  companyData,
  configuredFields = DEFAULT_ESTABLISHMENT_FIELDS,
}) {
  const displayFields = configuredFields.slice(0, 4);

  return (
    <div className="space-y-2">
      {displayFields.map(fieldId => {
        const field = ESTABLISHMENT_FIELDS[fieldId];
        if (!field) return null;

        const value = getValueFromPath(companyData, field.path);
        return (
          <div key={fieldId} className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{field.label}</span>
            <span className="font-medium text-slate-700">
              {formatFieldValue(fieldId, value) || '-'}
            </span>
          </div>
        );
      })}
      {configuredFields.length > 4 && (
        <p className="text-xs text-slate-400">
          +{configuredFields.length - 4} more fields
        </p>
      )}
    </div>
  );
}
