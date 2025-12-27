import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { getTemplates, saveContract, incrementTemplateUsage } from '@/utils/templateStorage';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ArrowLeft,
  FileText,
  Users,
  Settings,
  Send,
  Calendar,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  ChevronRight,
  Clock,
  Shield,
  Bell,
  Mail,
  Phone,
  File,
  X,
  Building2,
  User
} from 'lucide-react';

// Configure PDF.js worker to match react-pdf's version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Stepper from '@/components/ui-custom/Stepper';
import TemplateCard from '@/components/templates/TemplateCard';

const steps = [
  { id: 'template', title: 'Select Template', description: 'Choose a template' },
  { id: 'details', title: 'Contract Details', description: 'Add parties' },
  { id: 'settings', title: 'Settings', description: 'Configure options' },
  { id: 'review', title: 'Review & Send', description: 'Final check' },
];

// No more mock data - only user-created templates

export default function SignContract() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [userTemplates, setUserTemplates] = useState([]);
  const [contractDetails, setContractDetails] = useState({
    name: '',
    reference: '',
    tags: '',
    notes: ''
  });
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [uploadedDocumentPreview, setUploadedDocumentPreview] = useState(null);
  const [parties, setParties] = useState([
    { id: 1, name: '', email: '', phone: '', idType: 'passport', idNumber: '', order: 1 }
  ]);
  const [settings, setSettings] = useState({
    requireVerification: true,
    verificationType: 'full',
    maxAttempts: 3,
    sendNow: true,
    sendReminders: true,
    reminderDays: [3, 7],
    expiresIn: 7,
    warningDays: 2,
    requireEmailVerification: true,
    requireSmsOtp: false,
    allowDecline: true,
    allowComments: true,
    requireFullScroll: false,
    addWatermark: false,
    customMessage: ''
  });

  // Load templates from API
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const savedTemplates = await getTemplates();
        // Only show active templates
        setUserTemplates(savedTemplates.filter(t => t.status === 'active'));
      } catch (error) {
        console.error('Error loading templates:', error);
        setUserTemplates([]);
      }
    };
    loadTemplates();
  }, []);

  // Initialize parties from selected template
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.parties && selectedTemplate.parties.length > 0) {
      // Pre-populate parties from template
      const templateParties = selectedTemplate.parties.map((party, index) => ({
        id: party.id,
        roleName: party.name, // Store the role name from template
        name: '', // User fills this
        email: '',
        phone: '',
        idType: 'passport',
        idNumber: '',
        order: party.order || index + 1,
        required: party.required,
        templatePartyId: party.id // Link to template party
      }));
      setParties(templateParties);
    }
  }, [selectedTemplate]);

  const allTemplates = userTemplates;
  
  const addParty = () => {
    const newId = Math.max(...parties.map(p => p.id)) + 1;
    setParties([...parties, { 
      id: newId, 
      name: '', 
      email: '', 
      phone: '', 
      idType: 'passport', 
      idNumber: '', 
      order: parties.length + 1 
    }]);
  };
  
  const removeParty = (id) => {
    if (parties.length > 1) {
      setParties(parties.filter(p => p.id !== id));
    }
  };
  
  const updateParty = (id, field, value) => {
    setParties(parties.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedDocument(file);

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

            setUploadedDocumentPreview({
              data: pdfData,
              type: file.type,
              thumbnail: thumbnailData
            });
          } catch (error) {
            console.error('Error generating PDF thumbnail:', error);
            toast.error('Failed to process PDF');
            setUploadedDocumentPreview({
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
          setUploadedDocumentPreview({
            data: imageData,
            type: file.type,
            thumbnail: imageData
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSendContract = () => {
    try {
      // Save contract
      const contract = saveContract({
        templateId: selectedTemplate?.id,
        templateName: selectedTemplate?.name,
        name: contractDetails.name,
        reference: contractDetails.reference || `REF-${Date.now()}`,
        tags: contractDetails.tags.split(',').map(t => t.trim()).filter(Boolean),
        notes: contractDetails.notes,
        documentData: uploadedDocumentPreview,
        fileName: uploadedDocument?.name,
        parties: parties,
        settings: settings,
        status: settings.sendNow ? 'pending' : 'draft',
        progress: 0
      });

      // Increment template usage count
      if (selectedTemplate?.id) {
        incrementTemplateUsage(selectedTemplate.id);
      }

      console.log('Contract created:', contract);

      // Show success message
      toast.success('Contract sent successfully!', {
        description: `Contract has been sent to ${parties.length} ${parties.length === 1 ? 'party' : 'parties'}.`
      });

      // Navigate to contracts page
      setTimeout(() => {
        navigate(createPageUrl('Contracts'));
      }, 1000);
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('Failed to send contract', {
        description: 'Please try again.'
      });
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // Step 0: Upload document first, then select template
        if (!uploadedDocument) {
          return (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Your Contract Document</h2>
                <p className="text-slate-500">Start by uploading the contract that needs signatures</p>
              </div>
              <label className="block cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleDocumentUpload}
                />
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-16 text-center hover:border-slate-400 hover:bg-slate-50 transition-all">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-10 h-10 text-slate-700" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-lg">Click to Upload Contract</h3>
                  <p className="text-slate-500 mb-6">
                    Upload the pre-filled contract document that needs signatures
                  </p>
                  <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white">
                    Browse Files
                  </Button>
                  <p className="text-sm text-slate-400 mt-6">Supported: PDF, JPG, PNG • Max size: 25MB</p>
                </div>
              </label>
            </div>
          );
        }

        // After upload: Show template selection with PDF preview
        return (
          <div className="grid grid-cols-[60%_40%] gap-6 h-[calc(100vh-250px)]">
            {/* Left Side - Template Selection (60%) */}
            <div className="space-y-4 overflow-auto pr-2">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Select Template</h3>
                <p className="text-sm text-slate-500 mb-4">Choose a signature template for this document</p>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {allTemplates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`group cursor-pointer transition-all rounded-md border ${
                      selectedTemplate?.id === template.id
                        ? 'border-2 border-slate-900 bg-slate-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm'
                    }`}
                  >
                    {/* Template Thumbnail */}
                    <div className="aspect-[3/4] bg-slate-100 rounded-t-md overflow-hidden relative">
                      {template.filePreview || template.preview ? (
                        <img
                          src={template.filePreview || template.preview}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-slate-300" />
                        </div>
                      )}

                      {/* Selected Indicator */}
                      {selectedTemplate?.id === template.id && (
                        <div className="absolute top-1 right-1">
                          <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Template Info */}
                    <div className="p-2">
                      <h4 className="font-medium text-xs text-slate-900 truncate">{template.name}</h4>
                    </div>
                  </div>
                ))}

                {allTemplates.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm mb-4">No templates available.</p>
                    <Link to={createPageUrl('TemplateBuilder')}>
                      <Button size="sm" className="gap-2 bg-slate-900 hover:bg-slate-800">
                        <Plus className="w-4 h-4" />
                        Create Template
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - A4 PDF Preview (40%) */}
            <div className="bg-slate-100 rounded-xl overflow-auto flex items-start justify-center p-4">
              {uploadedDocumentPreview && (
                <div className="relative" style={{ width: '595px', maxWidth: '100%' }}>
                  {uploadedDocumentPreview.type === 'application/pdf' ? (
                    <div className="relative">
                      <Document
                        file={uploadedDocumentPreview.data}
                        onLoadError={(error) => {
                          console.error('PDF load error:', error);
                          toast.error('Failed to load PDF');
                        }}
                        loading={<div className="text-center p-8 text-slate-500">Loading PDF...</div>}
                      >
                        <Page
                          pageNumber={1}
                          width={595}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          className="shadow-lg"
                        />
                      </Document>

                      {/* Overlay signature field positions from selected template */}
                      {selectedTemplate?.fields?.map((field, index) => {
                        // Get party info for signer type display
                        const party = selectedTemplate?.parties?.find(p => p.id?.toString() === field.role?.toString());
                        const signerType = party?.signerType || 'external';
                        const isInternal = signerType === 'internal';
                        const SignerIcon = isInternal ? Building2 : User;

                        const colors = isInternal ? {
                          border: 'border-emerald-400',
                          bg: 'bg-emerald-100/80',
                          text: 'text-emerald-700',
                          badge: 'bg-emerald-100 text-emerald-700'
                        } : {
                          border: 'border-blue-400',
                          bg: 'bg-blue-100/80',
                          text: 'text-blue-700',
                          badge: 'bg-blue-100 text-blue-700'
                        };

                        return (
                          <div
                            key={field.id}
                            className={`absolute border-2 border-dashed ${colors.border} ${colors.bg} rounded flex items-center justify-center shadow-sm pointer-events-none group`}
                            style={{
                              left: `${(field.x / 595) * 100}%`,
                              top: `${(field.y / 842) * 100}%`,
                              width: `${(field.width / 595) * 100}%`,
                              height: `${(field.height / 842) * 100}%`,
                            }}
                          >
                            {/* Signer Type Badge */}
                            {party && (
                              <div className={`absolute -top-5 left-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${colors.badge}`}>
                                <SignerIcon className="w-2.5 h-2.5" />
                                <span>{party.name}</span>
                              </div>
                            )}
                            <span className={`text-xs font-medium ${colors.text}`}>
                              {field.placeholder || field.type}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={uploadedDocumentPreview.data}
                        alt="Document preview"
                        className="w-full h-auto shadow-lg"
                      />

                      {/* Overlay signature field positions from selected template */}
                      {selectedTemplate?.fields?.map((field, index) => {
                        // Get party info for signer type display
                        const party = selectedTemplate?.parties?.find(p => p.id?.toString() === field.role?.toString());
                        const signerType = party?.signerType || 'external';
                        const isInternal = signerType === 'internal';
                        const SignerIcon = isInternal ? Building2 : User;

                        const colors = isInternal ? {
                          border: 'border-emerald-400',
                          bg: 'bg-emerald-100/80',
                          text: 'text-emerald-700',
                          badge: 'bg-emerald-100 text-emerald-700'
                        } : {
                          border: 'border-blue-400',
                          bg: 'bg-blue-100/80',
                          text: 'text-blue-700',
                          badge: 'bg-blue-100 text-blue-700'
                        };

                        return (
                          <div
                            key={field.id}
                            className={`absolute border-2 border-dashed ${colors.border} ${colors.bg} rounded flex items-center justify-center shadow-sm pointer-events-none group`}
                            style={{
                              left: `${(field.x / 595) * 100}%`,
                              top: `${(field.y / 842) * 100}%`,
                              width: `${(field.width / 595) * 100}%`,
                              height: `${(field.height / 842) * 100}%`,
                            }}
                          >
                            {/* Signer Type Badge */}
                            {party && (
                              <div className={`absolute -top-5 left-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${colors.badge}`}>
                                <SignerIcon className="w-2.5 h-2.5" />
                                <span>{party.name}</span>
                              </div>
                            )}
                            <span className={`text-xs font-medium ${colors.text}`}>
                              {field.placeholder || field.type}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Contract Details */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Contract Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract-name">Contract Name *</Label>
                  <Input 
                    id="contract-name"
                    placeholder="e.g., Sales Agreement - Acme Corp"
                    value={contractDetails.name}
                    onChange={(e) => setContractDetails({ ...contractDetails, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input 
                    id="reference"
                    placeholder="Auto-generated if empty"
                    value={contractDetails.reference}
                    onChange={(e) => setContractDetails({ ...contractDetails, reference: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input 
                    id="tags"
                    placeholder="e.g., urgent, legal-review"
                    value={contractDetails.tags}
                    onChange={(e) => setContractDetails({ ...contractDetails, tags: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Internal Notes</Label>
                  <Input 
                    id="notes"
                    placeholder="Notes visible only to your team"
                    value={contractDetails.notes}
                    onChange={(e) => setContractDetails({ ...contractDetails, notes: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Parties */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">Signing Parties</h3>
                  {selectedTemplate?.parties?.length > 0 ? (
                    <p className="text-sm text-slate-500">
                      Party roles are defined by the template ({selectedTemplate.parties.length} {selectedTemplate.parties.length === 1 ? 'party' : 'parties'})
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500">Add the people who need to sign this contract</p>
                  )}
                </div>
                {!selectedTemplate?.parties?.length && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Import CSV
                    </Button>
                    <Button size="sm" className="gap-2 bg-slate-900 hover:bg-slate-800" onClick={addParty}>
                      <Plus className="w-4 h-4" />
                      Add Party
                    </Button>
                  </div>
                )}
              </div>

              {selectedTemplate?.parties?.length > 0 && (
                <div className="mb-4 p-3 bg-slate-100 border border-slate-300 rounded-lg">
                  <p className="text-sm text-slate-700">
                    <strong>Note:</strong> The number and roles of parties are fixed by the template.
                    You can only edit the signer details (name, email, etc.).
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                {parties.map((party, index) => (
                  <div key={party.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-700">
                            {party.roleName || `Signer ${index + 1}`}
                          </span>
                          {party.required && (
                            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                      </div>
                      {!selectedTemplate?.parties?.length && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-slate-400 hover:text-red-600"
                          onClick={() => removeParty(party.id)}
                          disabled={parties.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input 
                          placeholder="John Smith"
                          value={party.name}
                          onChange={(e) => updateParty(party.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input 
                          type="email"
                          placeholder="john@example.com"
                          value={party.email}
                          onChange={(e) => updateParty(party.id, 'email', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input 
                          type="tel"
                          placeholder="+1 234 567 8900"
                          value={party.phone}
                          onChange={(e) => updateParty(party.id, 'phone', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ID Type</Label>
                        <Select 
                          value={party.idType}
                          onValueChange={(value) => updateParty(party.id, 'idType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="national_id">National ID</SelectItem>
                            <SelectItem value="drivers_license">Driver's License</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>ID Number</Label>
                        <Input 
                          placeholder="ID document number"
                          value={party.idNumber}
                          onChange={(e) => updateParty(party.id, 'idNumber', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Identity Verification */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-slate-700" />
                <h3 className="font-semibold text-slate-900">Identity Verification</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-700">Require Identity Verification</p>
                    <p className="text-sm text-slate-500">Signers must verify their identity before signing</p>
                  </div>
                  <Switch 
                    checked={settings.requireVerification}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireVerification: checked })}
                  />
                </div>
                
                {settings.requireVerification && (
                  <>
                    <RadioGroup 
                      value={settings.verificationType}
                      onValueChange={(value) => setSettings({ ...settings, verificationType: value })}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                        <RadioGroupItem value="basic" id="basic" />
                        <Label htmlFor="basic" className="cursor-pointer">
                          <span className="font-medium">Basic</span>
                          <p className="text-sm text-slate-500">Email + SMS verification</p>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                        <RadioGroupItem value="full" id="full" />
                        <Label htmlFor="full" className="cursor-pointer">
                          <span className="font-medium">Full</span>
                          <p className="text-sm text-slate-500">ID document + facial recognition</p>
                        </Label>
                      </div>
                    </RadioGroup>
                    
                    <div className="space-y-2">
                      <Label>Max Verification Attempts</Label>
                      <Select 
                        value={settings.maxAttempts.toString()}
                        onValueChange={(value) => setSettings({ ...settings, maxAttempts: parseInt(value) })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 attempt</SelectItem>
                          <SelectItem value="2">2 attempts</SelectItem>
                          <SelectItem value="3">3 attempts</SelectItem>
                          <SelectItem value="5">5 attempts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Notifications */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-5 h-5 text-slate-700" />
                <h3 className="font-semibold text-slate-900">Notification Settings</h3>
              </div>
              
              <div className="space-y-4">
                <RadioGroup 
                  value={settings.sendNow ? 'now' : 'scheduled'}
                  onValueChange={(value) => setSettings({ ...settings, sendNow: value === 'now' })}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <RadioGroupItem value="now" id="now" />
                    <Label htmlFor="now" className="cursor-pointer">Send Immediately</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <RadioGroupItem value="scheduled" id="scheduled" />
                    <Label htmlFor="scheduled" className="cursor-pointer">Schedule for Later</Label>
                  </div>
                </RadioGroup>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-700">Send Reminders</p>
                    <p className="text-sm text-slate-500">Automatically remind unsigned parties</p>
                  </div>
                  <Switch 
                    checked={settings.sendReminders}
                    onCheckedChange={(checked) => setSettings({ ...settings, sendReminders: checked })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <Label>Email Notifications</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <Label>SMS Notifications</Label>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Expiration */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-slate-700" />
                <h3 className="font-semibold text-slate-900">Expiration Settings</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expires After (days)</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={settings.expiresIn}
                    onChange={(e) => setSettings({ ...settings, expiresIn: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Warning Before (days)</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={settings.warningDays}
                    onChange={(e) => setSettings({ ...settings, warningDays: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            
            {/* Advanced Options */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-5 h-5 text-slate-700" />
                <h3 className="font-semibold text-slate-900">Advanced Options</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <Label>Allow Decline</Label>
                  <Switch 
                    checked={settings.allowDecline}
                    onCheckedChange={(checked) => setSettings({ ...settings, allowDecline: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <Label>Allow Comments</Label>
                  <Switch 
                    checked={settings.allowComments}
                    onCheckedChange={(checked) => setSettings({ ...settings, allowComments: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <Label>Require Full Scroll</Label>
                  <Switch 
                    checked={settings.requireFullScroll}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireFullScroll: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <Label>Add Watermark</Label>
                  <Switch 
                    checked={settings.addWatermark}
                    onCheckedChange={(checked) => setSettings({ ...settings, addWatermark: checked })}
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Label>Custom Message for Signers</Label>
                <Textarea 
                  placeholder="Add a personalized message that will be included in the signing invitation..."
                  rows={3}
                  value={settings.customMessage}
                  onChange={(e) => setSettings({ ...settings, customMessage: e.target.value })}
                />
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Contract Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-500">Template</span>
                  <span className="font-medium text-slate-900">{selectedTemplate?.name || 'Not selected'}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-500">Contract Name</span>
                  <span className="font-medium text-slate-900">{contractDetails.name || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-500">Signing Parties</span>
                  <span className="font-medium text-slate-900">{parties.length} parties</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-500">Verification</span>
                  <span className="font-medium text-slate-900">
                    {settings.requireVerification ? `${settings.verificationType} verification` : 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500">Expires In</span>
                  <span className="font-medium text-slate-900">{settings.expiresIn} days</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Parties to Sign</h3>
              <div className="space-y-3">
                {parties.map((party, index) => (
                  <div key={party.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">{party.name || 'No name'}</p>
                        <p className="text-sm text-slate-500">{party.email || 'No email'}</p>
                      </div>
                    </div>
                    <span className="text-sm text-slate-400">Order: {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-800">Ready to send</p>
                <p className="text-sm text-emerald-700">
                  Your contract is ready. Click "Send Now" to send signing invitations to all parties.
                </p>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-8xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Dashboard')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold text-slate-900">Create Contract</h1>
                <p className="text-sm text-slate-500">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">Save as Draft</Button>
              {currentStep === steps.length - 1 ? (
                <Button className="gap-2 bg-slate-900 hover:bg-slate-800">
                  <Send className="w-4 h-4" />
                  Send Now
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
      <div className="p-6 lg:p-8 pb-32">
        {renderStepContent()}
      </div>
      
      {/* Footer Navigation - Single Line */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-4 px-6">
        <div className="max-w-8xl mx-auto flex items-center justify-between gap-6">
          {/* Previous Button */}
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
            disabled={currentStep === 0}
            className="min-w-28"
          >
            Previous
          </Button>

          {/* Progress Stepper - Centered */}
          <div className="flex items-center gap-2">
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

          {/* Next/Send Button */}
          {currentStep === steps.length - 1 ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setSettings({ ...settings, sendNow: false });
                  handleSendContract();
                }}
              >
                <Calendar className="w-4 h-4" />
                Schedule
              </Button>
              <Button
                className="gap-2 bg-slate-900 hover:bg-slate-800 min-w-28"
                onClick={() => {
                  setSettings({ ...settings, sendNow: true });
                  handleSendContract();
                }}
              >
                <Send className="w-4 h-4" />
                Send Now
              </Button>
            </div>
          ) : (
            <Button
              className="bg-slate-900 hover:bg-slate-800 min-w-28"
              onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
              disabled={currentStep === 0 && !uploadedDocument}
            >
              Next Step
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}