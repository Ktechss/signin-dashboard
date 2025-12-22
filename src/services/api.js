// API Service Layer for UAE KYC Dashboard
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper for making API requests
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Auth API
export const authApi = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// Dashboard API
export const dashboardApi = {
  getKpi: (clientId) => {
    const params = clientId && clientId !== 'all' ? `?clientId=${clientId}` : '';
    return request(`/dashboard/kpi${params}`);
  },
  getTrends: (clientId) => {
    const params = clientId && clientId !== 'all' ? `?clientId=${clientId}` : '';
    return request(`/dashboard/trends${params}`);
  },
  getRecentContracts: (clientId) => {
    const params = clientId && clientId !== 'all' ? `?clientId=${clientId}` : '';
    return request(`/dashboard/recent-contracts${params}`);
  },
  getRecentActivity: (clientId) => {
    const params = clientId && clientId !== 'all' ? `?clientId=${clientId}` : '';
    return request(`/dashboard/recent-activity${params}`);
  },
};

// Contracts API
export const contractsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/contracts${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/contracts/${id}`),
  create: (data) => request('/contracts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/contracts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/contracts/${id}`, { method: 'DELETE' }),
};

// Signing Requests API
export const signingRequestsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/signing-requests${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/signing-requests/${id}`),
  getByToken: (token) => request(`/signing-requests?requestToken=${token}`),
  create: (data) => request('/signing-requests', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/signing-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Templates API
export const templatesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/templates${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/templates/${id}`),
  create: (data) => request('/templates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/templates/${id}`, { method: 'DELETE' }),
};

// Users API
export const usersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/users/${id}`),
  create: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};

// API Keys API
export const apiKeysApi = {
  getAll: () => request('/api-keys'),
  create: (data) => request('/api-keys', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/api-keys/${id}`, { method: 'DELETE' }),
  revoke: (id) => request(`/api-keys/${id}/revoke`, { method: 'POST' }),
};

// Channels API
export const channelsApi = {
  getAll: () => request('/channels'),
  create: (data) => request('/channels', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/channels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/channels/${id}`, { method: 'DELETE' }),
};

// Clients API
export const clientsApi = {
  getAll: () => request('/clients'),
  getById: (id) => request(`/clients/${id}`),
};

// Audit Logs API
export const auditLogsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/audit-logs${query ? `?${query}` : ''}`);
  },
  getPlatformLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/platform-audit-logs${query ? `?${query}` : ''}`);
  },
};

// Billing API
export const billingApi = {
  getPlan: () => request('/billing/plan'),
  getUsage: () => request('/billing/usage'),
  getHistory: () => request('/billing/history'),
};

// Analytics API
export const analyticsApi = {
  getDailyStatus: (clientId) => {
    const params = clientId && clientId !== 'all' ? `?clientId=${clientId}` : '';
    return request(`/analytics/daily-status${params}`);
  },
  getDistribution: (clientId) => {
    const params = clientId && clientId !== 'all' ? `?clientId=${clientId}` : '';
    return request(`/analytics/distribution${params}`);
  },
  getByClient: () => request('/analytics/by-client'),
  getByChannel: (clientId) => {
    const params = clientId && clientId !== 'all' ? `?clientId=${clientId}` : '';
    return request(`/analytics/by-channel${params}`);
  },
  getContractStatus: (clientId) => {
    const params = clientId && clientId !== 'all' ? `?clientId=${clientId}` : '';
    return request(`/analytics/contract-status${params}`);
  },
  getDevices: (clientId) => {
    const params = clientId && clientId !== 'all' ? `?clientId=${clientId}` : '';
    return request(`/analytics/devices${params}`);
  },
  getPlatformStats: (clientId) => {
    const params = clientId && clientId !== 'all' ? `?clientId=${clientId}` : '';
    return request(`/platform-stats${params}`);
  },
};

// Settings API
export const settingsApi = {
  get: () => request('/settings'),
  update: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};

// Export all APIs
export default {
  auth: authApi,
  dashboard: dashboardApi,
  contracts: contractsApi,
  signingRequests: signingRequestsApi,
  templates: templatesApi,
  users: usersApi,
  apiKeys: apiKeysApi,
  channels: channelsApi,
  clients: clientsApi,
  auditLogs: auditLogsApi,
  billing: billingApi,
  analytics: analyticsApi,
  settings: settingsApi,
};
