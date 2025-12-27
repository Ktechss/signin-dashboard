import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getTemplateVersions,
  getTemplateVersion,
  restoreTemplateVersion,
} from '@/utils/templateStorage';
import { History, Eye, RotateCcw, Check, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VersionHistoryTab({ templateId, currentVersion, onVersionRestored, onVersionSelect, viewingVersion, compact = false }) {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [templateId]);

  const loadVersions = async () => {
    setIsLoading(true);
    try {
      const history = await getTemplateVersions(templateId);
      // Sort by version descending (newest first)
      const sorted = [...history].sort((a, b) => {
        const aNum = a.versionNumber.major * 1000 + a.versionNumber.minor;
        const bNum = b.versionNumber.major * 1000 + b.versionNumber.minor;
        return bNum - aNum;
      });
      setVersions(sorted);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewVersion = async (version) => {
    if (onVersionSelect) {
      const snapshot = await getTemplateVersion(templateId, version.version);
      onVersionSelect(version.version, snapshot);
    }
  };

  const handleViewCurrent = () => {
    if (onVersionSelect) {
      onVersionSelect(null, null);
    }
  };

  const handleRestoreClick = (version) => {
    setSelectedVersion(version);
    setIsRestoreConfirmOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!selectedVersion) return;

    setIsRestoring(true);
    try {
      const restored = await restoreTemplateVersion(templateId, selectedVersion.version);
      setIsRestoreConfirmOpen(false);
      await loadVersions();
      if (onVersionRestored) {
        onVersionRestored(restored);
      }
    } catch (error) {
      console.error('Error restoring version:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="p-6 text-center">
        <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No version history available</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", compact ? "p-2" : "p-4")}>
      {!compact && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="font-medium text-slate-700">Version History</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {versions.length} versions
            </span>
          </div>

          {/* Back to Current button when viewing old version */}
          {viewingVersion && viewingVersion !== currentVersion && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 mb-2"
              onClick={handleViewCurrent}
            >
              <Eye className="w-3 h-3" />
              Back to Current (v{currentVersion})
            </Button>
          )}
        </>
      )}

      <div className={cn("space-y-2", compact && "space-y-1")}>
        {versions.map((version, index) => {
          const isCurrent = version.version === currentVersion;
          const isViewing = version.version === viewingVersion;

          return (
            <div
              key={version.version}
              className={cn(
                'rounded-lg border transition-colors cursor-pointer',
                compact ? 'p-2' : 'p-3',
                isViewing
                  ? 'border-purple-300 bg-purple-50/50 ring-1 ring-purple-200'
                  : isCurrent
                  ? 'border-blue-200 bg-blue-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              )}
              onClick={() => handleViewVersion(version)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-mono font-semibold text-slate-900", compact && "text-sm")}>
                      v{version.version}
                    </span>
                    {isCurrent && (
                      <span className={cn("bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full flex items-center gap-1", compact ? "text-[10px]" : "text-xs")}>
                        <Check className={cn(compact ? "w-2.5 h-2.5" : "w-3 h-3")} />
                        Current
                      </span>
                    )}
                    {isViewing && !isCurrent && (
                      <span className={cn("bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full flex items-center gap-1", compact ? "text-[10px]" : "text-xs")}>
                        <Eye className={cn(compact ? "w-2.5 h-2.5" : "w-3 h-3")} />
                        Viewing
                      </span>
                    )}
                  </div>

                  {version.changeNote && (
                    <p className={cn("text-slate-600 mt-1 line-clamp-1", compact ? "text-xs" : "text-sm")}>
                      {version.changeNote}
                    </p>
                  )}

                  <div className={cn("flex items-center gap-3 mt-1.5 text-slate-500", compact ? "text-[10px]" : "text-xs")}>
                    <span className="flex items-center gap-1">
                      <Clock className={cn(compact ? "w-2.5 h-2.5" : "w-3 h-3")} />
                      {formatDate(version.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn("text-slate-600", compact ? "h-6 w-6 p-0" : "h-8 px-2")}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestoreClick(version);
                      }}
                    >
                      <RotateCcw className={cn(compact ? "w-3 h-3" : "w-4 h-4")} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Restore Confirmation Dialog */}
      <Dialog open={isRestoreConfirmOpen} onOpenChange={setIsRestoreConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restore to v{selectedVersion?.version}?</DialogTitle>
            <DialogDescription className="pt-2">
              This will create a new version with the content from v{selectedVersion?.version}.
              The current version will be preserved in history.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsRestoreConfirmOpen(false)}
              disabled={isRestoring}
            >
              Cancel
            </Button>
            <Button onClick={handleRestoreConfirm} disabled={isRestoring} className="gap-2">
              {isRestoring ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Restore
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
