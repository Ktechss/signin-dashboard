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
  Layers
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

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function TemplateDetail() {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('id');
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
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
                <span>{template.category}</span>
                <span>•</span>
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
                <DropdownMenuItem className="gap-2 text-amber-600">
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
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Document Preview</h3>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Full Screen
                </Button>
              </div>
              <div className="p-4 bg-slate-50">
                {(template.documentData || template.filePreview || template.preview) ? (
                  <div className="flex justify-center">
                    <div className="relative inline-block">
                      {template.documentData?.type === 'application/pdf' ? (
                        // Render PDF using react-pdf
                        <Document
                          file={template.documentData.data}
                          onLoadError={(error) => {
                            console.error('PDF load error:', error);
                          }}
                          loading={<div className="text-center p-8 text-slate-500">Loading PDF...</div>}
                        >
                          <Page
                            pageNumber={1}
                            width={600}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="rounded-lg shadow-sm"
                          />
                        </Document>
                      ) : (
                        // Render image (JPEG/PNG)
                        <img
                          src={template.filePreview || template.preview || template.documentData?.thumbnail}
                          alt={template.name}
                          className="max-w-full rounded-lg shadow-sm border border-slate-200"
                          onError={(e) => {
                            console.error('Failed to load image:', e);
                          }}
                        />
                      )}
                      {/* Render field overlays */}
                      {template.fields && Array.isArray(template.fields) && template.fields.map((field, index) => {
                        const fieldTypes = {
                          signature: { icon: '✍️', color: 'indigo' },
                          initials: { icon: '📝', color: 'purple' },
                          date: { icon: '📅', color: 'emerald' },
                          text: { icon: '📄', color: 'blue' },
                          checkbox: { icon: '☑️', color: 'amber' },
                          number: { icon: '#️⃣', color: 'rose' },
                        };

                        const fieldInfo = fieldTypes[field.type] || fieldTypes.text;
                        const colors = [
                          { border: 'border-indigo-400', bg: 'bg-indigo-100/70', text: 'text-indigo-700' },
                          { border: 'border-purple-400', bg: 'bg-purple-100/70', text: 'text-purple-700' },
                          { border: 'border-emerald-400', bg: 'bg-emerald-100/70', text: 'text-emerald-700' },
                          { border: 'border-blue-400', bg: 'bg-blue-100/70', text: 'text-blue-700' },
                        ];
                        const colorScheme = colors[index % colors.length];

                        return (
                          <div
                            key={field.id}
                            className={`absolute border-2 border-dashed ${colorScheme.border} ${colorScheme.bg} rounded flex items-center justify-center`}
                            style={{
                              left: `${(field.x / 595) * 100}%`,
                              top: `${(field.y / 842) * 100}%`,
                              width: `${(field.width / 595) * 100}%`,
                              height: `${(field.height / 842) * 100}%`,
                            }}
                          >
                            <span className={`text-xs font-medium ${colorScheme.text}`}>
                              {fieldInfo.icon} {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
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
                  <span className="text-slate-500">Category</span>
                  <span className="font-medium text-slate-700">{template.category || 'Uncategorized'}</span>
                </div>
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
                <h3 className="font-semibold text-slate-900 mb-4">Party Roles</h3>
                <div className="space-y-3">
                  {template.parties.map((party, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="font-medium text-slate-700">{party.name || party.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {party.required ? (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-xs">
                            Required
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500 text-xs">
                            Optional
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Signature Fields */}
            {template.fields && Array.isArray(template.fields) && template.fields.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200/60 p-5">
                <h3 className="font-semibold text-slate-900 mb-4">Signature Fields</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(() => {
                    const fieldCounts = template.fields.reduce((acc, field) => {
                      acc[field.type] = (acc[field.type] || 0) + 1;
                      return acc;
                    }, {});

                    return Object.entries(fieldCounts).map(([type, count]) => (
                      <div key={type} className="p-3 bg-slate-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-slate-900">{count}</p>
                        <p className="text-xs text-slate-500 capitalize">{type}</p>
                      </div>
                    ));
                  })()}
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
                  <div className="w-2 h-2 rounded-full mt-2 bg-indigo-500" />
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