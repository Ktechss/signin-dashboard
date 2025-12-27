import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import {
  getTemplates,
  getTemplateById,
  createContractFromBlueprint,
  CONTRACT_STATUS_CONFIG,
  getDocumentUrl,
} from '@/utils/templateStorage';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ArrowLeft,
  FileText,
  Users,
  CheckCircle2,
  ChevronRight,
  Building2,
  User,
  ClipboardCheck,
  Mail,
  Search,
  Pen,
  Type,
  Calendar,
  CheckSquare,
  Hash,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { SIGNER_TYPES } from '@/components/templates/SignerCard';
import { FIELD_TYPES } from '@/components/templates/FieldOverlay';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const steps = [
  { id: 'blueprint', title: 'Select Blueprint', description: 'Choose a template' },
  { id: 'signers', title: 'Signer Details', description: 'Enter signer info' },
  { id: 'review', title: 'Review & Create', description: 'Confirm and create' },
];

export default function ContractCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedBlueprintId = searchParams.get('blueprintId');

  const [currentStep, setCurrentStep] = useState(0);
  const [blueprints, setBlueprints] = useState([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [sampleBlueprints, setSampleBlueprints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [contractData, setContractData] = useState({
    name: '',
    reference: '',
    notes: '',
    signerEmails: {},
    signerNames: {},
    fieldValues: {}, // Store values for all blueprint fields
    createdBy: 'Current User', // In real app, get from auth
  });
  const [reviewNumPages, setReviewNumPages] = useState(null);

  // Load blueprints
  useEffect(() => {
    const loadBlueprints = async () => {
      setIsLoading(true);
      try {
        // Get blueprints from API
        const allTemplates = await getTemplates();
        const activeBlueprints = allTemplates.filter(t => t.status === 'active');

        setBlueprints(activeBlueprints);
        setSampleBlueprints([]); // No longer using sample blueprints

        // If preselected blueprint ID, find and select it
        if (preselectedBlueprintId) {
          const blueprint = activeBlueprints.find(b =>
            b.id.toString() === preselectedBlueprintId ||
            b.id === parseInt(preselectedBlueprintId)
          );
          if (blueprint) {
            setSelectedBlueprint(blueprint);
            setContractData(prev => ({
              ...prev,
              name: `${blueprint.name} - New Contract`,
              reference: `CON-${Date.now().toString().slice(-6)}`,
            }));
            setCurrentStep(1); // Skip to signer details
          } else {
            console.warn('Blueprint not found for ID:', preselectedBlueprintId);
          }
        }
      } catch (error) {
        console.error('Error loading blueprints:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBlueprints();
  }, [preselectedBlueprintId]);

  // All blueprints combined
  const allBlueprints = [...blueprints, ...sampleBlueprints];

  // Filter blueprints by search
  const filteredBlueprints = allBlueprints.filter(blueprint =>
    blueprint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blueprint.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectBlueprint = (blueprint) => {
    setSelectedBlueprint(blueprint);
    setContractData(prev => ({
      ...prev,
      name: `${blueprint.name} - New Contract`,
      reference: `CON-${Date.now().toString().slice(-6)}`,
      signerEmails: {},
      signerNames: {},
      fieldValues: {},
    }));
  };

  const handleSignerChange = (signerId, field, value) => {
    setContractData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [signerId]: value,
      },
    }));
  };

  const handleFieldChange = (fieldId, value) => {
    setContractData(prev => ({
      ...prev,
      fieldValues: {
        ...prev.fieldValues,
        [fieldId]: value,
      },
    }));
  };

  // Get fields grouped by signer
  const getFieldsBySigner = (signerId) => {
    return (selectedBlueprint?.fields || []).filter(
      field => field.role?.toString() === signerId?.toString()
    );
  };

  // Render appropriate input for field type
  const renderFieldInput = (field) => {
    const fieldType = FIELD_TYPES[field.type];
    const value = contractData.fieldValues[field.id] || '';

    switch (field.type) {
      case 'signature':
      case 'initials':
        // Signature/initials will be collected during signing, just show info
        return (
          <div className="flex items-center gap-2 text-slate-500 text-sm py-2 px-3 bg-slate-50 rounded-lg">
            <Pen className="w-4 h-4" />
            <span>Will be collected during signing</span>
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={field.id}
              checked={value === true}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <Label htmlFor={field.id} className="text-sm text-slate-600">
              {field.placeholder || 'Check if applicable'}
            </Label>
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="bg-white"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || 'Enter number'}
            className="bg-white"
          />
        );

      case 'email':
        return (
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="email"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || 'email@example.com'}
              className="pl-9 bg-white"
            />
          </div>
        );

      case 'phone':
        return (
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="tel"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || '+971 XX XXX XXXX'}
              className="pl-9 bg-white"
            />
          </div>
        );

      case 'text':
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || 'Enter text'}
            className="bg-white"
          />
        );
    }
  };

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateContract = async () => {
    if (!selectedBlueprint) {
      toast.error('Please select a blueprint');
      return;
    }

    // Validate signer details
    const missingSigners = (selectedBlueprint.parties || []).filter(party => {
      const name = contractData.signerNames[party.id];
      const email = contractData.signerEmails[party.id];
      return !name || !email;
    });

    if (missingSigners.length > 0) {
      toast.error('Please fill in all signer details', {
        description: `Missing details for: ${missingSigners.map(s => s.name).join(', ')}`,
      });
      return;
    }

    // Validate required fields (excluding signature/initials which are collected during signing)
    const missingFields = (selectedBlueprint.fields || []).filter(field => {
      if (field.type === 'signature' || field.type === 'initials') return false;
      if (!field.required) return false;
      const value = contractData.fieldValues[field.id];
      return value === undefined || value === '' || value === null;
    });

    if (missingFields.length > 0) {
      const fieldTypeConfig = FIELD_TYPES[missingFields[0].type];
      toast.error('Please fill in all required fields', {
        description: `Missing: ${missingFields.map(f => f.placeholder || fieldTypeConfig?.label || f.type).join(', ')}`,
      });
      return;
    }

    setIsCreating(true);
    try {
      const contract = await createContractFromBlueprint(selectedBlueprint, contractData);
      toast.success('Contract created successfully!', {
        description: `Contract "${contract.name}" is ready.`,
      });

      // Navigate to contract detail
      setTimeout(() => {
        navigate(createPageUrl(`ContractDetail?id=${contract.id}`));
      }, 500);
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('Failed to create contract', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="max-w-5xl mx-auto">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search blueprints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Blueprint Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBlueprints.map((blueprint) => {
                const isSelected = selectedBlueprint?.id === blueprint.id;
                return (
                  <div
                    key={blueprint.id}
                    onClick={() => handleSelectBlueprint(blueprint)}
                    className={cn(
                      'p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md',
                      isSelected
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    {/* Preview */}
                    <div className="h-32 bg-slate-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                      {blueprint.thumbnailUrl || blueprint.preview || blueprint.filePreview ? (
                        <img
                          src={blueprint.thumbnailUrl ? getDocumentUrl(blueprint.thumbnailUrl) : (blueprint.preview || blueprint.filePreview)}
                          alt={blueprint.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-12 h-12 text-slate-300" />
                      )}
                    </div>

                    {/* Info */}
                    <h3 className="font-medium text-slate-900 mb-1 truncate">{blueprint.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{blueprint.description}</p>

                    {/* Signers count */}
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                      <Users className="w-3.5 h-3.5" />
                      <span>{blueprint.parties?.length || 0} signers</span>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1 mt-3 text-xs text-slate-900 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Selected
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredBlueprints.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No blueprints found</p>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="max-w-3xl mx-auto">
            {/* Contract Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <h3 className="font-semibold text-slate-900 mb-4">Contract Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contract Name</Label>
                  <Input
                    value={contractData.name}
                    onChange={(e) => setContractData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter contract name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reference ID</Label>
                  <Input
                    value={contractData.reference}
                    onChange={(e) => setContractData(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="e.g., CON-2024-001"
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={contractData.notes}
                  onChange={(e) => setContractData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes for this contract..."
                  rows={3}
                />
              </div>
            </div>

            {/* Signers */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Signer Details</h3>
              <p className="text-sm text-slate-500 mb-6">
                Enter the details for each signer defined in the blueprint.
              </p>

              <div className="space-y-6">
                {(selectedBlueprint?.parties || []).map((party, index) => {
                  const signerType = SIGNER_TYPES[party.signerType] || SIGNER_TYPES.external;
                  const SignerIcon = signerType.icon;
                  const signerFields = getFieldsBySigner(party.id);

                  return (
                    <div
                      key={party.id}
                      className={cn(
                        'p-5 rounded-xl border-2',
                        signerType.borderColor,
                        signerType.bgColor
                      )}
                    >
                      {/* Signer Header */}
                      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200/50">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          'bg-white shadow-sm'
                        )}>
                          <SignerIcon className={cn('w-5 h-5', signerType.color)} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{party.name}</p>
                          <p className={cn('text-xs', signerType.color)}>{signerType.label}</p>
                        </div>
                        <span className="text-xs bg-white/80 px-2 py-1 rounded-full text-slate-500">
                          {signerFields.length} fields
                        </span>
                      </div>

                      {/* Basic Signer Info */}
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-slate-700">Full Name *</Label>
                          <Input
                            value={contractData.signerNames[party.id] || ''}
                            onChange={(e) => handleSignerChange(party.id, 'signerNames', e.target.value)}
                            placeholder={`Enter ${party.name}'s full name`}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-slate-700">Email Address *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              type="email"
                              value={contractData.signerEmails[party.id] || ''}
                              onChange={(e) => handleSignerChange(party.id, 'signerEmails', e.target.value)}
                              placeholder="email@example.com"
                              className="pl-9 bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Blueprint Fields for this Signer */}
                      {signerFields.length > 0 && (
                        <div className="space-y-4">
                          <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                            Fields to complete
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            {signerFields.map((field) => {
                              const fieldTypeConfig = FIELD_TYPES[field.type];
                              const FieldIcon = fieldTypeConfig?.icon || Type;

                              return (
                                <div key={field.id} className="space-y-2">
                                  <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                                    <FieldIcon className="w-3 h-3 text-slate-400" />
                                    {field.label || field.placeholder || fieldTypeConfig?.label || field.type}
                                    {field.required && <span className="text-red-500">*</span>}
                                  </Label>
                                  {renderFieldInput(field)}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {(!selectedBlueprint?.parties || selectedBlueprint.parties.length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No signers defined in this blueprint</p>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        // Helper to get display value for a field
        const getFieldDisplayValue = (field) => {
          const value = contractData.fieldValues[field.id];
          if (field.type === 'checkbox') {
            return value ? '✓' : '☐';
          } else if (field.type === 'signature') {
            const party = selectedBlueprint?.parties?.find(p => p.id?.toString() === field.role?.toString());
            const signerName = contractData.signerNames[party?.id] || party?.name || '';
            return signerName ? `[Signature: ${signerName}]` : '[Signature]';
          } else if (field.type === 'initials') {
            const party = selectedBlueprint?.parties?.find(p => p.id?.toString() === field.role?.toString());
            const signerName = contractData.signerNames[party?.id] || party?.name || '';
            const initials = signerName.split(' ').map(n => n[0]).join('').toUpperCase();
            return initials ? `[${initials}]` : '[Initials]';
          } else if (field.type === 'date' && value) {
            return new Date(value).toLocaleDateString();
          }
          return value || '';
        };

        // Get signer info for a field
        const getSignerForField = (field) => {
          const party = selectedBlueprint?.parties?.find(p => p.id?.toString() === field.role?.toString());
          if (!party) return null;
          const signerType = SIGNER_TYPES[party.signerType] || SIGNER_TYPES.external;
          return { party, signerType };
        };

        return (
          <div className="h-full flex gap-6">
            {/* Document Preview with Field Values */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                <h3 className="font-semibold text-slate-900">Document Preview with Values</h3>
                <span className="text-xs text-slate-500">{selectedBlueprint?.fields?.length || 0} fields</span>
              </div>
              <div className="flex-1 p-4 bg-slate-100 overflow-y-auto">
                  {(selectedBlueprint?.documentUrl || selectedBlueprint?.documentData?.data) ? (
                    (selectedBlueprint.documentType === 'application/pdf' || selectedBlueprint?.documentData?.type === 'application/pdf') ? (
                      <Document
                        file={selectedBlueprint.documentUrl ? getDocumentUrl(selectedBlueprint.documentUrl) : selectedBlueprint.documentData.data}
                        onLoadSuccess={({ numPages }) => setReviewNumPages(numPages)}
                        onLoadError={(error) => console.error('PDF load error:', error)}
                        loading={<div className="text-center py-8 text-slate-500">Loading PDF...</div>}
                      >
                        {Array.from(new Array(reviewNumPages || 1), (_, index) => (
                          <div key={index} className="relative mb-4 mx-auto" style={{ width: 550 }}>
                            <Page
                              pageNumber={index + 1}
                              width={550}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                              className="shadow-lg rounded-lg"
                            />
                            {/* Field Values as Plain Text */}
                            {(selectedBlueprint?.fields || [])
                              .filter(f => (f.page || 1) === index + 1)
                              .map((field) => {
                                const displayValue = getFieldDisplayValue(field);
                                const isSignature = field.type === 'signature' || field.type === 'initials';
                                const fieldLabel = field.label || field.placeholder || FIELD_TYPES[field.type]?.label || field.type;
                                const hasValue = displayValue && displayValue !== '';

                                return (
                                  <div
                                    key={field.id}
                                    className="absolute flex items-center"
                                    style={{
                                      left: `${(field.x / 595) * 100}%`,
                                      top: `${(field.y / 842) * 100}%`,
                                    }}
                                  >
                                    <span className={cn(
                                      'text-xs whitespace-nowrap',
                                      hasValue
                                        ? isSignature ? 'italic text-slate-600' : 'text-slate-900'
                                        : 'text-slate-400'
                                    )}>
                                      {hasValue ? displayValue : fieldLabel}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        ))}
                      </Document>
                    ) : (
                      <div className="relative mx-auto" style={{ width: 550 }}>
                        <img
                          src={selectedBlueprint.documentUrl ? getDocumentUrl(selectedBlueprint.documentUrl) : selectedBlueprint.documentData?.data}
                          alt="Document"
                          className="w-full rounded-lg shadow-lg"
                        />
                        {/* Field Values as Plain Text for Image */}
                        {(selectedBlueprint?.fields || []).map((field) => {
                          const displayValue = getFieldDisplayValue(field);
                          const isSignature = field.type === 'signature' || field.type === 'initials';
                          const fieldLabel = field.label || field.placeholder || FIELD_TYPES[field.type]?.label || field.type;
                          const hasValue = displayValue && displayValue !== '';

                          return (
                            <div
                              key={field.id}
                              className="absolute flex items-center"
                              style={{
                                left: `${(field.x / 595) * 100}%`,
                                top: `${(field.y / 842) * 100}%`,
                              }}
                            >
                              <span className={cn(
                                'text-xs whitespace-nowrap',
                                hasValue
                                  ? isSignature ? 'italic text-slate-600' : 'text-slate-900'
                                  : 'text-slate-400'
                              )}>
                                {hasValue ? displayValue : fieldLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No preview available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contract Summary - Simplified */}
            <div className="w-80 shrink-0 space-y-4 overflow-y-auto">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-900 mb-4">Contract Summary</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Contract Name</span>
                      <span className="text-sm font-medium text-slate-900 text-right max-w-[150px] truncate">{contractData.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Reference</span>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded">{contractData.reference}</code>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Blueprint</span>
                      <span className="text-sm font-medium text-slate-900">{selectedBlueprint?.name}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-slate-500">Total Signers</span>
                      <span className="text-sm font-medium text-slate-900">
                        {selectedBlueprint?.parties?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signers Summary */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-900 mb-4">Signers</h3>
                  <div className="space-y-3">
                    {(selectedBlueprint?.parties || []).map((party) => {
                      const signerType = SIGNER_TYPES[party.signerType] || SIGNER_TYPES.external;
                      const SignerIcon = signerType.icon;
                      const name = contractData.signerNames[party.id] || party.name;
                      const email = contractData.signerEmails[party.id] || 'Not provided';
                      const signerFields = getFieldsBySigner(party.id);

                      return (
                        <div key={party.id} className={cn(
                          'p-3 rounded-lg border',
                          signerType.borderColor,
                          signerType.bgColor
                        )}>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center bg-white'
                            )}>
                              <SignerIcon className={cn('w-4 h-4', signerType.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-slate-900 truncate">{name}</p>
                              <p className="text-xs text-slate-500 truncate">{email}</p>
                            </div>
                            <span className="text-[10px] bg-white/80 px-1.5 py-0.5 rounded text-slate-500 shrink-0">
                              {signerFields.length} fields
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Workflow Info */}
                {selectedBlueprint?.settings && (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h4 className="font-semibold text-slate-900 mb-4">Workflow</h4>
                    <div className="space-y-2 text-sm">
                      {/* Approval */}
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Approval</span>
                        <span className="text-slate-700">
                          {selectedBlueprint.settings.approval?.enabled
                            ? `${selectedBlueprint.settings.approval.requiredApprovers || 1} level(s)`
                            : 'Not required'}
                        </span>
                      </div>

                      {/* Delivery */}
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Delivery</span>
                        <span className="text-slate-700 capitalize">
                          {selectedBlueprint.settings.delivery?.mode || 'Manual'}
                        </span>
                      </div>

                      {/* Signing Order */}
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Signing Order</span>
                        <span className="text-slate-700 capitalize">
                          {selectedBlueprint.settings.signingOrder?.order || 'Sequential'}
                        </span>
                      </div>

                      {/* Reminder */}
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Reminders</span>
                        <span className="text-slate-700">
                          {selectedBlueprint.settings.reminder?.enabled
                            ? `Every ${selectedBlueprint.settings.reminder.reminderIntervalDays || 2} days`
                            : 'Disabled'}
                        </span>
                      </div>

                      {/* Expiration */}
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Expiration</span>
                        <span className="text-slate-700">
                          {selectedBlueprint.settings.expiration?.enabled
                            ? `${selectedBlueprint.settings.expiration.expiresAfterDays || 30} days`
                            : 'No expiry'}
                        </span>
                      </div>

                      {/* Revoke */}
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Revocation</span>
                        <span className="text-slate-700">
                          {selectedBlueprint.settings.revoke?.allowRevocation ? 'Allowed' : 'Not allowed'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading blueprints...</p>
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
              <Link to={createPageUrl('Contracts')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold text-slate-900">Create Contract</h1>
                <p className="text-sm text-slate-500">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>

            {/* Center: Progress Stepper */}
            <div className="flex items-center gap-2 flex-1 justify-center">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => {
                      if (index === 0 || selectedBlueprint) {
                        setCurrentStep(index);
                      }
                    }}
                    disabled={index > 0 && !selectedBlueprint}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all',
                      index === currentStep
                        ? 'bg-slate-900 text-white'
                        : index < currentStep
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-slate-100 text-slate-500',
                      index > 0 && !selectedBlueprint && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span className="text-xs font-medium">{index + 1}</span>
                    <span className="text-xs hidden md:inline">{step.title}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      'h-0.5 w-8',
                      index < currentStep ? 'bg-slate-700' : 'bg-slate-200'
                    )} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
                  Back
                </Button>
              )}
              {currentStep === steps.length - 1 ? (
                <Button
                  className="gap-2 bg-slate-900 hover:bg-slate-800"
                  onClick={handleCreateContract}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Create Contract
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  className="bg-slate-900 hover:bg-slate-800"
                  onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
                  disabled={currentStep === 0 && !selectedBlueprint}
                >
                  Next Step
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto py-6 px-6">
        {renderStepContent()}
      </div>
    </div>
  );
}
