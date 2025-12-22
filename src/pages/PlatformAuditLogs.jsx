import { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  User,
  Building2,
  Clock,
  Globe,
  FileText,
  LogIn,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Key,
  X,
  Loader2,
} from 'lucide-react';
import { auditLogsApi, clientsApi } from '@/services/api';
import { useFetch } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Filter options - clients will be loaded from API

const actionTypes = [
  { id: 'all', name: 'All Actions' },
  { id: 'login', name: 'Login' },
  { id: 'logout', name: 'Logout' },
  { id: 'create', name: 'Create' },
  { id: 'update', name: 'Update' },
  { id: 'delete', name: 'Delete' },
  { id: 'view', name: 'View' },
  { id: 'export', name: 'Export' },
  { id: 'api_call', name: 'API Call' },
];

const resourceTypes = [
  { id: 'all', name: 'All Resources' },
  { id: 'user', name: 'User' },
  { id: 'contract', name: 'Contract' },
  { id: 'signing_request', name: 'Signing Request' },
  { id: 'blueprint', name: 'Blueprint' },
  { id: 'api_key', name: 'API Key' },
  { id: 'settings', name: 'Settings' },
  { id: 'channel', name: 'Channel' },
];

const statusOptions = [
  { id: 'all', name: 'All Status' },
  { id: 'success', name: 'Success' },
  { id: 'failed', name: 'Failed' },
  { id: 'warning', name: 'Warning' },
];

