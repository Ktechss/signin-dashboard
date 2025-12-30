// RevokeSettings - Revocation configuration panel

import React from 'react';
import { X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AVAILABLE_ROLES } from '@/constants/workflow';

/**
 * Revoke settings panel - configures revocation permissions
 * @param {object} settings - Current revoke settings
 * @param {function} onChange - Handler for setting changes
 */
export function RevokeSettings({ settings, onChange }) {
  const allowedRoles = settings?.allowedRoles || [];

  const handleAddRole = (role) => {
    if (!allowedRoles.includes(role)) {
      onChange('allowedRoles', [...allowedRoles, role]);
    }
  };

  const handleRemoveRole = (role) => {
    onChange('allowedRoles', allowedRoles.filter(r => r !== role));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-slate-700 mb-2 block">Who Can Revoke</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {allowedRoles.map(role => {
            const roleInfo = AVAILABLE_ROLES.find(r => r.value === role);
            return (
              <Badge key={role} variant="secondary" className="gap-1">
                {roleInfo?.label || role}
                <button
                  onClick={() => handleRemoveRole(role)}
                  className="hover:text-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
        <Select onValueChange={handleAddRole}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Add role..." />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_ROLES.filter(r => !allowedRoles.includes(r.value)).map(role => (
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
        <Switch
          checked={settings?.notifySigners ?? true}
          onCheckedChange={(c) => onChange('notifySigners', c)}
        />
      </div>
    </div>
  );
}

export default RevokeSettings;
