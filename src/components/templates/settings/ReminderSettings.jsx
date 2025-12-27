import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Bell } from 'lucide-react';

/**
 * ReminderSettings - Configure automatic reminder rules
 */
export default function ReminderSettings({ value, onChange }) {
  const handleChange = (key, val) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-6">
      {/* Enable Reminders */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <Bell className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Automatic Reminders</p>
            <p className="text-xs text-slate-500">Send reminders to signers who haven't signed</p>
          </div>
        </div>
        <Switch
          checked={value.enabled}
          onCheckedChange={(checked) => handleChange('enabled', checked)}
        />
      </div>

      {value.enabled && (
        <div className="space-y-5 pt-2">
          {/* Reminder Timing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">First Reminder After</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={value.firstReminderAfterDays}
                  onChange={(e) => handleChange('firstReminderAfterDays', parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <span className="text-sm text-slate-500">days</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Reminder Interval</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={14}
                  value={value.reminderIntervalDays}
                  onChange={(e) => handleChange('reminderIntervalDays', parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <span className="text-sm text-slate-500">days</span>
              </div>
            </div>
          </div>

          {/* Max Reminders */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Maximum Reminders</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={value.maxReminders}
              onChange={(e) => handleChange('maxReminders', parseInt(e.target.value) || 1)}
              className="w-24"
            />
            <p className="text-xs text-slate-500">
              Stop sending reminders after this count is reached
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
