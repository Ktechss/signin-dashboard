// ExpirationSettings - Expiration configuration panel

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

/**
 * Expiration settings panel - configures contract expiration
 * @param {object} settings - Current expiration settings
 * @param {function} onChange - Handler for setting changes
 */
export function ExpirationSettings({ settings, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-slate-700 mb-2 block">Contract Expires After</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={365}
            value={settings?.expiresAfterDays || 30}
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
            value={settings?.notifyBeforeExpiryDays || 7}
            onChange={(e) => onChange('notifyBeforeExpiryDays', parseInt(e.target.value) || 1)}
            className="w-20"
          />
          <span className="text-sm text-slate-600">days before</span>
        </div>
      </div>
    </div>
  );
}

export default ExpirationSettings;
