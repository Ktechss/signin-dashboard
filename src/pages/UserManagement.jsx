import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Shield,
  UserCog,
  Eye,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  Users,
  Loader2,
  Phone,
  FileEdit,
  CheckSquare,
  Send,
  Pen,
  Building2,
  Settings,
  Key,
  ClipboardList,
  CreditCard,
  FileText,
  Upload,
  Download,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { cn } from '@/lib/utils';
import { usersApi } from '@/services/api';
import { useAuth } from '@/pages/index';
import { toast } from 'sonner';

// Role configuration
const roleConfig = {
  superadmin: { label: 'Super Admin', color: 'bg-red-100 text-red-700 border-red-200', icon: Shield },
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Shield },
  staff: { label: 'Staff', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: UserCog },
};

// Workflow permissions configuration
const workflowPermissionsConfig = {
  canCreate: {
    label: 'Creator',
    description: 'Can create contracts from blueprints',
    icon: FileEdit,
    color: 'bg-blue-100 text-blue-700'
  },
  canApprove: {
    label: 'Approver',
    description: 'Can approve/reject contracts',
    icon: CheckSquare,
    color: 'bg-amber-100 text-amber-700'
  },
  canSend: {
    label: 'Sender',
    description: 'Can send contracts to external signers',
    icon: Send,
    color: 'bg-emerald-100 text-emerald-700'
  },
  canSign: {
    label: 'Signer',
    description: 'Can sign contracts internally',
    icon: Pen,
    color: 'bg-purple-100 text-purple-700'
  },
  canViewAll: {
    label: 'View All',
    description: 'Can view all contracts (not just assigned)',
    icon: Eye,
    color: 'bg-slate-100 text-slate-700'
  },
};

// Admin permissions configuration
const adminPermissionsConfig = {
  userManagement: {
    label: 'User Management',
    description: 'Manage users and permissions',
    icon: Users
  },
  apiKeys: {
    label: 'API Keys',
    description: 'Manage API keys and integrations',
    icon: Key
  },
  auditLogs: {
    label: 'Audit Logs',
    description: 'View system audit logs',
    icon: ClipboardList
  },
  billing: {
    label: 'Billing',
    description: 'Access billing and invoices',
    icon: CreditCard
  },
  blueprints: {
    label: 'Blueprints',
    description: 'Manage contract blueprints/templates',
    icon: FileText
  },
  settings: {
    label: 'Settings',
    description: 'Configure client settings',
    icon: Settings
  },
};

// Preset roles for quick selection
const rolePresets = {
  contractCreator: {
    label: 'Contract Creator',
    designation: 'Contract Creator',
    workflowPermissions: { canCreate: true, canApprove: false, canSend: false, canSign: true, canViewAll: false },
    adminPermissions: { userManagement: false, apiKeys: false, auditLogs: false, billing: false, blueprints: true, settings: false },
  },
  approver: {
    label: 'Approver',
    designation: 'Approver',
    workflowPermissions: { canCreate: false, canApprove: true, canSend: false, canSign: false, canViewAll: false },
    adminPermissions: { userManagement: false, apiKeys: false, auditLogs: true, billing: false, blueprints: false, settings: false },
  },
  sender: {
    label: 'Sender',
    designation: 'Sender',
    workflowPermissions: { canCreate: false, canApprove: false, canSend: true, canSign: false, canViewAll: false },
    adminPermissions: { userManagement: false, apiKeys: false, auditLogs: false, billing: false, blueprints: false, settings: false },
  },
  internalSigner: {
    label: 'Internal Signer',
    designation: 'Internal Signer',
    workflowPermissions: { canCreate: false, canApprove: false, canSend: false, canSign: true, canViewAll: false },
    adminPermissions: { userManagement: false, apiKeys: false, auditLogs: false, billing: false, blueprints: false, settings: false },
  },
  fullAccess: {
    label: 'Full Access',
    designation: 'Operations Manager',
    workflowPermissions: { canCreate: true, canApprove: true, canSend: true, canSign: true, canViewAll: true },
    adminPermissions: { userManagement: true, apiKeys: true, auditLogs: true, billing: true, blueprints: true, settings: true },
  },
};

