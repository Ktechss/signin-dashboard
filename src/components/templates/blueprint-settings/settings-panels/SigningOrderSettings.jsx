// SigningOrderSettings - Signing order configuration panel

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

/**
 * SigningOrder settings panel - configures signing sequence
 * @param {object} settings - Current signing order settings
 * @param {function} onChange - Handler for setting changes
 * @param {Array} parties - Array of signing parties
 */
export function SigningOrderSettings({ settings, onChange, parties = [] }) {
  // Get current sequence or default to parties order
  const currentSequence = settings?.signerSequence || [];
  const orderedSigners = currentSequence.length > 0
    ? currentSequence.map(id => parties.find(p => p.id === id)).filter(Boolean)
    : [...parties];

  // Add any parties not in sequence
  parties.forEach(p => {
    if (!orderedSigners.find(s => s.id === p.id)) {
      orderedSigners.push(p);
    }
  });

  const moveSignerUp = (index) => {
    if (index <= 0) return;
    const newOrder = [...orderedSigners];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    onChange('signerSequence', newOrder.map(s => s.id));
  };

  const moveSignerDown = (index) => {
    if (index >= orderedSigners.length - 1) return;
    const newOrder = [...orderedSigners];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    onChange('signerSequence', newOrder.map(s => s.id));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-slate-700 mb-2 block">Signing Sequence</Label>
        <RadioGroup
          value={settings?.order || 'sequential'}
          onValueChange={(val) => onChange('order', val)}
          className="space-y-2"
        >
          <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
            <RadioGroupItem value="sequential" />
            <div>
              <span className="text-sm font-medium text-slate-700">Sequential</span>
              <p className="text-xs text-slate-500">Signers sign one after another in order</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
            <RadioGroupItem value="parallel" />
            <div>
              <span className="text-sm font-medium text-slate-700">Parallel</span>
              <p className="text-xs text-slate-500">All signers can sign simultaneously</p>
            </div>
          </label>
        </RadioGroup>
      </div>

      {/* Signer Order - Only show for Sequential */}
      {settings?.order === 'sequential' && parties.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Signing Order</Label>
          <p className="text-xs text-slate-500 mb-2">Drag or use arrows to reorder signers</p>

          <div className="space-y-2">
            {orderedSigners.map((signer, index) => (
              <div
                key={signer.id}
                className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="text-slate-400">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{signer.name}</p>
                  {signer.email && (
                    <p className="text-[10px] text-slate-500 truncate">{signer.email}</p>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveSignerUp(index)}
                    disabled={index === 0}
                    className={cn(
                      'p-0.5 rounded hover:bg-slate-200 transition-colors',
                      index === 0 ? 'opacity-30 cursor-not-allowed' : ''
                    )}
                  >
                    <ChevronUp className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => moveSignerDown(index)}
                    disabled={index === orderedSigners.length - 1}
                    className={cn(
                      'p-0.5 rounded hover:bg-slate-200 transition-colors',
                      index === orderedSigners.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                    )}
                  >
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {orderedSigners.length > 1 && (
            <div className="pt-2 border-t border-slate-100 mt-3">
              <p className="text-xs text-slate-400">
                Signing Flow: {orderedSigners.map((s, i) => s.name || `Signer ${i + 1}`).join(' → ')}
              </p>
            </div>
          )}
        </div>
      )}

      {settings?.order === 'sequential' && parties.length === 0 && (
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-700">
            Add signers in the Signature Placement step to configure signing order.
          </p>
        </div>
      )}
    </div>
  );
}

export default SigningOrderSettings;
