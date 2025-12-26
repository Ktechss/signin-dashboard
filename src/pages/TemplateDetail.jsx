import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getTemplateById } from '@/utils/templateStorage';
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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import DocumentViewer from '@/components/ui-custom/DocumentViewer';
import { FieldOverlayList } from '@/components/templates/FieldOverlay';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function TemplateDetail() {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('id');
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);

  // Handle PDF load success to get page count
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    const loadTemplate = async () => {
      if (templateId) {
        try {
          // First try to load from localStorage
          let loadedTemplate = getTemplateById(templateId);

          // If not found in localStorage, try loading from sample blueprints
          if (!loadedTemplate) {
            const response = await fetch('/sample-blueprints.json');
            const sampleBlueprints = await response.json();
            loadedTemplate = sampleBlueprints.find(t => t.id.toString() === templateId.toString());
          }

          setTemplate(loadedTemplate);
        } catch (error) {
          console.error('Error loading template:', error);
          setTemplate(null);
        } finally {
          setLoading(false);
        }
      }
    };

    loadTemplate();
  }, [templateId]);

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
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link to={createPageUrl('Templates')}>
              <Button variant="ghost" size="icon" className="mt-1">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">{template.name}</h1>
                <StatusBadge status={template.status} />
                <Badge variant="outline" className="gap-1">
                  <Layers className="w-3 h-3" />
                  v{template.version}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {template.usageCount} uses
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Updated {template.lastModified}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={createPageUrl('SignContract')}>
              <Button className="gap-2 bg-slate-900 hover:bg-slate-800">
                <PenTool className="w-4 h-4" />
                Create Contract
              </Button>
            </Link>
            <Link to={createPageUrl('TemplateBuilder')}>
              <Button variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Template
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
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
                <DropdownMenuItem className="gap-2">
                  <History className="w-4 h-4" />
                  Version History
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
        
        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Document Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
              <div className="p-6 bg-slate-50 max-h-[80vh] overflow-y-auto">
                {(template.documentData || template.filePreview || template.preview) ? (
                  <div className="flex flex-col items-center">
                    {template.documentData?.type === 'application/pdf' ? (
                      // Render PDF using react-pdf - all pages
                      <Document
                        file={template.documentData.data}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={(error) => {
                          console.error('PDF load error:', error);
                        }}
                        loading={<div className="text-center p-8 text-slate-500">Loading PDF...</div>}
                      >
                        <div className="flex flex-col items-center space-y-6">
                          {Array.from({ length: numPages || template.documentData?.numPages || 1 }, (_, index) => {
                            const pageNumber = index + 1;
                            // Filter fields for this page
                            const pageFields = template.fields?.filter(f => (f.page || 1) === pageNumber) || [];

                            return (
                              <div key={pageNumber} className="relative">
                                {/* Page number badge */}
                                {(numPages || template.documentData?.numPages || 1) > 1 && (
                                  <div className="absolute top-2 right-2 bg-slate-900/70 text-white text-xs px-2 py-1 rounded z-10">
                                    Page {pageNumber} of {numPages || template.documentData?.numPages || 1}
                                  </div>
                                )}
                                <Page
                                  pageNumber={pageNumber}
                                  width={600}
                                  renderTextLayer={false}
                                  renderAnnotationLayer={false}
                                  className="rounded-lg shadow-sm"
                                />
                                {/* Render field overlays for this page */}
                                <FieldOverlayList fields={pageFields} />
                              </div>
                            );
                          })}
                        </div>
                      </Document>
                    ) : (
                      // Render image (JPEG/PNG)
                      <div className="relative inline-block">
                        <img
                          src={template.filePreview || template.preview || template.documentData?.thumbnail}
                          alt={template.name}
                          className="max-w-full rounded-lg shadow-sm border border-slate-200"
                          onError={(e) => {
                            console.error('Failed to load image:', e);
                          }}
                        />
                        {/* Render field overlays for images (all on page 1) */}
                        <FieldOverlayList fields={template.fields} />
                      </div>
                    )}
                  </div>
                ) : (
                  <DocumentViewer />
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Template Info */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Template Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Created</span>
                  <span className="font-medium text-slate-700">{template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Version</span>
                  <span className="font-medium text-slate-700">{template.version || '1.0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Uses</span>
                  <span className="font-medium text-slate-700">{template.usageCount || 0}</span>
                </div>
              </div>
              {template.description && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500">{template.description}</p>
                </div>
              )}
            </div>
            
            {/* Party Roles */}
            {template.parties && Array.isArray(template.parties) && template.parties.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200/60 p-5">
                <h3 className="font-semibold text-slate-900 mb-4">Signers & Fields</h3>
                <div className="space-y-3">
                  {template.parties.map((party, index) => {
                    // Color scheme matching signature overlay colors - only left border colored
                    const partyColors = [
                      { border: 'border-l-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-600' },
                      { border: 'border-l-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
                      { border: 'border-l-purple-500', bg: 'bg-purple-50', text: 'text-purple-600' },
                      { border: 'border-l-amber-500', bg: 'bg-amber-50', text: 'text-amber-600' },
                    ];
                    // Use saved color index or default based on position
                    const colorIndex = party.colorIndex !== undefined ? party.colorIndex : index;
                    const colorScheme = partyColors[colorIndex % partyColors.length];

                    // Get all fields allocated to this signer
                    const signerFields = template.fields ? template.fields.filter(
                      field => field.role === party.id.toString() || field.role === (index + 1).toString()
                    ) : [];
                    const totalFieldCount = signerFields.length;

                    // Group fields by type and count them
                    const fieldsByType = signerFields.reduce((acc, field) => {
                      const type = field.type || 'signature';
                      acc[type] = (acc[type] || 0) + 1;
                      return acc;
                    }, {});

                    // Get unique pages where this signer has fields
                    const fieldPages = [...new Set(signerFields.map(f => f.page || 1))].sort((a, b) => a - b);

                    // Field type labels
                    const fieldTypeLabels = {
                      signature: 'Signature',
                      text: 'Text',
                      initials: 'Initials',
                      date: 'Date',
                      checkbox: 'Checkbox',
                      number: 'Number'
                    };

                    return (
                      <div
                        key={index}
                        className={`p-3 bg-slate-50 rounded-r-lg border-l-4 ${colorScheme.border}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-700">{party.name || party.role}</span>
                          <Badge variant="outline" className="text-slate-600 text-xs">
                            {totalFieldCount} {totalFieldCount === 1 ? 'field' : 'fields'}
                          </Badge>
                        </div>

                        {/* Field type breakdown */}
                        {Object.keys(fieldsByType).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {Object.entries(fieldsByType).map(([type, count]) => (
                              <span
                                key={type}
                                className={`text-xs px-2 py-0.5 rounded-full ${colorScheme.bg} ${colorScheme.text}`}
                              >
                                {count} {fieldTypeLabels[type] || type}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Pages info */}
                        {fieldPages.length > 0 && (numPages || template.documentData?.numPages) > 1 && (
                          <div className="text-xs text-slate-500">
                            Page{fieldPages.length > 1 ? 's' : ''}: {fieldPages.join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
                        
            {/* Version History */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Version History</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-slate-500" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">v{template.version || '1.0'}</span>
                      <span className="text-xs text-slate-400">{template.lastModified || 'Recent'}</span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">Initial template creation</p>
                    <p className="text-xs text-slate-400">System</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}