import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatVersion, getNextVersion } from '@/utils/templateStorage';
import { GitBranch, ArrowUp, ArrowRight } from 'lucide-react';

export default function SaveVersionDialog({
  open,
  onOpenChange,
  currentVersion,
  onSave,
  isSaving = false,
}) {
  const [versionType, setVersionType] = useState('minor');
  const [changeNote, setChangeNote] = useState('');

  const nextMinor = getNextVersion(currentVersion, 'minor');
  const nextMajor = getNextVersion(currentVersion, 'major');

  const handleSave = () => {
    onSave(versionType, changeNote);
  };

  const handleClose = () => {
    setVersionType('minor');
    setChangeNote('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-slate-600" />
            Save Changes
          </DialogTitle>
          <DialogDescription>
            Choose how to version your changes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">Version Type</Label>
            <RadioGroup
              value={versionType}
              onValueChange={setVersionType}
              className="space-y-3"
            >
              <label
                htmlFor="minor"
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  versionType === 'minor'
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <RadioGroupItem value="minor" id="minor" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">Minor Update</span>
                    <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                      {formatVersion(currentVersion)} <ArrowRight className="w-3 h-3" /> {formatVersion(nextMinor)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Small changes, field adjustments, text updates
                  </p>
                </div>
              </label>

              <label
                htmlFor="major"
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  versionType === 'major'
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <RadioGroupItem value="major" id="major" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">Major Update</span>
                    <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                      {formatVersion(currentVersion)} <ArrowUp className="w-3 h-3" /> {formatVersion(nextMajor)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Significant changes, new structure, breaking changes
                  </p>
                </div>
              </label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="changeNote" className="text-sm font-medium text-slate-700">
              Change Note <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="changeNote"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="Describe what changed in this version..."
              className="resize-none h-20"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save as v{formatVersion(versionType === 'minor' ? nextMinor : nextMajor)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
