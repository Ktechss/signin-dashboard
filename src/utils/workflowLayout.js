// Workflow Layout Utility
// Generates dynamic nodes and connections based on parties and signing order

import {
  NODE_DIMENSIONS,
  BASE_NODES_BEFORE,
  BASE_NODES_AFTER,
  AVAILABLE_ROLES,
  SIGNER_ICON,
} from '@/constants/workflow';

const {
  NODE_GAP,
  START_X,
  CENTER_Y,
  NODE_WIDTH,
  NODE_HEIGHT,
  SIGNER_NODE_WIDTH,
  SIGNER_NODE_HEIGHT,
  SIGNER_VERTICAL_GAP,
} = NODE_DIMENSIONS;

/**
 * Generate dynamic nodes and connections based on parties and signing order
 * @param {Array} parties - Array of signer parties
 * @param {string} signingOrder - 'sequential' or 'parallel'
 * @param {Array} signerSequence - Array of party IDs in signing order
 * @returns {{ nodes: Array, connections: Array }}
 */
export function generateWorkflowLayout(parties = [], signingOrder = 'sequential', signerSequence = []) {
  const nodes = [];
  const connections = [];

  const isParallel = signingOrder === 'parallel';

  // Order parties based on signerSequence for sequential mode
  let orderedParties = [...parties];
  if (!isParallel && signerSequence.length > 0) {
    orderedParties = signerSequence
      .map(id => parties.find(p => p.id === id))
      .filter(Boolean);
    // Add any parties not in sequence at the end
    parties.forEach(p => {
      if (!signerSequence.includes(p.id)) {
        orderedParties.push(p);
      }
    });
  }

  const signerCount = orderedParties.length || 0;

  // Calculate positions
  let currentX = START_X;

  // Add nodes before signers
  BASE_NODES_BEFORE.forEach((node) => {
    nodes.push({
      ...node,
      position: { x: currentX, y: CENTER_Y }
    });
    currentX += NODE_GAP;
  });

  // Build connections for BASE_NODES_BEFORE
  for (let i = 0; i < BASE_NODES_BEFORE.length - 1; i++) {
    connections.push({
      from: BASE_NODES_BEFORE[i].id,
      to: BASE_NODES_BEFORE[i + 1].id
    });
  }

  // Get the last node before signers (to connect to first signer or first after-node)
  const lastBeforeNode = BASE_NODES_BEFORE[BASE_NODES_BEFORE.length - 1];
  const firstAfterNode = BASE_NODES_AFTER[0];

  // Add signer nodes if there are parties
  if (signerCount > 0) {
    const signerStartX = currentX;

    if (isParallel) {
      // Parallel: All signers at same X, spread vertically
      const totalHeight = (signerCount - 1) * SIGNER_VERTICAL_GAP;
      const startY = CENTER_Y - totalHeight / 2;

      orderedParties.forEach((party, index) => {
        const signerId = `signer_${party.id || index}`;
        nodes.push({
          id: signerId,
          partyId: party.id,
          step: `S${index + 1}`,
          label: party.name || `Signer ${index + 1}`,
          icon: SIGNER_ICON,
          enableKey: null,
          isSigner: true,
          position: { x: signerStartX, y: startY + index * SIGNER_VERTICAL_GAP }
        });

        // Connect from last before-node to each signer
        connections.push({ from: lastBeforeNode.id, to: signerId });
      });

      currentX += NODE_GAP;

      // Add nodes after signers
      BASE_NODES_AFTER.forEach((node, index) => {
        nodes.push({
          ...node,
          position: { x: currentX + index * NODE_GAP, y: CENTER_Y }
        });
      });

      // Connect all signers to first after-node
      orderedParties.forEach((party, index) => {
        connections.push({ from: `signer_${party.id || index}`, to: firstAfterNode.id });
      });

    } else {
      // Sequential: Signers in a chain based on order
      orderedParties.forEach((party, index) => {
        const signerId = `signer_${party.id || index}`;
        nodes.push({
          id: signerId,
          partyId: party.id,
          step: `${index + 1}`,
          label: party.name || `Signer ${index + 1}`,
          icon: SIGNER_ICON,
          enableKey: null,
          isSigner: true,
          sequenceNumber: index + 1,
          position: { x: currentX, y: CENTER_Y }
        });

        if (index === 0) {
          // First signer connects from last before-node
          connections.push({ from: lastBeforeNode.id, to: signerId });
        } else {
          // Connect from previous signer
          const prevParty = orderedParties[index - 1];
          connections.push({ from: `signer_${prevParty.id || (index - 1)}`, to: signerId });
        }

        currentX += NODE_GAP - 40; // Slightly less gap for signers
      });

      currentX += 40; // Reset gap

      // Add nodes after signers
      BASE_NODES_AFTER.forEach((node, index) => {
        nodes.push({
          ...node,
          position: { x: currentX + index * NODE_GAP, y: CENTER_Y }
        });
      });

      // Connect last signer to first after-node
      const lastParty = orderedParties[signerCount - 1];
      connections.push({ from: `signer_${lastParty.id || (signerCount - 1)}`, to: firstAfterNode.id });
    }
  } else {
    // No signers - add after nodes and connect directly
    BASE_NODES_AFTER.forEach((node, index) => {
      nodes.push({
        ...node,
        position: { x: currentX + index * NODE_GAP, y: CENTER_Y }
      });
    });
    connections.push({ from: lastBeforeNode.id, to: firstAfterNode.id });
  }

  // Build connections for BASE_NODES_AFTER
  for (let i = 0; i < BASE_NODES_AFTER.length - 1; i++) {
    connections.push({
      from: BASE_NODES_AFTER[i].id,
      to: BASE_NODES_AFTER[i + 1].id
    });
  }

  return { nodes, connections };
}

