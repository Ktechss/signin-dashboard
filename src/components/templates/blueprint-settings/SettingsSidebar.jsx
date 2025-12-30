// SettingsSidebar - Right panel for workflow node settings
// Displays the appropriate settings panel based on selected node

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { SETTINGS_PANELS } from './settings-panels';

/**
 * Settings Sidebar - Shows detailed settings for selected workflow node
 * @param {object} node - Selected node data
 * @param {object} settings - Current settings for this node
 * @param {function} onChange - Handler for setting changes (key, value) or (updates object)
 * @param {function} onClose - Handler to close sidebar
 * @param {boolean} isEnabled - Whether the node is enabled
 * @param {function} onToggleEnabled - Handler to toggle enabled state
 * @param {Array} parties - Array of signing parties (for signingOrder panel)
 */
export function SettingsSidebar({
  node,
  settings,
  onChange,
  onClose,
  isEnabled,
  onToggleEnabled,
  parties = [],
}) {
  const Icon = node.icon;
  const SettingsPanel = SETTINGS_PANELS[node.id];

  // Handle both single key/value and object updates
  const handleChange = (keyOrUpdates, value) => {
    if (typeof keyOrUpdates === 'object') {
      // Object of updates passed directly
      onChange(keyOrUpdates);
    } else {
      // Single key/value pair
      onChange(keyOrUpdates, value);
    }
  };

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

      {/* Enable Toggle - only show if node has enableKey */}
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
        {SettingsPanel && (
          <SettingsPanel
            settings={settings}
            onChange={handleChange}
            parties={parties}
          />
        )}
      </div>
    </div>
  );
}

export default SettingsSidebar;
