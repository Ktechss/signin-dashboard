const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Read JSON file
async function readJSON(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    throw error;
  }
}

// Write JSON file
async function writeJSON(filename, data) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Templates CRUD
async function getTemplates() {
  return readJSON('templates.json');
}

async function getTemplateById(id) {
  const templates = await getTemplates();
  return templates.find(t => t.id === parseInt(id) || t.id === id);
}

async function saveTemplate(template) {
  const templates = await getTemplates();
  const now = new Date().toISOString();

  // Initialize version info for new templates
  const initialVersion = template.status === 'draft'
    ? { major: 0, minor: 1 }
    : { major: 1, minor: 0 };

  const newTemplate = {
    ...template,
    id: Date.now(),
    createdAt: now,
    usageCount: 0,
    version: `${initialVersion.major}.${initialVersion.minor}`,
    versionNumber: initialVersion,
    versionHistory: [{
      version: `${initialVersion.major}.${initialVersion.minor}`,
      versionNumber: initialVersion,
      createdAt: now,
      createdBy: template.createdBy || 'system',
      changeNote: 'Initial version',
      snapshot: createTemplateSnapshot(template),
    }],
  };
  templates.push(newTemplate);
  await writeJSON('templates.json', templates);
  return newTemplate;
}

// Create a snapshot of template data for version history
function createTemplateSnapshot(template) {
  return {
    name: template.name,
    description: template.description,
    fields: template.fields || [],
    parties: template.parties || [],
    settings: template.settings || {},
    documentUrl: template.documentUrl,
    thumbnailUrl: template.thumbnailUrl,
    documentType: template.documentType,
    fileName: template.fileName,
    numPages: template.numPages || 1,
    category: template.category,
    tags: template.tags || [],
  };
}

async function updateTemplate(id, updates, versionOptions = null) {
  const templates = await getTemplates();
  const index = templates.findIndex(t => t.id === parseInt(id) || t.id === id);
  if (index === -1) {
    return null;
  }

  const existing = templates[index];
  const now = new Date().toISOString();

  // If version options provided, create a new version
  if (versionOptions && versionOptions.versionType) {
    const currentVersion = existing.versionNumber || { major: 1, minor: 0 };
    let newVersionNumber;

    if (versionOptions.versionType === 'major') {
      newVersionNumber = { major: currentVersion.major + 1, minor: 0 };
    } else {
      // minor
      newVersionNumber = { major: currentVersion.major, minor: currentVersion.minor + 1 };
    }

    const newVersionString = `${newVersionNumber.major}.${newVersionNumber.minor}`;

    // Create snapshot of updated template
    const updatedData = { ...existing, ...updates };
    const versionEntry = {
      version: newVersionString,
      versionNumber: newVersionNumber,
      createdAt: now,
      createdBy: versionOptions.createdBy || 'system',
      changeNote: versionOptions.changeNote || '',
      snapshot: createTemplateSnapshot(updatedData),
    };

    // Add to version history
    const versionHistory = existing.versionHistory || [];
    versionHistory.push(versionEntry);

    templates[index] = {
      ...existing,
      ...updates,
      version: newVersionString,
      versionNumber: newVersionNumber,
      versionHistory,
      updatedAt: now,
    };
  } else {
    // Simple update without version bump
    templates[index] = {
      ...existing,
      ...updates,
      updatedAt: now,
    };
  }

  await writeJSON('templates.json', templates);
  return templates[index];
}

async function deleteTemplate(id) {
  const templates = await getTemplates();
  const filtered = templates.filter(t => t.id !== parseInt(id) && t.id !== id);
  await writeJSON('templates.json', filtered);
  return true;
}

// Get version history for a template
async function getVersionHistory(id) {
  const template = await getTemplateById(id);
  if (!template) {
    return null;
  }
  return template.versionHistory || [];
}

// Get specific version snapshot
async function getVersionSnapshot(id, version) {
  const template = await getTemplateById(id);
  if (!template) {
    return null;
  }

  const versionHistory = template.versionHistory || [];
  const versionEntry = versionHistory.find(v => v.version === version);

  if (!versionEntry) {
    return null;
  }

  return {
    ...versionEntry.snapshot,
    version: versionEntry.version,
    versionNumber: versionEntry.versionNumber,
    createdAt: versionEntry.createdAt,
    createdBy: versionEntry.createdBy,
    changeNote: versionEntry.changeNote,
  };
}

// Restore template to a specific version
async function restoreVersion(id, version, createdBy = 'system') {
  const templates = await getTemplates();
  const index = templates.findIndex(t => t.id === parseInt(id) || t.id === id);

  if (index === -1) {
    return null;
  }

  const template = templates[index];
  const versionHistory = template.versionHistory || [];
  const versionEntry = versionHistory.find(v => v.version === version);

  if (!versionEntry) {
    return null;
  }

  const now = new Date().toISOString();

  // Create new version from restored snapshot (as minor update)
  const currentVersion = template.versionNumber || { major: 1, minor: 0 };
  const newVersionNumber = { major: currentVersion.major, minor: currentVersion.minor + 1 };
  const newVersionString = `${newVersionNumber.major}.${newVersionNumber.minor}`;

  // Create new version entry with restored content
  const restoredEntry = {
    version: newVersionString,
    versionNumber: newVersionNumber,
    createdAt: now,
    createdBy,
    changeNote: `Restored from v${version}`,
    snapshot: { ...versionEntry.snapshot },
  };

  versionHistory.push(restoredEntry);

  // Update template with restored data
  templates[index] = {
    ...template,
    ...versionEntry.snapshot,
    id: template.id, // Keep original ID
    createdAt: template.createdAt, // Keep original creation date
    usageCount: template.usageCount, // Keep usage count
    version: newVersionString,
    versionNumber: newVersionNumber,
    versionHistory,
    updatedAt: now,
  };

  await writeJSON('templates.json', templates);
  return templates[index];
}

