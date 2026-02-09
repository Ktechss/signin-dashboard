// Contract Status Constants
export const CONTRACT_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  SIGNED: 'signed',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
  REVOKED: 'revoked',
};

// Template Status Constants
export const TEMPLATE_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  PENDING_POLICY_APPROVAL: 'pending_policy_approval',
  POLICY_REJECTED: 'policy_rejected',
};

// Signer Status Constants
export const SIGNER_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  VIEWED: 'viewed',
  SIGNED: 'signed',
  DECLINED: 'declined',
  EXPIRED: 'expired',
};

// Verification Status Constants
export const VERIFICATION_STATUS = {
  NOT_STARTED: 'not_started',
  PENDING: 'pending',
  VERIFIED: 'verified',
  FAILED: 'failed',
  AUTHORISED: 'authorised',
  REJECTED: 'rejected',
};

// Priority Levels
export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// Status Color Configuration - Used by StatusBadge and other components
export const STATUS_COLORS = {
  // Contract statuses
  signed: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  completed: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  in_progress: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  failed: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', dot: 'bg-slate-700' },
  expired: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  cancelled: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
  revoked: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', dot: 'bg-slate-700' },

  // Journey/Verification statuses
  authorised: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  rejected: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', dot: 'bg-slate-700' },
  verified: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  not_started: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },

  // Template statuses
  draft: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
  active: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  archived: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  pending_policy_approval: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  policy_rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },

  // Signer statuses
  sent: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  viewed: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  declined: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', dot: 'bg-slate-700' },

  // Priority
  high: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', dot: 'bg-slate-700' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  low: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
};

// Helper to get status color config with fallback
export function getStatusColors(status) {
  const normalizedStatus = status?.toLowerCase()?.replace(/\s+/g, '_');
  return STATUS_COLORS[normalizedStatus] || STATUS_COLORS.pending;
}

// Status display labels
export const STATUS_LABELS = {
  draft: 'Draft',
  pending: 'Pending',
  in_progress: 'In Progress',
  signed: 'Signed',
  completed: 'Completed',
  expired: 'Expired',
  cancelled: 'Cancelled',
  failed: 'Failed',
  revoked: 'Revoked',
  active: 'Active',
  archived: 'Archived',
  pending_policy_approval: 'Pending Approval',
  policy_rejected: 'Policy Rejected',
  sent: 'Sent',
  viewed: 'Viewed',
  declined: 'Declined',
  verified: 'Verified',
  not_started: 'Not Started',
  authorised: 'Authorised',
  rejected: 'Rejected',
};

// Get display label for status
export function getStatusLabel(status) {
  const normalizedStatus = status?.toLowerCase()?.replace(/\s+/g, '_');
  return STATUS_LABELS[normalizedStatus] || status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
