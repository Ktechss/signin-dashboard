import React, { useState, useEffect } from 'react';
import {
  Plus,
  Copy,
  MoreHorizontal,
  Key,
  AlertTriangle,
  Trash2,
  Ban,
  Eye,
  EyeOff,
  CheckCircle2,
  Link2,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { toast } from 'sonner';
import {
  getApiKeys,
  saveApiKeyWithChannel,
  revokeApiKey,
  deleteApiKey,
  maskApiKey,
  formatDate,
  getChannels,
  updateApiKeyChannels,
} from '@/utils/userStorage';
import { Checkbox } from '@/components/ui/checkbox';

export default function APIKeys() {
  const [apiKeys, setApiKeys] = useState([]);
  const [channels, setChannels] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isNewKeyOpen, setIsNewKeyOpen] = useState(false);
  const [isEditChannelsOpen, setIsEditChannelsOpen] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  const [showFullKey, setShowFullKey] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadApiKeys();
    loadChannels();
  }, []);

  const loadApiKeys = () => {
    setApiKeys(getApiKeys());
  };

  const loadChannels = () => {
    setChannels(getChannels());
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    const newKey = saveApiKeyWithChannel(newKeyName.trim(), selectedChannels);
    setNewlyCreatedKey(newKey);
    setIsCreateOpen(false);
    setNewKeyName('');
    setSelectedChannels([]);
    setIsNewKeyOpen(true);
    loadApiKeys();
  };

  const handleToggleChannel = (channelId) => {
    setSelectedChannels(prev =>
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleOpenEditChannels = (apiKey) => {
    setEditingKey(apiKey);
    setSelectedChannels(apiKey.channelIds || []);
    setIsEditChannelsOpen(true);
  };

  const handleSaveChannels = () => {
    if (editingKey) {
      updateApiKeyChannels(editingKey.id, selectedChannels);
      toast.success('API key channels updated');
      setIsEditChannelsOpen(false);
      setEditingKey(null);
      setSelectedChannels([]);
      loadApiKeys();
    }
  };

  const getChannelNames = (channelIds) => {
    if (!channelIds || channelIds.length === 0) return 'None';
    return channelIds
      .map(id => channels.find(c => c.id === id)?.name || 'Unknown')
      .join(', ');
  };

  const handleCopyKey = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      toast.success('API key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleRevokeKey = (id) => {
    revokeApiKey(id);
    loadApiKeys();
    toast.success('API key revoked');
  };

  const handleDeleteKey = (id) => {
    deleteApiKey(id);
    loadApiKeys();
    toast.success('API key deleted');
  };

  const toggleShowKey = (id) => {
    setShowFullKey(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const activeKeys = apiKeys.filter(k => k.status === 'active').length;
  const revokedKeys = apiKeys.filter(k => k.status === 'revoked').length;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
            <p className="text-slate-500 mt-1">Manage API keys for programmatic access.</p>
          </div>
          <Button
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Create API Key
          </Button>
        </div>

        {/* Warning Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-800">Keep your API keys secure</p>
            <p className="text-sm text-amber-700 mt-1">
              API keys provide full access to your account. Never share them publicly or commit them to version control.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Total Keys</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{apiKeys.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Active</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{activeKeys}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Revoked</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{revokedKeys}</p>
          </div>
        </div>

        {/* API Keys Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Your API Keys</h3>
          </div>
          {apiKeys.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Channels</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map(apiKey => (
                  <TableRow key={apiKey.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900">{apiKey.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">
                          {showFullKey[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => toggleShowKey(apiKey.id)}
                        >
                          {showFullKey[apiKey.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => handleCopyKey(apiKey.key)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {apiKey.channelIds?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {apiKey.channelIds.slice(0, 2).map(channelId => {
                              const channel = channels.find(c => c.id === channelId);
                              return channel ? (
                                <Badge key={channelId} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
                                  {channel.name}
                                </Badge>
                              ) : null;
                            })}
                            {apiKey.channelIds.length > 2 && (
                              <Badge variant="outline" className="bg-slate-50 text-slate-600 text-xs">
                                +{apiKey.channelIds.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">No channels</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {formatDate(apiKey.createdAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={apiKey.status} size="sm" />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCopyKey(apiKey.key)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Key
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEditChannels(apiKey)}>
                            <Link2 className="w-4 h-4 mr-2" />
                            Link Channels
                          </DropdownMenuItem>
                          {apiKey.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleRevokeKey(apiKey.id)}>
                              <Ban className="w-4 h-4 mr-2" />
                              Revoke Key
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteKey(apiKey.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Key
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Key className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No API keys yet</p>
              <Button
                variant="link"
                className="text-indigo-600 mt-2"
                onClick={() => setIsCreateOpen(true)}
              >
                Create your first API key
              </Button>
            </div>
          )}
        </div>


        {/* Create API Key Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setNewKeyName('');
            setSelectedChannels([]);
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Give your API key a descriptive name and link it to channels.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  placeholder="e.g., Production Server, Development"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Link to Channels (Optional)</Label>
                <p className="text-sm text-slate-500">
                  Select channels this API key will have access to.
                </p>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3">
                  {channels.length > 0 ? (
                    channels.map(channel => (
                      <div key={channel.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`channel-${channel.id}`}
                          checked={selectedChannels.includes(channel.id)}
                          onCheckedChange={() => handleToggleChannel(channel.id)}
                        />
                        <label
                          htmlFor={`channel-${channel.id}`}
                          className="text-sm font-medium leading-none cursor-pointer flex-1"
                        >
                          <span className="text-slate-900">{channel.name}</span>
                          <span className="text-slate-400 ml-2">({channel.code})</span>
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No channels available. Create channels in Settings.</p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                onClick={handleCreateKey}
              >
                <Key className="w-4 h-4" />
                Create Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Key Created Dialog */}
        <Dialog open={isNewKeyOpen} onOpenChange={setIsNewKeyOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                API Key Created
              </DialogTitle>
              <DialogDescription>
                Copy this key now. You won't be able to see it again for security reasons.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Key Name</Label>
                <p className="text-sm font-medium text-slate-900">{newlyCreatedKey?.name}</p>
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="relative">
                  <code className="block bg-slate-100 p-4 rounded-lg text-sm font-mono text-slate-800 break-all pr-12">
                    {newlyCreatedKey?.key}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => handleCopyKey(newlyCreatedKey?.key)}
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  Make sure to copy your API key now. For security, it won't be shown again.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                  setIsNewKeyOpen(false);
                  setNewlyCreatedKey(null);
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Channels Dialog */}
        <Dialog open={isEditChannelsOpen} onOpenChange={(open) => {
          setIsEditChannelsOpen(open);
          if (!open) {
            setEditingKey(null);
            setSelectedChannels([]);
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-indigo-600" />
                Link Channels
              </DialogTitle>
              <DialogDescription>
                Select which channels this API key ({editingKey?.name}) should have access to.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-3">
                {channels.length > 0 ? (
                  channels.map(channel => (
                    <div key={channel.id} className="flex items-center space-x-3 py-2 border-b border-slate-100 last:border-0">
                      <Checkbox
                        id={`edit-channel-${channel.id}`}
                        checked={selectedChannels.includes(channel.id)}
                        onCheckedChange={() => handleToggleChannel(channel.id)}
                      />
                      <label
                        htmlFor={`edit-channel-${channel.id}`}
                        className="text-sm font-medium leading-none cursor-pointer flex-1"
                      >
                        <div>
                          <span className="text-slate-900">{channel.name}</span>
                          <span className="text-slate-400 ml-2">({channel.code})</span>
                        </div>
                        {channel.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{channel.description}</p>
                        )}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">No channels available. Create channels in Settings.</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Layers className="w-4 h-4" />
                <span>{selectedChannels.length} channel(s) selected</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditChannelsOpen(false)}>
                Cancel
              </Button>
              <Button
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                onClick={handleSaveChannels}
              >
                <CheckCircle2 className="w-4 h-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
