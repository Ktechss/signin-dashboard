// WorkflowNode - Clickable workflow step card
// Displays a workflow node with icon, label, and status

import React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import { NODE_DIMENSIONS } from '@/constants/workflow';
import { getNodeSummary } from '@/utils/workflowLayout';

const { NODE_WIDTH, SIGNER_NODE_WIDTH } = NODE_DIMENSIONS;

/**
 * Signer node variant - smaller, blue styling
 */
function SignerNode({ node, style }) {
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

/**
 * WorkflowNode - Clickable workflow step card
 * @param {object} node - Node data (id, label, icon, step, etc.)
 * @param {object} settings - Settings for this node
 * @param {boolean} isEnabled - Whether the node is enabled
 * @param {boolean} isSelected - Whether the node is currently selected
 * @param {function} onSelect - Click handler
 * @param {object} style - Position styles (left, top)
 */
export function WorkflowNode({ node, settings, isEnabled, isSelected, onSelect, style }) {
  const Icon = node.icon;
  const isSigner = node.isSigner;
  const summary = isSigner ? null : getNodeSummary(node.id, settings, isEnabled);

  // Render signer variant
  if (isSigner) {
    return <SignerNode node={node} style={style} />;
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

export default WorkflowNode;
