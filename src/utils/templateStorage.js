// Template Storage Utility - API Version
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Contract Status Constants
export const CONTRACT_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  PENDING_INTERNAL: 'pending_internal',
  INTERNAL_SIGNED: 'internal_signed',
  PENDING_SEND: 'pending_send',
  SENT: 'sent',
  PARTIALLY_SIGNED: 'partially_signed',
  COMPLETED: 'completed',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
};

// Status display configuration
export const CONTRACT_STATUS_CONFIG = {
  [CONTRACT_STATUS.DRAFT]: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
  [CONTRACT_STATUS.PENDING_APPROVAL]: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700' },
  [CONTRACT_STATUS.APPROVED]: { label: 'Approved', color: 'bg-blue-100 text-blue-700' },
  [CONTRACT_STATUS.PENDING_INTERNAL]: { label: 'Pending Internal Sign', color: 'bg-purple-100 text-purple-700' },
  [CONTRACT_STATUS.INTERNAL_SIGNED]: { label: 'Internal Signed', color: 'bg-emerald-100 text-emerald-700' },
  [CONTRACT_STATUS.PENDING_SEND]: { label: 'Ready to Send', color: 'bg-cyan-100 text-cyan-700' },
  [CONTRACT_STATUS.SENT]: { label: 'Sent', color: 'bg-blue-100 text-blue-700' },
  [CONTRACT_STATUS.PARTIALLY_SIGNED]: { label: 'Partially Signed', color: 'bg-indigo-100 text-indigo-700' },
  [CONTRACT_STATUS.COMPLETED]: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  [CONTRACT_STATUS.DECLINED]: { label: 'Declined', color: 'bg-red-100 text-red-700' },
  [CONTRACT_STATUS.EXPIRED]: { label: 'Expired', color: 'bg-orange-100 text-orange-700' },
  [CONTRACT_STATUS.REVOKED]: { label: 'Revoked', color: 'bg-red-100 text-red-700' },
};

// Helper function for API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Helper to convert base64 data URL to Blob
function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Template Management