// Default empty permissions
const defaultWorkflowPermissions = {
  canCreate: false,
  canApprove: false,
  canSend: false,
  canSign: false,
  canViewAll: false,
};

const defaultAdminPermissions = {
  userManagement: false,
  apiKeys: false,
  auditLogs: false,
  billing: false,
  blueprints: false,
  settings: false,
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [permissionFilter, setPermissionFilter] = useState('all');

  // Add/Edit user state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    role: 'staff',
    workflowPermissions: { ...defaultWorkflowPermissions },
    adminPermissions: { ...defaultAdminPermissions },
  });

  const { selectedClient, user: currentUser } = useAuth();
  const clientId = selectedClient?.id;

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      if (clientId) {
        data = await usersApi.getByClient(clientId);
      } else {
        data = await usersApi.getAll();
      }
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.designation?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    let matchesPermission = true;
    if (permissionFilter !== 'all') {
      matchesPermission = user.workflowPermissions?.[permissionFilter] === true;
    }

    return matchesSearch && matchesRole && matchesPermission;
  });

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const formatLastActive = (lastActive) => {
    if (!lastActive) return 'Never';
    const date = new Date(lastActive);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get workflow permission badges for a user
  const getWorkflowBadges = (user) => {
    const badges = [];
    const permissions = user.workflowPermissions || {};

    Object.entries(workflowPermissionsConfig).forEach(([key, config]) => {
      if (permissions[key]) {
        badges.push({ key, ...config });
      }
    });

    return badges;
  };

  // Open add user sheet
  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      designation: '',
      role: 'staff',
      workflowPermissions: { ...defaultWorkflowPermissions },
      adminPermissions: { ...defaultAdminPermissions },
    });
    setIsSheetOpen(true);
  };

  // Open edit user sheet
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      designation: user.designation || '',
      role: user.role || 'staff',
      workflowPermissions: { ...defaultWorkflowPermissions, ...user.workflowPermissions },
      adminPermissions: { ...defaultAdminPermissions, ...user.adminPermissions },
    });
    setIsSheetOpen(true);
  };

  // Apply role preset
  const applyPreset = (presetKey) => {
    const preset = rolePresets[presetKey];
    if (preset) {
      setFormData(prev => ({
        ...prev,
        designation: preset.designation,
        workflowPermissions: { ...preset.workflowPermissions },
        adminPermissions: { ...preset.adminPermissions },
      }));
      toast.success(`Applied "${preset.label}" preset`);
    }
  };

  // Toggle workflow permission
  const toggleWorkflowPermission = (key) => {
    setFormData(prev => ({
      ...prev,
      workflowPermissions: {
        ...prev.workflowPermissions,
        [key]: !prev.workflowPermissions[key],
      },
    }));
  };

  // Toggle admin permission
  const toggleAdminPermission = (key) => {
    setFormData(prev => ({
      ...prev,
      adminPermissions: {
        ...prev.adminPermissions,
        [key]: !prev.adminPermissions[key],
      },
    }));
  };

  // Save user
  const handleSaveUser = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      setSaving(true);

      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        designation: formData.designation,
        role: formData.role,
        workflowPermissions: formData.workflowPermissions,
        adminPermissions: formData.adminPermissions,
        clientId: clientId,
      };

      if (editingUser) {
        await usersApi.update(editingUser.id, userData);
        toast.success('User updated successfully');
      } else {
        await usersApi.create({
          ...userData,
          status: 'pending',
          password: 'temp123', // Default password - should be changed on first login
          isRootUser: false,
        });
        toast.success('User created successfully');
      }

      await fetchUsers();
      setIsSheetOpen(false);
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await usersApi.update(user.id, { status: newStatus });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast.error('Failed to update user status');
    }
  };

  // Delete user
  const handleDeleteUser = async (user) => {
    if (user.isRootUser) {
      toast.error('Cannot delete root user');
      return;
    }

    if (!confirm(`Are you sure you want to remove ${user.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await usersApi.delete(user.id);
      toast.success('User removed successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to remove user');
    }
  };

  // Stats calculations
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    creators: users.filter(u => u.workflowPermissions?.canCreate).length,
    approvers: users.filter(u => u.workflowPermissions?.canApprove).length,
    senders: users.filter(u => u.workflowPermissions?.canSend).length,
    signers: users.filter(u => u.workflowPermissions?.canSign).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-500 mt-1">Manage team members and their workflow permissions.</p>
          </div>
          <Button onClick={handleAddUser} className="gap-2 bg-slate-900 hover:bg-slate-800">
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Total Users</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Active</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Creators</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.creators}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Approvers</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.approvers}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Senders</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.senders}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Signers</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats.signers}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, or designation..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
          <Select value={permissionFilter} onValueChange={setPermissionFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Permission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Permissions</SelectItem>
              <SelectItem value="canCreate">Creators</SelectItem>
              <SelectItem value="canApprove">Approvers</SelectItem>
              <SelectItem value="canSend">Senders</SelectItem>
              <SelectItem value="canSign">Signers</SelectItem>
              <SelectItem value="canViewAll">View All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Workflow Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => {
                  const role = roleConfig[user.role] || roleConfig.staff;
                  const RoleIcon = role.icon;
                  const workflowBadges = getWorkflowBadges(user);

                  return (
                    <TableRow key={user.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-800 text-white text-sm">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-900">{user.name}</p>
                              {user.isRootUser && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-red-200 text-red-600">
                                  Root
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">{user.email}</p>
                            {user.designation && (
                              <p className="text-xs text-slate-400">{user.designation}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('gap-1', role.color)}
                        >
                          <RoleIcon className="w-3 h-3" />
                          {role.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {workflowBadges.length > 0 ? (
                            workflowBadges.map((badge) => {
                              const BadgeIcon = badge.icon;
                              return (
                                <Badge
                                  key={badge.key}
                                  variant="secondary"
                                  className={cn('gap-1 text-xs', badge.color)}
                                >
                                  <BadgeIcon className="w-3 h-3" />
                                  {badge.label}
                                </Badge>
                              );
                            })
                          ) : (
                            <span className="text-sm text-slate-400">No permissions</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={user.status} size="sm" />
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {formatLastActive(user.lastActive)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                              {user.status === 'active' ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user)}
                              disabled={user.isRootUser}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Workflow Permission Reference */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Workflow Permission Reference</h3>
          <div className="grid md:grid-cols-5 gap-4">
            {Object.entries(workflowPermissionsConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <div key={key} className={cn('p-4 rounded-lg border', config.color.replace('text-', 'border-').split(' ')[0] + '-200')}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-slate-900">{config.label}</span>
                  </div>
                  <p className="text-sm text-slate-500">{config.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add/Edit User Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingUser ? 'Edit User' : 'Add New User'}</SheetTitle>
            <SheetDescription>
              {editingUser
                ? `Update ${editingUser.name}'s details and permissions.`
                : 'Add a new team member to your organization.'}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Quick Presets */}
            {!editingUser && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quick Presets</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(rolePresets).map(([key, preset]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(key)}
                      className="text-xs"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 border-b pb-2">Basic Information</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                    placeholder="Contract Creator"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@company.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+971 50 XXX XXXX"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Workflow Permissions */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 border-b pb-2">Workflow Permissions</h4>
              <p className="text-sm text-slate-500">
                Define what actions this user can perform in the contract workflow.
              </p>

              <div className="space-y-3">
                {Object.entries(workflowPermissionsConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  const isChecked = formData.workflowPermissions[key];

                  return (
                    <div
                      key={key}
                      onClick={() => toggleWorkflowPermission(key)}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                        isChecked
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <Checkbox checked={isChecked} />
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-900">{config.label}</p>
                        <p className="text-xs text-slate-500">{config.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Admin Permissions */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 border-b pb-2">Admin Permissions</h4>
              <p className="text-sm text-slate-500">
                Control access to administrative features and settings.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {Object.entries(adminPermissionsConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  const isChecked = formData.adminPermissions[key];

                  return (
                    <div
                      key={key}
                      onClick={() => toggleAdminPermission(key)}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all',
                        isChecked
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <Checkbox checked={isChecked} />
                      <Icon className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-900">{config.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <SheetFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveUser}
              disabled={saving || !formData.name || !formData.email}
              className="gap-2 bg-slate-900 hover:bg-slate-800"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {editingUser ? 'Update User' : 'Create User'}
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
