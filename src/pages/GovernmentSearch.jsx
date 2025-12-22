import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Search,
  Eye,
  FileText,
  User,
  Building2,
  CreditCard,
  X,
  Filter,
  ChevronDown,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import EmptyState from '@/components/ui-custom/EmptyState';

// Mock data for all contracts across all clients with UAE-specific identifiers
const allContractsData = [
  {
    id: 1,
    reference: 'CTR-2024-001',
    clientName: 'ADCB Bank',
    clientAbbr: 'AD',
    signerName: 'Ahmed Mohammed Al Maktoum',
    emiratesId: '784-1990-1234567-1',
    udbNumber: 'UDB-123456789',
    documentType: 'Account Opening',
    status: 'signed',
    createdAt: 'Dec 15, 2024',
    completedAt: 'Dec 16, 2024',
  },
  {
    id: 2,
    reference: 'CTR-2024-002',
    clientName: 'ADCB Bank',
    clientAbbr: 'AD',
    signerName: 'Fatima Hassan Al Nahyan',
    emiratesId: '784-1985-7654321-2',
    udbNumber: null,
    documentType: 'Loan Agreement',
    status: 'in_progress',
    createdAt: 'Dec 18, 2024',
    completedAt: null,
  },
  {
    id: 3,
    reference: 'CTR-2024-003',
    clientName: 'Emirates NBD',
    clientAbbr: 'EN',
    signerName: 'Khalid Omar Al Qasimi',
    emiratesId: '784-1988-9876543-3',
    udbNumber: 'UDB-987654321',
    documentType: 'Credit Card Application',
    status: 'signed',
    createdAt: 'Dec 10, 2024',
    completedAt: 'Dec 12, 2024',
  },
  {
    id: 4,
    reference: 'CTR-2024-004',
    clientName: 'Emirates NBD',
    clientAbbr: 'EN',
    signerName: 'Sara Abdullah Al Falasi',
    emiratesId: '784-1992-4567890-4',
    udbNumber: null,
    documentType: 'Mortgage Agreement',
    status: 'pending',
    createdAt: 'Dec 20, 2024',
    completedAt: null,
  },
  {
    id: 5,
    reference: 'CTR-2024-005',
    clientName: 'First Abu Dhabi',
    clientAbbr: 'FA',
    signerName: 'Mohammed Rashid Al Shamsi',
    emiratesId: '784-1975-1122334-5',
    udbNumber: 'UDB-112233445',
    documentType: 'Business Account',
    status: 'signed',
    createdAt: 'Dec 5, 2024',
    completedAt: 'Dec 7, 2024',
  },
  {
    id: 6,
    reference: 'CTR-2024-006',
    clientName: 'First Abu Dhabi',
    clientAbbr: 'FA',
    signerName: 'Aisha Hamdan Al Ketbi',
    emiratesId: '784-1995-5566778-6',
    udbNumber: null,
    documentType: 'Investment Agreement',
    status: 'failed',
    createdAt: 'Dec 14, 2024',
    completedAt: null,
  },
  {
    id: 7,
    reference: 'CTR-2024-007',
    clientName: 'Mashreq Bank',
    clientAbbr: 'MB',
    signerName: 'Omar Saeed Al Suwaidi',
    emiratesId: '784-1982-9988776-7',
    udbNumber: 'UDB-998877665',
    documentType: 'Trade Finance',
    status: 'signed',
    createdAt: 'Dec 8, 2024',
    completedAt: 'Dec 10, 2024',
  },
  {
    id: 8,
    reference: 'CTR-2024-008',
    clientName: 'Mashreq Bank',
    clientAbbr: 'MB',
    signerName: 'Mariam Yousuf Al Dhaheri',
    emiratesId: '784-1998-3344556-8',
    udbNumber: null,
    documentType: 'Personal Loan',
    status: 'in_progress',
    createdAt: 'Dec 19, 2024',
    completedAt: null,
  },
  {
    id: 9,
    reference: 'CTR-2024-009',
    clientName: 'ADCB Bank',
    clientAbbr: 'AD',
    signerName: 'Abdullah Khalifa Al Mansoori',
    emiratesId: '784-1970-7788990-9',
    udbNumber: 'UDB-778899001',
    documentType: 'Corporate Agreement',
    status: 'signed',
    createdAt: 'Dec 1, 2024',
    completedAt: 'Dec 3, 2024',
  },
  {
    id: 10,
    reference: 'CTR-2024-010',
    clientName: 'Emirates NBD',
    clientAbbr: 'EN',
    signerName: 'Noura Ahmed Al Mazrouei',
    emiratesId: '784-1991-2233445-0',
    udbNumber: null,
    documentType: 'Savings Account',
    status: 'expired',
    createdAt: 'Nov 25, 2024',
    completedAt: null,
  },
];

