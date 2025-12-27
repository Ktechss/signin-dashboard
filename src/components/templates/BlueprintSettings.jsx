import React, { useState, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  ListOrdered,
  Truck,
  ShieldCheck,
  Bell,
  Clock,
  XCircle,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  User,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';

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
    manualTriggerType: 'role', // 'role' or 'user'
    manualTriggerValue: '',    // role value or user email
  },
  signingOrder: {
    order: 'sequential',
    signerSequence: [], // Array of party IDs in signing order
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

// Workflow steps order for tracking
export const WORKFLOW_STEPS = [
  { id: 'approval', label: 'Approval', icon: ShieldCheck },
  { id: 'delivery', label: 'Delivery', icon: Truck },
  { id: 'signingOrder', label: 'Signing Order', icon: ListOrdered },
  { id: 'reminder', label: 'Reminder', icon: Bell },
  { id: 'expiration', label: 'Expiration', icon: Clock },
  { id: 'revoke', label: 'Revoke', icon: XCircle },
];

// Available roles
const AVAILABLE_ROLES = [
  { value: 'creator', label: 'Creator' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
];

// Layout constants
const NODE_GAP = 200;
const START_X = 50;
const CENTER_Y = 150;
const NODE_WIDTH = 160;
const NODE_HEIGHT = 70;
const SIGNER_NODE_WIDTH = 140;
const SIGNER_NODE_HEIGHT = 50;
const SIGNER_VERTICAL_GAP = 70;

// Base workflow nodes (before signingOrder)
const BASE_NODES_BEFORE = [
  { id: 'approval', step: '3.1', label: 'Approval', icon: ShieldCheck, enableKey: 'enabled' },
  { id: 'delivery', step: '3.2', label: 'Delivery', icon: Truck, enableKey: null },
  { id: 'signingOrder', step: '3.3', label: 'Signing Order', icon: ListOrdered, enableKey: null },
];

// Base workflow nodes (after signers)
const BASE_NODES_AFTER = [
  { id: 'reminder', step: '3.4', label: 'Reminder', icon: Bell, enableKey: 'enabled' },
  { id: 'expiration', step: '3.5', label: 'Expiration', icon: Clock, enableKey: 'enabled' },
  { id: 'revoke', step: '3.6', label: 'Revoke', icon: XCircle, enableKey: 'allowRevocation' },
];

/**
 * Generate dynamic nodes and connections based on parties and signing order
 */
function generateWorkflowLayout(parties = [], signingOrder = 'sequential', signerSequence = []) {
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

  // Connection: approval -> delivery -> signingOrder
  connections.push({ from: 'approval', to: 'delivery' });
  connections.push({ from: 'delivery', to: 'signingOrder' });

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
          icon: User,
          enableKey: null,
          isSigner: true,
          position: { x: signerStartX, y: startY + index * SIGNER_VERTICAL_GAP }
        });

        // Connect from signingOrder to each signer
        connections.push({ from: 'signingOrder', to: signerId });
      });

      currentX += NODE_GAP;

      // Add nodes after signers
      BASE_NODES_AFTER.forEach((node, index) => {
        nodes.push({
          ...node,
          position: { x: currentX + index * NODE_GAP, y: CENTER_Y }
        });
      });

      // Connect all signers to reminder (first node after)
      orderedParties.forEach((party, index) => {
        connections.push({ from: `signer_${party.id || index}`, to: 'reminder' });
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
          icon: User,
          enableKey: null,
          isSigner: true,
          sequenceNumber: index + 1,
          position: { x: currentX, y: CENTER_Y }
        });

        if (index === 0) {
          // First signer connects from signingOrder
          connections.push({ from: 'signingOrder', to: signerId });
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

      // Connect last signer to reminder
      const lastParty = orderedParties[signerCount - 1];
      connections.push({ from: `signer_${lastParty.id || (signerCount - 1)}`, to: 'reminder' });
    }
  } else {
    // No signers - connect directly
    BASE_NODES_AFTER.forEach((node, index) => {
      nodes.push({
        ...node,
        position: { x: currentX + index * NODE_GAP, y: CENTER_Y }
      });
    });
    connections.push({ from: 'signingOrder', to: 'reminder' });
  }

  // Connections between post-signer nodes
  connections.push({ from: 'reminder', to: 'expiration' });
  connections.push({ from: 'expiration', to: 'revoke' });

  return { nodes, connections };
}