/**
 * Get summary text for each node type
 * @param {string} nodeId - The node ID
 * @param {object} settings - The settings for this node
 * @param {boolean} isEnabled - Whether the node is enabled
 * @returns {string} Summary text
 */
export function getNodeSummary(nodeId, settings, isEnabled) {
  if (!isEnabled) return 'Disabled';

  switch (nodeId) {
    case 'approval':
      const levels = settings?.requiredApprovers || 1;
      if (levels === 1) {
        const assignee = settings?.approvalLevels?.[0];
        if (assignee?.assigneeValue) {
          return assignee.assigneeType === 'role'
            ? AVAILABLE_ROLES.find(r => r.value === assignee.assigneeValue)?.label || assignee.assigneeValue
            : assignee.assigneeValue;
        }
        return 'Not assigned';
      }
      return `${levels} levels`;

    case 'delivery':
      if (settings?.mode === 'automatic') {
        return `Auto • ${settings?.deliveryMethod || 'email'}`;
      }
      const triggerLabel = settings?.manualTriggerValue
        ? (settings?.manualTriggerType === 'role'
          ? AVAILABLE_ROLES.find(r => r.value === settings.manualTriggerValue)?.label
          : settings.manualTriggerValue)
        : 'Not assigned';
      return `Manual • ${triggerLabel}`;

    case 'signingOrder':
      return settings?.order === 'sequential' ? 'Sequential' : 'Parallel';

    case 'reminder':
      return `After ${settings?.firstReminderAfterDays || 3}d, every ${settings?.reminderIntervalDays || 2}d`;

    case 'expiration':
      return `${settings?.expiresAfterDays || 30} days`;

    case 'revoke':
      return `${settings?.allowedRoles?.length || 0} roles`;

    default:
      return '';
  }
}

/**
 * Get connection coordinates between two nodes
 * @param {string} fromId - Source node ID
 * @param {string} toId - Target node ID
 * @param {Array} nodes - Array of all nodes
 * @returns {{ startX, startY, endX, endY } | null}
 */
export function getConnectionCoords(fromId, toId, nodes) {
  const fromNode = nodes.find(n => n.id === fromId);
  const toNode = nodes.find(n => n.id === toId);
  if (!fromNode || !toNode) return null;

  const fromWidth = fromNode.isSigner ? SIGNER_NODE_WIDTH : NODE_WIDTH;
  const fromHeight = fromNode.isSigner ? SIGNER_NODE_HEIGHT : NODE_HEIGHT;
  const toHeight = toNode.isSigner ? SIGNER_NODE_HEIGHT : NODE_HEIGHT;

  return {
    startX: fromNode.position.x + fromWidth + 6,
    startY: fromNode.position.y + fromHeight / 2,
    endX: toNode.position.x - 6,
    endY: toNode.position.y + toHeight / 2,
  };
}