const getActionIcon = (action) => {
  switch (action) {
    case 'login':
      return <LogIn className="w-4 h-4" />;
    case 'logout':
      return <LogOut className="w-4 h-4" />;
    case 'create':
      return <Plus className="w-4 h-4" />;
    case 'update':
      return <Edit2 className="w-4 h-4" />;
    case 'delete':
      return <Trash2 className="w-4 h-4" />;
    case 'view':
      return <Eye className="w-4 h-4" />;
    case 'export':
      return <Download className="w-4 h-4" />;
    case 'api_call':
      return <Key className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const getActionColor = (action) => {
  switch (action) {
    case 'login':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'logout':
      return 'bg-slate-50 text-slate-700 border-slate-200';
    case 'create':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'update':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'delete':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'view':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'export':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'api_call':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'warning':
      return <AlertCircle className="w-4 h-4 text-amber-500" />;
    default:
      return null;
  }
};

export default function PlatformAuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedResource, setSelectedResource] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data from API
  const { data: clientsData, loading: clientsLoading } = useFetch(() => clientsApi.getAll(), []);
  const { data: auditLogsData, loading: logsLoading, refetch: refetchLogs } = useFetch(
    () => auditLogsApi.getPlatformLogs(),
    []
  );

  // Build clients list for filter dropdown
  const clients = [
    { id: 'all', name: 'All Clients' },
    ...(clientsData || []).map(c => ({ id: c.id.toString(), name: c.name }))
  ];

  const isLoading = clientsLoading || logsLoading;

  // Transform API data to match component's expected format
  const transformedLogs = (auditLogsData || []).map(log => ({
    id: log.id,
    timestamp: new Date(log.timestamp).toLocaleString('en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).replace(',', ''),
    client: log.clientName,
    clientAbbr: log.clientName?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'XX',
    user: log.userName,
    userEmail: log.userEmail,
    action: log.action,
    resource: log.resource,
    resourceId: log.resourceId || '-',
    description: log.resourceDetails || log.actionLabel,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    status: log.status,
  }));

  // Filter logs based on selected filters
  const filteredLogs = transformedLogs.filter((log) => {
    if (selectedClient !== 'all') {
      const clientData = clientsData?.find(c => c.id.toString() === selectedClient);
      if (clientData && !log.client?.toLowerCase().includes(clientData.name.toLowerCase())) {
        return false;
      }
    }
    if (selectedAction !== 'all' && log.action !== selectedAction) {
      return false;
    }
    if (selectedResource !== 'all' && log.resource?.toLowerCase() !== selectedResource.replace('_', ' ')) {
      return false;
    }
    if (selectedStatus !== 'all' && log.status !== selectedStatus) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        log.user?.toLowerCase().includes(query) ||
        log.description?.toLowerCase().includes(query) ||
        log.resourceId?.toLowerCase().includes(query) ||
        log.ipAddress?.includes(query)
      );
    }
    return true;
  });

  const clearFilters = () => {
    setSelectedClient('all');
    setSelectedAction('all');
    setSelectedResource('all');
    setSelectedStatus('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedClient !== 'all' ||
    selectedAction !== 'all' ||
    selectedResource !== 'all' ||
    selectedStatus !== 'all' ||
    searchQuery;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading audit logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Platform Audit Logs</h1>
            <p className="text-slate-500 mt-1">
              Centralized audit trail across all clients and system activities.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => refetchLogs()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Logs
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/60 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">1,247</p>
                <p className="text-xs text-slate-500">Total Events (7d)</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">1,198</p>
                <p className="text-xs text-slate-500">Successful</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">49</p>
                <p className="text-xs text-slate-500">Failed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">156</p>
                <p className="text-xs text-slate-500">Active Users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by user, description, resource ID, or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Primary Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-[160px]">
                  <Building2 className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
                More Filters
                <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
              </Button>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500">
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100">
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((action) => (
                    <SelectItem key={action.id} value={action.id}>
                      {action.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedResource} onValueChange={setSelectedResource}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Resource Type" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{filteredLogs.length}</span> of{' '}
            <span className="font-medium text-slate-900">{transformedLogs.length}</span> log entries
          </p>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-600 font-mono text-xs">{log.timestamp}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-medium text-white">
                        {log.clientAbbr}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{log.client}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{log.user}</p>
                      <p className="text-xs text-slate-500">{log.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("gap-1.5 font-medium capitalize", getActionColor(log.action))}
                    >
                      {getActionIcon(log.action)}
                      {log.action.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-slate-700">{log.resource}</p>
                      <code className="text-xs text-slate-500 font-mono">{log.resourceId}</code>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <code className="text-xs text-slate-600 font-mono">{log.ipAddress}</code>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(log.status)}
                      <span className={cn(
                        "text-sm font-medium capitalize",
                        log.status === 'success' && "text-emerald-600",
                        log.status === 'failed' && "text-red-600",
                        log.status === 'warning' && "text-amber-600"
                      )}>
                        {log.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No log entries found matching your filters.</p>
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* Log Detail Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Log Details</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  {getStatusIcon(selectedLog.status)}
                  <div>
                    <p className="font-medium text-slate-900">{selectedLog.description}</p>
                    <p className="text-xs text-slate-500">{selectedLog.timestamp}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Client</p>
                    <p className="text-sm font-medium text-slate-900">{selectedLog.client}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">User</p>
                    <p className="text-sm font-medium text-slate-900">{selectedLog.user}</p>
                    <p className="text-xs text-slate-500">{selectedLog.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Action</p>
                    <Badge
                      variant="outline"
                      className={cn("gap-1.5 font-medium capitalize", getActionColor(selectedLog.action))}
                    >
                      {getActionIcon(selectedLog.action)}
                      {selectedLog.action.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Resource</p>
                    <p className="text-sm font-medium text-slate-900">{selectedLog.resource}</p>
                    <code className="text-xs text-slate-500 font-mono">{selectedLog.resourceId}</code>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">IP Address</p>
                    <code className="text-sm font-mono text-slate-700">{selectedLog.ipAddress}</code>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">User Agent</p>
                    <p className="text-sm text-slate-700">{selectedLog.userAgent}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedLog.status)}
                    <span className={cn(
                      "font-medium capitalize",
                      selectedLog.status === 'success' && "text-emerald-600",
                      selectedLog.status === 'failed' && "text-red-600",
                      selectedLog.status === 'warning' && "text-amber-600"
                    )}>
                      {selectedLog.status}
                    </span>
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
