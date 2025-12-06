// Template Storage Utility
const TEMPLATES_KEY = 'templates';
const CONTRACTS_KEY = 'contracts';

// Template Management
export const saveTemplate = (template) => {
  const templates = getTemplates();
  const newTemplate = {
    ...template,
    id: Date.now(),
    createdAt: new Date().toISOString(),
    usageCount: 0,
  };
  templates.push(newTemplate);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  return newTemplate;
};

export const getTemplates = () => {
  const stored = localStorage.getItem(TEMPLATES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getTemplateById = (id) => {
  const templates = getTemplates();
  return templates.find(t => t.id === parseInt(id));
};

export const updateTemplate = (id, updates) => {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === parseInt(id));
  if (index !== -1) {
    templates[index] = { ...templates[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    return templates[index];
  }
  return null;
};

export const deleteTemplate = (id) => {
  const templates = getTemplates();
  const filtered = templates.filter(t => t.id !== parseInt(id));
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
};

export const incrementTemplateUsage = (id) => {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === parseInt(id));
  if (index !== -1) {
    templates[index].usageCount = (templates[index].usageCount || 0) + 1;
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  }
};

// Contract Management
export const saveContract = (contract) => {
  const contracts = getContracts();
  const newContract = {
    ...contract,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  contracts.push(newContract);
  localStorage.setItem(CONTRACTS_KEY, JSON.stringify(contracts));
  return newContract;
};

export const getContracts = () => {
  const stored = localStorage.getItem(CONTRACTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getContractById = (id) => {
  const contracts = getContracts();
  return contracts.find(c => c.id === parseInt(id));
};

export const updateContract = (id, updates) => {
  const contracts = getContracts();
  const index = contracts.findIndex(c => c.id === parseInt(id));
  if (index !== -1) {
    contracts[index] = { ...contracts[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(CONTRACTS_KEY, JSON.stringify(contracts));
    return contracts[index];
  }
  return null;
};

export const deleteContract = (id) => {
  const contracts = getContracts();
  const filtered = contracts.filter(c => c.id !== parseInt(id));
  localStorage.setItem(CONTRACTS_KEY, JSON.stringify(filtered));
};
