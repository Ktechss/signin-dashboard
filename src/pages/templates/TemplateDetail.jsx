import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getTemplateById, getDocumentUrl } from '@/utils/templateStorage';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ArrowLeft,
  FileText,
  Edit,
  Copy,
  Archive,
  Download,
  Clock,
  Users,
  History,
  PenTool,
  Eye,
  MoreHorizontal,
  CheckCircle2,
  Layers,
  Plus,
  Minus,
  Building2,
  User,
  Settings,
  GitBranch,
  Send,
  Shield,
  Bell,
  Calendar,
  XCircle,
  Lock,
  Unlock,
  ArrowRight,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import DocumentViewer from '@/components/ui-custom/DocumentViewer';
import { FieldOverlayList } from '@/components/templates/FieldOverlay';
import VersionHistoryTab from '@/components/templates/VersionHistoryTab';
import { cn } from '@/lib/utils';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function TemplateDetail() {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('id');
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [viewingVersion, setViewingVersion] = useState(null);
  const [viewingSnapshot, setViewingSnapshot] = useState(null);

  // Handle PDF load success to get page count
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const loadTemplate = async () => {
    if (templateId) {
      try {
        // Load template from API
        const loadedTemplate = await getTemplateById(templateId);
        setTemplate(loadedTemplate);
      } catch (error) {
        console.error('Error loading template:', error);
        setTemplate(null);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  // Handler for when a version is restored
  const handleVersionRestored = (restoredTemplate) => {
    setTemplate(restoredTemplate);
    setViewingVersion(null);
    setViewingSnapshot(null);
  };

  // Handler for viewing a specific version
  const handleVersionSelect = (version, snapshot) => {
    setViewingVersion(version);
    setViewingSnapshot(snapshot);
  };

  // Get the data to display (either viewing snapshot or current template)
  const displayData = viewingSnapshot || template;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-slate-500">Loading template...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Template not found</h2>
          <p className="text-slate-500 mb-4">The template you're looking for doesn't exist.</p>
          <Link to={createPageUrl('Templates')}>
            <Button>Back to Templates</Button>
          </Link>
        </div>
      </div>
    );
  }
  // Helper function to get signer info
  const getSignerInfo = (party, index) => {
    const signerType = party.signerType || 'external';
    const isEstablishment = signerType === 'establishment';
    return {
      icon: isEstablishment ? Building2 : User,
      label: isEstablishment ? 'Establishment' : 'External',
      bgColor: isEstablishment ? 'bg-blue-100' : 'bg-emerald-100',
      textColor: isEstablishment ? 'text-blue-700' : 'text-emerald-700',
      borderColor: isEstablishment ? 'border-l-blue-500' : 'border-l-emerald-500'
    };
  };

  // Field type labels
  const fieldTypeLabels = {
    signature: 'Signature',
    text: 'Text',
    initials: 'Initials',
    date: 'Date',
    checkbox: 'Checkbox',
    number: 'Number',
    email: 'Email',
    phone: 'Phone'
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Compact Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-8xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Templates')}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-slate-900">{template.name}</h1>
                <StatusBadge status={template.status} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className={cn(
                      "gap-1.5 text-xs h-7",
                      viewingVersion && viewingVersion !== template.version && "bg-purple-50 border-purple-300 text-purple-700"
                    )}>
                      <History className="w-3 h-3" />
                      v{viewingVersion || template.version || '1.0'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-72 p-0">
                    <div className="p-3 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Version History</span>
                        {viewingVersion && viewingVersion !== template.version && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            onClick={() => handleVersionSelect(null, null)}
                          >
                            Back to Current
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-80 overflow-auto">
                      <VersionHistoryTab
                        templateId={templateId}
                        currentVersion={template.version}
                        onVersionRestored={handleVersionRestored}
                        onVersionSelect={handleVersionSelect}
                        viewingVersion={viewingVersion}
                        compact
                      />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 text-sm text-slate-500 mr-4">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {template.usageCount || 0} uses
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {template.lastModified || 'Recently'}
                </span>
              </div>
              <Link to={createPageUrl(`ContractCreate?blueprintId=${templateId}`)}>
                <Button size="sm" className="gap-2 bg-slate-900 hover:bg-slate-800">
                  <PenTool className="w-3.5 h-3.5" />
                  Create Contract
                </Button>
              </Link>
              <Link to={createPageUrl(`TemplateBuilder?id=${templateId}`)}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2">
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 text-slate-600">
                    <Archive className="w-4 h-4" />
                    Archive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="max-w-8xl mx-auto px-6 pb-6">
        <div className="flex gap-5" style={{ height: 'calc(100vh - 120px)' }}>
          {/* Left: Document Preview */}
          <div className="flex-1 bg-slate-100/50 rounded-2xl overflow-hidden relative">
            {/* Version Viewing Banner */}
            {viewingVersion && viewingVersion !== template.version && (
              <div className="absolute top-0 left-0 right-0 z-20 bg-purple-600 text-white px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  <span className="text-sm font-medium">Viewing version {viewingVersion}</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={() => handleVersionSelect(null, null)}
                >
                  Back to Current
                </Button>
              </div>
            )}

            {/* Floating Zoom Controls - Bottom Right */}
            <div className="absolute bottom-4 right-4 z-10">
              <div className="flex flex-col items-center bg-white/95 backdrop-blur rounded-xl shadow-lg overflow-hidden w-10">
                <button
                  className="h-9 w-full flex items-center justify-center hover:bg-slate-100 border-b border-slate-100"
                  onClick={() => setZoom(prev => Math.min(150, prev + 25))}
                >
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>
                <span className="text-[10px] font-medium text-slate-600 text-center py-1.5 w-full bg-slate-50/50">{zoom}%</span>
                <button
                  className="h-9 w-full flex items-center justify-center hover:bg-slate-100 border-t border-slate-100"
                  onClick={() => setZoom(prev => Math.max(50, prev - 25))}
                >
                  <Minus className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Document Preview Area - Scrollable */}
            <div className={cn("h-full overflow-auto p-6", viewingVersion && viewingVersion !== template.version && "pt-14")}>
              {(displayData.documentUrl || displayData.documentData || displayData.filePreview || displayData.preview) ? (
                <div className="flex flex-col items-center gap-4">
                  {(displayData.documentType === 'application/pdf' || displayData.documentData?.type === 'application/pdf') ? (
                    <Document
                      file={displayData.documentUrl ? getDocumentUrl(displayData.documentUrl) : displayData.documentData?.data}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={(error) => console.error('PDF load error:', error)}
                      loading={<div className="text-center p-8 text-slate-500">Loading PDF...</div>}
                    >
                      {Array.from(new Array(numPages || 1), (_, index) => (
                        <div key={index} className="relative mb-4" style={{ width: 595 * (zoom / 100) }}>
                          <Page
                            pageNumber={index + 1}
                            width={595 * (zoom / 100)}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="shadow-xl rounded-lg"
                          />
                          {/* Field Overlays for this page */}
                          {displayData.fields?.filter(f => (f.page || 1) === index + 1).map((field) => {
                            const party = displayData.parties?.find(p => p.id?.toString() === field.role?.toString());
                            const signerInfo = party ? getSignerInfo(party, 0) : null;
                            const SignerIcon = signerInfo?.icon;

                            return (
                              <div
                                key={field.id}
                                className={cn(
                                  'absolute border-2 border-dashed rounded flex items-center justify-center group',
                                  signerInfo ? (signerInfo.label === 'Internal' ? 'border-emerald-400 bg-emerald-100/70' : 'border-blue-400 bg-blue-100/70') : 'border-slate-400 bg-slate-100/70'
                                )}
                                style={{
                                  left: `${(field.x / 595) * 100}%`,
                                  top: `${(field.y / 842) * 100}%`,
                                  width: `${(field.width / 595) * 100}%`,
                                  height: `${(field.height / 842) * 100}%`,
                                }}
                              >
                                {party && signerInfo && (
                                  <div className={cn(
                                    'absolute -top-5 left-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity shadow-sm',
                                    signerInfo.bgColor, signerInfo.textColor
                                  )}>
                                    <SignerIcon className="w-2.5 h-2.5" />
                                    <span>{party.name}</span>
                                  </div>
                                )}
                                <span className={cn('text-xs font-medium', signerInfo?.textColor || 'text-slate-600')}>
                                  {field.placeholder || field.label || field.name || fieldTypeLabels[field.type] || field.type}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </Document>
                  ) : (
                    <div className="relative" style={{ width: 595 * (zoom / 100) }}>
                      <img
                        src={displayData.thumbnailUrl ? getDocumentUrl(displayData.thumbnailUrl) : (displayData.filePreview || displayData.preview || displayData.documentData?.thumbnail)}
                        alt={displayData.name}
                        className="w-full rounded-lg shadow-xl"
                        style={{ width: 595 * (zoom / 100) }}
                      />
                      {/* Field Overlays for image */}
                      {displayData.fields?.map((field) => {
                        const party = displayData.parties?.find(p => p.id?.toString() === field.role?.toString());
                        const signerInfo = party ? getSignerInfo(party, 0) : null;
                        const SignerIcon = signerInfo?.icon;

                        return (
                          <div
                            key={field.id}
                            className={cn(
                              'absolute border-2 border-dashed rounded flex items-center justify-center group',
                              signerInfo ? (signerInfo.label === 'Internal' ? 'border-emerald-400 bg-emerald-100/70' : 'border-blue-400 bg-blue-100/70') : 'border-slate-400 bg-slate-100/70'
                            )}
                            style={{
                              left: `${(field.x / 595) * 100}%`,
                              top: `${(field.y / 842) * 100}%`,
                              width: `${(field.width / 595) * 100}%`,
                              height: `${(field.height / 842) * 100}%`,
                            }}
                          >
                            {party && signerInfo && (
                              <div className={cn(
                                'absolute -top-5 left-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity shadow-sm',
                                signerInfo.bgColor, signerInfo.textColor
                              )}>
                                <SignerIcon className="w-2.5 h-2.5" />
                                <span>{party.name}</span>
                              </div>
                            )}
                            <span className={cn('text-xs font-medium', signerInfo?.textColor || 'text-slate-600')}>
                              {field.placeholder || field.label || field.name || fieldTypeLabels[field.type] || field.type}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No document uploaded</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Details Panel with Tabs */}
          <div className="w-80 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <Tabs defaultValue="overview" className="flex flex-col h-full">
              <TabsList className="grid grid-cols-3 mx-3 mt-3 bg-slate-100/80">
                <TabsTrigger value="overview" className="text-xs rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
                <TabsTrigger value="signers" className="text-xs rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Signers</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Settings</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-auto">
                {/* Overview Tab */}
                <TabsContent value="overview" className="m-0 p-4 space-y-5">
                  {/* Version viewing indicator */}
                  {viewingVersion && viewingVersion !== template.version && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-2">
                      <History className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-purple-700">Viewing version {viewingVersion}</span>
                    </div>
                  )}

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-slate-50/80 rounded-xl p-3">
                      <p className="text-slate-400 text-[10px] uppercase tracking-wide">Created</p>
                      <p className="font-medium text-slate-700 mt-0.5">{displayData.createdAt ? new Date(displayData.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50/80 rounded-xl p-3">
                      <p className="text-slate-400 text-[10px] uppercase tracking-wide">Version</p>
                      <p className="font-medium text-slate-700 mt-0.5">{viewingVersion || displayData.version || '1.0'}</p>
                    </div>
                    <div className="bg-slate-50/80 rounded-xl p-3">
                      <p className="text-slate-400 text-[10px] uppercase tracking-wide">Uses</p>
                      <p className="font-medium text-slate-700 mt-0.5">{template.usageCount || 0}</p>
                    </div>
                    <div className="bg-slate-50/80 rounded-xl p-3">
                      <p className="text-slate-400 text-[10px] uppercase tracking-wide">Fields</p>
                      <p className="font-medium text-slate-700 mt-0.5">{displayData.fields?.length || 0}</p>
                    </div>
                  </div>

                  {/* Description */}
                  {displayData.description && (
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase tracking-wide mb-1">Description</p>
                      <p className="text-sm text-slate-600">{displayData.description}</p>
                    </div>
                  )}

                  {/* Signers Summary */}
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase tracking-wide mb-2">Signers</p>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-blue-50/80 rounded-xl p-3 text-center">
                        <Building2 className="w-4 h-4 text-blue-600 mx-auto" />
                        <p className="text-xl font-semibold text-blue-700 mt-1">
                          {displayData.parties?.filter(p => p.signerType === 'establishment').length || 0}
                        </p>
                        <p className="text-[10px] text-blue-600 uppercase tracking-wide">Establishment</p>
                      </div>
                      <div className="flex-1 bg-emerald-50/80 rounded-xl p-3 text-center">
                        <User className="w-4 h-4 text-emerald-600 mx-auto" />
                        <p className="text-xl font-semibold text-emerald-700 mt-1">
                          {displayData.parties?.filter(p => p.signerType !== 'establishment').length || 0}
                        </p>
                        <p className="text-[10px] text-emerald-600 uppercase tracking-wide">External</p>
                      </div>
                    </div>
                  </div>

                  {/* Version */}
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase tracking-wide mb-2">{viewingVersion ? 'Viewing Version' : 'Latest Version'}</p>
                    <div className={cn("flex items-center gap-2 rounded-xl p-3", viewingVersion && viewingVersion !== template.version ? "bg-purple-50/80" : "bg-slate-50/80")}>
                      <div className={cn("w-2 h-2 rounded-full", viewingVersion && viewingVersion !== template.version ? "bg-purple-500" : "bg-emerald-500")} />
                      <span className="text-sm font-medium text-slate-700">v{viewingVersion || displayData.version || '1.0'}</span>
                      <span className="text-xs text-slate-400 ml-auto">{displayData.lastModified || 'Recent'}</span>
                    </div>
                  </div>
                </TabsContent>

                {/* Signers Tab */}
                <TabsContent value="signers" className="m-0 p-4 space-y-2">
                  {/* Version viewing indicator */}
                  {viewingVersion && viewingVersion !== template.version && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 flex items-center gap-2 mb-3">
                      <History className="w-3 h-3 text-purple-600" />
                      <span className="text-xs text-purple-700">Viewing v{viewingVersion}</span>
                    </div>
                  )}

                  {displayData.parties?.length > 0 ? (
                    <div className="space-y-2">
                      {displayData.parties.map((party, index) => {
                        const signerInfo = getSignerInfo(party, index);
                        const SignerIcon = signerInfo.icon;
                        const signerFields = displayData.fields?.filter(
                          f => f.role === party.id?.toString() || f.role === (index + 1).toString()
                        ) || [];
                        const fieldsByType = signerFields.reduce((acc, f) => {
                          acc[f.type] = (acc[f.type] || 0) + 1;
                          return acc;
                        }, {});

                        return (
                          <div
                            key={party.id || index}
                            className={cn('p-3 rounded-xl border-l-4', signerInfo.borderColor, 'bg-slate-50/80')}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-700 text-sm">{party.name}</span>
                                <span className={cn(
                                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                                  signerInfo.bgColor, signerInfo.textColor
                                )}>
                                  <SignerIcon className="w-2.5 h-2.5" />
                                  {signerInfo.label}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400">
                                {signerFields.length} fields
                              </span>
                            </div>

                            {Object.keys(fieldsByType).length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(fieldsByType).map(([type, count]) => (
                                  <span
                                    key={type}
                                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 text-slate-500"
                                  >
                                    {count} {fieldTypeLabels[type] || type}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No signers configured</p>
                    </div>
                  )}
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="m-0 p-4">
                  {/* Version viewing indicator */}
                  {viewingVersion && viewingVersion !== template.version && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 flex items-center gap-2 mb-3">
                      <History className="w-3 h-3 text-purple-600" />
                      <span className="text-xs text-purple-700">Viewing v{viewingVersion}</span>
                    </div>
                  )}

                  {displayData.settings ? (
                    <Accordion type="multiple" defaultValue={['approval', 'delivery', 'signingOrder']} className="space-y-1.5">
                      {/* Approval */}
                      <AccordionItem value="approval" className="bg-slate-50/80 rounded-xl px-3 border-0">
                        <AccordionTrigger className="text-sm font-medium py-2.5 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-700">Approval</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 space-y-1.5">
                          {displayData.settings.approval?.enabled ? (
                            <>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Approval Levels</span>
                                <span className="font-medium text-slate-700">{displayData.settings.approval.requiredApprovers || 1}</span>
                              </div>
                              {displayData.settings.approval.approvalLevels?.length > 0 && (
                                <div className="space-y-1 mt-2">
                                  {displayData.settings.approval.approvalLevels.slice(0, displayData.settings.approval.requiredApprovers).map((level, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                      <span className="w-5 h-5 rounded-full bg-slate-700 text-white text-[10px] flex items-center justify-center">L{i+1}</span>
                                      <span className="text-slate-600 capitalize">
                                        {level.assigneeType === 'role' ? level.assigneeValue || 'Not set' : level.assigneeValue || 'Not set'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-slate-400">No approval required</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      {/* Delivery */}
                      <AccordionItem value="delivery" className="bg-slate-50/80 rounded-xl px-3 border-0">
                        <AccordionTrigger className="text-sm font-medium py-2.5 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Send className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-700">Delivery</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Mode</span>
                            <span className="font-medium text-slate-700 capitalize">{displayData.settings.delivery?.mode || 'Manual'}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Method</span>
                            <span className="font-medium text-slate-700 capitalize">{displayData.settings.delivery?.deliveryMethod || 'Email'}</span>
                          </div>
                          {displayData.settings.delivery?.mode === 'manual' && displayData.settings.delivery?.manualTriggerValue && (
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Triggered By</span>
                              <span className="font-medium text-slate-700 capitalize">{displayData.settings.delivery.manualTriggerValue}</span>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      {/* Signing Order */}
                      <AccordionItem value="signingOrder" className="bg-slate-50/80 rounded-xl px-3 border-0">
                        <AccordionTrigger className="text-sm font-medium py-2.5 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-700">Signing Order</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Order Type</span>
                            <span className="font-medium text-slate-700 capitalize">{displayData.settings.signingOrder?.order || 'Sequential'}</span>
                          </div>
                          {displayData.settings.signingOrder?.order === 'sequential' && displayData.settings.signingOrder?.signerSequence?.length > 0 && (
                            <div className="mt-2">
                              <p className="text-[10px] text-slate-400 uppercase mb-1">Signing Sequence</p>
                              <div className="flex flex-wrap gap-1">
                                {displayData.settings.signingOrder.signerSequence.map((id, i) => {
                                  const signer = displayData.parties?.find(p => p.id === id);
                                  return (
                                    <span key={i} className="text-[10px] px-2 py-0.5 bg-white rounded-full text-slate-600 flex items-center gap-1">
                                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[8px] flex items-center justify-center">{i+1}</span>
                                      {signer?.name || `Signer ${i+1}`}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      {/* Reminder */}
                      <AccordionItem value="reminder" className="bg-slate-50/80 rounded-xl px-3 border-0">
                        <AccordionTrigger className="text-sm font-medium py-2.5 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Bell className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-700">Reminder</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 space-y-1.5">
                          {displayData.settings.reminder?.enabled ? (
                            <>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">First Reminder</span>
                                <span className="text-slate-700">{displayData.settings.reminder.firstReminderAfterDays || 3} days</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Interval</span>
                                <span className="text-slate-700">Every {displayData.settings.reminder.reminderIntervalDays || 2} days</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Max Reminders</span>
                                <span className="text-slate-700">{displayData.settings.reminder.maxReminders || 5}</span>
                              </div>
                            </>
                          ) : (
                            <p className="text-xs text-slate-400">Disabled</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      {/* Expiration */}
                      <AccordionItem value="expiration" className="bg-slate-50/80 rounded-xl px-3 border-0">
                        <AccordionTrigger className="text-sm font-medium py-2.5 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-700">Expiration</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 space-y-1.5">
                          {displayData.settings.expiration?.enabled ? (
                            <>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Expires After</span>
                                <span className="text-slate-700">{displayData.settings.expiration.expiresAfterDays || 30} days</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Warning Before</span>
                                <span className="text-slate-700">{displayData.settings.expiration.notifyBeforeExpiryDays || 7} days</span>
                              </div>
                            </>
                          ) : (
                            <p className="text-xs text-slate-400">No expiration</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      {/* Revoke */}
                      <AccordionItem value="revoke" className="bg-slate-50/80 rounded-xl px-3 border-0">
                        <AccordionTrigger className="text-sm font-medium py-2.5 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-700">Revoke</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 space-y-1.5">
                          {displayData.settings.revoke?.allowRevocation ? (
                            <>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Notify Signers</span>
                                <span className={displayData.settings.revoke.notifySigners ? 'text-emerald-600' : 'text-slate-400'}>
                                  {displayData.settings.revoke.notifySigners ? '✓' : '✗'}
                                </span>
                              </div>
                              {displayData.settings.revoke.allowedRoles?.length > 0 && (
                                <div className="mt-1">
                                  <p className="text-[10px] text-slate-400 uppercase mb-1">Allowed Roles</p>
                                  <div className="flex flex-wrap gap-1">
                                    {displayData.settings.revoke.allowedRoles.map((role, i) => (
                                      <span key={i} className="text-[10px] px-2 py-0.5 bg-red-50 text-red-600 rounded-full capitalize">{role}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-slate-400">Revocation not allowed</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No settings configured</p>
                    </div>
                  )}
                </TabsContent>

                              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}