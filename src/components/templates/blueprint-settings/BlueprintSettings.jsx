// BlueprintSettings - Main workflow settings component
// Modular architecture for easy maintenance and extensibility
//
// To change workflow order: edit BASE_NODES_BEFORE/BASE_NODES_AFTER in constants/workflow.js
// To add new workflow step:
//   1. Add to constants/workflow.js (WORKFLOW_STEPS, DEFAULT_BLUEPRINT_SETTINGS, BASE_NODES)
//   2. Create settings-panels/NewStepSettings.jsx
//   3. Add to settings-panels/index.js (export and SETTINGS_PANELS map)
//   4. Add case to utils/workflowLayout.js getNodeSummary()

import React, { useState, useMemo } from 'react';
import { DEFAULT_BLUEPRINT_SETTINGS } from '@/constants/workflow';
import { generateWorkflowLayout, getConnectionCoords } from '@/utils/workflowLayout';
import { useCanvasControls } from '@/hooks/useCanvasControls';
import { WorkflowCanvas } from './WorkflowCanvas';
import { WorkflowNode } from './WorkflowNode';
import { NodeConnector } from './NodeConnector';
import { SettingsSidebar } from './SettingsSidebar';

/**
 * BlueprintSettings - Canvas-based workflow settings editor
 * @param {object} settings - Current workflow settings
 * @param {function} onChange - Handler for settings changes
 * @param {Array} parties - Array of signing parties
 */
export default function BlueprintSettings({
  settings = DEFAULT_BLUEPRINT_SETTINGS,
  onChange,
  parties = [],
}) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasControls = useCanvasControls(0.9);

  // Merge with defaults to ensure all settings exist
  const mergedSettings = useMemo(() => ({
    ...DEFAULT_BLUEPRINT_SETTINGS,
    ...settings,
    approval: { ...DEFAULT_BLUEPRINT_SETTINGS.approval, ...settings?.approval },
    delivery: { ...DEFAULT_BLUEPRINT_SETTINGS.delivery, ...settings?.delivery },
    signingOrder: { ...DEFAULT_BLUEPRINT_SETTINGS.signingOrder, ...settings?.signingOrder },
    reminder: { ...DEFAULT_BLUEPRINT_SETTINGS.reminder, ...settings?.reminder },
    expiration: { ...DEFAULT_BLUEPRINT_SETTINGS.expiration, ...settings?.expiration },
    revoke: { ...DEFAULT_BLUEPRINT_SETTINGS.revoke, ...settings?.revoke },
  }), [settings]);

  // Generate dynamic workflow layout based on parties and signing order
  const { nodes: workflowNodes, connections: workflowConnections } = useMemo(() => {
    return generateWorkflowLayout(
      parties,
      mergedSettings.signingOrder?.order || 'sequential',
      mergedSettings.signingOrder?.signerSequence || []
    );
  }, [parties, mergedSettings.signingOrder?.order, mergedSettings.signingOrder?.signerSequence]);

  // Check if a node is enabled
  const isNodeEnabled = (node) => {
    if (!node.enableKey) return true;
    return mergedSettings[node.id]?.[node.enableKey] ?? false;
  };

  // Handle setting changes
  const handleSettingChange = (nodeId, keyOrUpdates, value) => {
    // Support both single key/value and object of updates
    const updates = typeof keyOrUpdates === 'object'
      ? keyOrUpdates
      : { [keyOrUpdates]: value };

    onChange?.({
      ...mergedSettings,
      [nodeId]: {
        ...mergedSettings[nodeId],
        ...updates,
      },
    });
  };

  // Toggle node enabled state
  const handleToggleEnabled = (nodeId, enableKey) => {
    const currentValue = mergedSettings[nodeId]?.[enableKey] ?? false;
    handleSettingChange(nodeId, enableKey, !currentValue);
  };

  // Get selected node data
  const selectedNodeData = selectedNode ? workflowNodes.find(n => n.id === selectedNode) : null;

  return (
    <WorkflowCanvas
      controls={canvasControls}
      isFullscreen={isFullscreen}
      onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      hasSidebar={!!selectedNode}
      nodeCount={workflowNodes.length}
      connectionCount={workflowConnections.length}
      sidebar={
        selectedNodeData && (
          <SettingsSidebar
            node={selectedNodeData}
            settings={mergedSettings[selectedNodeData.id]}
            onChange={(key, value) => handleSettingChange(selectedNodeData.id, key, value)}
            onClose={() => setSelectedNode(null)}
            isEnabled={isNodeEnabled(selectedNodeData)}
            onToggleEnabled={() => handleToggleEnabled(selectedNodeData.id, selectedNodeData.enableKey)}
            parties={parties}
          />
        )
      }
    >
      {/* SVG Connections */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: 2000, height: 400, overflow: 'visible' }}
      >
        {workflowConnections.map((conn, index) => {
          const coords = getConnectionCoords(conn.from, conn.to, workflowNodes);
          if (!coords) return null;
          return (
            <NodeConnector
              key={`${conn.from}-${conn.to}-${index}`}
              startX={coords.startX}
              startY={coords.startY}
              endX={coords.endX}
              endY={coords.endY}
            />
          );
        })}
      </svg>

      {/* Workflow Nodes */}
      {workflowNodes.map((node) => (
        <WorkflowNode
          key={node.id}
          node={node}
          settings={mergedSettings[node.id]}
          isEnabled={isNodeEnabled(node)}
          isSelected={selectedNode === node.id}
          onSelect={() => !node.isSigner && setSelectedNode(node.id)}
          style={{
            left: node.position.x,
            top: node.position.y,
          }}
        />
      ))}
    </WorkflowCanvas>
  );
}

// Re-export constants and utilities for convenience
export { DEFAULT_BLUEPRINT_SETTINGS, WORKFLOW_STEPS } from '@/constants/workflow';
