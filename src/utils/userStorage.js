// User Storage Utility
const USERS_KEY = 'users';
const ROOT_USER_KEY = 'rootUser';
const API_KEYS_KEY = 'apiKeys';
const AUDIT_LOGS_KEY = 'auditLogs';
const CHANNELS_KEY = 'channels';
const SETTINGS_KEY = 'appSettings';
const CURRENT_USER_KEY = 'currentUser';

// Default permissions (all false for new users)
const DEFAULT_PERMISSIONS = {
  dashboard: true,
  signings: false,
  quickSign: false,
  signatureRequest: false,
  bluePrints: false,
  apiKeys: false,
  auditLogs: false,
  billing: false,
};

// Password Generator
export const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// API Key Generator
export const generateApiKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'sk_live_';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

// ==================== USER MANAGEMENT ====================

// Get all users (excluding root user)
export const getUsers = () => {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save new user
export const saveUser = (user) => {
  const users = getUsers();
  const newUser = {
    ...user,
    id: Date.now(),
    password: generatePassword(),
    status: 'active',
    permissions: user.permissions || DEFAULT_PERMISSIONS,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActive: 'Never',
  };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Log the action
  logAction('user_created', newUser.id, newUser.name, `Created user: ${newUser.email}`);

  return newUser;
};

// Get user by ID
export const getUserById = (id) => {
  const users = getUsers();
  return users.find(u => u.id === parseInt(id));
};

// Update user
export const updateUser = (id, updates) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === parseInt(id));
  if (index !== -1) {
    const oldUser = users[index];
    users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Log the action
    logAction('user_updated', users[index].id, users[index].name, `Updated user: ${users[index].email}`);

    return users[index];
  }
  return null;
};

// Delete user
export const deleteUser = (id) => {
  const users = getUsers();
  const user = users.find(u => u.id === parseInt(id));
  const filtered = users.filter(u => u.id !== parseInt(id));
  localStorage.setItem(USERS_KEY, JSON.stringify(filtered));

  if (user) {
    logAction('user_deleted', id, user.name, `Deleted user: ${user.email}`);
  }
};

// Update user status
export const updateUserStatus = (id, status) => {
  return updateUser(id, { status });
};

// ==================== ROOT USER MANAGEMENT ====================

