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
import { Lock, History, Shield, AlertTriangle } from 'lucide-react';

/**
 * TemplateLockSettings - Configure template locking and version control
 */
export default function TemplateLockSettings({ value, onChange }) {
  const handleChange = (key, val) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-6">
      {/* Lock After Activation */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <Lock className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Lock After Activation</p>
            <p className="text-xs text-slate-500">Prevent modifications once blueprint is activated</p>
          </div>
        </div>
        <Switch
          checked={value.lockOnActivation}
          onCheckedChange={(checked) => handleChange('lockOnActivation', checked)}
        />
      </div>

      {value.lockOnActivation && (
        <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Important</p>
              <p className="text-xs text-amber-700 mt-1">
                When locked, any changes will create a new version. Existing contracts will continue using their original blueprint version.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Version Control */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-600" />
          <Label className="text-sm font-medium">Version Control</Label>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-slate-700">Auto Version on Changes</p>
            <p className="text-xs text-slate-500">Automatically increment version when changes are saved</p>
          </div>
          <Switch
            checked={value.autoVersion}
            onCheckedChange={(checked) => handleChange('autoVersion', checked)}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-slate-700">Keep Version History</p>
            <p className="text-xs text-slate-500">Maintain history of all blueprint versions</p>
          </div>
          <Switch
            checked={value.keepHistory}
            onCheckedChange={(checked) => handleChange('keepHistory', checked)}
          />
        </div>

        {value.keepHistory && (
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Max Versions to Keep</Label>
            <Select
              value={value.maxVersions?.toString() || '10'}
              onValueChange={(val) => handleChange('maxVersions', parseInt(val))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 versions</SelectItem>
                <SelectItem value="10">10 versions</SelectItem>
                <SelectItem value="20">20 versions</SelectItem>
                <SelectItem value="50">50 versions</SelectItem>
                <SelectItem value="0">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Access Control */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-600" />
          <Label className="text-sm font-medium">Access Control</Label>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-slate-700">Restrict Editing</p>
            <p className="text-xs text-slate-500">Only admins can modify this blueprint</p>
          </div>
          <Switch
            checked={value.restrictEditing}
            onCheckedChange={(checked) => handleChange('restrictEditing', checked)}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-slate-700">Require Approval for Changes</p>
            <p className="text-xs text-slate-500">Changes need approval before taking effect</p>
          </div>
          <Switch
            checked={value.requireApprovalForChanges}
            onCheckedChange={(checked) => handleChange('requireApprovalForChanges', checked)}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-slate-700">Prevent Deletion</p>
            <p className="text-xs text-slate-500">Blueprint cannot be deleted while contracts exist</p>
          </div>
          <Switch
            checked={value.preventDeletion}
            onCheckedChange={(checked) => handleChange('preventDeletion', checked)}
          />
        </div>
      </div>

      {/* Audit */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-slate-700">Log All Changes</p>
            <p className="text-xs text-slate-500">Track who made what changes and when</p>
          </div>
          <Switch
            checked={value.logChanges}
            onCheckedChange={(checked) => handleChange('logChanges', checked)}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-slate-700">Notify on Changes</p>
            <p className="text-xs text-slate-500">Send notification when blueprint is modified</p>
          </div>
          <Switch
            checked={value.notifyOnChanges}
            onCheckedChange={(checked) => handleChange('notifyOnChanges', checked)}
          />
        </div>

        {value.notifyOnChanges && (
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Notification Email</Label>
            <Input
              type="email"
              value={value.notificationEmail || ''}
              onChange={(e) => handleChange('notificationEmail', e.target.value)}
              placeholder="admin@company.com"
            />
          </div>
        )}
      </div>
    </div>
  );
}