export const saveTemplate = async (template, documentFile = null, thumbnailBlob = null) => {
  const formData = new FormData();

  // If template has documentData with base64, convert to file
  if (template.documentData?.data && !documentFile) {
    const blob = dataURLtoBlob(template.documentData.data);
    documentFile = new File([blob], template.fileName || 'document.pdf', { type: template.documentData.type });
  }

  // If template has thumbnail as base64, convert to blob
  if (template.documentData?.thumbnail && !thumbnailBlob) {
    thumbnailBlob = dataURLtoBlob(template.documentData.thumbnail);
  }

  // Remove documentData from template metadata (will be stored separately)
  const { documentData, ...templateMetadata } = template;

  formData.append('data', JSON.stringify(templateMetadata));

  if (documentFile) {
    formData.append('document', documentFile);
  }

  if (thumbnailBlob) {
    formData.append('thumbnail', thumbnailBlob, 'thumbnail.png');
  }

  const response = await fetch(`${API_BASE}/templates`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

export const getTemplates = async () => {
  return apiRequest('/templates');
};

export const getTemplateById = async (id) => {
  try {
    return await apiRequest(`/templates/${id}`);
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
};

export const updateTemplate = async (id, updates, documentFile = null, thumbnailBlob = null, versionOptions = null) => {
  // If we have new files, use FormData
  if (documentFile || thumbnailBlob || updates.documentData) {
    const formData = new FormData();

    // Handle documentData conversion
    if (updates.documentData?.data && !documentFile) {
      const blob = dataURLtoBlob(updates.documentData.data);
      documentFile = new File([blob], updates.fileName || 'document.pdf', { type: updates.documentData.type });
    }

    if (updates.documentData?.thumbnail && !thumbnailBlob) {
      thumbnailBlob = dataURLtoBlob(updates.documentData.thumbnail);
    }

    const { documentData, ...metadataUpdates } = updates;

    // Include version options in the data payload
    const dataPayload = versionOptions
      ? { ...metadataUpdates, ...versionOptions }
      : metadataUpdates;

    formData.append('data', JSON.stringify(dataPayload));

    if (documentFile) {
      formData.append('document', documentFile);
    }

    if (thumbnailBlob) {
      formData.append('thumbnail', thumbnailBlob, 'thumbnail.png');
    }

    const response = await fetch(`${API_BASE}/templates/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Simple JSON update - include version options
  const payload = versionOptions ? { ...updates, ...versionOptions } : updates;

  return apiRequest(`/templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

// Update template with version control
export const updateTemplateWithVersion = async (id, updates, versionType, changeNote = '', createdBy = 'system') => {
  const versionOptions = { versionType, changeNote, createdBy };
  return updateTemplate(id, updates, null, null, versionOptions);
};

export const deleteTemplate = async (id) => {
  return apiRequest(`/templates/${id}`, { method: 'DELETE' });
};

export const incrementTemplateUsage = async (id) => {
  return apiRequest(`/templates/${id}/increment-usage`, { method: 'POST' });
};

// Contract Management

export const saveContract = async (contract) => {
  return apiRequest('/contracts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contract),
  });
};

export const getContracts = async () => {
  return apiRequest('/contracts');
};

export const getContractById = async (id) => {
  try {
    return await apiRequest(`/contracts/${id}`);
  } catch (error) {
    console.error('Error fetching contract:', error);
    return null;
  }
};

export const updateContract = async (id, updates) => {
  return apiRequest(`/contracts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
};

export const deleteContract = async (id) => {
  return apiRequest(`/contracts/${id}`, { method: 'DELETE' });
};

// Create a contract from a blueprint
export const createContractFromBlueprint = async (blueprint, contractData) => {
  const contract = {
    ...contractData,
    blueprintId: blueprint.id,
  };

  return apiRequest('/contracts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contract),
  });
};

// Update contract status with history tracking
export const updateContractStatus = async (id, newStatus, actor = 'System', note = '') => {
  return apiRequest(`/contracts/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus, actor, note }),
  });
};

// Update signer status
export const updateSignerStatus = async (contractId, signerId, status, signature = null) => {
  return apiRequest(`/contracts/${contractId}/signers/${signerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, signature }),
  });
};

// Get contracts by status
export const getContractsByStatus = async (status) => {
  const statusParam = Array.isArray(status) ? status.join(',') : status;
  return apiRequest(`/contracts?status=${statusParam}`);
};

// Get contracts by blueprint
export const getContractsByBlueprint = async (blueprintId) => {
  return apiRequest(`/contracts?blueprintId=${blueprintId}`);
};

// Get contracts pending action by a specific user/role
export const getContractsPendingAction = async (userId, role) => {
  const contracts = await getContracts();
  return contracts.filter((contract) => {
    const pendingSigners = contract.signers?.filter((s) => s.status === 'pending') || [];
    return pendingSigners.some((signer) => {
      if (signer.email === userId) return true;
      if (role && signer.signerType === role) return true;
      return false;
    });
  });
};

// Send contract to external signers
export const sendContractToExternal = async (contractId, actor = 'System') => {
  return apiRequest(`/contracts/${contractId}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actor }),
  });
};

// Revoke a contract
export const revokeContract = async (contractId, reason, actor = 'System') => {
  return apiRequest(`/contracts/${contractId}/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, actor }),
  });
};

// Helper to get document URL (converts relative URL to full URL)
export const getDocumentUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/api')) return `${API_BASE.replace('/api', '')}${url}`;
  // Prepend /documents/ for MinIO paths (templates/..., contracts/..., etc.)
  return `${API_BASE}/documents/${url}`;
};

// Version Management

// Get version history for a template
export const getTemplateVersions = async (id) => {
  try {
    return await apiRequest(`/templates/${id}/versions`);
  } catch (error) {
    console.error('Error fetching template versions:', error);
    return [];
  }
};

// Get specific version snapshot
export const getTemplateVersion = async (id, version) => {
  try {
    return await apiRequest(`/templates/${id}/versions/${version}`);
  } catch (error) {
    console.error('Error fetching template version:', error);
    return null;
  }
};

// Restore template to a specific version
export const restoreTemplateVersion = async (id, version, createdBy = 'system') => {
  return apiRequest(`/templates/${id}/restore/${version}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ createdBy }),
  });
};

// Helper to format version string
export const formatVersion = (versionNumber) => {
  if (!versionNumber) return '1.0';
  return `${versionNumber.major}.${versionNumber.minor}`;
};