/**
 * SVG Connector with bezier curve and animated dot
 */
function NodeConnector({ startX, startY, endX, endY }) {
  const controlOffset = Math.min(Math.abs(endX - startX) * 0.5, 80);

  const path = `
    M ${startX} ${startY}
    C ${startX + controlOffset} ${startY},
      ${endX - controlOffset} ${endY},
      ${endX} ${endY}
  `;

  return (
    <g>
      {/* Main line */}
      <path
        d={path}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Animated dot */}
      <circle r="4" fill="#64748b">
        <animateMotion
          dur="3s"
          repeatCount="indefinite"
          path={path}
        />
      </circle>
    </g>
  );
}

/**
 * Get summary text for each node
 */
function getNodeSummary(nodeId, settings, isEnabled) {
  if (!isEnabled) return 'Disabled';

  switch (nodeId) {
    case 'approval':
      const levels = settings.requiredApprovers || 1;
      if (levels === 1) {
        const assignee = settings.approvalLevels?.[0];
        if (assignee?.assigneeValue) {
          return assignee.assigneeType === 'role'
            ? AVAILABLE_ROLES.find(r => r.value === assignee.assigneeValue)?.label || assignee.assigneeValue
            : assignee.assigneeValue;
        }
        return 'Not assigned';
      }
      return `${levels} levels`;
    case 'delivery':
      if (settings.mode === 'automatic') {
        return `Auto • ${settings.deliveryMethod}`;
      }
      // Manual mode - show who triggers
      const triggerLabel = settings.manualTriggerValue
        ? (settings.manualTriggerType === 'role'
          ? AVAILABLE_ROLES.find(r => r.value === settings.manualTriggerValue)?.label
          : settings.manualTriggerValue)
        : 'Not assigned';
      return `Manual • ${triggerLabel}`;
    case 'signingOrder':
      return settings.order === 'sequential' ? 'Sequential' : 'Parallel';
    case 'reminder':
      return `After ${settings.firstReminderAfterDays}d, every ${settings.reminderIntervalDays}d`;
    case 'expiration':
      return `${settings.expiresAfterDays} days`;
    case 'revoke':
      return `${settings.allowedRoles?.length || 0} roles`;
    default:
      return '';
  }
}

/**
 * WorkflowNode - Simple node card (click to open sidebar)
 */
function WorkflowNode({ node, settings, isEnabled, isSelected, onSelect, style }) {
  const Icon = node.icon;
  const isSigner = node.isSigner;
  const summary = isSigner ? null : getNodeSummary(node.id, settings, isEnabled);

  // Signer nodes are smaller and styled differently
  if (isSigner) {
    return (
      <div
        className={cn(
          'absolute select-none rounded-lg border-2 transition-all duration-200 shadow-sm',
          'bg-blue-50 border-blue-200 hover:shadow-md hover:border-blue-300'
        )}
        style={{
          ...style,
          width: SIGNER_NODE_WIDTH,
        }}
      >
        <div className="p-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-[8px] font-bold text-blue-400">{node.step}</span>
                <h3 className="text-blue-900 font-medium text-[11px] truncate">{node.label}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Points */}
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-300 bg-white" />
        </div>
        <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-300 bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        'absolute cursor-pointer select-none rounded-xl border-2 transition-all duration-200 shadow-sm',
        'bg-white hover:shadow-md',
        isEnabled ? 'border-slate-200' : 'border-slate-100 opacity-50',
        isSelected && 'ring-2 ring-slate-900 border-slate-300 shadow-lg'
      )}
      style={{
        ...style,
        width: NODE_WIDTH,
      }}
    >
      <div className="p-3">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0',
            isEnabled ? 'bg-slate-900' : 'bg-slate-300'
          )}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-slate-400">{node.step}</span>
              <h3 className="text-slate-900 font-medium text-xs truncate">{node.label}</h3>
            </div>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{summary}</p>
          </div>
        </div>
      </div>

      {/* Connection Points */}
      <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-3 h-3 rounded-full border-2 border-slate-300 bg-white hover:border-slate-500 hover:scale-125 transition-all" />
      </div>
      <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
        <div className="w-3 h-3 rounded-full border-2 border-slate-300 bg-white hover:border-slate-500 hover:scale-125 transition-all" />
      </div>
    </div>
  );
}