const searchTypes = [
  { value: 'all', label: 'All Fields', icon: Search },
  { value: 'name', label: 'Name', icon: User },
  { value: 'eid', label: 'Emirates ID', icon: CreditCard },
  { value: 'udb', label: 'UDB Number', icon: Building2 },
];

const getStatusIcon = (status) => {
  switch (status) {
    case 'signed':
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case 'in_progress':
      return <Clock className="w-4 h-4 text-blue-500" />;
    case 'pending':
      return <AlertCircle className="w-4 h-4 text-amber-500" />;
    case 'failed':
    case 'expired':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return null;
  }
};

export default function GovernmentSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    const query = searchQuery.toLowerCase().trim();

    const filtered = allContractsData.filter((contract) => {
      switch (searchType) {
        case 'name':
          return contract.signerName.toLowerCase().includes(query);
        case 'eid':
          return contract.emiratesId.toLowerCase().includes(query);
        case 'udb':
          return contract.udbNumber?.toLowerCase().includes(query);
        case 'all':
        default:
          return (
            contract.signerName.toLowerCase().includes(query) ||
            contract.emiratesId.toLowerCase().includes(query) ||
            (contract.udbNumber && contract.udbNumber.toLowerCase().includes(query)) ||
            contract.reference.toLowerCase().includes(query)
          );
      }
    });

    setResults(filtered);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case 'name':
        return 'Enter full name or partial name...';
      case 'eid':
        return 'Enter Emirates ID (e.g., 784-1990-1234567-1)...';
      case 'udb':
        return 'Enter UDB Number (e.g., UDB-123456789)...';
      default:
        return 'Search by name, Emirates ID, UDB number, or contract reference...';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Government Search</h1>
          <p className="text-slate-500 mt-1">
            Search contracts across all clients using Name, Emirates ID (EID), or UDB Number.
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-6">
          <div className="flex flex-col gap-4">
            {/* Search Type Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Search by:</span>
              <div className="flex gap-2">
                {searchTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSearchType(type.value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      searchType === type.value
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder={getPlaceholder()}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-10 h-12 text-base"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <Button onClick={handleSearch} className="h-12 px-8 bg-slate-900 hover:bg-slate-800">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Quick Stats */}
            {hasSearched && (
              <div className="flex items-center gap-4 pt-2">
                <span className="text-sm text-slate-500">
                  Found <span className="font-semibold text-slate-900">{results.length}</span>{' '}
                  {results.length === 1 ? 'result' : 'results'}
                </span>
                {results.length > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      {results.filter((r) => r.status === 'signed').length} Signed
                    </span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <Clock className="w-4 h-4" />
                      {results.filter((r) => r.status === 'in_progress').length} In Progress
                    </span>
                    <span className="flex items-center gap-1 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      {results.filter((r) => r.status === 'pending').length} Pending
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {!hasSearched ? (
          <div className="bg-white rounded-xl border border-slate-200/60 p-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Search Government Records</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Enter a name, Emirates ID, or UDB number to search across all client contracts and
                signing records.
              </p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No records found"
            description={`No contracts found matching "${searchQuery}". Try adjusting your search criteria.`}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead>Contract ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Signer Name</TableHead>
                  <TableHead>Emirates ID</TableHead>
                  <TableHead>UDB Number</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((contract) => (
                  <TableRow key={contract.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-700">
                        {contract.reference}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-medium text-white">
                          {contract.clientAbbr}
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {contract.clientName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="font-medium text-slate-900">{contract.signerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono">
                        {contract.emiratesId}
                      </code>
                    </TableCell>
                    <TableCell>
                      {contract.udbNumber ? (
                        <code className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded font-mono">
                          {contract.udbNumber}
                        </code>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{contract.documentType}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(contract.status)}
                        <StatusBadge status={contract.status} size="sm" />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {contract.completedAt || contract.createdAt}
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
