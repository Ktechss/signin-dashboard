import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, ShieldCheck } from 'lucide-react';

// Available roles for approval workflow
const AVAILABLE_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'creator', label: 'Contract Creator' },
];

/**
 * ApprovalSettings - Configure maker-checker approval workflow
 */
export default function ApprovalSettings({ value, onChange }) {
  const handleChange = (key, val) => {
    onChange({ ...value, [key]: val });
  };

  const addApproverRole = (role) => {
    if (!value.approverRoles.includes(role)) {
      handleChange('approverRoles', [...value.approverRoles, role]);
    }
  };

  const removeApproverRole = (role) => {
    handleChange('approverRoles', value.approverRoles.filter(r => r !== role));
  };

  const addSkipRole = (role) => {
    if (!value.skipApprovalForRoles.includes(role)) {
      handleChange('skipApprovalForRoles', [...value.skipApprovalForRoles, role]);
    }
  };

  const removeSkipRole = (role) => {
    handleChange('skipApprovalForRoles', value.skipApprovalForRoles.filter(r => r !== role));
  };

  return (
    <div className="space-y-6">
      {/* Enable Approval */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Maker-Checker Approval</p>
            <p className="text-xs text-slate-500">Require approval before sending to signers</p>
          </div>
        </div>
        <Switch
          checked={value.enabled}
          onCheckedChange={(checked) => handleChange('enabled', checked)}
        />
      </div>

      {value.enabled && (
        <div className="space-y-5 pt-2">
          {/* Required Approvers */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Required Approvers</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={value.requiredApprovers}
              onChange={(e) => handleChange('requiredApprovers', parseInt(e.target.value) || 1)}
              className="w-24"
            />
            <p className="text-xs text-slate-500">
              Number of approvals needed before contract can be sent
            </p>
          </div>

          {/* Approver Roles */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Who Can Approve</Label>
            <Select onValueChange={addApproverRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select roles that can approve..." />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.filter(r => !value.approverRoles.includes(r.value)).map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {value.approverRoles.map(role => {
                const roleInfo = AVAILABLE_ROLES.find(r => r.value === role);
                return (
                  <Badge key={role} variant="secondary" className="gap-1">
                    {roleInfo?.label || role}
                    <button onClick={() => removeApproverRole(role)} className="ml-1 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Skip Approval Roles */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Bypass Approval</Label>
            <p className="text-xs text-slate-500 mb-2">
              These roles can send contracts without approval
            </p>
            <Select onValueChange={addSkipRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select roles to bypass approval..." />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.filter(r => !value.skipApprovalForRoles.includes(r.value)).map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {value.skipApprovalForRoles.map(role => {
                const roleInfo = AVAILABLE_ROLES.find(r => r.value === role);
                return (
                  <Badge key={role} variant="outline" className="gap-1">
                    {roleInfo?.label || role}
                    <button onClick={() => removeSkipRole(role)} className="ml-1 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
