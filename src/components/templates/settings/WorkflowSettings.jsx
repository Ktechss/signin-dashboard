import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowRight, Users } from 'lucide-react';

/**
 * WorkflowSettings - Configure signing order and workflow options
 */
export default function WorkflowSettings({ value, onChange }) {
  const handleChange = (key, val) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-6">
      {/* Signing Order */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Signing Order</Label>
        <RadioGroup
          value={value.signingOrder}
          onValueChange={(val) => handleChange('signingOrder', val)}
          className="space-y-3"
        >
          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <RadioGroupItem value="sequential" id="sequential" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-sm">Sequential</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Signers receive the document one after another in the defined order
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <RadioGroupItem value="parallel" id="parallel" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-sm">Parallel</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                All signers receive the document simultaneously and can sign in any order
              </p>
            </div>
          </label>
        </RadioGroup>
      </div>
    </div>
  );
}
