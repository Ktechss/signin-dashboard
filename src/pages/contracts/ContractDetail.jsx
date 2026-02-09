import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  getContractById,
  getDocumentUrl,
  updateContract,
} from '@/utils/templateStorage';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  Eye,
  MoreVertical,
  Settings,
  Activity,
  FormInput,
  Download,
  ExternalLink,
  Mail,
  Building2,
  Bell,
  XCircle,
  ShieldCheck,
  Workflow,
  Copy,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ID Type labels
const ID_TYPE_LABELS = {
  emirates_id: 'Emirates ID',
  passport: 'Passport',
  gcc_id: 'GCC ID',
  uaekyc_id: 'UAEKYC ID',
  none: 'No Verification',
};

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Status labels
const statusLabels = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  pending_internal: 'Pending Internal',
  internal_signed: 'Internal Signed',
  pending_send: 'Ready to Send',
  sent: 'Sent',
  partially_signed: 'Partially Signed',
  completed: 'Completed',
  declined: 'Declined',
  expired: 'Expired',
  revoked: 'Revoked',
  pending: 'Pending',
  signed: 'Signed',
};

// Info Card Component
function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200">
      <div className="p-2 rounded-lg bg-slate-100">
        <Icon className="w-4 h-4 text-slate-600" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

// Signer Item Component
function SignerItem({ signer, index, onRemind, onView }) {
  const isSigned = signer.status === 'signed';
  const initials = signer.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';

  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const hasIdVerification = signer.idDetails?.idType && signer.idDetails.idType !== 'none';

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200">
      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-medium text-slate-600">{initials}</span>
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mb-0.5">Signatory</p>
          <p className="text-sm font-medium text-slate-900">{signer.name}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <Mail className="w-3 h-3" />
            {signer.email}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mb-0.5">Type</p>
          <div className="flex items-center gap-1.5 mt-1">
            {signer.signerType === 'establishment' ? (
              <>
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm text-slate-700">Establishment</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm text-slate-700">External</span>
              </>
            )}
          </div>
        </div>

        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mb-0.5">ID Verification</p>
          <p className="text-sm text-slate-700 mt-1">
            {hasIdVerification ? ID_TYPE_LABELS[signer.idDetails.idType] : 'None'}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mb-0.5">Signed At</p>
          {isSigned ? (
            <p className="text-sm text-slate-700 mt-1">{formatDateTime(signer.signedAt)}</p>
          ) : (
            <p className="text-sm text-slate-400 italic mt-1">Not signed yet</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={cn(
          'text-xs px-2 py-1 rounded border',
          isSigned
            ? 'bg-slate-100 text-slate-700 border-slate-200'
            : 'bg-white text-slate-500 border-slate-200'
        )}>
          {isSigned ? 'Signed' : 'Pending'}
        </span>

        <Button variant="outline" size="sm" className="gap-1.5 text-slate-600" onClick={() => onView?.(signer)}>
          <Eye className="w-3.5 h-3.5" />
          View
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isSigned && (
              <DropdownMenuItem onClick={() => onRemind?.(signer)}>
                <Bell className="w-4 h-4 mr-2" />
                Send Reminder
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <Copy className="w-4 h-4 mr-2" />
              Copy Email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onView?.(signer)}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Field Item Component
function FieldItem({ field, value, signerName }) {
  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <FormInput className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 uppercase tracking-wide">
            {field.label || field.type}
          </span>
        </div>
        {field.validation?.required && (
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
            Required
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-slate-900 mb-1">
        {value || <span className="text-slate-400 italic font-normal">Not provided</span>}
      </p>
      {signerName && (
        <p className="text-xs text-slate-400">Filled by {signerName}</p>
      )}
      {field.type === 'signature' && (
        <p className="text-xs text-slate-400 mt-1">Page {field.page || 1}</p>
      )}
    </div>
  );
}

// Timeline Item Component
function TimelineItem({ event }) {
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border border-slate-200">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-slate-500" />
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900 capitalize">{event.status}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {event.actor} • {formatDateTime(event.timestamp)}
        </p>
        {event.note && (
          <p className="text-xs text-slate-500 mt-1 italic">"{event.note}"</p>
        )}
      </div>
    </div>
  );
}

// Setting Row Component
function SettingRow({ label, value, enabled }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      {typeof enabled === 'boolean' ? (
        <span className={cn(
          'text-xs px-2 py-0.5 rounded',
          enabled ? 'bg-slate-100 text-slate-700' : 'bg-slate-50 text-slate-400'
        )}>
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
      ) : (
        <span className="text-sm text-slate-900">{value}</span>
      )}
    </div>
  );
}

export default function ContractDetail() {
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get('id');

  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('signers');
  const [documentOpen, setDocumentOpen] = useState(false);
  const [selectedSigner, setSelectedSigner] = useState(null);
  const [signerSheetOpen, setSignerSheetOpen] = useState(false);

  // Document viewer state
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  // View signer details
  const handleViewSigner = (signer) => {
    setSelectedSigner(signer);
    setSignerSheetOpen(true);
  };

  // Load contract data
  useEffect(() => {
    const loadContract = async () => {
      if (!contractId) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getContractById(contractId);
        if (data) {
          setContract(data);
        } else {
          toast.error('Contract not found');
        }
      } catch (error) {
        console.error('Error loading contract:', error);
        toast.error('Failed to load contract');
      } finally {
        setIsLoading(false);
      }
    };

    loadContract();
  }, [contractId]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Send reminder handler
  const handleSendReminder = (signer) => {
    toast.success(`Reminder sent to ${signer.name}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-900 font-medium mb-1">Contract Not Found</p>
          <p className="text-sm text-slate-500 mb-4">The contract doesn't exist.</p>
          <Link to={createPageUrl('Current')}>
            <Button variant="outline" size="sm">Back to Contracts</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusLabel = statusLabels[contract.status] || contract.status;
  const signedCount = contract.signers?.filter(s => s.status === 'signed').length || 0;
  const totalSigners = contract.signers?.length || 0;

  // Calculate expiration date
  let expiresAt = contract.expiresAt;
  if (!expiresAt && contract.settings?.expiration?.enabled && contract.createdAt) {
    const expDate = new Date(contract.createdAt);
    expDate.setDate(expDate.getDate() + (contract.settings.expiration.expiresAfterDays || 30));
    expiresAt = expDate.toISOString();
  }

  // Get fields by type
  const textFields = (contract.fields || []).filter(f => f.type !== 'signature' && f.type !== 'initials');
  const signatureFields = (contract.fields || []).filter(f => f.type === 'signature' || f.type === 'initials');

  // Get signer name by role/party id
  const getSignerName = (roleId) => {
    const signer = contract.signers?.find(s => s.id?.toString() === roleId?.toString() || s.partyId?.toString() === roleId?.toString());
    return signer?.name || '';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <Link
          to={createPageUrl('Current')}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Contracts
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold text-slate-900 mb-1">
                  {contract.name}
                </h1>
                <p className="text-sm text-slate-500 font-mono mb-2">{contract.reference}</p>
                {contract.blueprintName && (
                  <p className="text-xs text-slate-500">
                    Based on <span className="font-medium text-slate-700">{contract.blueprintName}</span>
                    {contract.blueprintVersion && (
                      <span className="text-slate-400 ml-1">v{contract.blueprintVersion}</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                {statusLabel}
              </span>
              <Button
                className="bg-slate-900 hover:bg-slate-800"
                onClick={() => setDocumentOpen(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Document
              </Button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <InfoCard
              icon={Calendar}
              label="Created"
              value={formatDate(contract.createdAt)}
            />
            <InfoCard
              icon={Clock}
              label="Expires"
              value={expiresAt ? formatDate(expiresAt) : 'No expiry'}
            />
            <InfoCard
              icon={CheckCircle}
              label="Signed"
              value={`${signedCount} of ${totalSigners}`}
            />
            <InfoCard
              icon={Users}
              label="Created By"
              value={contract.createdBy || 'System'}
            />
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border border-slate-200 p-1 mb-6">
            <TabsTrigger value="signers" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <Users className="w-4 h-4" />
              Signers ({totalSigners})
            </TabsTrigger>
            <TabsTrigger value="fields" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <FormInput className="w-4 h-4" />
              Fields ({textFields.length + signatureFields.length})
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <Activity className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="document" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <FileText className="w-4 h-4" />
              Document
            </TabsTrigger>
          </TabsList>

          {/* Signers Tab */}
          <TabsContent value="signers" className="space-y-3">
            {contract.settings?.workflow?.signingOrder && (
              <div className="mb-4 p-3 bg-slate-100 border border-slate-200 rounded-lg">
                <p className="text-sm text-slate-600">
                  <Workflow className="w-4 h-4 inline mr-1.5 text-slate-500" />
                  Signing Order: <span className="font-medium capitalize text-slate-900">
                    {contract.settings.workflow.signingOrder.replace('_', ' ')}
                  </span>
                </p>
              </div>
            )}
            {(contract.signers || []).map((signer, index) => (
              <SignerItem
                key={signer.id || index}
                signer={signer}
                index={index}
                onRemind={handleSendReminder}
                onView={handleViewSigner}
              />
            ))}
            {(!contract.signers || contract.signers.length === 0) && (
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No signers defined</p>
              </div>
            )}
          </TabsContent>

          {/* Fields Tab */}
          <TabsContent value="fields" className="space-y-6">
            {textFields.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">Text Fields</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {textFields.map((field) => (
                    <FieldItem
                      key={field.id}
                      field={field}
                      value={contract.fieldValues?.[field.id]}
                      signerName={getSignerName(field.role)}
                    />
                  ))}
                </div>
              </div>
            )}

            {signatureFields.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">Signature Fields</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {signatureFields.map((field) => (
                    <FieldItem
                      key={field.id}
                      field={field}
                      signerName={getSignerName(field.role)}
                    />
                  ))}
                </div>
              </div>
            )}

            {textFields.length === 0 && signatureFields.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <FormInput className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No fields defined</p>
              </div>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-3">
            {(contract.statusHistory || []).map((event, index) => (
              <TimelineItem key={index} event={event} />
            ))}
            {(!contract.statusHistory || contract.statusHistory.length === 0) && (
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No activity recorded</p>
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            {/* Workflow Settings */}
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Workflow className="w-4 h-4 text-slate-500" />
                <h3 className="font-medium text-slate-900">Workflow</h3>
              </div>
              <div className="space-y-1">
                <SettingRow
                  label="Signing Order"
                  value={(contract.settings?.workflow?.signingOrder || contract.settings?.signingOrder?.order || 'sequential').replace('_', ' ')}
                />
                <SettingRow label="Allow Decline" enabled={contract.settings?.workflow?.allowDecline ?? true} />
                <SettingRow label="Allow Delegation" enabled={contract.settings?.workflow?.allowDelegation ?? false} />
              </div>
            </div>

            {/* Reminders */}
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-slate-500" />
                <h3 className="font-medium text-slate-900">Reminders</h3>
              </div>
              <div className="space-y-1">
                <SettingRow label="Enabled" enabled={contract.settings?.reminders?.enabled ?? contract.settings?.reminder?.enabled ?? false} />
                <SettingRow label="First Reminder After" value={`${contract.settings?.reminders?.firstReminderAfterDays || contract.settings?.reminder?.firstReminderAfterDays || 3} days`} />
                <SettingRow label="Reminder Interval" value={`Every ${contract.settings?.reminders?.reminderIntervalDays || contract.settings?.reminder?.reminderIntervalDays || 2} days`} />
                <SettingRow label="Max Reminders" value={contract.settings?.reminders?.maxReminders || contract.settings?.reminder?.maxReminders || 5} />
              </div>
            </div>

            {/* Expiration */}
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="font-medium text-slate-900">Expiration</h3>
              </div>
              <div className="space-y-1">
                <SettingRow label="Enabled" enabled={contract.settings?.expiration?.enabled ?? false} />
                <SettingRow label="Expires After" value={`${contract.settings?.expiration?.expiresAfterDays || 30} days`} />
                <SettingRow label="Allow Extension" enabled={contract.settings?.expiration?.allowExtension ?? false} />
              </div>
            </div>

            {/* Revocation */}
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-4 h-4 text-slate-500" />
                <h3 className="font-medium text-slate-900">Revocation</h3>
              </div>
              <div className="space-y-1">
                <SettingRow label="Allow Revocation" enabled={contract.settings?.revocation?.allowRevocation ?? contract.settings?.revoke?.allowRevocation ?? true} />
                <SettingRow label="Require Reason" enabled={contract.settings?.revocation?.requireReason ?? false} />
                <SettingRow label="Notify Signers" enabled={contract.settings?.revocation?.notifySigners ?? contract.settings?.revoke?.notifySigners ?? true} />
              </div>
            </div>

            {/* Approval */}
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <h3 className="font-medium text-slate-900">Approval</h3>
              </div>
              <div className="space-y-1">
                <SettingRow label="Approval Required" enabled={contract.settings?.approval?.enabled ?? false} />
                <SettingRow label="Required Approvers" value={contract.settings?.approval?.requiredApprovers || 1} />
              </div>
            </div>
          </TabsContent>

          {/* Document Tab */}
          <TabsContent value="document">
            <div className="bg-white rounded-lg border border-slate-200 p-8">
              <div className="max-w-md mx-auto text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-medium text-slate-900 mb-1">
                  {contract.fileName || 'Document'}
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  {contract.documentType?.replace('application/', '').toUpperCase() || 'PDF'} Document
                </p>

                <div className="flex gap-3 justify-center">
                  <Button variant="outline" className="gap-2" onClick={() => setDocumentOpen(true)}>
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </Button>
                  <Button className="gap-2 bg-slate-900 hover:bg-slate-800">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Signer Details Modal */}
      <Dialog open={signerSheetOpen} onOpenChange={setSignerSheetOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0">
          {selectedSigner && (
            <>
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center">
                    <span className="text-xl font-medium text-white">
                      {selectedSigner.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-semibold text-slate-900">{selectedSigner.name}</h2>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        selectedSigner.status === 'signed'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-slate-100 text-slate-500'
                      )}>
                        {selectedSigner.status === 'signed' ? 'Signed' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{selectedSigner.email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedSigner.signerType === 'establishment' ? 'Establishment' : 'External Signer'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-5">
                    {/* Contact Info */}
                    <div>
                      <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Contact</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-slate-400">Email</p>
                          <p className="text-sm text-slate-900">{selectedSigner.email}</p>
                        </div>
                        {selectedSigner.phone && (
                          <div>
                            <p className="text-xs text-slate-400">Phone</p>
                            <p className="text-sm text-slate-900">{selectedSigner.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Signing Info */}
                    <div>
                      <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Signing</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-slate-400">Status</p>
                          <p className="text-sm text-slate-900">
                            {selectedSigner.status === 'signed' ? 'Completed' : 'Awaiting signature'}
                          </p>
                        </div>
                        {selectedSigner.signedAt && (
                          <div>
                            <p className="text-xs text-slate-400">Signed At</p>
                            <p className="text-sm text-slate-900">
                              {new Date(selectedSigner.signedAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </p>
                          </div>
                        )}
                        {selectedSigner.ipAddress && (
                          <div>
                            <p className="text-xs text-slate-400">IP Address</p>
                            <p className="text-sm text-slate-900 font-mono">{selectedSigner.ipAddress}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - ID Verification */}
                  <div>
                    <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">ID Verification</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-slate-400">Type</p>
                        <p className="text-sm text-slate-900">
                          {selectedSigner.idDetails?.idType && selectedSigner.idDetails.idType !== 'none'
                            ? ID_TYPE_LABELS[selectedSigner.idDetails.idType]
                            : 'No verification'}
                        </p>
                      </div>

                      {/* Emirates ID */}
                      {selectedSigner.idDetails?.idType === 'emirates_id' && (
                        <div>
                          <p className="text-xs text-slate-400">Emirates ID Number</p>
                          <p className="text-sm text-slate-900 font-mono">
                            {selectedSigner.idDetails.emiratesId || '-'}
                          </p>
                        </div>
                      )}

                      {/* Passport */}
                      {selectedSigner.idDetails?.idType === 'passport' && (
                        <>
                          <div>
                            <p className="text-xs text-slate-400">Country</p>
                            <p className="text-sm text-slate-900">
                              {selectedSigner.idDetails.passport?.country || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Passport Type</p>
                            <p className="text-sm text-slate-900">
                              {selectedSigner.idDetails.passport?.type || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Passport Number</p>
                            <p className="text-sm text-slate-900 font-mono">
                              {selectedSigner.idDetails.passport?.number || '-'}
                            </p>
                          </div>
                        </>
                      )}

                      {/* GCC ID */}
                      {selectedSigner.idDetails?.idType === 'gcc_id' && (
                        <>
                          <div>
                            <p className="text-xs text-slate-400">Country</p>
                            <p className="text-sm text-slate-900">
                              {selectedSigner.idDetails.gccId?.country || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">ID Number</p>
                            <p className="text-sm text-slate-900 font-mono">
                              {selectedSigner.idDetails.gccId?.number || '-'}
                            </p>
                          </div>
                        </>
                      )}

                      {/* UAEKYC ID */}
                      {selectedSigner.idDetails?.idType === 'uaekyc_id' && (
                        <div>
                          <p className="text-xs text-slate-400">UAEKYC ID</p>
                          <p className="text-sm text-slate-900 font-mono">
                            {selectedSigner.idDetails.uaekycId || '-'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedSigner.email);
                    toast.success('Email copied');
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Email
                </Button>
                {selectedSigner.status !== 'signed' && (
                  <Button
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800"
                    onClick={() => {
                      handleSendReminder(selectedSigner);
                      setSignerSheetOpen(false);
                    }}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Send Reminder
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Viewer Modal */}
      <Dialog open={documentOpen} onOpenChange={setDocumentOpen}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-4 py-3 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm font-medium">{contract.fileName || 'Document'}</DialogTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 mr-4">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-slate-600 min-w-[60px] text-center">{currentPage} / {numPages || 1}</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(p => Math.min(numPages || 1, p + 1))} disabled={currentPage >= (numPages || 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setZoom(z => Math.max(50, z - 25))} disabled={zoom <= 50}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-slate-600 min-w-[40px] text-center">{zoom}%</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setZoom(z => Math.min(200, z + 25))} disabled={zoom >= 200}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>

                <Button variant="outline" size="sm" className="ml-2">
                  <Download className="w-4 h-4 mr-1.5" />
                  Download
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto bg-slate-100 p-6 flex justify-center">
            {contract.documentUrl ? (
              contract.documentType === 'application/pdf' ? (
                <Document
                  file={getDocumentUrl(contract.documentUrl)}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  onLoadError={(error) => console.error('PDF load error:', error)}
                  loading={
                    <div className="text-center py-12">
                      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto" />
                    </div>
                  }
                >
                  <div className="relative" style={{ width: 595 * (zoom / 100) }}>
                    <Page
                      pageNumber={currentPage}
                      width={595 * (zoom / 100)}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="shadow-lg bg-white"
                    />
                    {/* Field Values as Plain Text - Only show if value exists */}
                    {(contract.fields || [])
                      .filter(field => field.page === currentPage || (!field.page && currentPage === 1))
                      .map((field) => {
                        const value = field.value || contract.fieldValues?.[field.id];
                        const isSignature = field.type === 'signature' || field.type === 'initials';

                        // If no value, leave blank (don't render anything)
                        if (!value && !isSignature) return null;
                        // For signatures without actual signature data, also leave blank
                        if (isSignature && !value) return null;

                        const scale = zoom / 100;
                        return (
                          <div
                            key={field.id}
                            className="absolute pointer-events-none"
                            style={{
                              left: (field.x || 0) * scale,
                              top: (field.y || 0) * scale,
                              fontSize: Math.max(10, 12 * scale),
                            }}
                          >
                            <span className={cn(
                              'whitespace-nowrap',
                              isSignature ? 'italic text-slate-500' : 'text-slate-900 font-medium'
                            )}>
                              {value}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </Document>
              ) : (
                <div className="relative" style={{ width: 595 * (zoom / 100) }}>
                  <img src={getDocumentUrl(contract.documentUrl)} alt="Document" className="w-full shadow-lg bg-white" />
                  {/* Field Values as Plain Text - Only show if value exists */}
                  {(contract.fields || [])
                    .filter(field => field.page === currentPage || (!field.page && currentPage === 1))
                    .map((field) => {
                      const value = field.value || contract.fieldValues?.[field.id];
                      const isSignature = field.type === 'signature' || field.type === 'initials';

                      // If no value, leave blank (don't render anything)
                      if (!value && !isSignature) return null;
                      // For signatures without actual signature data, also leave blank
                      if (isSignature && !value) return null;

                      const scale = zoom / 100;
                      return (
                        <div
                          key={field.id}
                          className="absolute pointer-events-none"
                          style={{
                            left: (field.x || 0) * scale,
                            top: (field.y || 0) * scale,
                            fontSize: Math.max(10, 12 * scale),
                          }}
                        >
                          <span className={cn(
                            'whitespace-nowrap',
                            isSignature ? 'italic text-slate-500' : 'text-slate-900 font-medium'
                          )}>
                            {value}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No document available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
