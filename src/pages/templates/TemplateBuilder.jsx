import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { saveTemplate, getTemplateById, updateTemplate, getDocumentUrl } from '@/utils/templateStorage';
import { useAuth } from '@/pages/index';
import { Document, Page, pdfjs } from 'react-pdf';
import SaveVersionDialog from '@/components/templates/SaveVersionDialog';
import LatexEditor, { extractPlaceholders, AVAILABLE_PLACEHOLDERS, convertLatexToHtml } from '@/components/templates/LatexEditor';
import { getDefaultValidation } from '@/components/templates/FieldOverlay';
import PolicyEditor, { hasPolicySection, extractPolicySection } from '@/components/templates/PolicyEditor';
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
  GripVertical,
  Code,
  FileUp,
  Shield,
  Send,
  Eye,
  Lock,
  AlertTriangle,
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

/**
 * Convert LaTeX placeholders to field overlay objects
 * Maps placeholder IDs to appropriate field types and signer roles
 * Uses actual positions from PDF generation when available
 */
const convertPlaceholdersToFields = (latexContent, parties, placeholderPositions = {}) => {
  const fields = [];
  const extractedPlaceholders = extractPlaceholders(latexContent);

  // Find the placeholder in AVAILABLE_PLACEHOLDERS to determine category
  const getPlaceholderCategory = (placeholderId) => {
    for (const [category, data] of Object.entries(AVAILABLE_PLACEHOLDERS)) {
      const found = data.fields.find(f => f.id === placeholderId);
      if (found) {
        return category;
      }
    }
    return 'custom';
  };

  // Map placeholder ID to field type
  const getFieldType = (placeholderId) => {
    if (placeholderId.includes('email')) return 'email';
    if (placeholderId.includes('phone')) return 'phone';
    if (placeholderId.includes('date')) return 'date';
    if (placeholderId.includes('number') || placeholderId.includes('value') || placeholderId.includes('id')) return 'text';
    return 'text';
  };

  // Get label from placeholder ID
  const getLabel = (placeholderId) => {
    // Search in AVAILABLE_PLACEHOLDERS for a matching label
    for (const category of Object.values(AVAILABLE_PLACEHOLDERS)) {
      const found = category.fields.find(f => f.id === placeholderId);
      if (found) {
        return found.label;
      }
    }
    // Fallback: convert snake_case to Title Case
    return placeholderId
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Map category to signer role
  const getCategoryRole = (category, parties) => {
    // Find establishment signer (role 1)
    const establishmentParty = parties.find(p => p.signerType === 'establishment');
    // Find first external signer (role 2+)
    const externalParty = parties.find(p => p.signerType === 'external');

    switch (category) {
      case 'establishment':
        return establishmentParty?.id.toString() || '1';
      case 'signer':
        return externalParty?.id.toString() || '2';
      case 'contract':
        return establishmentParty?.id.toString() || '1'; // Contract fields usually filled by establishment
      case 'custom':
      default:
        return establishmentParty?.id.toString() || '1';
    }
  };

  // Default field dimensions based on type (used as minimum/fallback)
  const getFieldDimensions = (fieldType, detectedWidth, detectedHeight) => {
    const minDimensions = {
      text: { width: 100, height: 16 },
      email: { width: 120, height: 16 },
      phone: { width: 100, height: 16 },
      date: { width: 80, height: 16 },
      number: { width: 60, height: 16 },
    };
    const min = minDimensions[fieldType] || { width: 100, height: 16 };

    // Use detected dimensions but ensure minimum size
    return {
      width: Math.max(detectedWidth || min.width, min.width),
      height: Math.max(detectedHeight || min.height, min.height),
    };
  };

  extractedPlaceholders.forEach((placeholderId, index) => {
    const category = getPlaceholderCategory(placeholderId);
    const fieldType = getFieldType(placeholderId);
    const role = getCategoryRole(category, parties);
    const label = getLabel(placeholderId);

    // Get position from PDF generation if available
    const position = placeholderPositions[placeholderId];
    const { width, height } = getFieldDimensions(
      fieldType,
      position?.width,
      position?.height
    );

    // Use actual position from PDF or fallback to staggered positions
    let xPos, yPos, pageNum;
    if (position) {
      xPos = position.x;
      yPos = position.y;
      pageNum = position.page || 1;
    } else {
      // Fallback: stagger positions by category
      const xPositions = { establishment: 50, signer: 350, contract: 50, custom: 200 };
      xPos = xPositions[category] || 100;
      yPos = 100 + (index * 30);
      pageNum = 1;
    }

    fields.push({
      id: Date.now() + index,
      type: fieldType,
      x: xPos,
      y: yPos,
      width,
      height,
      role,
      page: pageNum,
      label,
      placeholder: `{{${placeholderId}}}`,
      placeholderId, // Store original placeholder ID for mapping
      validation: getDefaultValidation(fieldType),
    });
  });

  return fields;
};

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
  const { user, isPlatformAdmin, selectedClient } = useAuth();

  // Check if user is super admin (can create/edit blueprints)
  // isPlatformAdmin is true when user exists and has no clientId
  const isSuperAdmin = isPlatformAdmin === true || user?.isRootUser === true;

  // Read params from URL
  const templateId = searchParams.get('id');
  const visibilityParam = searchParams.get('visibility') || 'public';
  const clientIdParam = searchParams.get('clientId');
  const importMode = searchParams.get('import') === 'true'; // Client importing a blueprint

  // Check if we're in edit mode
  const isEditMode = !!templateId && !importMode;
  const isImportMode = !!templateId && importMode;

  // Redirect non-super-admins trying to create new blueprints
  if (!isSuperAdmin && !templateId) {
    return <Navigate to={createPageUrl('Templates')} replace />;
  }

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
  const [documentSourceType, setDocumentSourceType] = useState('upload'); // 'upload' or 'latex'
  const [latexContent, setLatexContent] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const latexEditorRef = useRef(null);
  const [templateFields, setTemplateFields] = useState([]);
  const [templateSettings, setTemplateSettings] = useState(DEFAULT_BLUEPRINT_SETTINGS);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [existingTemplate, setExistingTemplate] = useState(null);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingSaveAction, setPendingSaveAction] = useState(null); // 'activate' or 'draft'
  const [importDocNumPages, setImportDocNumPages] = useState(1); // Track PDF pages for import mode
  const [importCurrentPage, setImportCurrentPage] = useState(1); // Current page in import mode
  const importPdfContainerRef = useRef(null); // Ref for PDF scroll container
  const importPageRefs = useRef([]); // Refs for each page

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
              // Initialize import doc page count
              setImportDocNumPages(template.numPages || 1);
            } else if (template.documentData) {
              // Fallback to inline documentData if present
              setUploadedPreview(template.documentData);
              setImportDocNumPages(template.documentData?.numPages || template.numPages || 1);
            }

            setTemplateFields(template.fields || []);
            setParties(template.parties || []);
            setTemplateSettings(template.settings || DEFAULT_BLUEPRINT_SETTINGS);

            // Load LaTeX content if present
            if (template.latexContent) {
              setDocumentSourceType('latex');
              setLatexContent(template.latexContent);
            }

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

  // Handle scroll to update current page indicator in import mode
  useEffect(() => {
    if (!isImportMode || !importPdfContainerRef.current) return;

    const container = importPdfContainerRef.current;
    const handleScroll = () => {
      const pages = importPageRefs.current;
      if (!pages.length) return;

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let currentPage = 1;
      for (let i = 0; i < pages.length; i++) {
        if (pages[i]) {
          const pageRect = pages[i].getBoundingClientRect();
          if (pageRect.top <= containerCenter && pageRect.bottom >= containerCenter) {
            currentPage = i + 1;
            break;
          }
          if (pageRect.top > containerCenter) {
            currentPage = Math.max(1, i);
            break;
          }
          currentPage = i + 1;
        }
      }
      setImportCurrentPage(currentPage);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isImportMode, importDocNumPages]);

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

  // Handle import mode - Submit for approval (with policy changes)
  const handleSubmitForApproval = async () => {
    if (!existingTemplate) return;

    setIsSaving(true);
    try {
      // Extract policy section to store separately for review
      const { policy } = extractPolicySection(latexContent);

      const templatePayload = {
        name: templateData.name || `${existingTemplate.name} (${selectedClient?.name || 'Custom'})`,
        description: existingTemplate.description,
        tags: existingTemplate.tags || [],
        status: 'pending_policy_approval', // Special status for policy approval
        fileName: existingTemplate.fileName,
        documentType: existingTemplate.documentType,
        filePreview: existingTemplate.filePreview || existingTemplate.thumbnailUrl,
        preview: existingTemplate.preview || existingTemplate.thumbnailUrl,
        documentUrl: existingTemplate.documentUrl,
        thumbnailUrl: existingTemplate.thumbnailUrl,
        numPages: existingTemplate.numPages || 1,
        fields: existingTemplate.fields || [],
        parties: existingTemplate.parties || [],
        settings: existingTemplate.settings || {},
        visibility: 'org-specific',
        assignedClient: selectedClient,
        sourceTemplateId: existingTemplate.id,
        documentSourceType: existingTemplate.documentSourceType,
        latexContent: latexContent, // Updated with client's policy
        placeholders: existingTemplate.placeholders,
        // Policy approval metadata
        policyApproval: {
          status: 'pending',
          submittedAt: new Date().toISOString(),
          submittedBy: user?.email || 'Unknown',
          clientPolicyContent: policy,
          originalPolicyContent: extractPolicySection(existingTemplate.latexContent || '').policy,
        },
      };

      const template = await saveTemplate(templatePayload);
      toast.success('Submitted for Approval!', {
        description: 'Your policy changes will be reviewed by ICP. You\'ll be notified once approved.',
      });

      setTimeout(() => {
        navigate(createPageUrl('Templates'));
      }, 1000);
    } catch (error) {
      console.error('Error submitting for approval:', error);
      toast.error('Failed to submit', {
        description: 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle import mode - Import without policy changes
  const handleImportWithoutChanges = async () => {
    if (!existingTemplate) return;

    setIsSaving(true);
    try {
      const templatePayload = {
        name: templateData.name || `${existingTemplate.name} (${selectedClient?.name || 'Custom'})`,
        description: existingTemplate.description,
        tags: existingTemplate.tags || [],
        status: 'active', // No approval needed if no policy changes
        fileName: existingTemplate.fileName,
        documentType: existingTemplate.documentType,
        filePreview: existingTemplate.filePreview || existingTemplate.thumbnailUrl,
        preview: existingTemplate.preview || existingTemplate.thumbnailUrl,
        documentUrl: existingTemplate.documentUrl,
        thumbnailUrl: existingTemplate.thumbnailUrl,
        numPages: existingTemplate.numPages || 1,
        fields: existingTemplate.fields || [],
        parties: existingTemplate.parties || [],
        settings: existingTemplate.settings || {},
        visibility: 'org-specific',
        assignedClient: selectedClient,
        sourceTemplateId: existingTemplate.id,
        documentSourceType: existingTemplate.documentSourceType,
        latexContent: existingTemplate.latexContent,
        placeholders: existingTemplate.placeholders,
      };

      const template = await saveTemplate(templatePayload);
      toast.success('Blueprint Imported!', {
        description: `"${template.name}" is now available in your blueprints.`,
      });

      setTimeout(() => {
        navigate(createPageUrl('Templates'));
      }, 1000);
    } catch (error) {
      console.error('Error importing blueprint:', error);
      toast.error('Failed to import', {
        description: 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

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
        fileName: uploadedFile?.name || existingTemplate?.fileName || (documentSourceType === 'latex' ? 'latex-document.pdf' : undefined),
        documentType: uploadedPreview?.type || existingTemplate?.documentType || (documentSourceType === 'latex' ? 'application/pdf' : undefined),
        filePreview: uploadedPreview?.thumbnail || uploadedPreview?.data || uploadedPreview,
        preview: uploadedPreview?.thumbnail || uploadedPreview?.data || uploadedPreview,
        // Only include documentData if it's new base64 data, not a URL
        documentData: hasNewDocument ? uploadedPreview : undefined,
        numPages: uploadedPreview?.numPages || existingTemplate?.numPages || 1,
        fields: templateFields,
        parties: parties,
        settings: templateSettings,
        visibility: isImportMode ? 'org-specific' : editVisibility, // Imported blueprints are org-specific
        assignedClient: isImportMode ? selectedClient : assignedClient, // Associate with client when importing
        currentStep: isActivate ? undefined : currentStep,
        lastModified: 'Just now',
        // Track the source blueprint when importing
        sourceTemplateId: isImportMode ? existingTemplate?.id : undefined,
        // LaTeX content if using LaTeX editor
        documentSourceType: documentSourceType,
        latexContent: documentSourceType === 'latex' ? latexContent : undefined,
        // Extract and store placeholders from LaTeX content
        placeholders: documentSourceType === 'latex' ? extractPlaceholders(latexContent) : undefined,
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
      } else if (isImportMode && existingTemplate) {
        // Import mode: Create a NEW blueprint copy for the client
        template = await saveTemplate(templatePayload);
        toast.success('Blueprint imported successfully!', {
          description: `"${template.name}" has been added to your organization's blueprints.`
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
        if (isImportMode) {
          // Clients go back to Templates page after importing
          navigate(createPageUrl('Templates'));
        } else if (editVisibility && editVisibility !== 'public') {
          // Super admin editing org-specific goes to gallery
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
    // Special rendering for Import Mode - Client can only edit policy section
    if (isImportMode && existingTemplate) {
      const hasPolicy = existingTemplate.documentSourceType === 'latex' &&
                       existingTemplate.latexContent &&
                       hasPolicySection(existingTemplate.latexContent);

      // Check if policy has been modified from original
      const originalPolicy = extractPolicySection(existingTemplate.latexContent || '').policy?.trim() || '';
      const currentPolicy = extractPolicySection(latexContent || '').policy?.trim() || '';
      const hasPolicyChanges = hasPolicy && originalPolicy !== currentPolicy;

      return (
        <div className="h-full flex">
          {/* Left: Document Preview (Read-only) - Fixed height PDF Viewer */}
          <div className="flex-1 bg-slate-100/50 p-6 flex flex-col items-center">
            {/* PDF Viewer Container - Fixed height with internal scroll */}
            <div className="relative w-full max-w-[620px] h-[calc(100vh-180px)]">
              {/* Scrollable PDF Container */}
              <div
                ref={importPdfContainerRef}
                className="h-full overflow-auto rounded-xl"
                style={{ scrollbarGutter: 'stable' }}
              >
                <div className="flex flex-col items-center py-4">
                  {existingTemplate.documentUrl ? (
                    // PDF document - render all pages scrollable
                    <Document
                      file={getDocumentUrl(existingTemplate.documentUrl)}
                      loading={<div className="p-8 text-center text-slate-500">Loading document...</div>}
                      onLoadSuccess={({ numPages }) => {
                        setImportDocNumPages(numPages);
                        setImportCurrentPage(1);
                        importPageRefs.current = [];
                      }}
                    >
                      {Array.from({ length: importDocNumPages }, (_, index) => (
                        <div
                          key={index}
                          ref={el => importPageRefs.current[index] = el}
                          className="bg-white rounded-lg shadow-lg overflow-hidden mb-4"
                          style={{ width: 565 }}
                        >
                          <Page
                            pageNumber={index + 1}
                            width={565}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                        </div>
                      ))}
                    </Document>
                ) : existingTemplate.latexContent ? (
                  // Fallback: LaTeX content as single page preview (when no PDF available)
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ width: 565 }}>
                    <div className="relative">
                      <div className="absolute top-2 right-2 bg-slate-900/70 text-white text-xs px-2 py-1 rounded z-10">
                        Preview
                      </div>
                      <div
                        className="p-12"
                        style={{
                          fontFamily: "'Times New Roman', Times, serif",
                          fontSize: 12,
                          lineHeight: 1.6,
                          minHeight: 842,
                        }}
                        dangerouslySetInnerHTML={{ __html: convertLatexToHtml(latexContent) }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden p-12 text-center text-slate-500" style={{ width: 565 }}>
                    <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No document preview available</p>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Policy Editor + Actions */}
          <div className="w-[420px] bg-white border-l border-slate-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Customize Blueprint</h2>
              <p className="text-sm text-slate-500 mt-1">
                {hasPolicy
                  ? (hasPolicyChanges
                      ? 'You have made policy changes that require approval'
                      : 'Edit the policy section below or import as-is')
                  : 'This blueprint has no editable policy section'}
              </p>
            </div>

            {/* Policy Editor */}
            <div className="flex-1 overflow-auto p-5">
              {hasPolicy ? (
                <>
                  {hasPolicyChanges && (
                    <div className="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <p className="text-sm text-purple-700">
                        Policy changes detected - approval required
                      </p>
                    </div>
                  )}
                  <PolicyEditor
                    latexContent={latexContent}
                    onChange={setLatexContent}
                    readOnly={false}
                    showPreview={true}
                  />
                </>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                  <h3 className="font-medium text-amber-900 mb-1">No Editable Section</h3>
                  <p className="text-sm text-amber-700">
                    This blueprint doesn't have a customizable policy section.
                    You can import it as-is or contact your administrator.
                  </p>
                </div>
              )}
            </div>

            {/* Blueprint Name */}
            <div className="p-5 border-t border-slate-100 bg-slate-50">
              <Label className="text-xs text-slate-500 mb-2 block">Blueprint Name</Label>
              <Input
                value={templateData.name}
                onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                placeholder="Enter a name for your copy"
              />
            </div>

            {/* Action Buttons */}
            <div className="p-5 border-t border-slate-200 bg-white space-y-3">
              {hasPolicyChanges ? (
                <>
                  <Button
                    className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                    onClick={handleSubmitForApproval}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Submit for Approval
                  </Button>
                  <p className="text-xs text-slate-500 text-center">
                    Your policy changes will be reviewed by ICP before activation
                  </p>
                </>
              ) : (
                <Button
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleImportWithoutChanges}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Import Blueprint
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 0:
        // Full-screen LaTeX Editor Mode with built-in split view
        if (documentSourceType === 'latex' && isSuperAdmin) {
          return (
            <div className="h-[calc(100vh-180px)] flex flex-col">
              {/* Top Bar with Blueprint Info and Mode Toggle */}
              <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="latex-name" className="text-sm text-slate-600">Name:</Label>
                    <Input
                      id="latex-name"
                      placeholder="Blueprint Name"
                      value={templateData.name}
                      onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                      className="w-64 h-8"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setDocumentSourceType('upload')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-slate-600 hover:text-slate-900"
                    >
                      <FileUp className="w-4 h-4" />
                      Upload
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-white text-slate-900 shadow-sm"
                    >
                      <Code className="w-4 h-4" />
                      LaTeX Editor
                    </button>
                  </div>
                </div>
              </div>

              {/* LaTeX Editor with built-in Split View */}
              <div className="flex-1 overflow-hidden">
                <LatexEditor
                  ref={latexEditorRef}
                  value={latexContent}
                  onChange={setLatexContent}
                  onPdfGenerated={(pdfData) => {
                    setUploadedPreview(pdfData);
                    setUploadedFile({ name: 'latex-document.pdf', size: 0 });
                  }}
                  fullScreen={true}
                />
              </div>
            </div>
          );
        }

        // Standard Upload Mode
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

                {/* Document Source Section */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Document Source</h3>
                    {/* Only show LaTeX option for super admins */}
                    {isSuperAdmin && (
                      <div className="flex items-center bg-slate-100 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => setDocumentSourceType('upload')}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            documentSourceType === 'upload'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <FileUp className="w-4 h-4" />
                          Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setDocumentSourceType('latex')}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-slate-600 hover:text-slate-900"
                        >
                          <Code className="w-4 h-4" />
                          LaTeX Editor
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Upload Mode Content */}
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
              <Link to={isImportMode ? createPageUrl('Templates') : (editVisibility && editVisibility !== 'public' ? '/BlueprintGallery' : createPageUrl('Templates'))}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold text-slate-900">
                    {isImportMode ? 'Import Blueprint' : isEditMode ? 'Edit Blueprint' : 'Create Blueprint'}
                  </h1>
                  {/* Import Mode Badge */}
                  {isImportMode ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Policy Customization
                    </span>
                  ) : (
                    /* Visibility Badge */
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
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  {isImportMode
                    ? `Importing from: ${existingTemplate?.name || 'Blueprint'}`
                    : `Step ${currentStep + 1} of ${steps.length}`}
                </p>
              </div>
            </div>

            {/* Center: Progress Stepper - Hidden in Import Mode */}
            {!isImportMode && (
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
            )}

            {/* Spacer for import mode to push content right */}
            {isImportMode && <div className="flex-1" />}

            {/* Right: Action buttons - Hidden in Import Mode (has own buttons) */}
            {!isImportMode && (
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
                    disabled={isGeneratingPdf}
                    onClick={async () => {
                      // If on step 0 with LaTeX mode and no PDF generated yet, generate PDF first
                      if (currentStep === 0 && documentSourceType === 'latex' && !uploadedPreview && latexEditorRef.current) {
                        setIsGeneratingPdf(true);
                        try {
                          const pdfData = await latexEditorRef.current.generatePdf();
                          if (pdfData) {
                            setUploadedPreview(pdfData);
                            setUploadedFile({ name: 'latex-document.pdf', size: 0 });

                            // Auto-generate field overlays from placeholders
                            if (latexContent) {
                              // Check if we need to add an external signer for signer placeholders
                              const extractedPlaceholders = extractPlaceholders(latexContent);
                              const hasSignerPlaceholders = extractedPlaceholders.some(p =>
                                AVAILABLE_PLACEHOLDERS.signer.fields.some(f => f.id === p)
                              );

                              let updatedParties = parties;
                              if (hasSignerPlaceholders && !parties.some(p => p.signerType === 'external')) {
                                // Add an external signer
                                const newSigner = {
                                  id: parties.length > 0 ? Math.max(...parties.map(p => p.id)) + 1 : 2,
                                  name: 'Signer 1',
                                  signerType: 'external',
                                  required: true,
                                  minCount: 1,
                                  maxCount: 1,
                                  order: parties.length + 1,
                                  colorIndex: parties.length
                                };
                                updatedParties = [...parties, newSigner];
                                setParties(updatedParties);
                              }

                              // Use placeholder positions from PDF generation
                              const placeholderPositions = pdfData.placeholderPositions || {};
                              const placeholderFields = convertPlaceholdersToFields(latexContent, updatedParties, placeholderPositions);
                              if (placeholderFields.length > 0) {
                                setTemplateFields(placeholderFields);
                                toast.success(`PDF generated with ${placeholderFields.length} field placeholders`);
                              } else {
                                toast.success('PDF generated successfully');
                              }
                            } else {
                              toast.success('PDF generated successfully');
                            }

                            setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
                          }
                        } catch (error) {
                          toast.error('Failed to generate PDF. Please try again.');
                        } finally {
                          setIsGeneratingPdf(false);
                        }
                      } else {
                        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
                      }
                    }}
                  >
                    {isGeneratingPdf ? 'Generating PDF...' : 'Next Step'}
                  </Button>
                )}
              </div>
            )}
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