import React, { useState, useEffect, useRef } from 'react';
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
import { echannelApi } from '@/services/api';
import { useAuth } from '@/pages/index';
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
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  X,
  Check,
  Loader2,
  Table,
  Plus,
  Trash2,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { SIGNER_TYPES } from '@/components/templates/SignerCard';
import { FIELD_TYPES } from '@/components/templates/FieldOverlay';
import EstablishmentFieldsDisplay from '@/components/contracts/EstablishmentFieldsDisplay';
import { DEFAULT_ESTABLISHMENT_FIELDS, ESTABLISHMENT_FIELDS, getValueFromPath } from '@/constants/establishmentFields';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ChevronsUpDown } from 'lucide-react';
// ID verification types
const ID_TYPES = {
  none: { id: 'none', label: 'No ID Verification' },
  emirates_id: { id: 'emirates_id', label: 'Emirates ID' },
  passport: { id: 'passport', label: 'Passport' },
  gcc_id: { id: 'gcc_id', label: 'GCC ID' },
  uaekyc_id: { id: 'uaekyc_id', label: 'UAEKYC ID' },
};

const GCC_COUNTRIES = [
  { value: 'ae', label: 'UAE' },
  { value: 'sa', label: 'Saudi Arabia' },
  { value: 'kw', label: 'Kuwait' },
  { value: 'bh', label: 'Bahrain' },
  { value: 'qa', label: 'Qatar' },
  { value: 'om', label: 'Oman' },
];

const COUNTRIES = [
  { value: 'af', label: 'Afghanistan' },
  { value: 'al', label: 'Albania' },
  { value: 'dz', label: 'Algeria' },
  { value: 'ar', label: 'Argentina' },
  { value: 'am', label: 'Armenia' },
  { value: 'au', label: 'Australia' },
  { value: 'at', label: 'Austria' },
  { value: 'az', label: 'Azerbaijan' },
  { value: 'bh', label: 'Bahrain' },
  { value: 'bd', label: 'Bangladesh' },
  { value: 'by', label: 'Belarus' },
  { value: 'be', label: 'Belgium' },
  { value: 'br', label: 'Brazil' },
  { value: 'bn', label: 'Brunei' },
  { value: 'bg', label: 'Bulgaria' },
  { value: 'ca', label: 'Canada' },
  { value: 'cn', label: 'China' },
  { value: 'co', label: 'Colombia' },
  { value: 'hr', label: 'Croatia' },
  { value: 'cy', label: 'Cyprus' },
  { value: 'cz', label: 'Czech Republic' },
  { value: 'dk', label: 'Denmark' },
  { value: 'eg', label: 'Egypt' },
  { value: 'ee', label: 'Estonia' },
  { value: 'et', label: 'Ethiopia' },
  { value: 'fi', label: 'Finland' },
  { value: 'fr', label: 'France' },
  { value: 'ge', label: 'Georgia' },
  { value: 'de', label: 'Germany' },
  { value: 'gh', label: 'Ghana' },
  { value: 'gr', label: 'Greece' },
  { value: 'hk', label: 'Hong Kong' },
  { value: 'hu', label: 'Hungary' },
  { value: 'in', label: 'India' },
  { value: 'id', label: 'Indonesia' },
  { value: 'ir', label: 'Iran' },
  { value: 'iq', label: 'Iraq' },
  { value: 'ie', label: 'Ireland' },
  { value: 'il', label: 'Israel' },
  { value: 'it', label: 'Italy' },
  { value: 'jp', label: 'Japan' },
  { value: 'jo', label: 'Jordan' },
  { value: 'kz', label: 'Kazakhstan' },
  { value: 'ke', label: 'Kenya' },
  { value: 'kw', label: 'Kuwait' },
  { value: 'kg', label: 'Kyrgyzstan' },
  { value: 'lv', label: 'Latvia' },
  { value: 'lb', label: 'Lebanon' },
  { value: 'ly', label: 'Libya' },
  { value: 'lt', label: 'Lithuania' },
  { value: 'lu', label: 'Luxembourg' },
  { value: 'my', label: 'Malaysia' },
  { value: 'mv', label: 'Maldives' },
  { value: 'mx', label: 'Mexico' },
  { value: 'ma', label: 'Morocco' },
  { value: 'np', label: 'Nepal' },
  { value: 'nl', label: 'Netherlands' },
  { value: 'nz', label: 'New Zealand' },
  { value: 'ng', label: 'Nigeria' },
  { value: 'no', label: 'Norway' },
  { value: 'om', label: 'Oman' },
  { value: 'pk', label: 'Pakistan' },
  { value: 'ps', label: 'Palestine' },
  { value: 'ph', label: 'Philippines' },
  { value: 'pl', label: 'Poland' },
  { value: 'pt', label: 'Portugal' },
  { value: 'qa', label: 'Qatar' },
  { value: 'ro', label: 'Romania' },
  { value: 'ru', label: 'Russia' },
  { value: 'sa', label: 'Saudi Arabia' },
  { value: 'rs', label: 'Serbia' },
  { value: 'sg', label: 'Singapore' },
  { value: 'sk', label: 'Slovakia' },
  { value: 'si', label: 'Slovenia' },
  { value: 'za', label: 'South Africa' },
  { value: 'kr', label: 'South Korea' },
  { value: 'es', label: 'Spain' },
  { value: 'lk', label: 'Sri Lanka' },
  { value: 'sd', label: 'Sudan' },
  { value: 'se', label: 'Sweden' },
  { value: 'ch', label: 'Switzerland' },
  { value: 'sy', label: 'Syria' },
  { value: 'tw', label: 'Taiwan' },
  { value: 'tj', label: 'Tajikistan' },
  { value: 'tz', label: 'Tanzania' },
  { value: 'th', label: 'Thailand' },
  { value: 'tn', label: 'Tunisia' },
  { value: 'tr', label: 'Turkey' },
  { value: 'tm', label: 'Turkmenistan' },
  { value: 'ug', label: 'Uganda' },
  { value: 'ua', label: 'Ukraine' },
  { value: 'ae', label: 'United Arab Emirates' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'us', label: 'United States' },
  { value: 'uz', label: 'Uzbekistan' },
  { value: 'vn', label: 'Vietnam' },
  { value: 'ye', label: 'Yemen' },
  { value: 'zw', label: 'Zimbabwe' },
];

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const steps = [
  { id: 'blueprint', title: 'Select Blueprint', description: 'Choose a template' },
  { id: 'signers', title: 'Signer Details', description: 'Enter signer info' },
  { id: 'review', title: 'Review & Create', description: 'Confirm and create' },
];

