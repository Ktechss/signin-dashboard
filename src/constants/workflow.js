// Workflow Constants - Blueprint Settings
// To change workflow order: reorder items in BASE_NODES_BEFORE or BASE_NODES_AFTER
// To add new step: add to WORKFLOW_STEPS, DEFAULT_BLUEPRINT_SETTINGS, and BASE_NODES arrays

import {
  ListOrdered,
  Truck,
  ShieldCheck,
  Bell,
  Clock,
  XCircle,
  User,
} from 'lucide-react';

// Default settings values - Blueprint Workflows
export const DEFAULT_BLUEPRINT_SETTINGS = {
  approval: {
    enabled: false,
    requiredApprovers: 1,
    approvalLevels: [
      { level: 1, assignee: null, assigneeType: 'role', assigneeValue: '' },
    ],
  },
  delivery: {
    mode: 'manual',
    deliveryMethod: 'email',
    manualTriggerType: 'role',
    manualTriggerValue: '',
  },
  signingOrder: {
    order: 'sequential',
    signerSequence: [],
  },
  reminder: {
    enabled: true,
    firstReminderAfterDays: 3,
    reminderIntervalDays: 2,
    maxReminders: 5,
  },
  expiration: {
    enabled: true,
    expiresAfterDays: 30,
    notifyBeforeExpiryDays: 7,
  },
  revoke: {
    allowRevocation: true,
    allowedRoles: ['creator', 'admin'],
    notifySigners: true,
  },
};

// Workflow steps - defines available steps and their icons
// To add a new step: add entry here with id, label, and icon
export const WORKFLOW_STEPS = [
  { id: 'approval', label: 'Approval', icon: ShieldCheck },
  { id: 'delivery', label: 'Delivery', icon: Truck },
  { id: 'signingOrder', label: 'Signing Order', icon: ListOrdered },
  { id: 'reminder', label: 'Reminder', icon: Bell },
  { id: 'expiration', label: 'Expiration', icon: Clock },
  { id: 'revoke', label: 'Revoke', icon: XCircle },
];

// Available roles for assignment
export const AVAILABLE_ROLES = [
  { value: 'creator', label: 'Creator' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
];

// Layout constants for workflow canvas
export const NODE_DIMENSIONS = {
  NODE_GAP: 200,
  START_X: 50,
  CENTER_Y: 150,
  NODE_WIDTH: 160,
  NODE_HEIGHT: 70,
  SIGNER_NODE_WIDTH: 140,
  SIGNER_NODE_HEIGHT: 50,
  SIGNER_VERTICAL_GAP: 70,
};

// Base workflow nodes BEFORE signers
// To change order: reorder items in this array
// To add new step before signers: add entry here
export const BASE_NODES_BEFORE = [
  { id: 'approval', step: '3.1', label: 'Approval', icon: ShieldCheck, enableKey: 'enabled' },
  { id: 'delivery', step: '3.2', label: 'Delivery', icon: Truck, enableKey: null },
  { id: 'signingOrder', step: '3.3', label: 'Signing Order', icon: ListOrdered, enableKey: null },
];

// Base workflow nodes AFTER signers
// To change order: reorder items in this array
// To add new step after signers: add entry here
export const BASE_NODES_AFTER = [
  { id: 'reminder', step: '3.4', label: 'Reminder', icon: Bell, enableKey: 'enabled' },
  { id: 'expiration', step: '3.5', label: 'Expiration', icon: Clock, enableKey: 'enabled' },
  { id: 'revoke', step: '3.6', label: 'Revoke', icon: XCircle, enableKey: 'allowRevocation' },
];

// Signer node icon (used in workflow layout)
export const SIGNER_ICON = User;
