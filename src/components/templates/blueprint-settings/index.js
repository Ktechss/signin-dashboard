// Blueprint Settings Module Exports
//
// ARCHITECTURE:
// - BlueprintSettings.jsx: Main component (entry point)
// - WorkflowCanvas.jsx: Zoomable/pannable canvas
// - WorkflowNode.jsx: Individual workflow step node
// - NodeConnector.jsx: SVG bezier curve connector
// - SettingsSidebar.jsx: Right panel for node settings
// - settings-panels/: Individual settings panels for each workflow step
//
// TO ADD A NEW WORKFLOW STEP:
// 1. Edit constants/workflow.js:
//    - Add to WORKFLOW_STEPS array
//    - Add default settings to DEFAULT_BLUEPRINT_SETTINGS
//    - Add to BASE_NODES_BEFORE or BASE_NODES_AFTER array
// 2. Create settings-panels/NewStepSettings.jsx
// 3. Export from settings-panels/index.js and add to SETTINGS_PANELS map
// 4. Add case to utils/workflowLayout.js getNodeSummary()
//
// TO CHANGE WORKFLOW ORDER:
// Edit BASE_NODES_BEFORE or BASE_NODES_AFTER in constants/workflow.js

// Main component
export { default } from './BlueprintSettings';
export { default as BlueprintSettings } from './BlueprintSettings';

// Sub-components (can be used independently)
export { WorkflowCanvas } from './WorkflowCanvas';
export { WorkflowNode } from './WorkflowNode';
export { NodeConnector } from './NodeConnector';
export { SettingsSidebar } from './SettingsSidebar';

// Settings panels
export * from './settings-panels';

// Re-export constants for convenience
export {
  DEFAULT_BLUEPRINT_SETTINGS,
  WORKFLOW_STEPS,
  AVAILABLE_ROLES,
  NODE_DIMENSIONS,
  BASE_NODES_BEFORE,
  BASE_NODES_AFTER,
} from '@/constants/workflow';
