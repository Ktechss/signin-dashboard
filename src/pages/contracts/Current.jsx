import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import {
  FileText,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  FileSignature,
  FilePen,
  Search,
  Filter,
  Plus,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  Building2,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { contractsApi, templatesApi } from '@/services/api';
import DateFilter from '@/components/ui-custom/DateFilter';

// Status configurations
const statusConfig = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: FilePen },
  pending_approval: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  pending_send: { label: 'Ready to Send', color: 'bg-indigo-100 text-indigo-700', icon: Send },
  sent: { label: 'Sent', color: 'bg-purple-100 text-purple-700', icon: Send },
  pending_internal: { label: 'Pending Internal', color: 'bg-orange-100 text-orange-700', icon: FileSignature },
  internal_signed: { label: 'Internal Signed', color: 'bg-teal-100 text-teal-700', icon: CheckCircle },
  partially_signed: { label: 'Partially Signed', color: 'bg-cyan-100 text-cyan-700', icon: FileSignature },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
  revoked: { label: 'Revoked', color: 'bg-red-100 text-red-700', icon: XCircle },
};

// View configurations
const viewConfig = {
  all: { title: 'All Contracts', icon: Eye, description: 'View all contracts' },
  drafts: { title: 'My Drafts', icon: FilePen, description: 'Contracts you created that are still in draft' },
  pending_approval: { title: 'Pending Approval', icon: Clock, description: 'Contracts waiting for your approval' },
  ready_to_send: { title: 'Ready to Send', icon: Send, description: 'Approved contracts ready to be sent' },
  pending_signature: { title: 'Pending Signature', icon: FileSignature, description: 'Contracts waiting for your signature' },
  completed: { title: 'Completed', icon: CheckCircle, description: 'Successfully completed contracts' },
};

// Status Badge Component
function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
  return (
    <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', config.color)}>
      {config.label}
    </span>
  );
}

