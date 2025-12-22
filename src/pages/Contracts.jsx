import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ContractFilters from '@/components/contracts/ContractFilters';
import { CardSkeleton } from '@/components/ui-custom/LoadingSkeleton';
import EmptyState from '@/components/ui-custom/EmptyState';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock data
const mockContracts = [
  { id: 1, name: 'Sales Agreement - Acme Corp', reference: 'SA-2024-001', status: 'in_progress', template: 'Sales Agreement', signedCount: 2, totalParties: 3, parties: [{ id: 1, name: 'John Smith', status: 'signed' }, { id: 2, name: 'Jane Doe', status: 'signed' }, { id: 3, name: 'Bob Wilson', status: 'pending' }], expiresIn: '2 days', createdAt: 'Jan 15, 2024', lastUpdated: 'Jan 17, 2024', priority: 'high' },
  { id: 2, name: 'NDA - TechStart Inc', reference: 'NDA-2024-089', status: 'signed', template: 'NDA', signedCount: 2, totalParties: 2, parties: [{ id: 1, name: 'Alice Chen', status: 'signed' }, { id: 2, name: 'Tom Brown', status: 'signed' }], expiresIn: null, createdAt: 'Jan 14, 2024', lastUpdated: 'Jan 17, 2024', priority: 'medium' },
  { id: 3, name: 'Employment Contract - Sarah M.', reference: 'EC-2024-156', status: 'pending', template: 'Employment', signedCount: 0, totalParties: 2, parties: [{ id: 1, name: 'Sarah Miller', status: 'pending' }, { id: 2, name: 'HR Dept', status: 'pending' }], expiresIn: '5 days', createdAt: 'Jan 13, 2024', lastUpdated: 'Jan 13, 2024', priority: 'medium' },
  { id: 4, name: 'Partnership Agreement - Global Ventures', reference: 'PA-2024-023', status: 'failed', template: 'Partnership', signedCount: 1, totalParties: 3, parties: [{ id: 1, name: 'Mike Johnson', status: 'signed' }, { id: 2, name: 'Lisa Park', status: 'failed' }, { id: 3, name: 'Dave Lee', status: 'pending' }], expiresIn: null, createdAt: 'Jan 12, 2024', lastUpdated: 'Jan 16, 2024', priority: 'high' },
  { id: 5, name: 'Service Agreement - CloudTech', reference: 'SVC-2024-045', status: 'in_progress', template: 'Service Agreement', signedCount: 1, totalParties: 2, parties: [{ id: 1, name: 'CloudTech Inc', status: 'signed' }, { id: 2, name: 'Our Company', status: 'pending' }], expiresIn: '7 days', createdAt: 'Jan 11, 2024', lastUpdated: 'Jan 15, 2024', priority: 'low' },
  { id: 6, name: 'NDA - Innovation Labs', reference: 'NDA-2024-090', status: 'pending', template: 'NDA', signedCount: 0, totalParties: 2, parties: [{ id: 1, name: 'Innovation Labs', status: 'pending' }, { id: 2, name: 'Legal Dept', status: 'pending' }], expiresIn: '3 days', createdAt: 'Jan 10, 2024', lastUpdated: 'Jan 10, 2024', priority: 'medium' },
  { id: 7, name: 'Vendor Agreement - SupplyChain Pro', reference: 'VA-2024-012', status: 'expired', template: 'Vendor Agreement', signedCount: 1, totalParties: 2, parties: [{ id: 1, name: 'SupplyChain Pro', status: 'signed' }, { id: 2, name: 'Procurement', status: 'expired' }], expiresIn: null, createdAt: 'Jan 5, 2024', lastUpdated: 'Jan 8, 2024', priority: 'low' },
  { id: 8, name: 'Consulting Agreement - Expert Advisors', reference: 'CA-2024-034', status: 'signed', template: 'Consulting', signedCount: 2, totalParties: 2, parties: [{ id: 1, name: 'Expert Advisors', status: 'signed' }, { id: 2, name: 'Finance Team', status: 'signed' }], expiresIn: null, createdAt: 'Jan 8, 2024', lastUpdated: 'Jan 14, 2024', priority: 'medium' },
];

export default function Contracts() {
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quick Sign</h1>
          <p className="text-slate-500 mt-1">Manage and monitor all your quick sign contracts in one place.</p>
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
        ) : mockContracts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No quick sign contracts found"
            description="Create your first quick sign contract to get started with document signing."
            actionLabel="Create Quick Sign Contract"
            onAction={() => {}}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
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
                {mockContracts.map((contract) => (
                  <TableRow key={contract.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-700">
                        {contract.reference}
                      </code>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{contract.template}</TableCell>
                    <TableCell>
                      <div className="flex items-center -space-x-1">
                        {contract.parties.map((party, index) => {
                          const initials = party.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                          return (
                            <div
                              key={index}
                              className="relative group"
                              title={`${party.name} - ${party.status}`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ring-1 ring-white ${
                                  party.status === 'signed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                                  party.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                                  party.status === 'failed' ? 'bg-red-100 text-red-700 border border-red-300' :
                                  'bg-slate-100 text-slate-700 border border-slate-300'
                                }`}
                              >
                                {initials}
                              </div>
                              {party.status === 'signed' && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full flex items-center justify-center ring-1 ring-white">
                                  <svg className="w-1.5 h-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                              {party.status === 'pending' && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full flex items-center justify-center ring-1 ring-white">
                                  <svg className="w-1.5 h-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{contract.createdAt}</TableCell>
                    <TableCell className="text-sm text-slate-500">{contract.lastUpdated}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}