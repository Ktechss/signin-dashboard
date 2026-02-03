import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { saveTemplate, getTemplateById, updateTemplate, getDocumentUrl } from '@/utils/templateStorage';
import { Document, Page, pdfjs } from 'react-pdf';
import SaveVersionDialog from '@/components/templates/SaveVersionDialog';
import {
  ArrowLeft,
  Upload,
  FileText,
  Users,
  Settings,
  CheckCircle2,
  ChevronRight,
  Plus,
  Trash2,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import FieldPlacement from '@/components/templates/FieldPlacement';
import BlueprintSettings, { DEFAULT_BLUEPRINT_SETTINGS } from '@/components/templates/BlueprintSettings';

// Configure PDF.js worker to match react-pdf's version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const steps = [
  { id: 'info', title: 'Basic Info & Upload', description: 'Blueprint details and document' },
  { id: 'fields', title: 'Signature Placement', description: 'Place signature fields' },
  { id: 'settings', title: 'Settings', description: 'Configure workflow & policies' },
];

// Clients list for org-specific blueprints
const clients = [
  { id: 1, name: 'ADCB Bank', abbr: 'AD' },
  { id: 2, name: 'Emirates NBD', abbr: 'EN' },
  { id: 3, name: 'First Abu Dhabi Bank', abbr: 'FA' },
  { id: 4, name: 'Mashreq Bank', abbr: 'MB' },
];

const visibilityLabels = {
  'org-specific': 'Org Specific',
  'internal': 'Internal',
  'public': 'Public',
};