export default function Current() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current user from localStorage
  const currentUser = useMemo(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }, []);

  const workflowPerms = currentUser?.workflowPermissions || {};

  // State
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Advanced filter state
  const [blueprintFilter, setBlueprintFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [blueprints, setBlueprints] = useState([]);

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Dialog states
  const [approveDialog, setApproveDialog] = useState({ open: false, contract: null });
  const [rejectDialog, setRejectDialog] = useState({ open: false, contract: null });
  const [sendDialog, setSendDialog] = useState({ open: false, contract: null });
  const [signDialog, setSignDialog] = useState({ open: false, contract: null });
  const [revokeDialog, setRevokeDialog] = useState({ open: false, contract: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [revokeReason, setRevokeReason] = useState('');

  // Bulk action dialog states
  const [bulkApproveDialog, setBulkApproveDialog] = useState(false);
  const [bulkRejectDialog, setBulkRejectDialog] = useState(false);
  const [bulkSendDialog, setBulkSendDialog] = useState(false);
  const [bulkSignDialog, setBulkSignDialog] = useState(false);
  const [bulkRevokeDialog, setBulkRevokeDialog] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');
  const [bulkRevokeReason, setBulkRevokeReason] = useState('');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Determine current view based on URL params
  const currentView = useMemo(() => {
    const status = searchParams.get('status');
    const filter = searchParams.get('filter');

    if (status === 'draft' && filter === 'my') return 'drafts';
    if (status === 'pending_approval') return 'pending_approval';
    if (status?.includes('approved') || status?.includes('pending_send')) return 'ready_to_send';
    if (status?.includes('pending_internal') || status?.includes('sent')) return 'pending_signature';
    if (status === 'completed') return 'completed';
    return 'all';
  }, [searchParams]);

  const viewInfo = viewConfig[currentView] || viewConfig.all;

  // Fetch contracts
  useEffect(() => {
    fetchContracts();
  }, [searchParams]);

  // Fetch blueprints for filter dropdown
  useEffect(() => {
    const fetchBlueprints = async () => {
      try {
        const data = await templatesApi.getAll();
        setBlueprints(data || []);
      } catch (error) {
        console.error('Error fetching blueprints:', error);
      }
    };
    fetchBlueprints();
  }, []);

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      const status = searchParams.get('status');
      const params = status ? { status } : {};
      const data = await contractsApi.getAll(params);
      setContracts(data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Failed to load contracts');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter contracts based on search, status, blueprint, and date
  const filteredContracts = useMemo(() => {
    let result = contracts;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(query) ||
          c.reference?.toLowerCase().includes(query) ||
          c.blueprintName?.toLowerCase().includes(query)
      );
    }

    // Apply status filter (from dropdown, not URL)
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Apply blueprint filter
    if (blueprintFilter !== 'all') {
      result = result.filter((c) => c.blueprintId === blueprintFilter);
    }

    // Apply date range filter
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      result = result.filter((c) => {
        const createdAt = new Date(c.createdAt);
        return createdAt >= fromDate;
      });
    }
    if (dateRange?.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((c) => {
        const createdAt = new Date(c.createdAt);
        return createdAt <= toDate;
      });
    }

    return result;
  }, [contracts, searchQuery, statusFilter, blueprintFilter, dateRange]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Selection helpers
  const visibleContractIds = useMemo(
    () => filteredContracts.map((c) => c.id),
    [filteredContracts]
  );

  const isAllSelected = useMemo(
    () => visibleContractIds.length > 0 && visibleContractIds.every((id) => selectedIds.includes(id)),
    [visibleContractIds, selectedIds]
  );

  const isSomeSelected = useMemo(
    () => selectedIds.some((id) => visibleContractIds.includes(id)) && !isAllSelected,
    [selectedIds, visibleContractIds, isAllSelected]
  );

  const selectedContracts = useMemo(
    () => contracts.filter((c) => selectedIds.includes(c.id)),
    [contracts, selectedIds]
  );

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleContractIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...visibleContractIds])]);
    }
  };

  const handleSelectRow = (contractId) => {
    setSelectedIds((prev) =>
      prev.includes(contractId)
        ? prev.filter((id) => id !== contractId)
        : [...prev, contractId]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setBlueprintFilter('all');
    setDateRange(null);
    setSelectedIds([]);
  };

  const hasActiveFilters = statusFilter !== 'all' || blueprintFilter !== 'all' || dateRange || searchQuery;

  // Compute available bulk actions based on selected contracts
  const bulkActions = useMemo(() => {
    if (selectedContracts.length === 0) return {};
    const statuses = selectedContracts.map((c) => c.status);
    return {
      canBulkApprove: statuses.every((s) => s === 'pending_approval') && workflowPerms.canApprove,
      canBulkReject: statuses.every((s) => s === 'pending_approval') && workflowPerms.canApprove,
      canBulkSend: statuses.every((s) => ['approved', 'pending_send'].includes(s)) && workflowPerms.canSend,
      canBulkSign: statuses.every((s) => ['pending_internal', 'sent'].includes(s)) && workflowPerms.canSign,
      canBulkRevoke: statuses.every((s) => !['completed', 'revoked', 'declined'].includes(s)),
    };
  }, [selectedContracts, workflowPerms]);

  // Helper to get reason why action is disabled
  const getDisabledReason = (action) => {
    if (selectedContracts.length === 0) return 'No contracts selected';
    const statuses = [...new Set(selectedContracts.map((c) => c.status))];
    switch (action) {
      case 'approve':
      case 'reject':
        if (!workflowPerms.canApprove) return 'You do not have approval permission';
        if (!statuses.every((s) => s === 'pending_approval'))
          return 'All selected must be "Pending Approval"';
        break;
      case 'send':
        if (!workflowPerms.canSend) return 'You do not have send permission';
        if (!statuses.every((s) => ['approved', 'pending_send'].includes(s)))
          return 'All selected must be "Approved" or "Ready to Send"';
        break;
      case 'sign':
        if (!workflowPerms.canSign) return 'You do not have sign permission';
        if (!statuses.every((s) => ['pending_internal', 'sent'].includes(s)))
          return 'All selected must be "Pending Internal" or "Sent"';
        break;
      case 'revoke':
        if (statuses.some((s) => ['completed', 'revoked', 'declined'].includes(s)))
          return 'Cannot revoke completed, revoked, or declined contracts';
        break;
    }
    return null;
  };

  // Action handlers
  const handleApprove = async () => {
    if (!approveDialog.contract) return;
    setActionLoading(true);
    try {
      await contractsApi.update(approveDialog.contract.id, {
        status: 'approved',
        statusHistory: [
          ...(approveDialog.contract.statusHistory || []),
          {
            status: 'approved',
            timestamp: new Date().toISOString(),
            actor: currentUser?.name || 'System',
            note: 'Contract approved',
          },
        ],
      });
      toast.success('Contract approved successfully');
      setApproveDialog({ open: false, contract: null });
      fetchContracts();
    } catch (error) {
      toast.error('Failed to approve contract');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.contract) return;
    setActionLoading(true);
    try {
      await contractsApi.update(rejectDialog.contract.id, {
        status: 'declined',
        statusHistory: [
          ...(rejectDialog.contract.statusHistory || []),
          {
            status: 'declined',
            timestamp: new Date().toISOString(),
            actor: currentUser?.name || 'System',
            note: rejectReason || 'Contract rejected',
          },
        ],
      });
      toast.success('Contract rejected');
      setRejectDialog({ open: false, contract: null });
      setRejectReason('');
      fetchContracts();
    } catch (error) {
      toast.error('Failed to reject contract');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSend = async () => {
    if (!sendDialog.contract) return;
    setActionLoading(true);
    try {
      await contractsApi.update(sendDialog.contract.id, {
        status: 'sent',
        statusHistory: [
          ...(sendDialog.contract.statusHistory || []),
          {
            status: 'sent',
            timestamp: new Date().toISOString(),
            actor: currentUser?.name || 'System',
            note: 'Contract sent to signers',
          },
        ],
      });
      toast.success('Contract sent to signers');
      setSendDialog({ open: false, contract: null });
      fetchContracts();
    } catch (error) {
      toast.error('Failed to send contract');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSign = async () => {
    if (!signDialog.contract) return;
    setActionLoading(true);
    try {
      // Find the current user's signer entry
      const contract = signDialog.contract;
      const updatedSigners = (contract.signers || []).map((signer) => {
        if (signer.email === currentUser?.email || signer.name === currentUser?.name) {
          return {
            ...signer,
            status: 'signed',
            signedAt: new Date().toISOString(),
          };
        }
        return signer;
      });

      // Check if all establishment signers have signed
      const establishmentSigners = updatedSigners.filter((s) => s.signerType === 'establishment');
      const allEstablishmentSigned = establishmentSigners.every((s) => s.status === 'signed');

      const newStatus = allEstablishmentSigned ? 'pending_send' : contract.status;

      await contractsApi.update(contract.id, {
        signers: updatedSigners,
        status: newStatus,
        statusHistory: [
          ...(contract.statusHistory || []),
          {
            status: 'signed',
            timestamp: new Date().toISOString(),
            actor: currentUser?.name || 'System',
            note: `Signed by ${currentUser?.name}`,
          },
        ],
      });
      toast.success('Contract signed successfully');
      setSignDialog({ open: false, contract: null });
      fetchContracts();
    } catch (error) {
      toast.error('Failed to sign contract');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeDialog.contract) return;
    setActionLoading(true);
    try {
      await contractsApi.update(revokeDialog.contract.id, {
        status: 'revoked',
        statusHistory: [
          ...(revokeDialog.contract.statusHistory || []),
          {
            status: 'revoked',
            timestamp: new Date().toISOString(),
            actor: currentUser?.name || 'System',
            note: revokeReason || 'Contract revoked',
          },
        ],
      });
      toast.success('Contract revoked');
      setRevokeDialog({ open: false, contract: null });
      setRevokeReason('');
      fetchContracts();
    } catch (error) {
      toast.error('Failed to revoke contract');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk action handlers
  const handleBulkApprove = async () => {
    setBulkActionLoading(true);
    try {
      const promises = selectedContracts.map((contract) =>
        contractsApi.update(contract.id, {
          status: 'approved',
          statusHistory: [
            ...(contract.statusHistory || []),
            {
              status: 'approved',
              timestamp: new Date().toISOString(),
              actor: currentUser?.name || 'System',
              note: 'Bulk approved',
            },
          ],
        })
      );
      await Promise.all(promises);
      toast.success(`${selectedContracts.length} contracts approved successfully`);
      setBulkApproveDialog(false);
      setSelectedIds([]);
      fetchContracts();
    } catch (error) {
      toast.error('Failed to approve some contracts');
      console.error(error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (!bulkRejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setBulkActionLoading(true);
    try {
      const promises = selectedContracts.map((contract) =>
        contractsApi.update(contract.id, {
          status: 'declined',
          statusHistory: [
            ...(contract.statusHistory || []),
            {
              status: 'declined',
              timestamp: new Date().toISOString(),
              actor: currentUser?.name || 'System',
              note: bulkRejectReason,
            },
          ],
        })
      );
      await Promise.all(promises);
      toast.success(`${selectedContracts.length} contracts rejected`);
      setBulkRejectDialog(false);
      setBulkRejectReason('');
      setSelectedIds([]);
      fetchContracts();
    } catch (error) {
      toast.error('Failed to reject some contracts');
      console.error(error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkSend = async () => {
    setBulkActionLoading(true);
    try {
      const promises = selectedContracts.map((contract) =>
        contractsApi.update(contract.id, {
          status: 'sent',
          statusHistory: [
            ...(contract.statusHistory || []),
            {
              status: 'sent',
              timestamp: new Date().toISOString(),
              actor: currentUser?.name || 'System',
              note: 'Bulk sent to signers',
            },
          ],
        })
      );
      await Promise.all(promises);
      toast.success(`${selectedContracts.length} contracts sent to signers`);
      setBulkSendDialog(false);
      setSelectedIds([]);
      fetchContracts();
    } catch (error) {
      toast.error('Failed to send some contracts');
      console.error(error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkSign = async () => {
    setBulkActionLoading(true);
    try {
      const promises = selectedContracts.map((contract) => {
        const updatedSigners = (contract.signers || []).map((signer) => {
          if (signer.email === currentUser?.email || signer.name === currentUser?.name) {
            return {
              ...signer,
              status: 'signed',
              signedAt: new Date().toISOString(),
            };
          }
          return signer;
        });

        const establishmentSigners = updatedSigners.filter((s) => s.signerType === 'establishment');
        const allEstablishmentSigned = establishmentSigners.every((s) => s.status === 'signed');
        const newStatus = allEstablishmentSigned ? 'pending_send' : contract.status;

        return contractsApi.update(contract.id, {
          signers: updatedSigners,
          status: newStatus,
          statusHistory: [
            ...(contract.statusHistory || []),
            {
              status: 'signed',
              timestamp: new Date().toISOString(),
              actor: currentUser?.name || 'System',
              note: `Bulk signed by ${currentUser?.name}`,
            },
          ],
        });
      });
      await Promise.all(promises);
      toast.success(`${selectedContracts.length} contracts signed`);
      setBulkSignDialog(false);
      setSelectedIds([]);
      fetchContracts();
    } catch (error) {
      toast.error('Failed to sign some contracts');
      console.error(error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkRevoke = async () => {
    if (!bulkRevokeReason.trim()) {
      toast.error('Please provide a revocation reason');
      return;
    }
    setBulkActionLoading(true);
    try {
      const promises = selectedContracts.map((contract) =>
        contractsApi.update(contract.id, {
          status: 'revoked',
          statusHistory: [
            ...(contract.statusHistory || []),
            {
              status: 'revoked',
              timestamp: new Date().toISOString(),
              actor: currentUser?.name || 'System',
              note: bulkRevokeReason,
            },
          ],
        })
      );
      await Promise.all(promises);
      toast.success(`${selectedContracts.length} contracts revoked`);
      setBulkRevokeDialog(false);
      setBulkRevokeReason('');
      setSelectedIds([]);
      fetchContracts();
    } catch (error) {
      toast.error('Failed to revoke some contracts');
      console.error(error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className={isRTL ? 'text-right' : ''}>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-slate-900 rounded-lg">
                <viewInfo.icon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{viewInfo.title}</h1>
            </div>
            <p className="text-slate-500">{viewInfo.description}</p>
          </div>

          {workflowPerms.canCreate && (
            <Link to={createPageUrl('ContractCreate')}>
              <Button className="bg-slate-900 hover:bg-slate-800 gap-2">
                <Plus className="w-4 h-4" />
                Create Contract
              </Button>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{contracts.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {contracts.filter((c) => c.status?.includes('pending')).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {contracts.filter((c) => ['approved', 'sent', 'partially_signed'].includes(c.status)).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Completed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {contracts.filter((c) => c.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search contracts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending_send">Ready to Send</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>

            <Select value={blueprintFilter} onValueChange={setBlueprintFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by blueprint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blueprints</SelectItem>
                {blueprints.map((bp) => (
                  <SelectItem key={bp.id} value={bp.id}>
                    {bp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DateFilter
              value={dateRange}
              onChange={setDateRange}
              placeholder="Created date"
              className="w-auto"
            />

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-slate-500 hover:text-slate-700"
                  onClick={handleClearAllFilters}
                >
                  <X className="w-4 h-4" />
                  Clear filters
                </Button>
              )}

              <Button variant="outline" size="sm" className="gap-2" onClick={fetchContracts}>
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Contracts Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-900 font-medium">No contracts found</p>
              <p className="text-sm text-slate-500 mt-1">
                {currentView === 'all'
                  ? 'Create your first contract to get started'
                  : 'No contracts match the current filter'}
              </p>
              {workflowPerms.canCreate && currentView === 'all' && (
                <Link to={createPageUrl('ContractCreate')}>
                  <Button className="mt-4 gap-2">
                    <Plus className="w-4 h-4" />
                    Create Contract
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all contracts"
                      className={isSomeSelected ? 'data-[state=checked]:bg-slate-600' : ''}
                    />
                  </TableHead>
                  <TableHead className="w-[200px]">Reference</TableHead>
                  <TableHead>Contract Name</TableHead>
                  <TableHead>Blueprint</TableHead>
                  <TableHead>Signers</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => {
                  const signedCount = contract.signers?.filter((s) => s.status === 'signed').length || 0;
                  const totalSigners = contract.signers?.length || 0;
                  const isSelected = selectedIds.includes(contract.id);
                  return (
                    <TableRow
                      key={contract.id}
                      className={cn(
                        'hover:bg-slate-50/50 cursor-pointer',
                        isSelected && 'bg-blue-50/50'
                      )}
                      onClick={() => window.location.href = createPageUrl(`ContractDetail?id=${contract.id}`)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectRow(contract.id)}
                          aria-label={`Select ${contract.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-700">
                          {contract.reference || `CON-${contract.id}`}
                        </code>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-900">{contract.name}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-600">{contract.blueprintName || '-'}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1.5">
                            {(contract.signers || []).slice(0, 3).map((signer, idx) => {
                              const initials = signer.name
                                ?.split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase() || '?';
                              return (
                                <div
                                  key={idx}
                                  className={cn(
                                    'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium ring-2 ring-white',
                                    signer.status === 'signed'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-slate-100 text-slate-600'
                                  )}
                                  title={`${signer.name} - ${signer.status}`}
                                >
                                  {initials}
                                </div>
                              );
                            })}
                            {totalSigners > 3 && (
                              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600 ring-2 ring-white">
                                +{totalSigners - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-500">{formatDate(contract.createdAt)}</p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={contract.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link to={createPageUrl(`ContractDetail?id=${contract.id}`)}>
                                <DropdownMenuItem className="gap-2">
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </DropdownMenuItem>
                              </Link>

                              {/* Approve/Reject for pending_approval */}
                              {contract.status === 'pending_approval' && workflowPerms.canApprove && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="gap-2 text-emerald-600"
                                    onClick={() => setApproveDialog({ open: true, contract })}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="gap-2 text-red-600"
                                    onClick={() => setRejectDialog({ open: true, contract })}
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}

                              {/* Send for approved/pending_send */}
                              {(contract.status === 'approved' || contract.status === 'pending_send') && workflowPerms.canSend && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="gap-2 text-indigo-600"
                                    onClick={() => setSendDialog({ open: true, contract })}
                                  >
                                    <Send className="w-4 h-4" />
                                    Send to Signers
                                  </DropdownMenuItem>
                                </>
                              )}

                              {/* Sign for pending_internal/sent */}
                              {(contract.status === 'pending_internal' || contract.status === 'sent') && workflowPerms.canSign && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="gap-2 text-purple-600"
                                    onClick={() => setSignDialog({ open: true, contract })}
                                  >
                                    <FileSignature className="w-4 h-4" />
                                    Sign Contract
                                  </DropdownMenuItem>
                                </>
                              )}

                              {/* Revoke for active contracts */}
                              {contract.status !== 'completed' &&
                                contract.status !== 'revoked' &&
                                contract.status !== 'declined' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="gap-2 text-red-600"
                                      onClick={() => setRevokeDialog({ open: true, contract })}
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Revoke Contract
                                    </DropdownMenuItem>
                                  </>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Bulk Actions Bar - at bottom for better UX */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between py-3 px-1">
            <div className="flex items-center gap-4">
              <span className="font-medium text-slate-700">
                {selectedIds.length} contract{selectedIds.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-700"
                onClick={handleClearSelection}
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* Only show Approve button when applicable */}
              {bulkActions.canBulkApprove && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={() => setBulkApproveDialog(true)}
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Approve
                </Button>
              )}

              {/* Only show Reject button when applicable */}
              {bulkActions.canBulkReject && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={() => setBulkRejectDialog(true)}
                >
                  <XCircle className="w-4 h-4 text-red-500" />
                  Reject
                </Button>
              )}

              {/* Only show Send button when applicable */}
              {bulkActions.canBulkSend && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={() => setBulkSendDialog(true)}
                >
                  <Send className="w-4 h-4 text-blue-500" />
                  Send
                </Button>
              )}

              {/* Only show Sign button when applicable */}
              {bulkActions.canBulkSign && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={() => setBulkSignDialog(true)}
                >
                  <FileSignature className="w-4 h-4 text-violet-500" />
                  Sign
                </Button>
              )}

              {/* Only show Revoke button when applicable */}
              {bulkActions.canBulkRevoke && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={() => setBulkRevokeDialog(true)}
                >
                  <XCircle className="w-4 h-4 text-orange-500" />
                  Revoke
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog({ open, contract: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Contract</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve "{approveDialog.contract?.name}"? This will move the contract
              to the next stage in the workflow.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog({ open: false, contract: null })}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleApprove} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, contract: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Contract</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{rejectDialog.contract?.name}".
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, contract: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={sendDialog.open} onOpenChange={(open) => setSendDialog({ open, contract: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Contract</DialogTitle>
            <DialogDescription>
              Send "{sendDialog.contract?.name}" to the following signers:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {sendDialog.contract?.signers
              ?.filter((s) => s.signerType === 'external')
              .map((signer, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{signer.name}</p>
                    <p className="text-xs text-slate-500">{signer.email}</p>
                  </div>
                </div>
              ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialog({ open: false, contract: null })}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSend} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Send to Signers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign Dialog */}
      <Dialog open={signDialog.open} onOpenChange={(open) => setSignDialog({ open, contract: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Contract</DialogTitle>
            <DialogDescription>
              You are about to sign "{signDialog.contract?.name}" as an establishment signer. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <FileSignature className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-900">Digital Signature</p>
              <p className="text-xs text-purple-700">
                Signing as: {currentUser?.name} ({currentUser?.email})
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignDialog({ open: false, contract: null })}>
              Cancel
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSign} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sign Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Dialog */}
      <Dialog open={revokeDialog.open} onOpenChange={(open) => setRevokeDialog({ open, contract: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Contract</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke "{revokeDialog.contract?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter revocation reason..."
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialog({ open: false, contract: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevoke} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Revoke Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Approve Dialog */}
      <Dialog open={bulkApproveDialog} onOpenChange={setBulkApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              Approve {selectedContracts.length} Contract{selectedContracts.length !== 1 ? 's' : ''}
            </DialogTitle>
            <DialogDescription>
              This will move them to the next stage in the workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Selected Contracts</label>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-3 bg-slate-50">
              {selectedContracts.map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b last:border-0 border-slate-100">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.reference || c.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkApproveDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
              onClick={handleBulkApprove}
              disabled={bulkActionLoading}
            >
              {bulkActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Approve All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Reject Dialog */}
      <Dialog open={bulkRejectDialog} onOpenChange={setBulkRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              Reject {selectedContracts.length} Contract{selectedContracts.length !== 1 ? 's' : ''}
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Selected Contracts</label>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-3 bg-slate-50">
              {selectedContracts.map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b last:border-0 border-slate-100">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.reference || c.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Reason <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Enter rejection reason..."
              value={bulkRejectReason}
              onChange={(e) => setBulkRejectReason(e.target.value)}
              className={cn("min-h-[80px]", !bulkRejectReason.trim() && bulkRejectReason !== '' && "border-red-300 focus-visible:ring-red-300")}
            />
            {!bulkRejectReason.trim() && bulkRejectReason !== '' && (
              <p className="text-sm text-red-500">Rejection reason is required</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setBulkRejectDialog(false); setBulkRejectReason(''); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={handleBulkReject}
              disabled={bulkActionLoading || !bulkRejectReason.trim()}
            >
              {bulkActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Reject All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Send Dialog */}
      <Dialog open={bulkSendDialog} onOpenChange={setBulkSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              Send {selectedContracts.length} Contract{selectedContracts.length !== 1 ? 's' : ''}
            </DialogTitle>
            <DialogDescription>
              Send these contracts to their external signers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Selected Contracts</label>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-3 bg-slate-50">
              {selectedContracts.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0 border-slate-100">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.reference || c.id}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {c.signers?.filter((s) => s.signerType === 'external').length || 0} signers
                  </span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkSendDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 gap-2"
              onClick={handleBulkSend}
              disabled={bulkActionLoading}
            >
              {bulkActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Sign Dialog */}
      <Dialog open={bulkSignDialog} onOpenChange={setBulkSignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-violet-100 rounded-lg">
                <FileSignature className="w-5 h-5 text-violet-600" />
              </div>
              Sign {selectedContracts.length} Contract{selectedContracts.length !== 1 ? 's' : ''}
            </DialogTitle>
            <DialogDescription>
              You are about to sign as an establishment signer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-lg border border-violet-200">
            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
              <FileSignature className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-violet-900">Digital Signature</p>
              <p className="text-xs text-violet-700">
                Signing as: {currentUser?.name} ({currentUser?.email})
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Selected Contracts</label>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-3 bg-slate-50">
              {selectedContracts.map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b last:border-0 border-slate-100">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.reference || c.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkSignDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700 gap-2"
              onClick={handleBulkSign}
              disabled={bulkActionLoading}
            >
              {bulkActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Revoke Dialog */}
      <Dialog open={bulkRevokeDialog} onOpenChange={setBulkRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <XCircle className="w-5 h-5 text-orange-600" />
              </div>
              Revoke {selectedContracts.length} Contract{selectedContracts.length !== 1 ? 's' : ''}
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Selected Contracts</label>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-3 bg-slate-50">
              {selectedContracts.map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b last:border-0 border-slate-100">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.reference || c.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Reason <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Enter revocation reason..."
              value={bulkRevokeReason}
              onChange={(e) => setBulkRevokeReason(e.target.value)}
              className={cn("min-h-[80px]", !bulkRevokeReason.trim() && bulkRevokeReason !== '' && "border-red-300 focus-visible:ring-red-300")}
            />
            {!bulkRevokeReason.trim() && bulkRevokeReason !== '' && (
              <p className="text-sm text-red-500">Revocation reason is required</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setBulkRevokeDialog(false); setBulkRevokeReason(''); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={handleBulkRevoke}
              disabled={bulkActionLoading || !bulkRevokeReason.trim()}
            >
              {bulkActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Revoke All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
