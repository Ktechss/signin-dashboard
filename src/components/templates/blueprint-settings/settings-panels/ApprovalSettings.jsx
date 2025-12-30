// ApprovalSettings - Approval workflow configuration panel

import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AVAILABLE_ROLES } from '@/constants/workflow';

/**
 * Approval settings panel - configures approval workflow
 * @param {object} settings - Current approval settings
 * @param {function} onChange - Handler for setting changes
 */
export function ApprovalSettings({ settings, onChange }) {
  const approvalLevels = settings?.approvalLevels || [{ level: 1, assigneeType: 'role', assigneeValue: '' }];
  const requiredApprovers = settings?.requiredApprovers || 1;

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

    // Update both at once
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
}

export default ApprovalSettings;