const bulkSteps = [
  { id: 'blueprint', title: 'Select Blueprint', description: 'Choose a template' },
  { id: 'upload', title: 'Upload CSV', description: 'Upload contract data' },
  { id: 'review', title: 'Review & Create', description: 'Confirm and create' },
];

// Parse CSV string to array of objects
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

// Generate CSV template based on blueprint
function generateCSVTemplate(blueprint) {
  const headers = ['contract_name', 'reference', 'notes'];

  // Add signer columns
  (blueprint.parties || []).forEach((party, idx) => {
    headers.push(`signer_${idx + 1}_name`);
    headers.push(`signer_${idx + 1}_email`);
  });

  // Add field columns (excluding signature/initials)
  (blueprint.fields || []).forEach((field) => {
    if (field.type !== 'signature' && field.type !== 'initials') {
      const label = field.label || field.placeholder || `field_${field.id}`;
      headers.push(label.toLowerCase().replace(/\s+/g, '_'));
    }
  });

  // Create sample row
  const sampleRow = ['Sample Contract', 'CON-001', 'Optional notes'];
  (blueprint.parties || []).forEach((party) => {
    sampleRow.push(`${party.name}`);
    sampleRow.push(`${party.name.toLowerCase().replace(/\s+/g, '.')}@example.com`);
  });
  (blueprint.fields || []).forEach((field) => {
    if (field.type !== 'signature' && field.type !== 'initials') {
      if (field.type === 'date') sampleRow.push('2024-01-15');
      else if (field.type === 'number') sampleRow.push('100');
      else if (field.type === 'checkbox') sampleRow.push('true');
      else sampleRow.push('Sample value');
    }
  });

  return headers.join(',') + '\n' + sampleRow.join(',');
}

