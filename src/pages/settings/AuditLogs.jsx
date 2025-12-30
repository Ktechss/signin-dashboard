import React, { useState, useEffect } from 'react';
import {
  Search,
  ClipboardList,
  Calendar,
  Filter,
  UserPlus,
  UserMinus,
  UserCog,
  Key,
  KeyRound,
  Shield,
} from 'lucide-react';
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
import { getFilteredAuditLogs, formatDate } from '@/utils/userStorage';

const actionTypes = [
  { value: 'all', label: 'All Actions' },
  { value: 'user_created', label: 'User Created' },
  { value: 'user_updated', label: 'User Updated' },
  { value: 'user_deleted', label: 'User Deleted' },
  { value: 'root_user_updated', label: 'Root User Updated' },
  { value: 'api_key_created', label: 'API Key Created' },
  { value: 'api_key_revoked', label: 'API Key Revoked' },
  { value: 'api_key_deleted', label: 'API Key Deleted' },
  { value: 'permission_changed', label: 'Permission Changed' },
];

const dateRanges = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

const getActionIcon = (action) => {
  switch (action) {
    case 'user_created':
      return <UserPlus className="w-4 h-4 text-emerald-500" />;
    case 'user_updated':
      return <UserCog className="w-4 h-4 text-blue-500" />;
    case 'user_deleted':
      return <UserMinus className="w-4 h-4 text-red-500" />;
    case 'root_user_updated':
      return <Shield className="w-4 h-4 text-purple-500" />;
    case 'api_key_created':
      return <Key className="w-4 h-4 text-emerald-500" />;
    case 'api_key_revoked':
      return <KeyRound className="w-4 h-4 text-amber-500" />;
    case 'api_key_deleted':
      return <Key className="w-4 h-4 text-red-500" />;
    case 'permission_changed':
      return <Shield className="w-4 h-4 text-indigo-500" />;
    default:
      return <ClipboardList className="w-4 h-4 text-slate-400" />;
  }
};

const getActionBadgeColor = (action) => {
  if (action.includes('created')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (action.includes('deleted')) return 'bg-red-100 text-red-700 border-red-200';
  if (action.includes('revoked')) return 'bg-amber-100 text-amber-700 border-amber-200';
  if (action.includes('updated')) return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

const formatActionLabel = (action) => {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    loadLogs();
  }, [searchQuery, actionFilter, dateFilter]);

  const loadLogs = () => {
    const filteredLogs = getFilteredAuditLogs({
      search: searchQuery,
      action: actionFilter,
      dateRange: dateFilter,
    });
    setLogs(filteredLogs);
  };

  const todayLogs = logs.filter(log => {
    const logDate = new Date(log.timestamp);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
            <p className="text-slate-500 mt-1">View system activity and user actions.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Total Logs</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{logs.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Today's Activity</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{todayLogs}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Action Types</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {new Set(logs.map(l => l.action)).size}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search logs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              {actionTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Activity Log</h3>
          </div>
          {logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[200px]">Timestamp</TableHead>
                  <TableHead className="w-[160px]">Action</TableHead>
                  <TableHead className="w-[150px]">User</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.id} className="hover:bg-slate-50">
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`gap-1.5 ${getActionBadgeColor(log.action)}`}
                      >
                        {getActionIcon(log.action)}
                        {formatActionLabel(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {log.userName}
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {log.details}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No audit logs found</p>
              <p className="text-sm text-slate-400 mt-1">
                Activity logs will appear here as actions are performed.
              </p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">About Audit Logs</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">What is tracked?</h4>
              <ul className="text-sm text-slate-500 space-y-1">
                <li className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-500" />
                  User creation and updates
                </li>
                <li className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-500" />
                  API key management
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  Permission changes
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Retention Policy</h4>
              <p className="text-sm text-slate-500">
                Audit logs are retained for up to 500 entries. Older logs are automatically
                removed as new activity is recorded.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
