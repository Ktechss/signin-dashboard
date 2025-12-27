import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Hand, Zap } from 'lucide-react';

/**
 * SenderSettings - Configure how contracts are sent to signers
 */
export default function SenderSettings({ value, onChange }) {
  const handleChange = (key, val) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-6">
      {/* Send Mode */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Send Mode</Label>
        <RadioGroup
          value={value.mode}
          onValueChange={(val) => handleChange('mode', val)}
          className="space-y-3"
        >
          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <RadioGroupItem value="manual" id="manual" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Hand className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-sm">Manual</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                User manually triggers sending to signers after contract creation
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <RadioGroupItem value="auto" id="auto" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-sm">Automatic</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Contracts are automatically sent to signers upon creation or approval
              </p>
            </div>
          </label>
        </RadioGroup>
      </div>

      {/* Options */}
      <div className="space-y-4 pt-2">
        <Label className="text-sm font-medium">Options</Label>

        {value.mode === 'auto' && (
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-700">Auto-send on Creation</p>
              <p className="text-xs text-slate-500">Send immediately when contract is created</p>
            </div>
            <Switch
              checked={value.autoSendOnCreation}
              onCheckedChange={(checked) => handleChange('autoSendOnCreation', checked)}
            />
          </div>
        )}

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-slate-700">Send Copy to Creator</p>
            <p className="text-xs text-slate-500">CC the contract creator on all email communications</p>
          </div>
          <Switch
            checked={value.sendCopyToCreator}
            onCheckedChange={(checked) => handleChange('sendCopyToCreator', checked)}
          />
        </div>
      </div>
    </div>
  );
}