export default function ContractCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedBlueprintId = searchParams.get('blueprintId');
  const fileInputRef = useRef(null);
  const { selectedClient } = useAuth();

  // Mode: 'single' or 'bulk'
  const [mode, setMode] = useState('single');

  const [currentStep, setCurrentStep] = useState(0);
  const [blueprints, setBlueprints] = useState([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [sampleBlueprints, setSampleBlueprints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // E-Channel company data
  const [companyData, setCompanyData] = useState(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);

  // Establishments (first one is always the company, rest are additional signers)
  const [establishments, setEstablishments] = useState([]);

  // Single contract data
  const [contractData, setContractData] = useState({
    name: '',
    reference: '',
    notes: '',
    signerEmails: {},
    signerNames: {},
    signerIdDetails: {}, // { signerId: { idType, emiratesId, passport: { country, type, number }, gccId: { country, number }, uaekycId } }
    fieldValues: {},
    createdBy: 'Current User',
  });
  const [reviewNumPages, setReviewNumPages] = useState(null);

  // Bulk upload data
  const [csvData, setCsvData] = useState({ headers: [], rows: [] });
  const [csvFile, setCsvFile] = useState(null);
  const [csvErrors, setCsvErrors] = useState([]);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, status: 'idle' });
  const [bulkResults, setBulkResults] = useState([]);

  // Fetch e-Channel company data
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!selectedClient?.id) return;

      setIsLoadingCompany(true);
      try {
        const data = await echannelApi.getByClient(selectedClient.id);
        setCompanyData(data);

        // Initialize establishments with company as Establishment 1
        setEstablishments([{
          id: 'establishment-1',
          type: 'establishment',
          name: data.companyName,
          tradeName: data.tradeName,
          establishmentNumber: data.establishmentNumber,
          licenseNumber: data.licenseNumber,
          address: data.address?.fullAddress,
          representedBy: data.owner?.name || '',
          representedByEmail: data.owner?.email || '',
          representedByPhone: data.owner?.phone || '',
          emiratesId: data.owner?.emiratesId || '',
          isCompany: true,
        }]);
      } catch (error) {
        console.error('Error fetching company data:', error);
        // Initialize with empty establishment if no data
        setEstablishments([{
          id: 'establishment-1',
          type: 'establishment',
          name: selectedClient?.name || 'Establishment 1',
          isCompany: true,
        }]);
      } finally {
        setIsLoadingCompany(false);
      }
    };

    fetchCompanyData();
  }, [selectedClient]);

  // Load blueprints
  useEffect(() => {
    const loadBlueprints = async () => {
      setIsLoading(true);
      try {
        const allTemplates = await getTemplates();
        const activeBlueprints = allTemplates.filter(t => t.status === 'active');

        setBlueprints(activeBlueprints);
        setSampleBlueprints([]);

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
            setCurrentStep(1);
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

  // Add new signer
  const addSigner = () => {
    const newId = `signer-${Date.now()}`;
    setEstablishments(prev => [...prev, {
      id: newId,
      type: 'signer',
      name: '',
      email: '',
      phone: '',
      emiratesId: '',
      isCompany: false,
    }]);
  };

  // Update establishment/signer
  const updateEstablishment = (id, field, value) => {
    setEstablishments(prev => prev.map(est =>
      est.id === id ? { ...est, [field]: value } : est
    ));
  };

  // Remove signer (cannot remove Establishment 1)
  const removeSigner = (id) => {
    setEstablishments(prev => prev.filter(est => est.id !== id || est.isCompany));
  };

  const allBlueprints = [...blueprints, ...sampleBlueprints];

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
      signerIdDetails: {},
      fieldValues: {},
    }));
    // Reset bulk data when changing blueprint
    setCsvData({ headers: [], rows: [] });
    setCsvFile(null);
    setCsvErrors([]);
    setBulkResults([]);
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

  const handleSignerIdChange = (signerId, idField, value) => {
    setContractData(prev => ({
      ...prev,
      signerIdDetails: {
        ...prev.signerIdDetails,
        [signerId]: {
          ...prev.signerIdDetails[signerId],
          [idField]: value,
        },
      },
    }));
  };

  const handleSignerIdNestedChange = (signerId, parentField, childField, value) => {
    setContractData(prev => ({
      ...prev,
      signerIdDetails: {
        ...prev.signerIdDetails,
        [signerId]: {
          ...prev.signerIdDetails[signerId],
          [parentField]: {
            ...prev.signerIdDetails[signerId]?.[parentField],
            [childField]: value,
          },
        },
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

  const getFieldsBySigner = (signerId) => {
    return (selectedBlueprint?.fields || []).filter(
      field => field.role?.toString() === signerId?.toString()
    );
  };

  const renderFieldInput = (field) => {
    const fieldType = FIELD_TYPES[field.type];
    const value = contractData.fieldValues[field.id] || '';

    switch (field.type) {
      case 'signature':
      case 'initials':
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
      // Helper to transform idDetails with country labels
      const transformIdDetails = (idDetails) => {
        if (!idDetails) return { idType: 'none' };

        const transformed = { ...idDetails };

        // Convert passport country code to label
        if (transformed.passport?.country) {
          const countryObj = COUNTRIES.find(c => c.value === transformed.passport.country);
          transformed.passport = {
            ...transformed.passport,
            country: countryObj?.label || transformed.passport.country,
          };
        }

        // Convert GCC country code to label
        if (transformed.gccId?.country) {
          const countryObj = GCC_COUNTRIES.find(c => c.value === transformed.gccId.country);
          transformed.gccId = {
            ...transformed.gccId,
            country: countryObj?.label || transformed.gccId.country,
          };
        }

        return transformed;
      };

      // Construct signers array with embedded idDetails
      const signers = (selectedBlueprint.parties || []).map(party => ({
        id: party.id,
        name: contractData.signerNames[party.id] || '',
        email: contractData.signerEmails[party.id] || '',
        role: party.name || party.role || 'Signer',
        signerType: party.type || 'external',
        status: 'pending',
        idDetails: transformIdDetails(contractData.signerIdDetails[party.id]),
      }));

      // Build contract data with properly structured signers
      const finalContractData = {
        ...contractData,
        signers,
      };

      const contract = await createContractFromBlueprint(selectedBlueprint, finalContractData);
      toast.success('Contract created successfully!', {
        description: `Contract "${contract.name}" is ready.`,
      });

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

  // Download CSV template
  const handleDownloadTemplate = () => {
    if (!selectedBlueprint) {
      toast.error('Please select a blueprint first');
      return;
    }

    const csvContent = generateCSVTemplate(selectedBlueprint);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedBlueprint.name.replace(/\s+/g, '_')}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Template downloaded!', {
      description: 'Fill in the data and upload the CSV.',
    });
  };

  // Handle CSV file upload
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        const parsed = parseCSV(text);
        setCsvData(parsed);
        validateCSVData(parsed);
      }
    };

    reader.readAsText(file);
  };

  // Validate CSV data against blueprint
  const validateCSVData = (data) => {
    const errors = [];
    const parties = selectedBlueprint?.parties || [];

    data.rows.forEach((row, rowIndex) => {
      // Check required fields
      if (!row.contract_name?.trim()) {
        errors.push({ row: rowIndex + 1, field: 'contract_name', message: 'Contract name is required' });
      }

      // Check signer fields
      parties.forEach((party, partyIdx) => {
        const nameKey = `signer_${partyIdx + 1}_name`;
        const emailKey = `signer_${partyIdx + 1}_email`;

        if (!row[nameKey]?.trim()) {
          errors.push({ row: rowIndex + 1, field: nameKey, message: `Signer ${partyIdx + 1} name is required` });
        }
        if (!row[emailKey]?.trim()) {
          errors.push({ row: rowIndex + 1, field: emailKey, message: `Signer ${partyIdx + 1} email is required` });
        }
      });
    });

    setCsvErrors(errors);
    return errors.length === 0;
  };

  // Build contract data from CSV row
  const buildContractFromRow = (row, rowIndex) => {
    const parties = selectedBlueprint?.parties || [];
    const fields = selectedBlueprint?.fields || [];

    const signerNames = {};
    const signerEmails = {};
    const fieldValues = {};

    // Map signer data
    parties.forEach((party, partyIdx) => {
      signerNames[party.id] = row[`signer_${partyIdx + 1}_name`] || '';
      signerEmails[party.id] = row[`signer_${partyIdx + 1}_email`] || '';
    });

    // Map field values
    fields.forEach((field) => {
      if (field.type !== 'signature' && field.type !== 'initials') {
        const label = field.label || field.placeholder || `field_${field.id}`;
        const key = label.toLowerCase().replace(/\s+/g, '_');
        let value = row[key] || '';

        // Convert checkbox values
        if (field.type === 'checkbox') {
          value = value.toLowerCase() === 'true' || value === '1';
        }

        fieldValues[field.id] = value;
      }
    });

    return {
      name: row.contract_name || `${selectedBlueprint.name} - Contract ${rowIndex + 1}`,
      reference: row.reference || `CON-${Date.now().toString().slice(-6)}-${rowIndex + 1}`,
      notes: row.notes || '',
      signerNames,
      signerEmails,
      fieldValues,
      createdBy: 'Bulk Upload',
    };
  };

  // Handle bulk contract creation
  const handleBulkCreate = async () => {
    if (csvData.rows.length === 0) {
      toast.error('No data to process');
      return;
    }

    if (csvErrors.length > 0) {
      toast.error('Please fix validation errors first');
      return;
    }

    setBulkProgress({ current: 0, total: csvData.rows.length, status: 'processing' });
    setBulkResults([]);

    const results = [];

    for (let i = 0; i < csvData.rows.length; i++) {
      const row = csvData.rows[i];
      const contractData = buildContractFromRow(row, i);

      try {
        const contract = await createContractFromBlueprint(selectedBlueprint, contractData);
        results.push({ row: i + 1, success: true, contract, name: contractData.name });
      } catch (error) {
        results.push({ row: i + 1, success: false, error: error.message, name: contractData.name });
      }

      setBulkProgress(prev => ({ ...prev, current: i + 1 }));
    }

    setBulkResults(results);
    setBulkProgress(prev => ({ ...prev, status: 'completed' }));

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (failCount === 0) {
      toast.success(`Successfully created ${successCount} contracts!`);
    } else {
      toast.warning(`Created ${successCount} contracts, ${failCount} failed`);
    }
  };

  const activeSteps = mode === 'bulk' ? bulkSteps : steps;

  const renderBlueprintSelector = () => (
    <div className="max-w-5xl mx-auto">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="bg-slate-100 p-1 rounded-lg flex">
          <button
            onClick={() => { setMode('single'); setCurrentStep(0); }}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              mode === 'single'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <User className="w-4 h-4 inline-block mr-2" />
            Single Contract
          </button>
          <button
            onClick={() => { setMode('bulk'); setCurrentStep(0); }}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              mode === 'bulk'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Table className="w-4 h-4 inline-block mr-2" />
            Bulk Upload (CSV)
          </button>
        </div>
      </div>

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

  const renderBulkUploadStep = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Template Download */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-lg">
            <FileSpreadsheet className="w-6 h-6 text-slate-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Download CSV Template</h3>
            <p className="text-sm text-slate-500 mt-1">
              Download a pre-formatted template for "{selectedBlueprint?.name}" with all required columns.
            </p>
          </div>
          <Button onClick={handleDownloadTemplate} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Download Template
          </Button>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Upload CSV File</h3>

        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
            csvFile ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 hover:border-slate-400'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          {csvFile ? (
            <div className="space-y-2">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-slate-900">{csvFile.name}</p>
              <p className="text-xs text-slate-500">{csvData.rows.length} contracts to create</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setCsvFile(null);
                  setCsvData({ headers: [], rows: [] });
                  setCsvErrors([]);
                }}
                className="text-slate-500"
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-400">CSV files only</p>
            </div>
          )}
        </div>
      </div>

      {/* Validation Errors */}
      {csvErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-medium text-red-900">Validation Errors ({csvErrors.length})</h4>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {csvErrors.slice(0, 10).map((error, idx) => (
              <p key={idx} className="text-sm text-red-700">
                Row {error.row}: {error.message}
              </p>
            ))}
            {csvErrors.length > 10 && (
              <p className="text-sm text-red-500 font-medium">...and {csvErrors.length - 10} more errors</p>
            )}
          </div>
        </div>
      )}

      {/* Data Preview */}
      {csvData.rows.length > 0 && csvErrors.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Preview</h3>
            <span className="text-sm text-slate-500">{csvData.rows.length} contracts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">#</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Contract Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Reference</th>
                  {(selectedBlueprint?.parties || []).map((party, idx) => (
                    <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                      Signer {idx + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {csvData.rows.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-2 text-slate-900">{row.contract_name}</td>
                    <td className="px-4 py-2 text-slate-500">{row.reference || '-'}</td>
                    {(selectedBlueprint?.parties || []).map((party, partyIdx) => (
                      <td key={partyIdx} className="px-4 py-2">
                        <div>
                          <p className="text-slate-900">{row[`signer_${partyIdx + 1}_name`]}</p>
                          <p className="text-xs text-slate-500">{row[`signer_${partyIdx + 1}_email`]}</p>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {csvData.rows.length > 5 && (
              <div className="px-4 py-2 text-center text-sm text-slate-500 border-t border-slate-100">
                ...and {csvData.rows.length - 5} more rows
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderBulkReviewStep = () => (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Bulk Creation Summary</h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">{csvData.rows.length}</p>
            <p className="text-sm text-slate-500">Total Contracts</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">{selectedBlueprint?.parties?.length || 0}</p>
            <p className="text-sm text-slate-500">Signers Each</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">{selectedBlueprint?.name}</p>
            <p className="text-sm text-slate-500">Blueprint</p>
          </div>
        </div>

        {bulkProgress.status === 'processing' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Creating contracts...</span>
              <span className="text-slate-900 font-medium">
                {bulkProgress.current} / {bulkProgress.total}
              </span>
            </div>
            <Progress value={(bulkProgress.current / bulkProgress.total) * 100} className="h-2" />
          </div>
        )}

        {bulkProgress.status === 'completed' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-900">
                Bulk creation completed!
              </span>
            </div>

            {/* Results */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {bulkResults.map((result, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    result.success
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-red-50 border-red-200'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm">{result.name}</span>
                  </div>
                  {result.success ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(createPageUrl(`ContractDetail?id=${result.contract.id}`))}
                      className="text-emerald-700"
                    >
                      View
                    </Button>
                  ) : (
                    <span className="text-xs text-red-600">{result.error}</span>
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={() => navigate(createPageUrl('Current'))}
              className="w-full bg-slate-900 hover:bg-slate-800"
            >
              Go to Contracts
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderStepContent = () => {
    if (currentStep === 0) {
      return renderBlueprintSelector();
    }

    if (mode === 'bulk') {
      if (currentStep === 1) return renderBulkUploadStep();
      if (currentStep === 2) return renderBulkReviewStep();
    }

    // Single contract flow
    switch (currentStep) {
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

            {/* Establishments & Signers */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">Signing Parties</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Company establishment and additional signers for this contract
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSigner}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Signer
                </Button>
              </div>

              {isLoadingCompany ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                  <p className="text-sm text-slate-500 mt-2">Loading company data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {establishments.map((establishment, index) => (
                    <div
                      key={establishment.id}
                      className={cn(
                        "p-5 rounded-xl border",
                        establishment.isCompany
                          ? "border-blue-200 bg-blue-50/50"
                          : "border-slate-200 bg-white"
                      )}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            establishment.isCompany ? "bg-blue-100" : "bg-slate-100"
                          )}>
                            {establishment.isCompany ? (
                              <Building2 className="w-5 h-5 text-blue-600" />
                            ) : (
                              <User className="w-5 h-5 text-slate-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {establishment.isCompany ? `Establishment ${index + 1}` : `Signer ${index}`}
                            </p>
                            <p className="text-xs text-slate-500">
                              {establishment.isCompany ? 'Company / Organization' : 'Individual Signer'}
                            </p>
                          </div>
                        </div>
                        {!establishment.isCompany && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSigner(establishment.id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {establishment.isCompany ? (
                        /* Establishment (Company) Fields - Dynamic based on blueprint field mappings */
                        <EstablishmentFieldsDisplay
                          companyData={companyData}
                          establishment={establishment}
                          configuredFields={(() => {
                            // Extract e-Channel mappings from template fields
                            const mappedFieldIds = (selectedBlueprint?.fields || [])
                              .filter(f => f.echannelMapping)
                              .map(f => f.echannelMapping);
                            // Always include basic required fields + any mapped fields
                            const uniqueFields = [...new Set([...DEFAULT_ESTABLISHMENT_FIELDS, ...mappedFieldIds])];
                            return uniqueFields.length > 0 ? uniqueFields : DEFAULT_ESTABLISHMENT_FIELDS;
                          })()}
                          representatives={companyData?.representatives || []}
                          onUpdate={(key, value) => updateEstablishment(establishment.id, key, value)}
                        />
                      ) : (
                        /* Individual Signer Fields */
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-700">Full Name *</Label>
                            <Input
                              value={establishment.name || ''}
                              onChange={(e) => updateEstablishment(establishment.id, 'name', e.target.value)}
                              placeholder="Enter signer's full name"
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-700">Email Address *</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                type="email"
                                value={establishment.email || ''}
                                onChange={(e) => updateEstablishment(establishment.id, 'email', e.target.value)}
                                placeholder="email@example.com"
                                className="pl-9 bg-white"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-700">Phone Number</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                value={establishment.phone || ''}
                                onChange={(e) => updateEstablishment(establishment.id, 'phone', e.target.value)}
                                placeholder="+971 XX XXX XXXX"
                                className="pl-9 bg-white"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-700">Emirates ID</Label>
                            <Input
                              value={establishment.emiratesId || ''}
                              onChange={(e) => updateEstablishment(establishment.id, 'emiratesId', e.target.value)}
                              placeholder="784-XXXX-XXXXXXX-X"
                              className="bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {establishments.length === 0 && !isLoadingCompany && (
                <div className="text-center py-8 text-slate-500">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No company data available</p>
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
                      <div key={party.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-200">
                            <SignerIcon className="w-4 h-4 text-slate-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-900 truncate">{name}</p>
                            <p className="text-xs text-slate-500 truncate">{email}</p>
                          </div>
                          <span className="text-[10px] bg-white px-1.5 py-0.5 rounded text-slate-500 shrink-0 border border-slate-200">
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
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Approval</span>
                      <span className="text-slate-700">
                        {selectedBlueprint.settings.approval?.enabled
                          ? `${selectedBlueprint.settings.approval.requiredApprovers || 1} level(s)`
                          : 'Not required'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Delivery</span>
                      <span className="text-slate-700 capitalize">
                        {selectedBlueprint.settings.delivery?.mode || 'Manual'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Signing Order</span>
                      <span className="text-slate-700 capitalize">
                        {selectedBlueprint.settings.signingOrder?.order || 'Sequential'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Reminders</span>
                      <span className="text-slate-700">
                        {selectedBlueprint.settings.reminder?.enabled
                          ? `Every ${selectedBlueprint.settings.reminder.reminderIntervalDays || 2} days`
                          : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Expiration</span>
                      <span className="text-slate-700">
                        {selectedBlueprint.settings.expiration?.enabled
                          ? `${selectedBlueprint.settings.expiration.expiresAfterDays || 30} days`
                          : 'No expiry'}
                      </span>
                    </div>
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
              <Link to={createPageUrl('Current')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold text-slate-900">
                  Create Contract{mode === 'bulk' && ' (Bulk)'}
                </h1>
                <p className="text-sm text-slate-500">Step {currentStep + 1} of {activeSteps.length}</p>
              </div>
            </div>

            {/* Center: Progress Stepper */}
            <div className="flex items-center gap-2 flex-1 justify-center">
              {activeSteps.map((step, index) => (
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
                  {index < activeSteps.length - 1 && (
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
              {currentStep === activeSteps.length - 1 ? (
                mode === 'bulk' ? (
                  bulkProgress.status !== 'completed' && (
                    <Button
                      className="gap-2 bg-slate-900 hover:bg-slate-800"
                      onClick={handleBulkCreate}
                      disabled={bulkProgress.status === 'processing' || csvData.rows.length === 0 || csvErrors.length > 0}
                    >
                      {bulkProgress.status === 'processing' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Create {csvData.rows.length} Contracts
                        </>
                      )}
                    </Button>
                  )
                ) : (
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
                )
              ) : (
                <Button
                  className="bg-slate-900 hover:bg-slate-800"
                  onClick={() => setCurrentStep(prev => Math.min(prev + 1, activeSteps.length - 1))}
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
