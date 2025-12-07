import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { saveTemplate } from '@/utils/templateStorage';
import { Document, Page, pdfjs } from 'react-pdf';
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

// Configure PDF.js worker to match react-pdf's version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const steps = [
  { id: 'info', title: 'Basic Info & Upload', description: 'Blueprint details and document' },
  { id: 'fields', title: 'Signature Placement', description: 'Place signature fields' },
];

export default function TemplateBuilder() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [templateFields, setTemplateFields] = useState([]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);

      if (file.type === 'application/pdf') {
        // For PDF, generate both the PDF data and a thumbnail image
        const reader = new FileReader();
        reader.onload = async (e) => {
          const pdfData = e.target.result;

          // Generate thumbnail from first page
          try {
            const loadingTask = pdfjs.getDocument(pdfData);
            const pdf = await loadingTask.promise;
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
              thumbnail: thumbnailData
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
  const [parties, setParties] = useState([]);
  
  const addParty = () => {
    const newId = parties.length > 0 ? Math.max(...parties.map(p => p.id)) + 1 : 1;
    setParties([...parties, {
      id: newId,
      name: `Signer ${newId}`,
      required: false,
      minCount: 0,
      maxCount: 1,
      order: parties.length + 1
    }]);
  };
  
  const removeParty = (id) => {
    setParties(parties.filter(p => p.id !== id));
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
            required: true,
            minCount: 1,
            maxCount: 1,
            order: i
          });
        }
      }
      if (newParties.length > 0) {
        setParties([...parties, ...newParties].sort((a, b) => a.id - b.id));
      }
    }
  }, [templateFields]);

  const handleActivateTemplate = () => {
    try {
      // Save blueprint to localStorage
      const template = saveTemplate({
        name: templateData.name || 'Untitled Blueprint',
        description: templateData.description,
        category: 'general',
        tags: [],
        status: 'active',
        version: '1.0',
        fileName: uploadedFile?.name,
        filePreview: uploadedPreview?.thumbnail || uploadedPreview?.data || uploadedPreview,
        preview: uploadedPreview?.thumbnail || uploadedPreview?.data || uploadedPreview,
        documentData: uploadedPreview,
        fields: templateFields,
        parties: parties,
        lastModified: 'Just now'
      });

      console.log('Blueprint activated:', template);

      // Show success message
      toast.success('Blueprint activated successfully!', {
        description: `"${template.name}" is now active and ready to use.`
      });

      // Navigate back to blueprints page after a brief delay
      setTimeout(() => {
        navigate(createPageUrl('Templates'));
      }, 1000);
    } catch (error) {
      console.error('Error saving blueprint:', error);
      toast.error('Failed to activate blueprint', {
        description: 'Please try again.'
      });
    }
  };

  const handleSaveAsDraft = () => {
    try {
      // Save blueprint as draft to localStorage
      const template = saveTemplate({
        name: templateData.name || 'Untitled Blueprint',
        description: templateData.description,
        category: 'general',
        tags: [],
        status: 'draft',
        version: '0.1',
        fileName: uploadedFile?.name,
        filePreview: uploadedPreview?.thumbnail || uploadedPreview?.data || uploadedPreview,
        preview: uploadedPreview?.thumbnail || uploadedPreview?.data || uploadedPreview,
        documentData: uploadedPreview,
        fields: templateFields,
        parties: parties,
        currentStep: currentStep,
        lastModified: 'Just now'
      });

      console.log('Blueprint saved as draft:', template);

      // Show success message
      toast.success('Blueprint saved as draft!', {
        description: 'You can continue editing it later.'
      });

      // Navigate back to blueprints page after a brief delay
      setTimeout(() => {
        navigate(createPageUrl('Templates'));
      }, 1000);
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save blueprint draft', {
        description: 'Please try again.'
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="max-w-4xl mx-auto space-y-6">
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
                <div className="space-y-4">
                  {/* File Info */}
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

                  {/* Preview */}
                  {uploadedPreview && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                        <span className="text-sm font-medium text-slate-700">Document Preview</span>
                      </div>
                      <div className="p-4 bg-slate-50 max-h-[500px] overflow-auto">
                        {uploadedPreview.type === 'application/pdf' ? (
                          <Document
                            file={uploadedPreview.data}
                            onLoadError={(error) => {
                              console.error('PDF load error:', error);
                              toast.error('Failed to load PDF');
                            }}
                            loading={<div className="text-center p-4">Loading PDF...</div>}
                          >
                            <Page
                              pageNumber={1}
                              width={500}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                            />
                          </Document>
                        ) : (
                          <img
                            src={uploadedPreview.data}
                            alt="Document preview"
                            className="w-full rounded shadow-sm"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <FieldPlacement
            className="mx-auto"
            documentPreview={uploadedPreview}
            onFieldsChange={setTemplateFields}
            parties={parties}
          />
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Templates')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold text-slate-900">Create Blueprint</h1>
                <p className="text-sm text-slate-500">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSaveAsDraft}>Save as Draft</Button>
              {currentStep === steps.length - 1 ? (
                <Button className="gap-2 bg-slate-900 hover:bg-slate-800" onClick={handleActivateTemplate}>
                  <CheckCircle2 className="w-4 h-4" />
                  Activate Blueprint
                </Button>
              ) : (
                <Button
                  className="gap-2 bg-slate-900 hover:bg-slate-800"
                  onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 lg:p-8 pb-24">
        {renderStepContent()}
      </div>
      
      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Previous Button */}
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
            disabled={currentStep === 0}
            className="min-w-24"
          >
            Previous
          </Button>

          {/* Progress Stepper - Compact */}
          <div className="flex-1 max-w-3xl">
            <div className="flex items-center justify-center gap-2">
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
          </div>

          {/* Next Button */}
          <Button
            className="bg-slate-900 hover:bg-slate-800 min-w-24"
            onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
            disabled={currentStep === steps.length - 1}
          >
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
}