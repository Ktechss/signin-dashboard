/**
 * Establishment Fields Configuration
 *
 * These fields are available from the e-Channel government data
 * and can be configured per blueprint to determine which fields
 * are required/displayed for the establishment signer.
 */

// All available establishment fields from e-Channel data
export const ESTABLISHMENT_FIELDS = {
  // Company Information
  companyName: {
    id: 'companyName',
    label: 'Company Name',
    category: 'company',
    path: 'companyName',
    required: true, // Always required
    editable: false,
  },
  companyNameAr: {
    id: 'companyNameAr',
    label: 'Company Name (Arabic)',
    category: 'company',
    path: 'companyNameAr',
    required: false,
    editable: false,
  },
  tradeName: {
    id: 'tradeName',
    label: 'Trade Name',
    category: 'company',
    path: 'tradeName',
    required: false,
    editable: false,
  },
  tradeNameAr: {
    id: 'tradeNameAr',
    label: 'Trade Name (Arabic)',
    category: 'company',
    path: 'tradeNameAr',
    required: false,
    editable: false,
  },
  legalType: {
    id: 'legalType',
    label: 'Legal Type',
    category: 'company',
    path: 'legalType',
    required: false,
    editable: false,
  },
  establishmentNumber: {
    id: 'establishmentNumber',
    label: 'Establishment Number',
    category: 'company',
    path: 'establishmentNumber',
    required: false,
    editable: false,
  },
  licenseNumber: {
    id: 'licenseNumber',
    label: 'License Number',
    category: 'company',
    path: 'licenseNumber',
    required: true, // Always required
    editable: false,
  },
  industry: {
    id: 'industry',
    label: 'Industry',
    category: 'company',
    path: 'industry',
    required: false,
    editable: false,
  },
  registrationDate: {
    id: 'registrationDate',
    label: 'Registration Date',
    category: 'company',
    path: 'registrationDate',
    required: false,
    editable: false,
  },
  expiryDate: {
    id: 'expiryDate',
    label: 'License Expiry Date',
    category: 'company',
    path: 'expiryDate',
    required: false,
    editable: false,
  },

  // Address
  fullAddress: {
    id: 'fullAddress',
    label: 'Full Address',
    category: 'address',
    path: 'address.fullAddress',
    required: false,
    editable: false,
  },
  street: {
    id: 'street',
    label: 'Street',
    category: 'address',
    path: 'address.street',
    required: false,
    editable: false,
  },
  area: {
    id: 'area',
    label: 'Area',
    category: 'address',
    path: 'address.area',
    required: false,
    editable: false,
  },
  city: {
    id: 'city',
    label: 'City',
    category: 'address',
    path: 'address.city',
    required: false,
    editable: false,
  },
  emirate: {
    id: 'emirate',
    label: 'Emirate',
    category: 'address',
    path: 'address.emirate',
    required: false,
    editable: false,
  },
  poBox: {
    id: 'poBox',
    label: 'PO Box',
    category: 'address',
    path: 'address.poBox',
    required: false,
    editable: false,
  },

  // Owner Information
  ownerName: {
    id: 'ownerName',
    label: 'Owner Name',
    category: 'owner',
    path: 'owner.name',
    required: false,
    editable: false,
  },
  ownerNameAr: {
    id: 'ownerNameAr',
    label: 'Owner Name (Arabic)',
    category: 'owner',
    path: 'owner.nameAr',
    required: false,
    editable: false,
  },
  ownerEmiratesId: {
    id: 'ownerEmiratesId',
    label: 'Owner Emirates ID',
    category: 'owner',
    path: 'owner.emiratesId',
    required: false,
    editable: false,
  },
  ownerPhone: {
    id: 'ownerPhone',
    label: 'Owner Phone',
    category: 'owner',
    path: 'owner.phone',
    required: false,
    editable: false,
  },
  ownerEmail: {
    id: 'ownerEmail',
    label: 'Owner Email',
    category: 'owner',
    path: 'owner.email',
    required: false,
    editable: false,
  },
  ownerRole: {
    id: 'ownerRole',
    label: 'Owner Role/Title',
    category: 'owner',
    path: 'owner.role',
    required: false,
    editable: false,
  },

  // Representative (Signing Authority)
  representedBy: {
    id: 'representedBy',
    label: 'Represented By',
    category: 'representative',
    path: 'representatives[0].name',
    required: false,
    editable: true, // Can select from available representatives
  },
  representativeDesignation: {
    id: 'representativeDesignation',
    label: 'Representative Designation',
    category: 'representative',
    path: 'representatives[0].designation',
    required: false,
    editable: false,
  },
  representativeEmiratesId: {
    id: 'representativeEmiratesId',
    label: 'Representative Emirates ID',
    category: 'representative',
    path: 'representatives[0].emiratesId',
    required: false,
    editable: false,
  },
  representativeEmail: {
    id: 'representativeEmail',
    label: 'Representative Email',
    category: 'representative',
    path: 'representatives[0].email',
    required: false,
    editable: false,
  },
  representativePhone: {
    id: 'representativePhone',
    label: 'Representative Phone',
    category: 'representative',
    path: 'representatives[0].phone',
    required: false,
    editable: false,
  },

  // Capital
  authorizedCapital: {
    id: 'authorizedCapital',
    label: 'Authorized Capital',
    category: 'capital',
    path: 'capital.authorized',
    required: false,
    editable: false,
    format: 'currency',
  },
  paidUpCapital: {
    id: 'paidUpCapital',
    label: 'Paid Up Capital',
    category: 'capital',
    path: 'capital.paidUp',
    required: false,
    editable: false,
    format: 'currency',
  },

  // Documents
  tradeLicense: {
    id: 'tradeLicense',
    label: 'Trade License Number',
    category: 'documents',
    path: 'documents.tradeLicense',
    required: false,
    editable: false,
  },
  commercialRegistration: {
    id: 'commercialRegistration',
    label: 'Commercial Registration',
    category: 'documents',
    path: 'documents.commercialRegistration',
    required: false,
    editable: false,
  },
  taxRegistration: {
    id: 'taxRegistration',
    label: 'Tax Registration (TRN)',
    category: 'documents',
    path: 'documents.taxRegistration',
    required: false,
    editable: false,
  },
};

