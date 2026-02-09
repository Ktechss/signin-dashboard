import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getTemplates, getDocumentUrl } from '@/utils/templateStorage';
import { useAuth } from '@/pages/index';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Download,
  FileText,
  Globe,
  Users,
  Layers,
  Eye,
  ArrowRight,
  X,
  CheckCircle2,
  Shield,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TemplateCard from '@/components/templates/TemplateCard';
import EmptyState from '@/components/ui-custom/EmptyState';
import { cn } from '@/lib/utils';

export default function Templates() {
  const navigate = useNavigate();
  const { user, isPlatformAdmin, selectedClient } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userTemplates, setUserTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Import gallery state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [publicBlueprints, setPublicBlueprints] = useState([]);
  const [importSearchQuery, setImportSearchQuery] = useState('');
  const [selectedImportBlueprint, setSelectedImportBlueprint] = useState(null);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  // Check if user is super admin (can create blueprints)
  // isPlatformAdmin is true when user exists and has no clientId
  const isSuperAdmin = isPlatformAdmin === true || user?.isRootUser === true;

  // Load templates from API
  useEffect(() => {
    const loadBlueprints = async () => {
      setLoading(true);
      try {
        // Load templates from API
        const templates = await getTemplates();

        // For clients, filter to show only their org-specific blueprints
        // For super admin, show all
        if (isSuperAdmin) {
          setUserTemplates(templates);
        } else {
          // Show org-specific blueprints assigned to this client
          const clientBlueprints = templates.filter(t =>
            t.visibility === 'org-specific' &&
            t.assignedClient?.id === selectedClient?.id
          );
          setUserTemplates(clientBlueprints);
        }

        // Store public blueprints for import gallery
        const publicBps = templates.filter(t =>
          t.visibility === 'public' && t.status === 'active'
        );
        setPublicBlueprints(publicBps);

        // Count pending policy approvals for super admins
        if (isSuperAdmin) {
          const pendingCount = templates.filter(t => t.status === 'pending_policy_approval').length;
          setPendingApprovalsCount(pendingCount);
        }
      } catch (error) {
        console.error('Error loading blueprints:', error);
        setUserTemplates([]);
        setPublicBlueprints([]);
      } finally {
        setLoading(false);
      }
    };

    loadBlueprints();
  }, [isSuperAdmin, selectedClient]);

  // Filter public blueprints for import dialog
  const filteredImportBlueprints = publicBlueprints.filter(bp =>
    bp.name.toLowerCase().includes(importSearchQuery.toLowerCase()) ||
    (bp.description || '').toLowerCase().includes(importSearchQuery.toLowerCase())
  );

  // Handle import button click
  const handleImportClick = (blueprint) => {
    setSelectedImportBlueprint(blueprint);
  };

  // Confirm import - navigate to TemplateBuilder in import mode
  const confirmImport = () => {
    if (selectedImportBlueprint) {
      navigate(createPageUrl(`TemplateBuilder?id=${selectedImportBlueprint.id}&import=true`));
    }
  };

  const filteredTemplates = userTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Pending Approvals Banner for Super Admin */}
        {isSuperAdmin && pendingApprovalsCount > 0 && (
          <Link to={createPageUrl('PolicyApprovalQueue')}>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between hover:bg-purple-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-purple-900">Policy Approvals Pending</h3>
                  <p className="text-sm text-purple-700">
                    {pendingApprovalsCount} client{pendingApprovalsCount > 1 ? 's' : ''} submitted policy changes for review
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-purple-600 text-sm font-medium">
                <Clock className="w-4 h-4" />
                Review Now
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Blueprints</h1>
            <p className="text-slate-500 mt-1">
              {isSuperAdmin
                ? 'Create and manage document blueprints for all clients.'
                : 'Browse and import blueprints for your organization.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSuperAdmin ? (
              <Link to={createPageUrl('TemplateBuilder')}>
                <Button className="gap-2 bg-slate-900 hover:bg-slate-800">
                  <Plus className="w-4 h-4" />
                  Create Blueprint
                </Button>
              </Link>
            ) : (
              <Button
                className="gap-2 bg-slate-900 hover:bg-slate-800"
                onClick={() => {
                  setIsImportOpen(true);
                  setSelectedImportBlueprint(null);
                  setImportSearchQuery('');
                }}
              >
                <Download className="w-4 h-4" />
                Import Blueprint
              </Button>
            )}
          </div>
        </div>
        
        {/* Tabs & Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Tabs defaultValue="all" className="flex-1">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="all" onClick={() => setStatusFilter('all')}>All</TabsTrigger>
              <TabsTrigger value="active" onClick={() => setStatusFilter('active')}>Active</TabsTrigger>
              <TabsTrigger value="draft" onClick={() => setStatusFilter('draft')}>Drafts</TabsTrigger>
              <TabsTrigger value="archived" onClick={() => setStatusFilter('archived')}>Archived</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search blueprints..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          isSuperAdmin ? (
            <EmptyState
              title="No blueprints found"
              description="Create your first blueprint to start generating contracts."
              actionLabel="Create Blueprint"
              onAction={() => {}}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No blueprints yet</h3>
              <p className="text-slate-500 text-center max-w-md mb-6">
                Import blueprints from the public gallery to start creating contracts for your organization.
              </p>
              {publicBlueprints.length > 0 && (
                <Button
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setIsImportOpen(true);
                    setSelectedImportBlueprint(null);
                    setImportSearchQuery('');
                  }}
                >
                  <Download className="w-4 h-4" />
                  Browse Gallery ({publicBlueprints.length} available)
                </Button>
              )}
            </div>
          )
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AnimatePresence>
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={createPageUrl(`TemplateDetail?id=${template.id}`)}>
                    <TemplateCard template={template} />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Import Blueprint Gallery Dialog */}
        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
              <DialogTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                Import from Blueprint Gallery
              </DialogTitle>
              <DialogDescription>
                Browse and import public blueprints to customize for your organization
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Search */}
              <div className="px-6 py-3 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search blueprints..."
                    className="pl-10"
                    value={importSearchQuery}
                    onChange={(e) => setImportSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Blueprint Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                {filteredImportBlueprints.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No blueprints available for import</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredImportBlueprints.map((blueprint) => {
                      const isSelected = selectedImportBlueprint?.id === blueprint.id;
                      const thumbnailSrc = blueprint.thumbnailUrl
                        ? getDocumentUrl(blueprint.thumbnailUrl)
                        : blueprint.filePreview || blueprint.preview;

                      return (
                        <div
                          key={blueprint.id}
                          onClick={() => handleImportClick(blueprint)}
                          className={cn(
                            'group bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md',
                            isSelected
                              ? 'border-emerald-500 ring-2 ring-emerald-100'
                              : 'border-slate-200 hover:border-slate-300'
                          )}
                        >
                          {/* Thumbnail */}
                          <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
                            {thumbnailSrc ? (
                              <img
                                src={thumbnailSrc}
                                alt={blueprint.name}
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <div className="absolute inset-4 bg-white rounded-lg shadow-sm flex items-center justify-center">
                                <FileText className="w-8 h-8 text-slate-300" />
                              </div>
                            )}

                            {/* Selected Indicator */}
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">
                              {blueprint.name}
                            </h3>
                            {blueprint.description && (
                              <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                                {blueprint.description}
                              </p>
                            )}

                            {/* Meta */}
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5" />
                                {blueprint.fields?.length || 0} fields
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {blueprint.parties?.length || 0} signers
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  {selectedImportBlueprint ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Selected: <strong>{selectedImportBlueprint.name}</strong>
                    </span>
                  ) : (
                    <span>{publicBlueprints.length} blueprints available</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => setIsImportOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    disabled={!selectedImportBlueprint}
                    onClick={confirmImport}
                  >
                    Import Blueprint
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}