// Get root user
export const getRootUser = () => {
  const stored = localStorage.getItem(ROOT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

// Set/Update root user
export const setRootUser = (user) => {
  const existingRoot = getRootUser();
  const rootUser = {
    ...user,
    id: existingRoot?.id || Date.now(),
    isRootUser: true,
    status: 'active',
    permissions: {
      dashboard: true,
      signings: true,
      quickSign: true,
      signatureRequest: true,
      bluePrints: true,
      apiKeys: true,
      auditLogs: true,
      billing: true,
    },
    createdAt: existingRoot?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(ROOT_USER_KEY, JSON.stringify(rootUser));

  logAction('root_user_updated', rootUser.id, rootUser.name, 'Root user information updated');

  return rootUser;
};

// ==================== API KEY MANAGEMENT ====================

// Get all API keys
export const getApiKeys = () => {
  const stored = localStorage.getItem(API_KEYS_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save new API key
export const saveApiKey = (name) => {
  const apiKeys = getApiKeys();
  const newKey = {
    id: Date.now(),
    name,
    key: generateApiKey(),
    status: 'active',
    createdAt: new Date().toISOString(),
    lastUsed: null,
  };
  apiKeys.push(newKey);
  localStorage.setItem(API_KEYS_KEY, JSON.stringify(apiKeys));

  logAction('api_key_created', newKey.id, 'System', `Created API key: ${name}`);

  return newKey;
};

// Revoke API key
export const revokeApiKey = (id) => {
  const apiKeys = getApiKeys();
  const index = apiKeys.findIndex(k => k.id === parseInt(id));
  if (index !== -1) {
    apiKeys[index].status = 'revoked';
    apiKeys[index].revokedAt = new Date().toISOString();
    localStorage.setItem(API_KEYS_KEY, JSON.stringify(apiKeys));

    logAction('api_key_revoked', id, 'System', `Revoked API key: ${apiKeys[index].name}`);

    return apiKeys[index];
  }
  return null;
};

// Delete API key
export const deleteApiKey = (id) => {
  const apiKeys = getApiKeys();
  const key = apiKeys.find(k => k.id === parseInt(id));
  const filtered = apiKeys.filter(k => k.id !== parseInt(id));
  localStorage.setItem(API_KEYS_KEY, JSON.stringify(filtered));

  if (key) {
    logAction('api_key_deleted', id, 'System', `Deleted API key: ${key.name}`);
  }
};

// ==================== AUDIT LOG MANAGEMENT ====================

// Get all audit logs
export const getAuditLogs = () => {
  const stored = localStorage.getItem(AUDIT_LOGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Log an action
export const logAction = (action, resourceId, userName, details) => {
  const logs = getAuditLogs();
  const newLog = {
    id: Date.now(),
    action,
    resourceId,
    userName,
    details,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog); // Add to beginning for newest first

  // Keep only last 500 logs
  const trimmedLogs = logs.slice(0, 500);
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(trimmedLogs));

  return newLog;
};

// Get filtered audit logs
export const getFilteredAuditLogs = (filters = {}) => {
  let logs = getAuditLogs();

  if (filters.action && filters.action !== 'all') {
    logs = logs.filter(log => log.action === filters.action);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    logs = logs.filter(log =>
      log.userName.toLowerCase().includes(searchLower) ||
      log.details.toLowerCase().includes(searchLower)
    );
  }

  if (filters.dateRange && filters.dateRange !== 'all') {
    const now = new Date();
    let startDate;

    switch (filters.dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = null;
    }

    if (startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= startDate);
    }
  }

  return logs;
};

// ==================== UTILITY FUNCTIONS ====================

// Mask API key for display
export const maskApiKey = (key) => {
  if (!key || key.length < 12) return '***';
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
};

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get permission label
export const getPermissionLabel = (key) => {
  const labels = {
    dashboard: 'Dashboard',
    signings: 'Signings',
    quickSign: 'Quick Sign',
    signatureRequest: 'Signature Request',
    bluePrints: 'BluePrints',
    apiKeys: 'API Keys',
    auditLogs: 'Audit Logs',
    billing: 'Billing',
  };
  return labels[key] || key;
};

// ==================== CHANNELS MANAGEMENT ====================

// Default channels
const DEFAULT_CHANNELS = [
  { id: 1, name: 'Loan', code: 'LOAN', description: 'Loan application processing', status: 'active', createdAt: new Date().toISOString() },
  { id: 2, name: 'Credit Card', code: 'CC', description: 'Credit card applications', status: 'active', createdAt: new Date().toISOString() },
  { id: 3, name: 'Account Opening', code: 'ACCT', description: 'New account opening', status: 'active', createdAt: new Date().toISOString() },
];

// Get all channels
export const getChannels = () => {
  const stored = localStorage.getItem(CHANNELS_KEY);
  if (!stored) {
    // Initialize with default channels
    localStorage.setItem(CHANNELS_KEY, JSON.stringify(DEFAULT_CHANNELS));
    return DEFAULT_CHANNELS;
  }
  return JSON.parse(stored);
};

// Save new channel
export const saveChannel = (channel) => {
  const channels = getChannels();
  const newChannel = {
    ...channel,
    id: Date.now(),
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  channels.push(newChannel);
  localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));

  logAction('channel_created', newChannel.id, 'System', `Created channel: ${newChannel.name}`);

  return newChannel;
};

// Update channel
export const updateChannel = (id, updates) => {
  const channels = getChannels();
  const index = channels.findIndex(c => c.id === parseInt(id));
  if (index !== -1) {
    channels[index] = { ...channels[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));

    logAction('channel_updated', id, 'System', `Updated channel: ${channels[index].name}`);

    return channels[index];
  }
  return null;
};

// Delete channel
export const deleteChannel = (id) => {
  const channels = getChannels();
  const channel = channels.find(c => c.id === parseInt(id));
  const filtered = channels.filter(c => c.id !== parseInt(id));
  localStorage.setItem(CHANNELS_KEY, JSON.stringify(filtered));

  if (channel) {
    logAction('channel_deleted', id, 'System', `Deleted channel: ${channel.name}`);
  }
};

// ==================== APP SETTINGS MANAGEMENT ====================

// Default app settings
const DEFAULT_SETTINGS = {
  allowNonRegisteredOnboarding: false,
  requireEmailVerification: true,
  requirePhoneVerification: false,
  sessionTimeout: 30, // minutes
};

// Get app settings
export const getAppSettings = () => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  return JSON.parse(stored);
};

// Update app settings
export const updateAppSettings = (updates) => {
  const settings = getAppSettings();
  const newSettings = { ...settings, ...updates };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));

  logAction('settings_updated', null, 'System', 'App settings updated');

  return newSettings;
};

// ==================== ENHANCED API KEY MANAGEMENT ====================

// Save API key with channel linking
export const saveApiKeyWithChannel = (name, channelIds = []) => {
  const apiKeys = getApiKeys();
  const newKey = {
    id: Date.now(),
    name,
    key: generateApiKey(),
    status: 'active',
    channelIds: channelIds,
    createdAt: new Date().toISOString(),
    lastUsed: null,
  };
  apiKeys.push(newKey);
  localStorage.setItem(API_KEYS_KEY, JSON.stringify(apiKeys));

  const channels = getChannels();
  const channelNames = channelIds.map(id => channels.find(c => c.id === id)?.name || id).join(', ');
  logAction('api_key_created', newKey.id, 'System', `Created API key: ${name}${channelIds.length > 0 ? ` (Channels: ${channelNames})` : ''}`);

  return newKey;
};

// Update API key channel linking
export const updateApiKeyChannels = (id, channelIds) => {
  const apiKeys = getApiKeys();
  const index = apiKeys.findIndex(k => k.id === parseInt(id));
  if (index !== -1) {
    apiKeys[index].channelIds = channelIds;
    localStorage.setItem(API_KEYS_KEY, JSON.stringify(apiKeys));

    const channels = getChannels();
    const channelNames = channelIds.map(id => channels.find(c => c.id === id)?.name || id).join(', ');
    logAction('api_key_updated', id, 'System', `Updated API key channels: ${apiKeys[index].name} (${channelNames})`);

    return apiKeys[index];
  }
  return null;
};

// ==================== AUTHENTICATION ====================

// Mock admin credentials - always works
const MOCK_ADMIN = {
  id: 1,
  email: 'admin@signflow.com',
  password: 'admin123',
  name: 'Admin User',
  role: 'root',
  isRootUser: true,
  status: 'active',
  permissions: {
    dashboard: true,
    signings: true,
    quickSign: true,
    signatureRequest: true,
    bluePrints: true,
    apiKeys: true,
    auditLogs: true,
    billing: true,
    userManagement: true,
    settings: true,
  },
  createdAt: new Date().toISOString(),
};

// Mock staff user for demo
const MOCK_STAFF = {
  id: 2,
  email: 'staff@signflow.com',
  password: 'staff123',
  name: 'Staff User',
  role: 'staff',
  isRootUser: false,
  status: 'active',
  permissions: {
    dashboard: true,
    signings: true,
    quickSign: false,
    signatureRequest: false,
    bluePrints: true,
    apiKeys: false,
    auditLogs: false,
    billing: false,
    userManagement: false,
    settings: false,
  },
  createdAt: new Date().toISOString(),
};

// Mock client users - each tied to a specific client/organization
const MOCK_CLIENT_USERS = [
  {
    id: 101,
    email: 'admin@adcb.ae',
    password: 'adcb123',
    name: 'Ahmed Khan',
    role: 'client_admin',
    isRootUser: false,
    clientId: 1,
    client: { id: 1, name: 'ADCB Bank', abbr: 'AD' },
    status: 'active',
    permissions: {
      dashboard: true,
      signings: true,
      quickSign: true,
      signatureRequest: true,
      bluePrints: true,
      apiKeys: true,
      auditLogs: true,
      billing: true,
      userManagement: true,
      settings: true,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 102,
    email: 'admin@enbd.ae',
    password: 'enbd123',
    name: 'Sara Mohammed',
    role: 'client_admin',
    isRootUser: false,
    clientId: 2,
    client: { id: 2, name: 'Emirates NBD', abbr: 'EN' },
    status: 'active',
    permissions: {
      dashboard: true,
      signings: true,
      quickSign: true,
      signatureRequest: true,
      bluePrints: true,
      apiKeys: true,
      auditLogs: true,
      billing: true,
      userManagement: true,
      settings: true,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 103,
    email: 'admin@fab.ae',
    password: 'fab123',
    name: 'Mariam Khalid',
    role: 'client_admin',
    isRootUser: false,
    clientId: 3,
    client: { id: 3, name: 'First Abu Dhabi Bank', abbr: 'FA' },
    status: 'active',
    permissions: {
      dashboard: true,
      signings: true,
      quickSign: true,
      signatureRequest: true,
      bluePrints: true,
      apiKeys: true,
      auditLogs: true,
      billing: true,
      userManagement: true,
      settings: true,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 104,
    email: 'admin@mashreq.ae',
    password: 'mashreq123',
    name: 'Layla Ahmed',
    role: 'client_admin',
    isRootUser: false,
    clientId: 4,
    client: { id: 4, name: 'Mashreq Bank', abbr: 'MB' },
    status: 'active',
    permissions: {
      dashboard: true,
      signings: true,
      quickSign: true,
      signatureRequest: true,
      bluePrints: true,
      apiKeys: true,
      auditLogs: true,
      billing: true,
      userManagement: true,
      settings: true,
    },
    createdAt: new Date().toISOString(),
  },
];

// Initialize root user if not exists
export const initializeRootUser = () => {
  return MOCK_ADMIN;
};

// Login function
export const login = (email, password) => {
  // Check mock admin first (platform admin)
  if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
    const sessionUser = {
      ...MOCK_ADMIN,
      lastLogin: new Date().toISOString(),
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
    // Clear any selected client for admin login
    localStorage.removeItem('selectedClient');
    logAction('user_login', MOCK_ADMIN.id, MOCK_ADMIN.name, 'Root user logged in');
    return { success: true, user: sessionUser };
  }

  // Check mock staff user
  if (email === MOCK_STAFF.email && password === MOCK_STAFF.password) {
    const sessionUser = {
      ...MOCK_STAFF,
      lastLogin: new Date().toISOString(),
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
    // Clear any selected client for staff login
    localStorage.removeItem('selectedClient');
    logAction('user_login', MOCK_STAFF.id, MOCK_STAFF.name, 'Staff user logged in');
    return { success: true, user: sessionUser };
  }

  // Check mock client users
  const clientUser = MOCK_CLIENT_USERS.find(u => u.email === email && u.password === password);
  if (clientUser) {
    const sessionUser = {
      ...clientUser,
      lastLogin: new Date().toISOString(),
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
    // Set the client for this user automatically
    localStorage.setItem('selectedClient', JSON.stringify(clientUser.client));
    logAction('user_login', clientUser.id, clientUser.name, `Client admin logged in (${clientUser.client.name})`);
    return { success: true, user: sessionUser, client: clientUser.client };
  }

  // Check staff users from localStorage
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    if (user.status !== 'active') {
      return { success: false, error: 'Your account is inactive. Please contact administrator.' };
    }
    const sessionUser = {
      ...user,
      role: 'staff',
      isRootUser: false,
      lastLogin: new Date().toISOString(),
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));

    // Update last active
    updateUser(user.id, { lastActive: new Date().toISOString() });
    logAction('user_login', user.id, user.name, 'Staff user logged in');

    return { success: true, user: sessionUser };
  }

  return { success: false, error: 'Invalid email or password' };
};

// Logout function
export const logout = () => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    logAction('user_logout', currentUser.id, currentUser.name, `${currentUser.role === 'root' ? 'Root' : 'Staff'} user logged out`);
  }
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Get current logged-in user
export const getCurrentUser = () => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

// Check if current user is root/admin
export const isRootUser = () => {
  const user = getCurrentUser();
  return user?.isRootUser === true || user?.role === 'root';
};

// Check if user has permission
export const hasPermission = (permission) => {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.isRootUser || user.role === 'root') return true;
  return user.permissions?.[permission] === true;
};

// Get user initials for avatar
export const getUserInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};