// Field categories for grouping in UI
export const FIELD_CATEGORIES = {
  company: {
    id: 'company',
    label: 'Company Information',
    description: 'Basic company details',
    icon: 'Building2',
  },
  address: {
    id: 'address',
    label: 'Address',
    description: 'Company address information',
    icon: 'MapPin',
  },
  owner: {
    id: 'owner',
    label: 'Owner Information',
    description: 'Company owner/chairman details',
    icon: 'Crown',
  },
  representative: {
    id: 'representative',
    label: 'Representative',
    description: 'Authorized signatory details',
    icon: 'UserCheck',
  },
  capital: {
    id: 'capital',
    label: 'Capital',
    description: 'Company capital information',
    icon: 'Banknote',
  },
  documents: {
    id: 'documents',
    label: 'Documents',
    description: 'Official document numbers',
    icon: 'FileText',
  },
};

// Get fields by category
export function getFieldsByCategory(category) {
  return Object.values(ESTABLISHMENT_FIELDS).filter(f => f.category === category);
}

// Get all field IDs
export function getAllFieldIds() {
  return Object.keys(ESTABLISHMENT_FIELDS);
}

// Default fields that are always included (minimum required)
export const DEFAULT_ESTABLISHMENT_FIELDS = ['companyName', 'licenseNumber'];

// Common field presets for quick selection
export const FIELD_PRESETS = {
  minimal: {
    id: 'minimal',
    label: 'Minimal',
    description: 'Company name and license only',
    fields: ['companyName', 'licenseNumber'],
  },
  basic: {
    id: 'basic',
    label: 'Basic',
    description: 'Essential company and owner info',
    fields: ['companyName', 'licenseNumber', 'tradeName', 'ownerName', 'fullAddress'],
  },
  standard: {
    id: 'standard',
    label: 'Standard',
    description: 'Common fields for most contracts',
    fields: [
      'companyName', 'licenseNumber', 'tradeName', 'establishmentNumber',
      'ownerName', 'fullAddress', 'representedBy', 'representativeDesignation'
    ],
  },
  comprehensive: {
    id: 'comprehensive',
    label: 'Comprehensive',
    description: 'Full company profile',
    fields: [
      'companyName', 'companyNameAr', 'tradeName', 'legalType',
      'licenseNumber', 'establishmentNumber', 'industry',
      'fullAddress', 'city', 'emirate',
      'ownerName', 'ownerEmiratesId', 'ownerEmail',
      'representedBy', 'representativeDesignation', 'representativeEmiratesId',
      'authorizedCapital', 'paidUpCapital',
      'tradeLicense', 'commercialRegistration', 'taxRegistration'
    ],
  },
};

// Helper to get value from nested path
export function getValueFromPath(obj, path) {
  if (!obj || !path) return null;

  // Handle array notation like representatives[0].name
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let value = obj;

  for (const part of parts) {
    if (value === null || value === undefined) return null;
    value = value[part];
  }

  return value;
}

// Format value based on field type
export function formatFieldValue(fieldId, value) {
  const field = ESTABLISHMENT_FIELDS[fieldId];
  if (!field || value === null || value === undefined) return '-';

  if (field.format === 'currency') {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(value);
  }

  return value;
}