export default function TemplateBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read params from URL
  const templateId = searchParams.get('id');
  const visibilityParam = searchParams.get('visibility') || 'public';
  const clientIdParam = searchParams.get('clientId');

  // Check if we're in edit mode
  const isEditMode = !!templateId;

  // Get assigned client if org-specific
  const [assignedClient, setAssignedClient] = useState(
    clientIdParam ? clients.find(c => c.id === parseInt(clientIdParam)) : null
  );
  const [editVisibility, setEditVisibility] = useState(visibilityParam);

  const [currentStep, setCurrentStep] = useState(isEditMode ? 1 : 0); // Start at step 1 for edit mode
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [templateFields, setTemplateFields] = useState([]);
  const [templateSettings, setTemplateSettings] = useState(DEFAULT_BLUEPRINT_SETTINGS);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [existingTemplate, setExistingTemplate] = useState(null);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingSaveAction, setPendingSaveAction] = useState(null); // 'activate' or 'draft'

  // Load existing template if in edit mode
  useEffect(() => {
    const loadTemplate = async () => {
      if (templateId) {
        setIsLoading(true);
        try {
          // Load template from API
          const template = await getTemplateById(templateId);

          if (template) {
            setExistingTemplate(template);
            setTemplateData({
              name: template.name || '',
              description: template.description || '',
            });

            // Set document preview - handle both API stored documents and inline data
            if (template.documentUrl) {
              // Document is stored in MinIO, create preview object with URL
              setUploadedPreview({
                data: getDocumentUrl(template.documentUrl),
                type: template.documentType || 'application/pdf',
                thumbnail: template.thumbnailUrl ? getDocumentUrl(template.thumbnailUrl) : null,
                numPages: template.numPages || 1
              });
            } else if (template.documentData) {
              // Fallback to inline documentData if present
              setUploadedPreview(template.documentData);
            }

            setTemplateFields(template.fields || []);
            setParties(template.parties || []);
            setTemplateSettings(template.settings || DEFAULT_BLUEPRINT_SETTINGS);

            // Set visibility info
            if (template.visibility) {
              setEditVisibility(template.visibility);
            }
            if (template.assignedClient) {
              setAssignedClient(template.assignedClient);
            }

            // Set a mock file object for display
            if (template.fileName) {
              setUploadedFile({ name: template.fileName, size: 0 });
            }
          }
        } catch (error) {
          console.error('Error loading template:', error);
          toast.error('Failed to load template');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadTemplate();
  }, [templateId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);

      if (file.type === 'application/pdf') {
        // For PDF, generate both the PDF data and a thumbnail image
        const reader = new FileReader();
        reader.onload = async (e) => {
          const pdfData = e.target.result;

          // Generate thumbnail from first page and get page count
          try {
            const loadingTask = pdfjs.getDocument(pdfData);
            const pdf = await loadingTask.promise;
            const totalPages = pdf.numPages;

            const page = await pdf.getPage(1);

            // Create canvas for thumbnail
            const viewport = page.getViewport({ scale: 0.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise;

            const thumbnailData = canvas.toDataURL('image/png');

            setUploadedPreview({
              data: pdfData,
              type: file.type,
              thumbnail: thumbnailData,
              numPages: totalPages
            });
          } catch (error) {
            console.error('Error generating PDF thumbnail:', error);
            setUploadedPreview({
              data: pdfData,
              type: file.type
            });
          }
        };
        reader.readAsDataURL(file);
      } else {
        // For images, just read as data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target.result;
          setUploadedPreview({
            data: imageData,
            type: file.type,
            thumbnail: imageData
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };
  // Initialize with default Establishment 1 signer
  const [parties, setParties] = useState([{
    id: 1,
    name: 'Establishment 1',
    signerType: 'establishment',
    required: true,
    minCount: 1,
    maxCount: 1,
    order: 1,
    colorIndex: 0
  }]);

  const addParty = () => {
    const newId = parties.length > 0 ? Math.max(...parties.map(p => p.id)) + 1 : 1;
    // Determine signer type and name based on existing parties
    const establishmentCount = parties.filter(p => p.signerType === 'establishment').length;
    const externalCount = parties.filter(p => p.signerType === 'external').length;

    setParties([...parties, {
      id: newId,
      name: `Signer ${externalCount + 1}`,
      signerType: 'external', // New signers default to external
      required: false,
      minCount: 0,
      maxCount: 1,
      order: parties.length + 1,
      colorIndex: parties.length
    }]);
  };

  const removeParty = (id) => {
    // Prevent deletion of establishment signers
    const party = parties.find(p => p.id === id);
    if (party?.signerType === 'establishment') {
      return; // Cannot delete establishment signers
    }
    setParties(parties.filter(p => p.id !== id));
  };

  const updateParty = (id, updates) => {
    // Prevent modification of establishment signers
    const party = parties.find(p => p.id === id);
    if (party?.signerType === 'establishment') {
      return; // Cannot modify establishment signers
    }
    setParties(parties.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // Auto-generate parties based on signature/initials fields
  useEffect(() => {
    // Count signature and initials fields (these require signers)
    const signatureFields = templateFields.filter(
      field => field.type === 'signature' || field.type === 'initials'
    );

    // Get unique roles from fields
    const uniqueRoles = new Set(signatureFields.map(field => field.role));
    const requiredPartiesCount = uniqueRoles.size || signatureFields.length;

    // Auto-generate parties if we don't have enough
    if (requiredPartiesCount > parties.length) {
      const newParties = [];
      for (let i = 1; i <= requiredPartiesCount; i++) {
        if (!parties.find(p => p.id === i)) {
          newParties.push({
            id: i,
            name: `Signer ${i}`,
            signerType: 'external', // Default to external signer
            required: true,
            minCount: 1,
            maxCount: 1,
            order: i,
            colorIndex: i - 1 // Save color index (0-based)
          });
        }
      }
      if (newParties.length > 0) {
        setParties([...parties, ...newParties].sort((a, b) => a.id - b.id));
      }
    }
  }, [templateFields]);

  const handleActivateTemplate = async () => {
    // If editing existing template, show version dialog
    if (isEditMode && existingTemplate) {
      setPendingSaveAction('activate');
      setShowVersionDialog(true);
      return;
    }

    // For new templates, save directly
    await saveTemplateWithVersion('activate');
  };

  const saveTemplateWithVersion = async (action, versionType = null, changeNote = '') => {
    setIsSaving(true);
    try {
      const isActivate = action === 'activate';

      // Check if we have a new document upload (base64 data vs URL)
      const hasNewDocument = uploadedPreview?.data && !uploadedPreview.data.startsWith('http');

      const templatePayload = {
        name: templateData.name || 'Untitled Blueprint',
        description: templateData.description,
        tags: existingTemplate?.tags || [],
        status: isActivate ? 'active' : 'draft',
        fileName: uploadedFile?.name || existingTemplate?.fileName,
        filePreview: uploadedPreview?.thumbnail || uploadedPreview?.data || uploadedPreview,
        preview: uploadedPreview?.thumbnail || uploadedPreview?.data || uploadedPreview,
        // Only include documentData if it's new base64 data, not a URL
        documentData: hasNewDocument ? uploadedPreview : undefined,
        numPages: uploadedPreview?.numPages || existingTemplate?.numPages || 1,
        fields: templateFields,
        parties: parties,
        settings: templateSettings,
        visibility: editVisibility,
        assignedClient: assignedClient,
        currentStep: isActivate ? undefined : currentStep,
        lastModified: 'Just now'
      };

      let template;
      if (isEditMode && existingTemplate) {
        // Build version options for update
        const versionOptions = versionType ? { versionType, changeNote } : null;
        template = await updateTemplate(existingTemplate.id, templatePayload, null, null, versionOptions);

        const newVersion = template.version || existingTemplate.version;
        toast.success('Blueprint updated successfully!', {
          description: `"${templatePayload.name}" is now at version ${newVersion}.`
        });
      } else {
        // Save new template
        template = await saveTemplate(templatePayload);
        toast.success(isActivate ? 'Blueprint activated successfully!' : 'Blueprint saved as draft!', {
          description: isActivate
            ? `"${template.name}" is now active and ready to use.`
            : 'You can continue editing it later.'
        });
      }

      // Navigate back to appropriate page after a brief delay
      setTimeout(() => {
        if (editVisibility && editVisibility !== 'public') {
          navigate('/BlueprintGallery');
        } else {
          navigate(createPageUrl('Templates'));
        }
      }, 1000);
    } catch (error) {
      console.error('Error saving blueprint:', error);
      toast.error('Failed to save blueprint', {
        description: 'Please try again.'
      });
    } finally {
      setIsSaving(false);
      setShowVersionDialog(false);
      setPendingSaveAction(null);
    }
  };

  const handleVersionSave = (versionType, changeNote) => {
    saveTemplateWithVersion(pendingSaveAction, versionType, changeNote);
  };

  const handleSaveAsDraft = async () => {
    // If editing existing template, show version dialog
    if (isEditMode && existingTemplate) {
      setPendingSaveAction('draft');
      setShowVersionDialog(true);
      return;
    }

    // For new templates, save directly
    await saveTemplateWithVersion('draft');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="w-[90%] max-w-8xl mx-auto">
            <div className={`grid grid-cols-1 gap-8 ${uploadedPreview ? 'lg:grid-cols-2' : ''}`}>
              {/* Left Column: Form */}
              <div className={`space-y-6 ${!uploadedPreview ? 'max-w-2xl mx-auto w-full' : ''}`}>
                {/* Basic Info Section */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                  <h3 className="font-semibold text-slate-900">Blueprint Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="name">Blueprint Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Sales Agreement"
                      value={templateData.name}
                      onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this blueprint is used for..."
                      rows={4}
                      value={templateData.description}
                      onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                    />
                  </div>
                </div>

                {/* Upload Section */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                  <h3 className="font-semibold text-slate-900">Upload Document</h3>

                  {!uploadedFile ? (
                    <label className="block">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                      />
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-8 h-8 text-slate-700" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">Upload your document</h3>
                        <p className="text-sm text-slate-500 mb-4">
                          Drag and drop your PDF or Image file here, or click to browse
                        </p>
                        <Button variant="outline" type="button">Browse Files</Button>
                        <p className="text-xs text-slate-400 mt-4">Supported: PDF, JPG, PNG • Max size: 25MB</p>
                      </div>
                    </label>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-slate-700" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{uploadedFile.name}</p>
                          <p className="text-sm text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-red-600"
                        onClick={() => {
                          setUploadedFile(null);
                          setUploadedPreview(null);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Preview - Only show when document is uploaded */}
              {uploadedPreview && (
                <div className="lg:sticky lg:top-24 lg:h-fit">
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="p-6 bg-slate-50 max-h-[85vh] overflow-y-auto">
                      {uploadedPreview.type === 'application/pdf' ? (
                        <Document
                          file={uploadedPreview.data}
                          onLoadError={(error) => {
                            console.error('PDF load error:', error);
                            toast.error('Failed to load PDF');
                          }}
                          loading={<div className="text-center p-4">Loading PDF...</div>}
                        >
                          <div className="space-y-4">
                            {Array.from({ length: uploadedPreview.numPages || 1 }, (_, index) => (
                              <div key={index} className="relative">
                                {uploadedPreview.numPages > 1 && (
                                  <div className="absolute top-2 right-2 bg-slate-900/70 text-white text-xs px-2 py-1 rounded z-10">
                                    Page {index + 1}
                                  </div>
                                )}
                                <Page
                                  pageNumber={index + 1}
                                  scale={1}
                                  renderTextLayer={false}
                                  renderAnnotationLayer={false}
                                  className="max-w-full h-auto shadow-md"
                                />
                              </div>
                            ))}
                          </div>
                        </Document>
                      ) : (
                        <img
                          src={uploadedPreview.data}
                          alt="Document preview"
                          className="max-w-full h-auto"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="h-full">
            <FieldPlacement
              documentPreview={uploadedPreview}
              onFieldsChange={setTemplateFields}
              parties={parties}
              initialFields={templateFields}
              onAddSigner={addParty}
              onDeleteSigner={removeParty}
              onUpdateSigner={updateParty}
            />
          </div>
        );

      case 2:
        return (
          <div className="w-full h-full">
            <BlueprintSettings
              settings={templateSettings}
              onChange={setTemplateSettings}
              parties={parties}
            />
          </div>
        );

      default:
        return null;
    }
  };
  
  // Show loading state while loading template in edit mode
  if (isLoading) {
    return (
      <div className="h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading blueprint...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50/50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 flex-shrink-0">
        <div className="max-w-8xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-8">
            {/* Left: Back button and Title */}
            <div className="flex items-center gap-4">
              <Link to={editVisibility && editVisibility !== 'public' ? '/BlueprintGallery' : createPageUrl('Templates')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold text-slate-900">
                    {isEditMode ? 'Edit Blueprint' : 'Create Blueprint'}
                  </h1>
                  {/* Visibility Badge */}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    editVisibility === 'org-specific'
                      ? 'bg-blue-100 text-blue-700'
                      : editVisibility === 'internal'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {visibilityLabels[editVisibility] || 'Public'}
                    {assignedClient && ` - ${assignedClient.name}`}
                  </span>
                </div>
                <p className="text-sm text-slate-500">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>

            {/* Center: Progress Stepper */}
            <div className="flex items-center gap-2 flex-1 justify-center">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setCurrentStep(index)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                      index === currentStep
                        ? 'bg-slate-900 text-white'
                        : index < currentStep
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <span className={`text-xs font-medium ${
                      index === currentStep ? 'text-white' : ''
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-xs hidden md:inline">{step.title}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 w-8 ${
                      index < currentStep ? 'bg-slate-700' : 'bg-slate-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSaveAsDraft}>Save as Draft</Button>
              {currentStep === steps.length - 1 ? (
                <Button
                  className="gap-2 bg-slate-900 hover:bg-slate-800"
                  onClick={handleActivateTemplate}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isEditMode ? 'Update Blueprint' : 'Activate Blueprint'}
                </Button>
              ) : (
                <Button
                  className="bg-slate-900 hover:bg-slate-800"
                  onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
                >
                  Next Step
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 ${currentStep === 0 ? 'overflow-auto' : 'overflow-hidden'}`}>
        <div className={currentStep === 0 ? 'py-6' : 'h-full'}>
          {renderStepContent()}
        </div>
      </div>

      {/* Version Save Dialog */}
      <SaveVersionDialog
        open={showVersionDialog}
        onOpenChange={setShowVersionDialog}
        currentVersion={existingTemplate?.versionNumber}
        onSave={handleVersionSave}
        isSaving={isSaving}
      />
    </div>
  );
}