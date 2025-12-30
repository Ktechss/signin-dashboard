import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { contractsApi } from '@/services/api';
import { useAuth } from '@/pages/index';
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
import StatusBadge from '@/components/ui-custom/StatusBadge';
import KPICard from '@/components/ui-custom/KPICard';

export default function SigningRequests() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { selectedClient } = useAuth();
  const clientId = selectedClient?.id;

  // Fetch contracts from API
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const params = clientId ? { clientId } : {};
        const data = await contractsApi.getAll(params);
        setContracts(data || []);
      } catch (error) {
        console.error('Failed to fetch contracts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, [clientId]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format time ago helper
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  // Filter contracts
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = !searchQuery ||
      contract.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.blueprintName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats from contracts
  const stats = [
    {
      title: 'Total Contracts',
      value: contracts.length.toString(),
      subtitle: 'All contracts',
      icon: Clock,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50'
    },
    {
      title: 'Completed',
      value: contracts.filter(c => c.status === 'completed' || c.status === 'signed').length.toString(),
      trend: 'up',
      trendValue: '+2.1%',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50'
    },
    {
      title: 'Failed/Declined',
      value: contracts.filter(c => c.status === 'failed' || c.status === 'declined' || c.status === 'revoked').length.toString(),
      trend: 'down',
      trendValue: '-12%',
      icon: XCircle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50'
    },
    {
      title: 'Pending',
      value: contracts.filter(c => c.status === 'pending' || c.status === 'pending_internal' || c.status === 'pending_external' || c.status === 'draft').length.toString(),
      subtitle: 'Awaiting action',
      icon: AlertCircle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading contracts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Signing Requests</h1>
            <p className="text-slate-500 mt-1">Track individual signing requests and their status.</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <KPICard key={index} {...stat} />
          ))}
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, reference, or blueprint..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending_internal">Pending Internal</SelectItem>
                  <SelectItem value="pending_external">Pending External</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead>Contract ID</TableHead>
                  <TableHead>Blueprint Name</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No contracts found</p>
                      <p className="text-xs text-slate-400 mt-1">Create a contract from a blueprint to get started</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContracts.map(contract => {
                    const signers = contract.signers || [];

                    return (
                      <TableRow
                        key={contract.id}
                        className="hover:bg-slate-50/50"
                      >
                        <TableCell>
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-700">
                            {contract.reference || `CON-${contract.id}`}
                          </code>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {contract.blueprintName || contract.name || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center -space-x-1">
                            {signers.length > 0 ? signers.map((signer, index) => {
                              const name = signer.name || `Signer ${index + 1}`;
                              const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                              return (
                                <div
                                  key={index}
                                  className="relative group"
                                  title={`${name} - ${signer.status || 'pending'}`}
                                >
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ring-1 ring-white ${
                                      signer.status === 'signed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                                      signer.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                                      signer.status === 'failed' ? 'bg-red-100 text-red-700 border border-red-300' :
                                      'bg-slate-100 text-slate-700 border border-slate-300'
                                    }`}
                                  >
                                    {initials}
                                  </div>
                                  {signer.status === 'signed' && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full flex items-center justify-center ring-1 ring-white">
                                      <svg className="w-1.5 h-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  )}
                                  {signer.status === 'pending' && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full flex items-center justify-center ring-1 ring-white">
                                      <svg className="w-1.5 h-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              );
                            }) : (
                              <span className="text-xs text-slate-400">No signers</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">{formatDate(contract.createdAt)}</TableCell>
                        <TableCell className="text-sm text-slate-500">{formatDate(contract.updatedAt || contract.createdAt)}</TableCell>
                        <TableCell>
                          <StatusBadge status={contract.status} size="sm" />
                        </TableCell>
                        <TableCell>
                          <Link to={createPageUrl(`ContractDetail?id=${contract.id}`)}>
                            <Button variant="ghost" size="icon" className="w-8 h-8">
                              <Eye className="w-4 h-4 text-slate-500" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredContracts.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium">{filteredContracts.length}</span> contract{filteredContracts.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
        

      </div>
    </div>
  );
}