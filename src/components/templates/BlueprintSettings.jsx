// BlueprintSettings - Re-export from modular structure
// This file maintains backward compatibility with existing imports
//
// The component has been modularized into:
// - components/templates/blueprint-settings/BlueprintSettings.jsx (main component)
// - components/templates/blueprint-settings/WorkflowCanvas.jsx
// - components/templates/blueprint-settings/WorkflowNode.jsx
// - components/templates/blueprint-settings/NodeConnector.jsx
// - components/templates/blueprint-settings/SettingsSidebar.jsx
// - components/templates/blueprint-settings/settings-panels/*.jsx
//
// Constants moved to: constants/workflow.js
// Layout utilities moved to: utils/workflowLayout.js
// Canvas hook moved to: hooks/useCanvasControls.js

// Re-export everything from the modular structure
export {
  default,
  BlueprintSettings,
  WorkflowCanvas,
  WorkflowNode,
  NodeConnector,
  SettingsSidebar,
  DEFAULT_BLUEPRINT_SETTINGS,
  WORKFLOW_STEPS,
  AVAILABLE_ROLES,
  NODE_DIMENSIONS,
  BASE_NODES_BEFORE,
  BASE_NODES_AFTER,
} from './blueprint-settings';

// Re-export settings panels
export {
  ApprovalSettings,
  DeliverySettings,
  SigningOrderSettings,
  ReminderSettings,
  ExpirationSettings,
  RevokeSettings,
  SETTINGS_PANELS,
} from './blueprint-settings/settings-panels';
