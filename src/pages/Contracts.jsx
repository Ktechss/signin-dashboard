import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ContractFilters from '@/components/contracts/ContractFilters';
import { CardSkeleton } from '@/components/ui-custom/LoadingSkeleton';
import EmptyState from '@/components/ui-custom/EmptyState';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { FileText, Eye, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getContracts,
  CONTRACT_STATUS,
  CONTRACT_STATUS_CONFIG,
} from '@/utils/templateStorage';
import { cn } from '@/lib/utils';

export default function Contracts() {
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [contracts, setContracts] = useState([]);

  // Load contracts from API
  useEffect(() => {
    const loadContracts = async () => {
      setIsLoading(true);
      try {
        const storedContracts = await getContracts();
        // Sort by most recent first
        const sorted = storedContracts.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setContracts(sorted);
      } catch (error) {
        console.error('Error loading contracts:', error);
        setContracts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadContracts();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = CONTRACT_STATUS_CONFIG[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
    return (
      <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', config.color)}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Contracts</h1>
            <p className="text-slate-500 mt-1">Manage and monitor all your contracts in one place.</p>
          </div>
          <Link to={createPageUrl('ContractCreate')}>
            <Button className="gap-2 bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4" />
              Create Contract
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <ContractFilters
          filters={filters}
          onFiltersChange={setFilters}
        />


        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : contracts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No contracts found"
            description="Create your first contract from a blueprint to get started with document signing."
            actionLabel="Create Contract"
            onAction={() => window.location.href = createPageUrl('ContractCreate')}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead>Reference</TableHead>
                  <TableHead>Contract Name</TableHead>
                  <TableHead>Blueprint</TableHead>
                  <TableHead>Signers</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => {
                  const signers = contract.signers || [];
                  const signedCount = signers.filter(s => s.status === 'signed').length;

                  return (
                    <TableRow key={contract.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-700">
                          {contract.reference || `CON-${contract.id}`}
                        </code>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {contract.name || 'Untitled Contract'}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {contract.blueprintName || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center -space-x-1">
                            {signers.slice(0, 4).map((signer, index) => {
                              const name = signer.name || `Signer ${signer.signerId}`;
                              const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                              return (
                                <div
                                  key={index}
                                  className="relative group"
                                  title={`${name} - ${signer.status}`}
                                >
                                  <div
                                    className={cn(
                                      'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ring-1 ring-white',
                                      signer.status === 'signed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                                      signer.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                                      'bg-slate-100 text-slate-700 border border-slate-300'
                                    )}
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
                                </div>
                              );
                            })}
                          </div>
                          <span className="text-xs text-slate-500">
                            {signedCount}/{signers.length}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(contract.createdAt)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(contract.status)}
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
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}