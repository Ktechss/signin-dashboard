import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Clock } from 'lucide-react';

/**
 * ExpirationSettings - Configure contract validity and expiration rules
 */
export default function ExpirationSettings({ value, onChange }) {
  const handleChange = (key, val) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-6">
      {/* Enable Expiration */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <Clock className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Contract Expiration</p>
            <p className="text-xs text-slate-500">Automatically expire contracts after a period</p>
          </div>
        </div>
        <Switch
          checked={value.enabled}
          onCheckedChange={(checked) => handleChange('enabled', checked)}
        />
      </div>

      {value.enabled && (
        <div className="space-y-5 pt-2">
          {/* Expiry Period */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Expires After</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={365}
                value={value.expiresAfterDays}
                onChange={(e) => handleChange('expiresAfterDays', parseInt(e.target.value) || 1)}
                className="w-24"
              />
              <span className="text-sm text-slate-500">days from sending</span>
            </div>
            <p className="text-xs text-slate-500">
              Unsigned contracts will automatically expire after this period
            </p>
          </div>

          {/* Expiry Notification */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Expiry Warning</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Notify</span>
              <Input
                type="number"
                min={1}
                max={30}
                value={value.notifyBeforeExpiryDays}
                onChange={(e) => handleChange('notifyBeforeExpiryDays', parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <span className="text-sm text-slate-500">days before expiry</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
