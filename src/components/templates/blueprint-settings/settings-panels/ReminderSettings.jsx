// ReminderSettings - Reminder configuration panel

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

/**
 * Reminder settings panel - configures reminder notifications
 * @param {object} settings - Current reminder settings
 * @param {function} onChange - Handler for setting changes
 */
export function ReminderSettings({ settings, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-slate-700 mb-2 block">First Reminder</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={30}
            value={settings?.firstReminderAfterDays || 3}
            onChange={(e) => onChange('firstReminderAfterDays', parseInt(e.target.value) || 1)}
            className="w-20"
          />
          <span className="text-sm text-slate-600">days after sending</span>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-slate-700 mb-2 block">Reminder Interval</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={14}
            value={settings?.reminderIntervalDays || 2}
            onChange={(e) => onChange('reminderIntervalDays', parseInt(e.target.value) || 1)}
            className="w-20"
          />
          <span className="text-sm text-slate-600">days between reminders</span>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-slate-700 mb-2 block">Maximum Reminders</Label>
        <Input
          type="number"
          min={1}
          max={20}
          value={settings?.maxReminders || 5}
          onChange={(e) => onChange('maxReminders', parseInt(e.target.value) || 1)}
          className="w-20"
        />
        <p className="text-xs text-slate-500 mt-1">Stop sending after this count</p>
      </div>
    </div>
  );
}

export default ReminderSettings;
