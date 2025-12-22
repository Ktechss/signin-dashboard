import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Search, 
  Download, 
  Bell, 
  MoreHorizontal,
  Eye,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import StatusBadge from '@/components/ui-custom/StatusBadge';
import KPICard from '@/components/ui-custom/KPICard';

// Mock data - Signing requests are verification attempts for each party
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

const stats = [
  { title: 'Total Signing Requests', value: '1,234', subtitle: 'All verification attempts', icon: Clock, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50' },
  { title: 'Authorised', value: '1,098', trend: 'up', trendValue: '+2.1%', icon: CheckCircle2, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
  { title: 'Rejected', value: '68', trend: 'down', trendValue: '-12%', icon: XCircle, iconColor: 'text-red-600', iconBg: 'bg-red-50' },
  { title: 'Pending', value: '156', subtitle: 'Awaiting verification', icon: AlertCircle, iconColor: 'text-amber-600', iconBg: 'bg-amber-50' },
];

export default function SigningRequests() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [filters, setFilters] = useState({});

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Signing Requests</h1>
            <p className="text-slate-500 mt-1">Track individual signing requests and their status.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
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
              <Input placeholder="Search by name, email, or token..." className="pl-10" />
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
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
              
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Attempt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Attempts</SelectItem>
                  <SelectItem value="1">1st Attempt</SelectItem>
                  <SelectItem value="2">2nd Attempt</SelectItem>
                  <SelectItem value="3">3rd+ Attempt</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Checkbox id="latest" />
                <label htmlFor="latest" className="text-sm text-slate-600">Latest attempt only</label>
              </div>
            </div>
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
                <Download className="w-4 h-4" />
                Export
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
                          <DropdownMenuItem className="gap-2">
                            <Download className="w-4 h-4" />
                            Download Log
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
        

      </div>
    </div>
  );
}