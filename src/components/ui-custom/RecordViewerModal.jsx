import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Mail,
  CheckCircle2,
  Hash,
  FileCheck,
  FileText,
  Bell,
  Send,
  Eye,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  MailOpen,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function RecordViewerModal({
  open,
  onOpenChange,
  records = [],
  currentIndex = 0,
  onIndexChange,
  renderContent,
}) {
  const currentRecord = records[currentIndex];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    } else if (e.key === 'ArrowRight' && currentIndex < records.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  if (!currentRecord) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md p-0 gap-0 overflow-hidden rounded-2xl"
        onKeyDown={handleKeyDown}
      >
        {/* Header with Avatars and Navigation */}
        <div className="flex items-center justify-between px-4 py-5 bg-gradient-to-b from-slate-50 to-white">
          {/* Left Arrow */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-slate-100"
            onClick={() => currentIndex > 0 && onIndexChange(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {/* Avatar Navigation */}
          <div className="flex items-center justify-center gap-3">
            {records.map((record, index) => {
              const isActive = index === currentIndex;
              const statusColor = record.status === 'signed'
                ? 'from-emerald-400 to-emerald-600'
                : record.status === 'failed'
                  ? 'from-red-400 to-red-600'
                  : 'from-slate-300 to-slate-400';

              return (
                <button
                  key={record.id}
                  onClick={() => onIndexChange(index)}
                  className={cn(
                    "rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br transition-all duration-300 ease-out",
                    statusColor,
                    isActive
                      ? "w-14 h-14 text-base shadow-lg scale-100"
                      : "w-9 h-9 text-xs opacity-50 hover:opacity-80 scale-90"
                  )}
                >
                  {record.name?.split(' ').map(n => n[0]).join('') || index + 1}
                </button>
              );
            })}
          </div>

          {/* Right Arrow */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-slate-100"
            onClick={() => currentIndex < records.length - 1 && onIndexChange(currentIndex + 1)}
            disabled={currentIndex === records.length - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 max-h-[65vh] overflow-y-auto">
          {renderContent ? renderContent(currentRecord) : (
            <DefaultPartyContent record={currentRecord} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Default content renderer for party records
function DefaultPartyContent({ record }) {
  const [copiedHash, setCopiedHash] = useState(null);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(type);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const statusConfig = {
    signed: { color: 'emerald', label: 'Signed', icon: CheckCircle2 },
    pending: { color: 'amber', label: 'Pending', icon: Clock },
    failed: { color: 'red', label: 'Failed', icon: Clock },
  };

  const status = statusConfig[record.status] || statusConfig.pending;

  return (
    <div className="space-y-5">
      {/* Party Header Card */}
      <div className="text-center pt-1">
        <h3 className="text-lg font-semibold text-slate-900">{record.name}</h3>
        <p className="text-sm text-slate-500">{record.role}</p>
        <div className={cn(
          "inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-medium",
          status.color === 'emerald' && "bg-emerald-50 text-emerald-700",
          status.color === 'amber' && "bg-amber-50 text-amber-700",
          status.color === 'red' && "bg-red-50 text-red-700"
        )}>
          <status.icon className="w-3.5 h-3.5" />
          {status.label}
        </div>
      </div>

      {/* Contact */}
      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
          <Mail className="w-5 h-5 text-slate-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500">Email</p>
          <p className="text-sm font-medium text-slate-900 truncate">{record.email}</p>
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="space-y-1">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Signing Journey</h4>
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="space-y-4">
            {/* Step 1: Invitation Sent */}
            <TimelineStep
              icon={Send}
              title="Invitation Sent"
              value={record.mailSentAt}
              completed={!!record.mailSentAt}
            />

            {/* Step 2: Email Opened */}
            <TimelineStep
              icon={MailOpen}
              title="Email Opened"
              value={record.mailOpenedAt}
              completed={!!record.mailOpenedAt}
            />

            {/* Step 3: Document Viewed */}
            <TimelineStep
              icon={Eye}
              title="Document Viewed"
              value={record.documentViewedAt}
              completed={!!record.documentViewedAt}
            />

            {/* Step 4: Identity Verified */}
            <TimelineStep
              icon={ShieldCheck}
              title="Identity Verified"
              value={record.verifiedAt}
              subtitle={record.verificationMethod}
              completed={!!record.verifiedAt}
            />

            {/* Step 5: Signed */}
            <TimelineStep
              icon={CheckCircle2}
              title="Document Signed"
              value={record.signedAt}
              completed={record.status === 'signed'}
              isLast
            />
          </div>
        </div>
      </div>

      {/* Reminders Info */}
      {record.remindersSent > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <RefreshCw className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-900">{record.remindersSent} Reminder{record.remindersSent > 1 ? 's' : ''} Sent</p>
            <p className="text-xs text-amber-600">Keep track of follow-ups</p>
          </div>
        </div>
      )}

      {/* Signature Hashes (only if signed) */}
      {record.status === 'signed' && (record.documentHash || record.signatureHash) && (
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Cryptographic Proof</h4>
          <div className="space-y-2">
            {record.documentHash && (
              <HashDisplay
                icon={Hash}
                label="Document Hash"
                value={record.documentHash}
                copied={copiedHash === 'doc'}
                onCopy={() => copyToClipboard(record.documentHash, 'doc')}
              />
            )}
            {record.signatureHash && (
              <HashDisplay
                icon={FileCheck}
                label="Signature Hash"
                value={record.signatureHash}
                copied={copiedHash === 'sig'}
                onCopy={() => copyToClipboard(record.signatureHash, 'sig')}
              />
            )}
          </div>
        </div>
      )}

      {/* View Signed Document Button for signed */}
      {record.status === 'signed' && (
        <Button className="w-full gap-2 bg-slate-900 hover:bg-slate-800 h-11 rounded-xl">
          <FileText className="w-4 h-4" />
          View Signed Document
          <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-50" />
        </Button>
      )}

      {/* Send Reminder Button for pending */}
      {record.status === 'pending' && (
        <Button className="w-full gap-2 bg-slate-900 hover:bg-slate-800 h-11 rounded-xl">
          <Bell className="w-4 h-4" />
          Send Reminder
        </Button>
      )}
    </div>
  );
}

// Timeline Step Component
function TimelineStep({ icon: Icon, title, value, subtitle, completed, isLast }) {
  return (
    <div className="flex gap-3">
      {/* Icon & Line */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
          completed
            ? "bg-emerald-100 text-emerald-600"
            : "bg-slate-200 text-slate-400"
        )}>
          {completed ? (
            <Check className="w-4 h-4" />
          ) : (
            <Icon className="w-4 h-4" />
          )}
        </div>
        {!isLast && (
          <div className={cn(
            "w-0.5 h-full min-h-[20px] mt-1",
            completed ? "bg-emerald-200" : "bg-slate-200"
          )} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-1">
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-sm font-medium",
            completed ? "text-slate-900" : "text-slate-400"
          )}>
            {title}
          </p>
        </div>
        {value ? (
          <p className="text-xs text-slate-500 mt-0.5">{value}</p>
        ) : (
          <p className="text-xs text-slate-400 mt-0.5">Waiting...</p>
        )}
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// Hash Display Component
function HashDisplay({ icon: Icon, label, value, copied, onCopy }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">{label}</span>
        </div>
        <button
          onClick={onCopy}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <code className="block text-[11px] bg-white px-2.5 py-2 rounded-lg border border-slate-200 font-mono text-slate-600 break-all leading-relaxed">
        {value}
      </code>
    </div>
  );
}
