import { useState, useEffect } from 'react';
import {
  Key,
  Save,
  Layers,
  Plus,
  Trash2,
  Edit2,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  User,
  Bell,
  Shield,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  getChannels,
  saveChannel,
  updateChannel,
  deleteChannel,
  getAppSettings,
  updateAppSettings,
} from '@/utils/userStorage';

// Settings navigation items
const settingsNavItems = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'company', label: 'Company', icon: Building },
  { id: 'channels', label: 'Channels', icon: Layers },
  { id: 'onboarding', label: 'Onboarding', icon: UserPlus },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  // Channels state
  const [channels, setChannels] = useState([]);
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [channelForm, setChannelForm] = useState({ name: '', code: '', description: '' });

  // App settings state
  const [appSettings, setAppSettings] = useState({
    allowNonRegisteredOnboarding: false,
    requireEmailVerification: true,
    requirePhoneVerification: false,
    sessionTimeout: 30,
  });

  useEffect(() => {
    loadChannels();
    loadAppSettings();
  }, []);

  const loadChannels = () => {
    setChannels(getChannels());
  };

  const loadAppSettings = () => {
    setAppSettings(getAppSettings());
  };

  const handleSaveChannel = () => {
    if (!channelForm.name.trim() || !channelForm.code.trim()) {
      toast.error('Please fill in channel name and code');
      return;
    }

    if (editingChannel) {
      updateChannel(editingChannel.id, channelForm);
      toast.success('Channel updated successfully');
    } else {
      saveChannel(channelForm);
      toast.success('Channel created successfully');
    }

    setIsChannelDialogOpen(false);
    setEditingChannel(null);
    setChannelForm({ name: '', code: '', description: '' });
    loadChannels();
  };

  const handleEditChannel = (channel) => {
    setEditingChannel(channel);
    setChannelForm({
      name: channel.name,
      code: channel.code,
      description: channel.description || '',
    });
    setIsChannelDialogOpen(true);
  };

  const handleDeleteChannel = (id) => {
    deleteChannel(id);
    toast.success('Channel deleted');
    loadChannels();
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...appSettings, [key]: value };
    setAppSettings(newSettings);
    updateAppSettings({ [key]: value });
    toast.success('Setting updated');
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-0.5">Manage your account and preferences</p>
        </div>

        <div className="flex gap-8">
          {/* Settings Navigation */}
          <div className="w-56 flex-shrink-0">
            <nav className="space-y-1">
              {settingsNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    activeTab === item.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
                  <p className="text-sm text-slate-500">Update your personal details and contact information.</p>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold">
                    JD
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Photo</Button>
                    <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john.doe@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" defaultValue="+1 234 567 8900" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" placeholder="Tell us about yourself..." rows={3} />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Notification Preferences</h2>
                  <p className="text-sm text-slate-500">Choose what notifications you receive and how.</p>
                </div>
                
                <Separator />
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-slate-900 mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { id: 'email_signatures', label: 'Signature Completed', description: 'When someone signs a document' },
                        { id: 'email_expiring', label: 'Contracts Expiring', description: 'Reminder before contracts expire' },
                        { id: 'email_failed', label: 'Verification Failed', description: 'When identity verification fails' },
                        { id: 'email_reminders', label: 'Pending Reminders', description: 'Daily digest of pending signatures' },
                      ].map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-700">{item.label}</p>
                            <p className="text-sm text-slate-500">{item.description}</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium text-slate-900 mb-4">Push Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { id: 'push_signatures', label: 'Real-time Signatures', description: 'Instant notification when signed' },
                        { id: 'push_urgent', label: 'Urgent Alerts', description: 'Critical issues requiring attention' },
                      ].map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-700">{item.label}</p>
                            <p className="text-sm text-slate-500">{item.description}</p>
                          </div>
                          <Switch defaultChecked={item.id === 'push_urgent'} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Password</h2>
                    <p className="text-sm text-slate-500">Update your password regularly to keep your account secure.</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                  
                  <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Key className="w-4 h-4" />
                    Update Password
                  </Button>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Two-Factor Authentication</h2>
                    <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-700">Enable 2FA</p>
                      <p className="text-sm text-slate-500">Require a verification code when signing in</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Active Sessions</h2>
                    <p className="text-sm text-slate-500">Manage your active sessions across devices.</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    {[
                      { device: 'Chrome on Windows', location: 'New York, US', current: true, lastActive: 'Now' },
                      { device: 'Safari on iPhone', location: 'New York, US', current: false, lastActive: '2 hours ago' },
                    ].map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-slate-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-700">{session.device}</p>
                              {session.current && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">Current</span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">{session.location} • {session.lastActive}</p>
                          </div>
                        </div>
                        {!session.current && (
                          <Button variant="ghost" size="sm" className="text-red-600">Revoke</Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'company' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Company Information</h2>
                  <p className="text-sm text-slate-500">Manage your organization's details.</p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" defaultValue="Acme Corporation" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select defaultValue="technology">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" defaultValue="https://acme.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select defaultValue="50-200">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="50-200">50-200 employees</SelectItem>
                        <SelectItem value="200+">200+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" defaultValue="123 Business Ave, Suite 100&#10;New York, NY 10001" rows={2} />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'channels' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Channels</h2>
                      <p className="text-sm text-slate-500">Manage departments and channels for blueprint categorization.</p>
                    </div>
                    <Button
                      className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => {
                        setEditingChannel(null);
                        setChannelForm({ name: '', code: '', description: '' });
                        setIsChannelDialogOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Channel
                    </Button>
                  </div>

                  {channels.length > 0 ? (
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {channels.map(channel => (
                            <TableRow key={channel.id} className="hover:bg-slate-50">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Layers className="w-4 h-4 text-indigo-500" />
                                  <span className="font-medium text-slate-900">{channel.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-slate-50 text-slate-700">
                                  {channel.code}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-500 text-sm max-w-xs truncate">
                                {channel.description || '-'}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    channel.status === 'active'
                                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }
                                >
                                  {channel.status === 'active' ? (
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                  ) : (
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                  )}
                                  {channel.status?.charAt(0).toUpperCase() + channel.status?.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="w-8 h-8">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditChannel(channel)}>
                                      <Edit2 className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleDeleteChannel(channel.id)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg">
                      <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No channels configured</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Create channels to categorize blueprints by department.
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-slate-100 rounded-xl p-4">
                  <p className="text-sm text-slate-600">
                    <strong>Note:</strong> Channels are used to categorize blueprints and can be linked to API keys for access control.
                    Examples: Loan, Credit Card, Account Opening, etc.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'onboarding' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Onboarding Settings</h2>
                    <p className="text-sm text-slate-500">Configure how new users can be onboarded to the platform.</p>
                  </div>

                  <Separator />

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-5 h-5 text-indigo-600" />
                          <p className="font-medium text-slate-900">Allow Non-Registered Onboarding</p>
                        </div>
                        <p className="text-sm text-slate-500 mt-1 ml-7">
                          Allow individuals who are not registered on the platform to be onboarded for signing.
                          They will receive an invitation to complete the signing process.
                        </p>
                      </div>
                      <Switch
                        checked={appSettings.allowNonRegisteredOnboarding}
                        onCheckedChange={(checked) => handleSettingChange('allowNonRegisteredOnboarding', checked)}
                      />
                    </div>

                    <Separator />

                    <h3 className="font-medium text-slate-900">Verification Requirements</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-700">Email Verification</p>
                          <p className="text-sm text-slate-500">Require email verification during onboarding</p>
                        </div>
                        <Switch
                          checked={appSettings.requireEmailVerification}
                          onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-700">Phone Verification</p>
                          <p className="text-sm text-slate-500">Require phone/SMS verification during onboarding</p>
                        </div>
                        <Switch
                          checked={appSettings.requirePhoneVerification}
                          onCheckedChange={(checked) => handleSettingChange('requirePhoneVerification', checked)}
                        />
                      </div>
                    </div>

                    <Separator />

                    <h3 className="font-medium text-slate-900">Session Settings</h3>

                    <div className="max-w-xs">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Select
                        value={appSettings.sessionTimeout?.toString() || '30'}
                        onValueChange={(value) => handleSettingChange('sessionTimeout', parseInt(value))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="480">8 hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500 mt-1">
                        How long until inactive users are automatically logged out.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800">Security Notice</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Enabling non-registered onboarding may reduce security controls.
                        Ensure you have proper verification requirements enabled.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Channel Dialog */}
      <Dialog open={isChannelDialogOpen} onOpenChange={(open) => {
        setIsChannelDialogOpen(open);
        if (!open) {
          setEditingChannel(null);
          setChannelForm({ name: '', code: '', description: '' });
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingChannel ? 'Edit Channel' : 'Create Channel'}</DialogTitle>
            <DialogDescription>
              {editingChannel
                ? 'Update the channel information below.'
                : 'Add a new channel for categorizing blueprints and API access.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">Channel Name</Label>
              <Input
                id="channel-name"
                placeholder="e.g., Loan, Credit Card"
                value={channelForm.name}
                onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel-code">Channel Code</Label>
              <Input
                id="channel-code"
                placeholder="e.g., LOAN, CC"
                value={channelForm.code}
                onChange={(e) => setChannelForm({ ...channelForm, code: e.target.value.toUpperCase() })}
              />
              <p className="text-xs text-slate-500">A short unique identifier for this channel.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel-description">Description (Optional)</Label>
              <Textarea
                id="channel-description"
                placeholder="Describe the purpose of this channel..."
                value={channelForm.description}
                onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChannelDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              onClick={handleSaveChannel}
            >
              <Save className="w-4 h-4" />
              {editingChannel ? 'Save Changes' : 'Create Channel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}