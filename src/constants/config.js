// Application Configuration Constants

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
};

// Date format patterns
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy h:mm a',
  ISO: 'yyyy-MM-dd',
  TIME_ONLY: 'h:mm a',
  RELATIVE: 'relative', // for "2 days ago" style
};

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_TYPES: ['application/pdf', 'image/png', 'image/jpeg'],
  ALLOWED_EXTENSIONS: ['.pdf', '.png', '.jpg', '.jpeg'],
};

// Signer types
export const SIGNER_TYPES = {
  INTERNAL: 'internal',
  EXTERNAL: 'external',
};

// Field types for document templates
export const FIELD_TYPES = {
  SIGNATURE: 'signature',
  TEXT: 'text',
  DATE: 'date',
  INITIAL: 'initial',
  CHECKBOX: 'checkbox',
};

// Signing order modes
export const SIGNING_ORDER = {
  SEQUENTIAL: 'sequential',
  PARALLEL: 'parallel',
};

// Delivery modes
export const DELIVERY_MODES = {
  MANUAL: 'manual',
  AUTO: 'auto',
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer',
};

// Chart colors for analytics
export const CHART_COLORS = {
  primary: '#0891b2', // cyan-600
  secondary: '#6366f1', // indigo-500
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  muted: '#64748b', // slate-500
  palette: [
    '#0891b2', // cyan
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#f59e0b', // amber
    '#10b981', // emerald
    '#ef4444', // red
  ],
};

// API response codes
export const API_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

// Local storage keys
export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
};

// Toast/notification durations (ms)
export const TOAST_DURATION = {
  SHORT: 3000,
  DEFAULT: 5000,
  LONG: 8000,
};
