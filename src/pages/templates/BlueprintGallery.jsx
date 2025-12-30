import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getTemplates, deleteTemplate, updateTemplate } from '@/utils/templateStorage';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Copy,
  MoreVertical,
  Building2,
  Lock,
  Globe,
  FileText,
  Layers,
  Calendar,
  X,
  Check,
  AlertCircle,
  Filter,
  Loader2,
  Users,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/ui-custom/StatusBadge';

// Mock clients for org-specific blueprints
const clients = [
  { id: 1, name: 'ADCB Bank', abbr: 'AD' },
  { id: 2, name: 'Emirates NBD', abbr: 'EN' },
  { id: 3, name: 'First Abu Dhabi Bank', abbr: 'FA' },
  { id: 4, name: 'Mashreq Bank', abbr: 'MB' },
];

const visibilityConfig = {
  'org-specific': {
    label: 'Org Specific',
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Blueprints assigned to specific client organizations',
  },
  'internal': {
    label: 'Internal',
    icon: Lock,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Internal blueprints for platform operations only',
  },
  'public': {
    label: 'Public',
    icon: Globe,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Public blueprints available to all clients',
  },
};

// Blueprint Card Component
function BlueprintCard({ blueprint, onEdit, onDelete, onDuplicate, onView, onAssign }) {
  const {
    id,
    name,
    status,
    version,
    usageCount = 0,
    lastModified,
    preview,
    filePreview,
    documentData,
    visibility = 'public',
    assignedClient,
    fields = [],
  } = blueprint;

  const thumbnailSrc = filePreview || preview || documentData?.thumbnail;
  const isPdf = documentData?.type === 'application/pdf';
  const config = visibilityConfig[visibility] || visibilityConfig.public;
  const VisibilityIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-xl border border-slate-200/60 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300/60 transition-all duration-300"
    >
      {/* Visibility Header */}
      <div className={`px-4 py-2 ${config.bgColor} border-b ${config.borderColor} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <VisibilityIcon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-xs font-medium ${config.color}`}>
            {visibility === 'org-specific' && assignedClient
              ? assignedClient.name
              : config.label}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded hover:bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onView(blueprint)}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(blueprint)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Blueprint
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(blueprint)}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAssign(blueprint)}>
              <Building2 className="w-4 h-4 mr-2" />
              Change Visibility
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(blueprint)} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
        {isPdf && documentData?.data ? (
          <div className="w-full h-full flex items-center justify-center">
            <Document
              file={documentData.data}
              loading={<div className="text-slate-400 text-sm">Loading...</div>}
              error={<div className="text-slate-400 text-sm">PDF</div>}
            >
              <Page
                pageNumber={1}
                width={200}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        ) : thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="absolute inset-4 bg-white rounded-lg shadow-sm flex items-center justify-center">
            <div className="w-3/4 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-2/3" />
              <div className="h-2 bg-slate-100 rounded w-full" />
              <div className="h-2 bg-slate-100 rounded w-5/6" />
              <div className="h-2 bg-slate-100 rounded w-full" />
              <div className="h-2 bg-slate-100 rounded w-3/4" />
            </div>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            size="sm"
            className="gap-2 bg-white text-slate-900 hover:bg-slate-100"
            onClick={() => onView(blueprint)}
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-slate-900 group-hover:text-slate-600 transition-colors line-clamp-1">
            {name}
          </h3>
          <StatusBadge status={status} size="sm" showDot={false} />
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              v{version || '1.0'}
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {fields.length || 0} fields
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {usageCount} uses
            </span>
          </div>
        </div>

        {lastModified && (
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
            <Clock className="w-3 h-3" />
            {lastModified}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function BlueprintGallery() {
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('org-specific');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [assignVisibility, setAssignVisibility] = useState('public');
  const [assignClientId, setAssignClientId] = useState('');
  const [createVisibility, setCreateVisibility] = useState('public');
  const [createClientId, setCreateClientId] = useState('');

  // Load blueprints from sample-blueprints.json and localStorage
  useEffect(() => {
    const loadBlueprints = async () => {
      setLoading(true);
      try {
        // Load sample blueprints from JSON file
        const response = await fetch('/sample-blueprints.json');
        const sampleBlueprints = await response.json();

        // Load user-created templates from localStorage
        const savedTemplates = getTemplates();

        // Add visibility field to blueprints that don't have it
        // Map existing categories to visibility
        const processedSamples = sampleBlueprints.map((bp, index) => ({
          ...bp,
          visibility: bp.visibility || getVisibilityFromCategory(bp.category, index),
          assignedClient: bp.assignedClient || (index % 4 === 0 ? clients[0] : index % 4 === 1 ? clients[1] : index % 4 === 2 ? clients[2] : clients[3]),
        }));

        const processedSaved = savedTemplates.map(bp => ({
          ...bp,
          visibility: bp.visibility || 'public',
        }));

        // Combine both arrays
        const allBlueprints = [...processedSamples, ...processedSaved];
        setBlueprints(allBlueprints);
      } catch (error) {
        console.error('Error loading blueprints:', error);
        // If sample blueprints fail to load, at least show localStorage templates
        const savedTemplates = getTemplates();
        setBlueprints(savedTemplates.map(bp => ({ ...bp, visibility: bp.visibility || 'public' })));
      } finally {
        setLoading(false);
      }
    };

    loadBlueprints();
  }, []);

  // Helper to map category to visibility
  const getVisibilityFromCategory = (category, index) => {
    // Distribute sample blueprints across visibility types
    if (index % 3 === 0) return 'org-specific';
    if (index % 3 === 1) return 'internal';
    return 'public';
  };

  // Filter blueprints
  const filteredBlueprints = blueprints.filter(bp => {
    const matchesVisibility = bp.visibility === activeTab;
    const matchesSearch = bp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (bp.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bp.status === statusFilter;
    const matchesClient = clientFilter === 'all' ||
                         (bp.assignedClient && bp.assignedClient.id === parseInt(clientFilter));

    return matchesVisibility && matchesSearch && matchesStatus &&
           (activeTab !== 'org-specific' || matchesClient);
  });

  // Counts by visibility
  const counts = {
    'org-specific': blueprints.filter(bp => bp.visibility === 'org-specific').length,
    'internal': blueprints.filter(bp => bp.visibility === 'internal').length,
    'public': blueprints.filter(bp => bp.visibility === 'public').length,
  };

  const handleView = (blueprint) => {
    // Navigate to TemplateDetail page like in client view
    window.location.href = `/TemplateDetail?id=${blueprint.id}`;
  };

  const handleEdit = (blueprint) => {
    // Navigate to TemplateBuilder with blueprint ID for editing
    window.location.href = `/TemplateBuilder?id=${blueprint.id}`;
  };

  const handleDelete = (blueprint) => {
    setSelectedBlueprint(blueprint);
    setIsDeleteOpen(true);
  };

  const handleDuplicate = (blueprint) => {
    const newBlueprint = {
      ...blueprint,
      id: Date.now(),
      name: `${blueprint.name} (Copy)`,
      status: 'draft',
      version: '1.0',
      usageCount: 0,
      lastModified: new Date().toLocaleDateString(),
    };
    setBlueprints([...blueprints, newBlueprint]);
  };

  const handleAssign = (blueprint) => {
    setSelectedBlueprint(blueprint);
    setAssignVisibility(blueprint.visibility || 'public');
    setAssignClientId(blueprint.assignedClient?.id?.toString() || '');
    setIsAssignOpen(true);
  };

  const confirmDelete = () => {
    // Delete from localStorage if it's a saved template
    if (selectedBlueprint) {
      deleteTemplate(selectedBlueprint.id);
      setBlueprints(blueprints.filter(bp => bp.id !== selectedBlueprint.id));
    }
    setIsDeleteOpen(false);
  };

  const confirmAssign = () => {
    if (selectedBlueprint) {
      const client = clients.find(c => c.id === parseInt(assignClientId));
      const updatedBlueprint = {
        ...selectedBlueprint,
        visibility: assignVisibility,
        assignedClient: assignVisibility === 'org-specific' ? client : null,
      };

      setBlueprints(blueprints.map(bp =>
        bp.id === selectedBlueprint.id ? updatedBlueprint : bp
      ));

      // Update in localStorage if it's a saved template
      updateTemplate(selectedBlueprint.id, updatedBlueprint);
    }
    setIsAssignOpen(false);
  };

  const handleOpenCreateDialog = () => {
    // Pre-select current tab's visibility
    setCreateVisibility(activeTab);
    setCreateClientId('');
    setIsCreateOpen(true);
  };

  const confirmCreate = () => {
    // Build query params for TemplateBuilder
    const params = new URLSearchParams();
    params.set('visibility', createVisibility);
    if (createVisibility === 'org-specific' && createClientId) {
      params.set('clientId', createClientId);
    }

    // Navigate to TemplateBuilder with visibility params
    window.location.href = `/TemplateBuilder?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading blueprints...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Blueprint Gallery</h1>
            <p className="text-slate-500 mt-1">Manage document blueprints and their visibility across clients</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="gap-2 bg-slate-900 hover:bg-slate-800"
              onClick={handleOpenCreateDialog}
            >
              <Plus className="w-4 h-4" />
              Create Blueprint
            </Button>
          </div>
        </div>

        {/* Visibility Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <TabsList className="bg-white border border-slate-200 p-1">
              {Object.entries(visibilityConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                  >
                    <Icon className="w-4 h-4" />
                    {config.label}
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {counts[key]}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Filters */}
            <div className="flex items-center gap-3 ml-auto">
              {activeTab === 'org-specific' && (
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-[180px] bg-white">
                    <Building2 className="w-4 h-4 mr-2 text-slate-400" />
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-white">
                  <Filter className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search blueprints..."
                  className="pl-10 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Blueprint Grid */}
          {Object.keys(visibilityConfig).map(visibility => (
            <TabsContent key={visibility} value={visibility} className="mt-0">
              {filteredBlueprints.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No blueprints found</h3>
                  <p className="text-slate-500 mb-6">
                    {searchQuery || statusFilter !== 'all' || clientFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : `Create your first ${visibilityConfig[visibility].label.toLowerCase()} blueprint`
                    }
                  </p>
                  <Button className="gap-2" onClick={handleOpenCreateDialog}>
                    <Plus className="w-4 h-4" />
                    Create Blueprint
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {filteredBlueprints.map((blueprint) => (
                      <BlueprintCard
                        key={blueprint.id}
                        blueprint={blueprint}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                        onView={handleView}
                        onAssign={handleAssign}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Assign Visibility Dialog */}
        <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Change Visibility</DialogTitle>
              <DialogDescription>
                Update the visibility settings for "{selectedBlueprint?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Visibility Type</Label>
                <Select value={assignVisibility} onValueChange={setAssignVisibility}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(visibilityConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {React.createElement(config.icon, { className: `w-4 h-4 ${config.color}` })}
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {assignVisibility === 'org-specific' && (
                <div className="space-y-2">
                  <Label>Assign to Client</Label>
                  <Select value={assignClientId} onValueChange={setAssignClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmAssign}
                disabled={assignVisibility === 'org-specific' && !assignClientId}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Delete Blueprint
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedBlueprint?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete Blueprint
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Blueprint Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Blueprint
              </DialogTitle>
              <DialogDescription>
                Select the visibility category for your new blueprint
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Visibility Selection Cards */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Visibility Type</Label>
                <div className="grid gap-3">
                  {Object.entries(visibilityConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    const isSelected = createVisibility === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setCreateVisibility(key);
                          if (key !== 'org-specific') {
                            setCreateClientId('');
                          }
                        }}
                        className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? `${config.borderColor} ${config.bgColor}`
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isSelected ? config.color : 'text-slate-900'}`}>
                              {config.label}
                            </span>
                            {isSelected && (
                              <Check className={`w-4 h-4 ${config.color}`} />
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">{config.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Client Selection for Org-Specific */}
              {createVisibility === 'org-specific' && (
                <div className="space-y-2 pt-2">
                  <Label className="text-sm font-medium">Assign to Client</Label>
                  <Select value={createClientId} onValueChange={setCreateClientId}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a client organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-medium text-white">
                              {client.abbr}
                            </div>
                            {client.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    This blueprint will only be available to the selected client
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmCreate}
                disabled={createVisibility === 'org-specific' && !createClientId}
                className="gap-2 bg-slate-900 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4" />
                Continue to Builder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
