import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { createPageUrl } from '@/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye, Bell, MoreHorizontal, RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ContractFilters from '@/components/contracts/ContractFilters';
import { CardSkeleton } from '@/components/ui-custom/LoadingSkeleton';
import EmptyState from '@/components/ui-custom/EmptyState';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import KPICard from '@/components/ui-custom/KPICard';
import { Search } from 'lucide-react';

// Mock data for contracts
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

// Mock data for signing requests
const mockSigningRequests = [
  { id: 'SR-001', requestToken: 'TKN-8F2A-X9K1', userName: 'John Smith', email: 'john@acme.com', contractId: 1, status: 'authorised', lastActivity: '2 hours ago', attemptNumber: 1, createdDate: 'Jan 16, 2024' },
  { id: 'SR-002', requestToken: 'TKN-3B7C-M4P2', userName: 'Jane Doe', email: 'jane@company.com', contractId: 1, status: 'authorised', lastActivity: '1 day ago', attemptNumber: 1, createdDate: 'Jan 15, 2024' },
  { id: 'SR-003', requestToken: 'TKN-5D9E-Q6R3', userName: 'Bob Wilson', email: 'bob@legal.com', contractId: 1, status: 'pending', lastActivity: '3 days ago', attemptNumber: 1, createdDate: 'Jan 15, 2024' },
  { id: 'SR-004', requestToken: 'TKN-7F1G-S8T4', userName: 'Alice Chen', email: 'alice@techstart.com', contractId: 2, status: 'authorised', lastActivity: '5 hours ago', attemptNumber: 1, createdDate: 'Jan 14, 2024' },
  { id: 'SR-005', requestToken: 'TKN-2H4I-U0V5', userName: 'Lisa Park', email: 'lisa@partner.com', contractId: 4, status: 'rejected', lastActivity: '2 days ago', attemptNumber: 1, createdDate: 'Jan 12, 2024' },
  { id: 'SR-006', requestToken: 'TKN-9J6K-W2X6', userName: 'Lisa Park', email: 'lisa@partner.com', contractId: 4, status: 'authorised', lastActivity: '1 day ago', attemptNumber: 2, createdDate: 'Jan 13, 2024' },
  { id: 'SR-007', requestToken: 'TKN-1L8M-Y4Z7', userName: 'Mike Johnson', email: 'mike@partner.com', contractId: 4, status: 'authorised', lastActivity: '3 days ago', attemptNumber: 1, createdDate: 'Jan 12, 2024' },
  { id: 'SR-008', requestToken: 'TKN-3N0O-A6B8', userName: 'Sarah Miller', email: 'sarah@email.com', contractId: 3, status: 'pending', lastActivity: '4 hours ago', attemptNumber: 1, createdDate: 'Jan 13, 2024' },
  { id: 'SR-009', requestToken: 'TKN-5P2Q-C8D9', userName: 'Dave Lee', email: 'dave@partner.com', contractId: 4, status: 'expired', lastActivity: '5 days ago', attemptNumber: 1, createdDate: 'Jan 10, 2024' },
  { id: 'SR-010', requestToken: 'TKN-7R4S-E0F0', userName: 'Dave Lee', email: 'dave@partner.com', contractId: 4, status: 'pending', lastActivity: '1 hour ago', attemptNumber: 2, createdDate: 'Jan 18, 2024' },
];

export default function Current() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('contracts');
  const [contractFilters, setContractFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const signingRequestStats = [
    { title: t('signing.stats.totalSigningRequests'), value: '1,234', subtitle: t('signing.stats.allVerificationAttempts'), icon: Clock, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50' },
    { title: t('signing.stats.authorised'), value: '1,098', trend: 'up', trendValue: '+2.1%', icon: CheckCircle2, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
    { title: t('signing.stats.rejected'), value: '68', trend: 'down', trendValue: '-12%', icon: XCircle, iconColor: 'text-red-600', iconBg: 'bg-red-50' },
    { title: t('signing.stats.pending'), value: '156', subtitle: t('signing.stats.awaitingVerification'), icon: AlertCircle, iconColor: 'text-amber-600', iconBg: 'bg-amber-50' },
  ];

  const toggleRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedRows(prev =>
      prev.length === mockSigningRequests.length ? [] : mockSigningRequests.map(r => r.id)
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className={isRTL ? 'text-right' : ''}>
          <h1 className="text-2xl font-bold text-slate-900">{t('signing.title')}</h1>
          <p className="text-slate-500 mt-1">{t('signing.subtitle')}</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`bg-slate-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <TabsTrigger value="contracts" className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <FileText className="w-4 h-4" />
              {t('signing.quickSign')}
            </TabsTrigger>
            <TabsTrigger value="signingRequests" className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Clock className="w-4 h-4" />
              {t('signing.signingRequests')}
            </TabsTrigger>
          </TabsList>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-6 mt-6">
            <ContractFilters
              filters={contractFilters}
              onFiltersChange={setContractFilters}
            />

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : mockContracts.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No contracts found"
                description="Create your first contract to get started with document signing."
                actionLabel="Create Contract"
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
          </TabsContent>

          {/* Signing Requests Tab */}
          <TabsContent value="signingRequests" className="space-y-6 mt-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {signingRequestStats.map((stat, index) => (
                <KPICard key={index} {...stat} />
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="Search by name, email, or token..." className="pl-10" />
                </div>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="authorised">Authorised</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedRows.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm text-indigo-700 font-medium">{selectedRows.length} signing requests selected</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2 bg-white">
                    <Bell className="w-4 h-4" />
                    Send Reminder
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 bg-white">
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Reviewed
                  </Button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedRows.length === mockSigningRequests.length}
                          onCheckedChange={toggleAll}
                        />
                      </TableHead>
                      <TableHead>Request Token</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSigningRequests.map(request => (
                      <TableRow
                        key={request.id}
                        className="hover:bg-slate-50/50 cursor-pointer"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.includes(request.id)}
                            onCheckedChange={() => toggleRow(request.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-700">
                            {request.requestToken}
                          </code>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={request.status} size="sm" />
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">{request.lastActivity}</TableCell>
                        <TableCell className="text-slate-500 text-sm">{request.createdDate}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-8 h-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link to={createPageUrl(`SigningRequestDetail?token=${request.requestToken}`)}>
                                <DropdownMenuItem className="gap-2">
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem className="gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Retry Verification
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 text-red-600">
                                <XCircle className="w-4 h-4" />
                                Cancel Request
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-medium">1-10</span> of <span className="font-medium">1,234</span> signing requests
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </div>


          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