async function incrementTemplateUsage(id) {
  const templates = await getTemplates();
  const index = templates.findIndex(t => t.id === parseInt(id) || t.id === id);
  if (index !== -1) {
    templates[index].usageCount = (templates[index].usageCount || 0) + 1;
    await writeJSON('templates.json', templates);
    return templates[index];
  }
  return null;
}

// Contracts CRUD
async function getContracts() {
  return readJSON('contracts.json');
}

async function getContractById(id) {
  const contracts = await getContracts();
  return contracts.find(c => c.id === parseInt(id) || c.id === id);
}

async function saveContract(contract) {
  const contracts = await getContracts();
  const newContract = {
    ...contract,
    id: contract.id || Date.now(),
    createdAt: new Date().toISOString(),
  };
  contracts.push(newContract);
  await writeJSON('contracts.json', contracts);
  return newContract;
}

async function updateContract(id, updates) {
  const contracts = await getContracts();
  const index = contracts.findIndex(c => c.id === parseInt(id) || c.id === id);
  if (index !== -1) {
    contracts[index] = {
      ...contracts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await writeJSON('contracts.json', contracts);
    return contracts[index];
  }
  return null;
}

async function deleteContract(id) {
  const contracts = await getContracts();
  const filtered = contracts.filter(c => c.id !== parseInt(id) && c.id !== id);
  await writeJSON('contracts.json', filtered);
  return true;
}

// Users CRUD
async function getUsers() {
  return readJSON('users.json');
}

async function getUserById(id) {
  const users = await getUsers();
  return users.find(u => u.id === parseInt(id) || u.id === id);
}

async function saveUser(user) {
  const users = await getUsers();
  const newUser = {
    ...user,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  await writeJSON('users.json', users);
  return newUser;
}

async function updateUser(id, updates) {
  const users = await getUsers();
  const index = users.findIndex(u => u.id === parseInt(id) || u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
    await writeJSON('users.json', users);
    return users[index];
  }
  return null;
}

async function deleteUser(id) {
  const users = await getUsers();
  const filtered = users.filter(u => u.id !== parseInt(id) && u.id !== id);
  await writeJSON('users.json', filtered);
  return true;
}

// Clients CRUD
async function getClients() {
  return readJSON('clients.json');
}

async function getClientById(id) {
  const clients = await getClients();
  return clients.find(c => c.id === parseInt(id) || c.id === id);
}

async function saveClient(client) {
  const clients = await getClients();
  const newClient = {
    ...client,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  clients.push(newClient);
  await writeJSON('clients.json', clients);
  return newClient;
}

async function updateClient(id, updates) {
  const clients = await getClients();
  const index = clients.findIndex(c => c.id === parseInt(id) || c.id === id);
  if (index !== -1) {
    clients[index] = { ...clients[index], ...updates, updatedAt: new Date().toISOString() };
    await writeJSON('clients.json', clients);
    return clients[index];
  }
  return null;
}

async function deleteClient(id) {
  const clients = await getClients();
  const filtered = clients.filter(c => c.id !== parseInt(id) && c.id !== id);
  await writeJSON('clients.json', filtered);
  return true;
}

// Journeys CRUD
async function getJourneys() {
  return readJSON('journeys.json');
}

async function getJourneyById(id) {
  const journeys = await getJourneys();
  return journeys.find(j => j.id === parseInt(id) || j.id === id);
}

async function saveJourney(journey) {
  const journeys = await getJourneys();
  const newJourney = {
    ...journey,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  journeys.push(newJourney);
  await writeJSON('journeys.json', journeys);
  return newJourney;
}

async function updateJourney(id, updates) {
  const journeys = await getJourneys();
  const index = journeys.findIndex(j => j.id === parseInt(id) || j.id === id);
  if (index !== -1) {
    journeys[index] = { ...journeys[index], ...updates, updatedAt: new Date().toISOString() };
    await writeJSON('journeys.json', journeys);
    return journeys[index];
  }
  return null;
}

async function deleteJourney(id) {
  const journeys = await getJourneys();
  const filtered = journeys.filter(j => j.id !== parseInt(id) && j.id !== id);
  await writeJSON('journeys.json', filtered);
  return true;
}

module.exports = {
  // Templates
  getTemplates,
  getTemplateById,
  saveTemplate,
  updateTemplate,
  deleteTemplate,
  incrementTemplateUsage,
  // Version management
  getVersionHistory,
  getVersionSnapshot,
  restoreVersion,
  // Contracts
  getContracts,
  getContractById,
  saveContract,
  updateContract,
  deleteContract,
  // Users
  getUsers,
  getUserById,
  saveUser,
  updateUser,
  deleteUser,
  // Clients
  getClients,
  getClientById,
  saveClient,
  updateClient,
  deleteClient,
  // Journeys
  getJourneys,
  getJourneyById,
  saveJourney,
  updateJourney,
  deleteJourney,
};
