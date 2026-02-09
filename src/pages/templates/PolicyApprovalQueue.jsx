import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getTemplates, updateTemplate, getDocumentUrl } from '@/utils/templateStorage';
import { useAuth } from '@/pages/index';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Building2,
  User,
  Calendar,
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { convertLatexToHtml } from '@/components/templates/LatexEditor';
import {
  extractPolicySection,
  parsePolicyItems,
  POLICY_START_MARKER,
  POLICY_END_MARKER,
} from '@/components/templates/PolicyEditor';

export default function PolicyApprovalQueue() {
  const navigate = useNavigate();
  const { user, isPlatformAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  // Check if user is super admin (ICP)
  const isSuperAdmin = isPlatformAdmin === true || user?.isRootUser === true;

  // Load pending approvals
  useEffect(() => {
    const loadPendingApprovals = async () => {
      setLoading(true);
      try {
        const templates = await getTemplates();
        // Filter templates with pending policy approval status
        const pending = templates.filter(t => t.status === 'pending_policy_approval');
        setPendingApprovals(pending);
      } catch (error) {
        console.error('Error loading pending approvals:', error);
        setPendingApprovals([]);
      } finally {
        setLoading(false);
      }
    };

    loadPendingApprovals();
  }, []);

  // Filter approvals by search query
  const filteredApprovals = pendingApprovals.filter(approval =>
    approval.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    approval.assignedClient?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open review dialog
  const handleReview = (approval) => {
    setSelectedApproval(approval);
    setIsReviewOpen(true);
    setShowRejectionForm(false);
    setRejectionReason('');
  };

  // Approve policy changes
  const handleApprove = async () => {
    if (!selectedApproval) return;

    setIsProcessing(true);
    try {
      // Update the template status to active
      const updatedData = {
        status: 'active',
        policyApproval: {
          ...selectedApproval.policyApproval,
          status: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: user?.email || 'ICP Admin',
        },
      };

      await updateTemplate(selectedApproval.id, updatedData);

      toast.success('Policy Approved!', {
        description: `"${selectedApproval.name}" is now active for ${selectedApproval.assignedClient?.name || 'the client'}.`,
      });

      // Remove from pending list
      setPendingApprovals(prev => prev.filter(a => a.id !== selectedApproval.id));
      setIsReviewOpen(false);
      setSelectedApproval(null);
    } catch (error) {
      console.error('Error approving policy:', error);
      toast.error('Failed to approve policy');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject policy changes
  const handleReject = async () => {
    if (!selectedApproval || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      // Update the template status to rejected
      const updatedData = {
        status: 'policy_rejected',
        policyApproval: {
          ...selectedApproval.policyApproval,
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectedBy: user?.email || 'ICP Admin',
          rejectionReason: rejectionReason,
        },
      };

      await updateTemplate(selectedApproval.id, updatedData);

      toast.success('Policy Rejected', {
        description: `The client will be notified of the rejection.`,
      });

      // Remove from pending list
      setPendingApprovals(prev => prev.filter(a => a.id !== selectedApproval.id));
      setIsReviewOpen(false);
      setSelectedApproval(null);
      setShowRejectionForm(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting policy:', error);
      toast.error('Failed to reject policy');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Redirect non-super-admins
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-slate-500 mb-4">Only ICP administrators can access this page.</p>
          <Link to={createPageUrl('Templates')}>
            <Button>Go to Blueprints</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Templates')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Policy Approval Queue</h1>
                  <p className="text-slate-500">
                    Review and approve client policy customizations
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search submissions..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pendingApprovals.length}</p>
              <p className="text-sm text-slate-500">Pending Review</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">-</p>
              <p className="text-sm text-slate-500">Approved Today</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">-</p>
              <p className="text-sm text-slate-500">Rejected Today</p>
            </div>
          </div>
        </div>

        {/* Pending Approvals List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : filteredApprovals.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">All caught up!</h3>
            <p className="text-slate-500">
              {searchQuery
                ? 'No submissions match your search.'
                : 'No policy approvals pending at this time.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      Blueprint
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      Client
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      Submitted By
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      Submitted On
                    </th>
                    <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <AnimatePresence>
                    {filteredApprovals.map((approval) => (
                      <motion.tr
                        key={approval.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{approval.name}</p>
                              <p className="text-xs text-slate-500">
                                Source: {approval.sourceTemplateId ? `#${approval.sourceTemplateId}` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700">
                              {approval.assignedClient?.name || 'Unknown Client'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700">
                              {approval.policyApproval?.submittedBy || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700">
                              {formatDate(approval.policyApproval?.submittedAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => handleReview(approval)}
                          >
                            <Eye className="w-4 h-4" />
                            Review
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Review Dialog */}
        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Review Policy Changes
              </DialogTitle>
              <DialogDescription>
                Review the policy modifications submitted by {selectedApproval?.assignedClient?.name || 'the client'}
              </DialogDescription>
            </DialogHeader>

            {selectedApproval && (
              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Meta Info */}
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{selectedApproval.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{selectedApproval.assignedClient?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{formatDate(selectedApproval.policyApproval?.submittedAt)}</span>
                  </div>
                </div>

                {/* Policy Comparison */}
                <div className="flex-1 overflow-auto p-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Original Policy */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-400" />
                        <h3 className="font-medium text-slate-900">Original Policy</h3>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 min-h-[300px] border border-slate-200">
                        {selectedApproval.policyApproval?.originalPolicyContent ? (
                          <div className="prose prose-sm max-w-none">
                            {parsePolicyItems(selectedApproval.policyApproval.originalPolicyContent).map((item, idx) => (
                              <div key={idx} className="mb-4">
                                <h4 className="font-semibold text-slate-800">{item.title}</h4>
                                <p className="text-slate-600 whitespace-pre-wrap">{item.content || '(No content)'}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">No original policy content</p>
                        )}
                      </div>
                    </div>

                    {/* Client's Policy */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <h3 className="font-medium text-slate-900">Client's Policy Changes</h3>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4 min-h-[300px] border border-purple-200">
                        {selectedApproval.policyApproval?.clientPolicyContent ? (
                          <div className="prose prose-sm max-w-none">
                            {parsePolicyItems(selectedApproval.policyApproval.clientPolicyContent).map((item, idx) => (
                              <div key={idx} className="mb-4">
                                <h4 className="font-semibold text-purple-800">{item.title}</h4>
                                <p className="text-purple-700 whitespace-pre-wrap">{item.content || '(No content)'}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">No policy changes submitted</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Conflict Warning */}
                  <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-amber-900">Review Guidelines</h4>
                      <ul className="text-sm text-amber-700 mt-1 space-y-1">
                        <li>- Check for conflicts with standard terms and conditions</li>
                        <li>- Verify compliance with regulatory requirements</li>
                        <li>- Ensure no liability-limiting clauses are removed</li>
                        <li>- Confirm the policy additions are legally sound</li>
                      </ul>
                    </div>
                  </div>

                  {/* Rejection Form */}
                  {showRejectionForm && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                      <Label className="text-red-900 font-medium">Rejection Reason *</Label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this policy change is being rejected..."
                        className="mt-2 border-red-200 focus:border-red-400"
                        rows={3}
                      />
                      <p className="text-xs text-red-600 mt-2">
                        This reason will be shared with the client.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsReviewOpen(false);
                      setSelectedApproval(null);
                      setShowRejectionForm(false);
                      setRejectionReason('');
                    }}
                  >
                    Cancel
                  </Button>
                  <div className="flex items-center gap-3">
                    {showRejectionForm ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowRejectionForm(false);
                            setRejectionReason('');
                          }}
                        >
                          Back
                        </Button>
                        <Button
                          variant="destructive"
                          className="gap-2"
                          onClick={handleReject}
                          disabled={isProcessing || !rejectionReason.trim()}
                        >
                          {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Confirm Rejection
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setShowRejectionForm(true)}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                        <Button
                          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                          onClick={handleApprove}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          Approve Policy
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