// Helper to get next version string for preview
export const getNextVersion = (currentVersion, type) => {
  const current = currentVersion || { major: 1, minor: 0 };
  if (type === 'major') {
    return { major: current.major + 1, minor: 0 };
  }
  return { major: current.major, minor: current.minor + 1 };
};

// ==========================================
// Dashboard API
// ==========================================

export const getDashboardKPI = async (clientId = null) => {
  const params = clientId ? `?clientId=${clientId}` : '';
  return apiRequest(`/dashboard/kpi${params}`);
};

export const getDashboardTrends = async (clientId = null) => {
  const params = clientId ? `?clientId=${clientId}` : '';
  return apiRequest(`/dashboard/trends${params}`);
};

export const getDashboardRecentContracts = async (clientId = null) => {
  const params = clientId ? `?clientId=${clientId}` : '';
  return apiRequest(`/dashboard/recent-contracts${params}`);
};

export const getDashboardRecentActivity = async (clientId = null) => {
  const params = clientId ? `?clientId=${clientId}` : '';
  return apiRequest(`/dashboard/recent-activity${params}`);
};

export const getPlatformStats = async () => {
  return apiRequest('/dashboard/platform-stats');
};

// ==========================================
// Analytics API
// ==========================================

export const getAnalyticsDistribution = async (clientId = null) => {
  const params = clientId ? `?clientId=${clientId}` : '';
  return apiRequest(`/analytics/distribution${params}`);
};

export const getAnalyticsByChannel = async (clientId = null) => {
  const params = clientId ? `?clientId=${clientId}` : '';
  return apiRequest(`/analytics/by-channel${params}`);
};

export const getAnalyticsByClient = async () => {
  return apiRequest('/analytics/by-client');
};

export const getAnalyticsDailyStatus = async (clientId = null) => {
  const params = clientId ? `?clientId=${clientId}` : '';
  return apiRequest(`/analytics/daily-status${params}`);
};

export const getAnalyticsContractStatus = async (clientId = null) => {
  const params = clientId ? `?clientId=${clientId}` : '';
  return apiRequest(`/analytics/contract-status${params}`);
};

export const getAnalyticsDevices = async (clientId = null) => {
  const params = clientId ? `?clientId=${clientId}` : '';
  return apiRequest(`/analytics/devices${params}`);
};

// ==========================================
// Auth API
// ==========================================

export const login = async (email, password) => {
  return apiRequest('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
};

export const logout = async () => {
  return apiRequest('/auth/logout', { method: 'POST' });
};

export const getCurrentUser = async () => {
  return apiRequest('/auth/me');
};

// ==========================================
// Users API
// ==========================================

export const getUsers = async () => {
  return apiRequest('/users');
};

export const getUserById = async (id) => {
  return apiRequest(`/users/${id}`);
};

export const createUser = async (userData) => {
  return apiRequest('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
};

export const updateUser = async (id, updates) => {
  return apiRequest(`/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
};

export const deleteUser = async (id) => {
  return apiRequest(`/users/${id}`, { method: 'DELETE' });
};

// ==========================================
// Clients API
// ==========================================

export const getClients = async () => {
  return apiRequest('/clients');
};

export const getClientById = async (id) => {
  return apiRequest(`/clients/${id}`);
};

export const createClient = async (clientData) => {
  return apiRequest('/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData),
  });
};

export const updateClient = async (id, updates) => {
  return apiRequest(`/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
};

export const deleteClient = async (id) => {
  return apiRequest(`/clients/${id}`, { method: 'DELETE' });
};

// ==========================================
// Journeys API
// ==========================================

export const getJourneys = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.clientId) params.append('clientId', filters.clientId);
  const queryString = params.toString();
  return apiRequest(`/journeys${queryString ? `?${queryString}` : ''}`);
};

export const getJourneyById = async (id) => {
  return apiRequest(`/journeys/${id}`);
};

export const createJourney = async (journeyData) => {
  return apiRequest('/journeys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(journeyData),
  });
};

export const updateJourney = async (id, updates) => {
  return apiRequest(`/journeys/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
};

export const deleteJourney = async (id) => {
  return apiRequest(`/journeys/${id}`, { method: 'DELETE' });
};
