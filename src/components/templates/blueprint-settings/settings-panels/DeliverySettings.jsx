// DeliverySettings - Delivery mode configuration panel

import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AVAILABLE_ROLES } from '@/constants/workflow';

/**
 * Delivery settings panel - configures delivery mode
 * @param {object} settings - Current delivery settings
 * @param {function} onChange - Handler for setting changes
 */
export function DeliverySettings({ settings, onChange }) {
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
        <RadioGroup
          value={settings?.mode || 'manual'}
          onValueChange={(val) => onChange('mode', val)}
          className="space-y-2"
        >
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
      {settings?.mode === 'manual' && (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <Label className="text-sm font-medium text-slate-700 mb-3 block">Who Can Trigger Send?</Label>

          {/* Type Toggle */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => handleTriggerChange('role', '')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors',
                settings?.manualTriggerType === 'role'
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
                settings?.manualTriggerType === 'user'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}
            >
              By User
            </button>
          </div>

          {settings?.manualTriggerType === 'role' ? (
            <Select
              value={settings?.manualTriggerValue || ''}
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
              value={settings?.manualTriggerValue || ''}
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
        <Select
          value={settings?.deliveryMethod || 'email'}
          onValueChange={(val) => onChange('deliveryMethod', val)}
        >
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
}

export default DeliverySettings;