/**
 * Settings Sidebar - Shows detailed settings for selected node
 */
function SettingsSidebar({ node, settings, onChange, onClose, isEnabled, onToggleEnabled, parties }) {
  const Icon = node.icon;

  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-white border-l border-slate-200 shadow-lg z-20 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            isEnabled ? 'bg-slate-900' : 'bg-slate-300'
          )}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400">{node.step}</span>
              <h3 className="font-semibold text-slate-900">{node.label}</h3>
            </div>
            <p className="text-xs text-slate-500">Configure settings</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Enable Toggle */}
      {node.enableKey && (
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Enable {node.label}</span>
          <Switch
            checked={isEnabled}
            onCheckedChange={onToggleEnabled}
          />
        </div>
      )}

      {/* Settings Content */}
      <div className={cn(
        'flex-1 overflow-y-auto p-4',
        !isEnabled && node.enableKey && 'opacity-50 pointer-events-none'
      )}>
        {renderSidebarSettings(node.id, settings, onChange, parties)}
      </div>
    </div>
  );
}

/**
 * Render detailed settings for sidebar
 */
function renderSidebarSettings(nodeId, settings, onChange, parties = []) {
  switch (nodeId) {
    case 'approval':
      const approvalLevels = settings.approvalLevels || [{ level: 1, assigneeType: 'role', assigneeValue: '' }];
      const requiredApprovers = settings.requiredApprovers || 1;

      const handleApproverCountChange = (e) => {
        const count = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));

        // Adjust approval levels array
        const currentLevels = [...approvalLevels];
        if (count > currentLevels.length) {
          for (let i = currentLevels.length + 1; i <= count; i++) {
            currentLevels.push({ level: i, assigneeType: 'role', assigneeValue: '' });
          }
        } else if (count < currentLevels.length) {
          currentLevels.splice(count);
        }

        // Update both at once to avoid race condition
        onChange({
          requiredApprovers: count,
          approvalLevels: currentLevels
        });
      };

      const handleLevelAssigneeChange = (levelIndex, type, value) => {
        const newLevels = [...approvalLevels];
        newLevels[levelIndex] = {
          ...newLevels[levelIndex],
          assigneeType: type,
          assigneeValue: value
        };
        onChange('approvalLevels', newLevels);
      };

      return (
        <div className="space-y-4">
          {/* Number of Approvers */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Number of Approvers</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={requiredApprovers}
              onChange={handleApproverCountChange}
              className="w-24"
            />
            <p className="text-xs text-slate-500 mt-1">
              {requiredApprovers === 1
                ? 'Single approver handles the contract'
                : `${requiredApprovers} levels of approval required`}
            </p>
          </div>

          {/* Single Approver - Simple Selection */}
          {requiredApprovers === 1 && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <Label className="text-sm font-medium text-slate-700 mb-3 block">Assign Approver</Label>

              {/* Type Toggle */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => handleLevelAssigneeChange(0, 'role', '')}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors',
                    approvalLevels[0]?.assigneeType === 'role'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  )}
                >
                  By Role
                </button>
                <button
                  onClick={() => handleLevelAssigneeChange(0, 'user', '')}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors',
                    approvalLevels[0]?.assigneeType === 'user'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  )}
                >
                  By User
                </button>
              </div>

              {approvalLevels[0]?.assigneeType === 'role' ? (
                <Select
                  value={approvalLevels[0]?.assigneeValue || ''}
                  onValueChange={(val) => handleLevelAssigneeChange(0, 'role', val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Enter user email..."
                  value={approvalLevels[0]?.assigneeValue || ''}
                  onChange={(e) => handleLevelAssigneeChange(0, 'user', e.target.value)}
                />
              )}
            </div>
          )}

          {/* Multi-Level Approvers */}
          {requiredApprovers > 1 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">Approval Levels</Label>

              {approvalLevels.slice(0, requiredApprovers).map((level, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                      L{index + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700">Level {index + 1}</span>
                  </div>

                  {/* Type Toggle */}
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => handleLevelAssigneeChange(index, 'role', '')}
                      className={cn(
                        'px-2 py-1 text-[10px] font-medium rounded border transition-colors',
                        level.assigneeType === 'role'
                          ? 'bg-slate-700 text-white border-slate-700'
                          : 'bg-white text-slate-500 border-slate-200'
                      )}
                    >
                      Role
                    </button>
                    <button
                      onClick={() => handleLevelAssigneeChange(index, 'user', '')}
                      className={cn(
                        'px-2 py-1 text-[10px] font-medium rounded border transition-colors',
                        level.assigneeType === 'user'
                          ? 'bg-slate-700 text-white border-slate-700'
                          : 'bg-white text-slate-500 border-slate-200'
                      )}
                    >
                      User
                    </button>
                  </div>

                  {level.assigneeType === 'role' ? (
                    <Select
                      value={level.assigneeValue || ''}
                      onValueChange={(val) => handleLevelAssigneeChange(index, 'role', val)}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select role..." />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ROLES.map(role => (
                          <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="Enter user email..."
                      value={level.assigneeValue || ''}
                      onChange={(e) => handleLevelAssigneeChange(index, 'user', e.target.value)}
                      className="h-8 text-xs"
                    />
                  )}
                </div>
              ))}

              {/* Flow Indicator */}
              <div className="pt-2 border-t border-slate-100 mt-3">
                <p className="text-xs text-slate-400">
                  Approval Flow: {Array.from({ length: requiredApprovers }, (_, i) => `L${i + 1}`).join(' → ')}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Each level must approve before moving to the next.
                </p>
              </div>
            </div>
          )}
        </div>
      );

    case 'delivery':
      const handleTriggerChange = (type, value) => {
        onChange({
          manualTriggerType: type,
          manualTriggerValue: value
        });
      };

      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Delivery Mode</Label>
            <RadioGroup value={settings.mode} onValueChange={(val) => onChange('mode', val)} className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <RadioGroupItem value="manual" />
                <div>
                  <span className="text-sm font-medium text-slate-700">Manual</span>
                  <p className="text-xs text-slate-500">Send contracts manually when ready</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <RadioGroupItem value="automatic" />
                <div>
                  <span className="text-sm font-medium text-slate-700">Automatic</span>
                  <p className="text-xs text-slate-500">Send automatically after creation</p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {/* Manual Trigger Assignment - Only show for Manual mode */}
          {settings.mode === 'manual' && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <Label className="text-sm font-medium text-slate-700 mb-3 block">Who Can Trigger Send?</Label>

              {/* Type Toggle */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => handleTriggerChange('role', '')}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors',
                    settings.manualTriggerType === 'role'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  )}
                >
                  By Role
                </button>
                <button
                  onClick={() => handleTriggerChange('user', '')}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors',
                    settings.manualTriggerType === 'user'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  )}
                >
                  By User
                </button>
              </div>

              {settings.manualTriggerType === 'role' ? (
                <Select
                  value={settings.manualTriggerValue || ''}
                  onValueChange={(val) => onChange('manualTriggerValue', val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Enter user email..."
                  value={settings.manualTriggerValue || ''}
                  onChange={(e) => onChange('manualTriggerValue', e.target.value)}
                />
              )}

              <p className="text-xs text-slate-500 mt-2">
                This person/role will be responsible for sending the contract.
              </p>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Delivery Method</Label>
            <Select value={settings.deliveryMethod} onValueChange={(val) => onChange('deliveryMethod', val)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="both">Email & SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      );

    case 'signingOrder':
      // Get current sequence or default to parties order
      const currentSequence = settings.signerSequence || [];
      const orderedSigners = currentSequence.length > 0
        ? currentSequence.map(id => parties.find(p => p.id === id)).filter(Boolean)
        : [...parties];

      // Add any parties not in sequence
      parties.forEach(p => {
        if (!orderedSigners.find(s => s.id === p.id)) {
          orderedSigners.push(p);
        }
      });

      const moveSignerUp = (index) => {
        if (index <= 0) return;
        const newOrder = [...orderedSigners];
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        onChange('signerSequence', newOrder.map(s => s.id));
      };

      const moveSignerDown = (index) => {
        if (index >= orderedSigners.length - 1) return;
        const newOrder = [...orderedSigners];
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        onChange('signerSequence', newOrder.map(s => s.id));
      };

      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Signing Sequence</Label>
            <RadioGroup value={settings.order} onValueChange={(val) => onChange('order', val)} className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <RadioGroupItem value="sequential" />
                <div>
                  <span className="text-sm font-medium text-slate-700">Sequential</span>
                  <p className="text-xs text-slate-500">Signers sign one after another in order</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <RadioGroupItem value="parallel" />
                <div>
                  <span className="text-sm font-medium text-slate-700">Parallel</span>
                  <p className="text-xs text-slate-500">All signers can sign simultaneously</p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {/* Signer Order - Only show for Sequential */}
          {settings.order === 'sequential' && parties.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Signing Order</Label>
              <p className="text-xs text-slate-500 mb-2">Drag or use arrows to reorder signers</p>

              <div className="space-y-2">
                {orderedSigners.map((signer, index) => (
                  <div
                    key={signer.id}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="text-slate-400">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{signer.name}</p>
                      {signer.email && (
                        <p className="text-[10px] text-slate-500 truncate">{signer.email}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveSignerUp(index)}
                        disabled={index === 0}
                        className={cn(
                          'p-0.5 rounded hover:bg-slate-200 transition-colors',
                          index === 0 ? 'opacity-30 cursor-not-allowed' : ''
                        )}
                      >
                        <ChevronUp className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => moveSignerDown(index)}
                        disabled={index === orderedSigners.length - 1}
                        className={cn(
                          'p-0.5 rounded hover:bg-slate-200 transition-colors',
                          index === orderedSigners.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                        )}
                      >
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {orderedSigners.length > 1 && (
                <div className="pt-2 border-t border-slate-100 mt-3">
                  <p className="text-xs text-slate-400">
                    Signing Flow: {orderedSigners.map((s, i) => s.name || `Signer ${i + 1}`).join(' → ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {settings.order === 'sequential' && parties.length === 0 && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-700">
                Add signers in the Signature Placement step to configure signing order.
              </p>
            </div>
          )}
        </div>
      );

    case 'reminder':
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">First Reminder</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={30}
                value={settings.firstReminderAfterDays}
                onChange={(e) => onChange('firstReminderAfterDays', parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <span className="text-sm text-slate-600">days after sending</span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Reminder Interval</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={14}
                value={settings.reminderIntervalDays}
                onChange={(e) => onChange('reminderIntervalDays', parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <span className="text-sm text-slate-600">days between reminders</span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Maximum Reminders</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={settings.maxReminders}
              onChange={(e) => onChange('maxReminders', parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <p className="text-xs text-slate-500 mt-1">Stop sending after this count</p>
          </div>
        </div>
      );

    case 'expiration':
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Contract Expires After</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={365}
                value={settings.expiresAfterDays}
                onChange={(e) => onChange('expiresAfterDays', parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <span className="text-sm text-slate-600">days from sending</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Unsigned contracts will expire automatically</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Expiry Warning</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Notify</span>
              <Input
                type="number"
                min={1}
                max={30}
                value={settings.notifyBeforeExpiryDays}
                onChange={(e) => onChange('notifyBeforeExpiryDays', parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <span className="text-sm text-slate-600">days before</span>
            </div>
          </div>
        </div>
      );

    case 'revoke':
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Who Can Revoke</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {settings.allowedRoles?.map(role => {
                const roleInfo = AVAILABLE_ROLES.find(r => r.value === role);
                return (
                  <Badge key={role} variant="secondary" className="gap-1">
                    {roleInfo?.label || role}
                    <button
                      onClick={() => onChange('allowedRoles', settings.allowedRoles.filter(r => r !== role))}
                      className="hover:text-slate-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
            <Select
              onValueChange={(role) => {
                if (!settings.allowedRoles?.includes(role)) {
                  onChange('allowedRoles', [...(settings.allowedRoles || []), role]);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Add role..." />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.filter(r => !settings.allowedRoles?.includes(r.value)).map(role => (
                  <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-medium text-slate-700">Notify signers</p>
              <p className="text-xs text-slate-500">Inform signers when contract is revoked</p>
            </div>
            <Switch checked={settings.notifySigners} onCheckedChange={(c) => onChange('notifySigners', c)} />
          </div>
        </div>
      );

    default:
      return null;
  }
}

/**
 * BlueprintSettings - Canvas with clickable nodes and settings sidebar
 */
export default function BlueprintSettings({
  settings = DEFAULT_BLUEPRINT_SETTINGS,
  onChange,
  parties = [],
}) {
  const [zoom, setZoom] = useState(0.9);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  // Zoom limits
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2;
  const ZOOM_STEP = 0.1;

  // Merge with defaults
  const mergedSettings = {
    ...DEFAULT_BLUEPRINT_SETTINGS,
    ...settings,
    approval: { ...DEFAULT_BLUEPRINT_SETTINGS.approval, ...settings?.approval },
    delivery: { ...DEFAULT_BLUEPRINT_SETTINGS.delivery, ...settings?.delivery },
    signingOrder: { ...DEFAULT_BLUEPRINT_SETTINGS.signingOrder, ...settings?.signingOrder },
    reminder: { ...DEFAULT_BLUEPRINT_SETTINGS.reminder, ...settings?.reminder },
    expiration: { ...DEFAULT_BLUEPRINT_SETTINGS.expiration, ...settings?.expiration },
    revoke: { ...DEFAULT_BLUEPRINT_SETTINGS.revoke, ...settings?.revoke },
  };

  // Generate dynamic workflow layout based on parties and signing order
  const { nodes: workflowNodes, connections: workflowConnections } = useMemo(() => {
    return generateWorkflowLayout(
      parties,
      mergedSettings.signingOrder?.order || 'sequential',
      mergedSettings.signingOrder?.signerSequence || []
    );
  }, [parties, mergedSettings.signingOrder?.order, mergedSettings.signingOrder?.signerSequence]);

  const isNodeEnabled = (node) => {
    if (!node.enableKey) return true;
    return mergedSettings[node.id]?.[node.enableKey] ?? false;
  };

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

  const handleToggleEnabled = (nodeId, enableKey) => {
    const currentValue = mergedSettings[nodeId]?.[enableKey] ?? false;
    handleSettingChange(nodeId, enableKey, !currentValue);
  };

  // Get connection coordinates based on dynamic nodes
  const getConnectionCoords = useCallback((fromId, toId) => {
    const fromNode = workflowNodes.find(n => n.id === fromId);
    const toNode = workflowNodes.find(n => n.id === toId);
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
  }, [workflowNodes]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(0.9);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
    }
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback((e) => {
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-bg')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const selectedNodeData = selectedNode ? workflowNodes.find(n => n.id === selectedNode) : null;

  return (
    <div
      className={cn(
        'relative bg-slate-50 overflow-hidden transition-all w-full h-full',
        isFullscreen ? 'fixed inset-0 z-50' : 'rounded-lg border border-slate-200'
      )}
    >
      {/* Dot Grid Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3">
        {/* Left - Title */}
        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Workflow Settings</h2>
          <p className="text-[10px] text-slate-500">Click on a node to configure</p>
        </div>

        {/* Right - Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm p-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="px-2 py-1 text-xs text-slate-600 font-mono min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-slate-300" />

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            onClick={handleResetView}
            title="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className={cn(
          'absolute inset-0 pt-16 canvas-bg',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
          selectedNode && 'pr-80'
        )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Transform container */}
        <div
          className="absolute"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            left: '50%',
            top: '50%',
            marginLeft: selectedNode ? -700 : -600,
            marginTop: -80,
          }}
        >
          {/* SVG Connections */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: 2000, height: 400, overflow: 'visible' }}
          >
            {workflowConnections.map((conn, index) => {
              const coords = getConnectionCoords(conn.from, conn.to);
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

          {/* Nodes */}
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
        </div>
      </div>

      {/* Settings Sidebar */}
      {selectedNodeData && (
        <SettingsSidebar
          node={selectedNodeData}
          settings={mergedSettings[selectedNodeData.id]}
          onChange={(key, value) => handleSettingChange(selectedNodeData.id, key, value)}
          onClose={() => setSelectedNode(null)}
          isEnabled={isNodeEnabled(selectedNodeData)}
          onToggleEnabled={() => handleToggleEnabled(selectedNodeData.id, selectedNodeData.enableKey)}
          parties={parties}
        />
      )}

      {/* Bottom Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-9 bg-white/90 backdrop-blur-sm border-t border-slate-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-600">Ready</span>
          </div>
          <div className="text-xs text-slate-500">
            {workflowNodes.length} nodes • {workflowConnections.length} connections
          </div>
        </div>
        <div className="text-xs text-slate-500">
          Ctrl + Scroll to zoom • Drag to pan
        </div>
      </div>
    </div>
  );
}
