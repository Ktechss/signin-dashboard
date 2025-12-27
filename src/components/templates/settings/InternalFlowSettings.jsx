import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Send, Users, UserCheck, ArrowRight } from 'lucide-react';

/**
 * InternalFlowSettings - Configure internal signing and approval flow
 *
 * This handles the workflow:
 * 1. Approvers review the contract
 * 2. Internal signers sign on behalf of company
 * 3. Then contract is sent to external signers
 */
export default function InternalFlowSettings({ value, onChange }) {
  const handleChange = (key, val) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-6">
      {/* Enable Internal Flow */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <Building2 className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Internal Signing Flow</p>
            <p className="text-xs text-slate-500">Enable internal review and signing before external</p>
          </div>
        </div>
        <Switch
          checked={value.enabled}
          onCheckedChange={(checked) => handleChange('enabled', checked)}
        />
      </div>

      {value.enabled && (
        <>
          {/* Flow Visualization */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-medium text-blue-800 mb-3">Signing Flow Order</p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                <UserCheck className="w-3.5 h-3.5" />
                Approvers
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400" />
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                <Building2 className="w-3.5 h-3.5" />
                Internal Signers
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400" />
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                <Users className="w-3.5 h-3.5" />
                External Signers
              </div>
            </div>
          </div>

          {/* After Internal Signing Actions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">After Internal Signing Completes</Label>
            <RadioGroup
              value={value.afterInternalSigning}
              onValueChange={(val) => handleChange('afterInternalSigning', val)}
              className="space-y-3"
            >
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="auto_send" id="auto_send" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-sm">Auto-send to External Signers</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Automatically send to external signers after all internal signatures are collected
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="manual_trigger" id="manual_trigger" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-sm">Manual Trigger Required</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Require authorized user to manually send to external signers
                  </p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {/* Manual Trigger Options */}
          {value.afterInternalSigning === 'manual_trigger' && (
            <div className="space-y-4 pl-4 border-l-2 border-slate-200">
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Who Can Trigger Send</Label>
                <Select
                  value={value.sendTriggerRole}
                  onValueChange={(val) => handleChange('sendTriggerRole', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract_creator">Contract Creator</SelectItem>
                    <SelectItem value="last_internal_signer">Last Internal Signer</SelectItem>
                    <SelectItem value="any_internal_signer">Any Internal Signer</SelectItem>
                    <SelectItem value="admin">Admin Only</SelectItem>
                    <SelectItem value="specific_role">Specific Role (HR, Manager, etc.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {value.sendTriggerRole === 'specific_role' && (
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Role Name</Label>
                  <Input
                    value={value.specificSendRole || ''}
                    onChange={(e) => handleChange('specificSendRole', e.target.value)}
                    placeholder="e.g., HR Manager"
                  />
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          <div className="space-y-4 pt-2">
            <Label className="text-sm font-medium">Notifications</Label>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-700">Notify Creator on Internal Completion</p>
                <p className="text-xs text-slate-500">Send email when all internal signatures are collected</p>
              </div>
              <Switch
                checked={value.notifyOnInternalComplete}
                onCheckedChange={(checked) => handleChange('notifyOnInternalComplete', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-700">Notify Internal Signers on Approval</p>
                <p className="text-xs text-slate-500">Alert internal signers when approvers approve</p>
              </div>
              <Switch
                checked={value.notifyInternalOnApproval}
                onCheckedChange={(checked) => handleChange('notifyInternalOnApproval', checked)}
              />
            </div>
          </div>

          {/* Deadline Settings */}
          <div className="space-y-4 pt-2">
            <Label className="text-sm font-medium">Deadlines</Label>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-700">Set Internal Signing Deadline</p>
                <p className="text-xs text-slate-500">Require internal signatures within timeframe</p>
              </div>
              <Switch
                checked={value.internalDeadlineEnabled}
                onCheckedChange={(checked) => handleChange('internalDeadlineEnabled', checked)}
              />
            </div>

            {value.internalDeadlineEnabled && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={value.internalDeadlineDays || 3}
                  onChange={(e) => handleChange('internalDeadlineDays', parseInt(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-slate-500">days to complete internal signing</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
