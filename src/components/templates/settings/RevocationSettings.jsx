import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Ban } from 'lucide-react';

// Available roles for revocation
const AVAILABLE_ROLES = [
  { value: 'creator', label: 'Contract Creator' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
];

/**
 * RevocationSettings - Configure contract revocation rules
 */
export default function RevocationSettings({ value, onChange }) {
  const handleChange = (key, val) => {
    onChange({ ...value, [key]: val });
  };

  const addRole = (role) => {
    if (!value.allowedRoles.includes(role)) {
      handleChange('allowedRoles', [...value.allowedRoles, role]);
    }
  };

  const removeRole = (role) => {
    handleChange('allowedRoles', value.allowedRoles.filter(r => r !== role));
  };

  return (
    <div className="space-y-6">
      {/* Enable Revocation */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <Ban className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Allow Revocation</p>
            <p className="text-xs text-slate-500">Permit canceling contracts after sending</p>
          </div>
        </div>
        <Switch
          checked={value.allowRevocation}
          onCheckedChange={(checked) => handleChange('allowRevocation', checked)}
        />
      </div>

      {value.allowRevocation && (
        <div className="space-y-5 pt-2">
          {/* Who Can Revoke */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Who Can Revoke</Label>
            <Select onValueChange={addRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select roles that can revoke contracts..." />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.filter(r => !value.allowedRoles.includes(r.value)).map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {value.allowedRoles.map(role => {
                const roleInfo = AVAILABLE_ROLES.find(r => r.value === role);
                return (
                  <Badge key={role} variant="secondary" className="gap-1">
                    {roleInfo?.label || role}
                    <button onClick={() => removeRole(role)} className="ml-1 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-700">Notify Signers</p>
                <p className="text-xs text-slate-500">Send notification to signers on revocation</p>
              </div>
              <Switch
                checked={value.notifySigners}
                onCheckedChange={(checked) => handleChange('notifySigners', checked)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
