import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Eye,
  Lock,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Policy section markers
const POLICY_START_MARKER = '% ========== CLIENT POLICY SECTION START ==========';
const POLICY_END_MARKER = '% ========== CLIENT POLICY SECTION END ==========';

// Extract policy section content from LaTeX
export function extractPolicySection(latexContent) {
  if (!latexContent) return { before: '', policy: '', after: '' };

  const startIndex = latexContent.indexOf(POLICY_START_MARKER);
  const endIndex = latexContent.indexOf(POLICY_END_MARKER);

  if (startIndex === -1 || endIndex === -1) {
    return { before: latexContent, policy: '', after: '' };
  }

  const before = latexContent.substring(0, startIndex);
  const policy = latexContent.substring(startIndex + POLICY_START_MARKER.length, endIndex);
  const after = latexContent.substring(endIndex + POLICY_END_MARKER.length);

  return { before, policy: policy.trim(), after };
}

// Reconstruct LaTeX with updated policy section
export function updatePolicySection(latexContent, newPolicyContent) {
  const { before, after } = extractPolicySection(latexContent);

  return `${before}${POLICY_START_MARKER}
${newPolicyContent}
${POLICY_END_MARKER}${after}`;
}

// Check if LaTeX has a policy section
export function hasPolicySection(latexContent) {
  if (!latexContent) return false;
  return latexContent.includes(POLICY_START_MARKER) && latexContent.includes(POLICY_END_MARKER);
}

// Parse policy items from LaTeX policy section
export function parsePolicyItems(policyContent) {
  if (!policyContent) return [];

  const items = [];
  const lines = policyContent.split('\n');

  let currentItem = null;
  let itemIndex = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip comments and empty lines
    if (trimmedLine.startsWith('%') || trimmedLine === '') continue;

    // Check for section headers
    if (trimmedLine.startsWith('\\section*{') || trimmedLine.startsWith('\\subsection*{')) {
      if (currentItem) {
        items.push(currentItem);
      }
      const match = trimmedLine.match(/\\(?:sub)?section\*\{([^}]+)\}/);
      currentItem = {
        id: `policy-${itemIndex++}`,
        title: match ? match[1] : 'Untitled Policy',
        content: '',
        type: trimmedLine.startsWith('\\subsection') ? 'subsection' : 'section',
      };
    } else if (currentItem) {
      currentItem.content += (currentItem.content ? '\n' : '') + trimmedLine;
    }
  }

  if (currentItem) {
    items.push(currentItem);
  }

  // If no structured items found, treat entire content as one item
  if (items.length === 0 && policyContent.trim()) {
    items.push({
      id: 'policy-0',
      title: 'Additional Terms and Policies',
      content: policyContent.trim(),
      type: 'section',
    });
  }

  return items;
}

// Convert policy items back to LaTeX
export function policyItemsToLatex(items) {
  if (!items || items.length === 0) {
    return `
\\section*{Additional Terms and Policies}

% Add your organization's specific policies here
`;
  }

  return items.map(item => {
    const sectionCmd = item.type === 'subsection' ? '\\subsection*' : '\\section*';
    return `
${sectionCmd}{${item.title}}

${item.content}
`;
  }).join('\n');
}

// PolicyEditor Component
export default function PolicyEditor({
  latexContent,
  onChange,
  readOnly = false,
  showPreview = true,
}) {
  const [policyItems, setPolicyItems] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [viewMode, setViewMode] = useState('edit'); // 'edit' or 'preview'

  // Extract and parse policy section on mount/content change
  useEffect(() => {
    const { policy } = extractPolicySection(latexContent);
    const items = parsePolicyItems(policy);
    setPolicyItems(items.length > 0 ? items : [{
      id: `policy-${Date.now()}`,
      title: 'Additional Terms and Policies',
      content: '',
      type: 'section',
    }]);
  }, [latexContent]);

  // Update parent when policy items change
  const handlePolicyChange = (updatedItems) => {
    setPolicyItems(updatedItems);
    const newPolicyLatex = policyItemsToLatex(updatedItems);
    const updatedLatex = updatePolicySection(latexContent, newPolicyLatex);
    onChange?.(updatedLatex);
  };

  // Add new policy item
  const addPolicyItem = () => {
    const newItem = {
      id: `policy-${Date.now()}`,
      title: 'New Policy Section',
      content: '',
      type: 'subsection',
    };
    handlePolicyChange([...policyItems, newItem]);
    setActiveItem(newItem.id);
  };

  // Update policy item
  const updatePolicyItem = (id, field, value) => {
    const updated = policyItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    handlePolicyChange(updated);
  };

  // Delete policy item
  const deletePolicyItem = (id) => {
    if (policyItems.length <= 1) return; // Keep at least one
    const updated = policyItems.filter(item => item.id !== id);
    handlePolicyChange(updated);
  };

  // Move policy item
  const movePolicyItem = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= policyItems.length) return;

    const updated = [...policyItems];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    handlePolicyChange(updated);
  };

  if (!hasPolicySection(latexContent)) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
        <h3 className="font-medium text-amber-900 mb-1">No Editable Section</h3>
        <p className="text-sm text-amber-700">
          This blueprint does not have an editable policy section defined.
          Contact your administrator to enable policy customization.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Organization Policies</h3>
            <p className="text-xs text-slate-500">
              {readOnly ? 'View your organization\'s policies' : 'Add or edit your organization\'s specific policies'}
            </p>
          </div>
        </div>

        {showPreview && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('edit')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                viewMode === 'edit'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Edit3 className="w-3.5 h-3.5 inline mr-1.5" />
              Edit
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                viewMode === 'preview'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1.5" />
              Preview
            </button>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
        <Lock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="text-blue-900 font-medium">Editable Section Only</p>
          <p className="text-blue-700 text-xs mt-0.5">
            You can only modify policies in this section. The rest of the blueprint is locked.
            Changes will require ICP approval before activation.
          </p>
        </div>
      </div>

      {viewMode === 'edit' ? (
        /* Edit Mode */
        <div className="space-y-3">
          {policyItems.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                'border rounded-xl overflow-hidden transition-all',
                activeItem === item.id
                  ? 'border-purple-300 ring-2 ring-purple-100'
                  : 'border-slate-200'
              )}
            >
              {/* Item Header */}
              <div
                className={cn(
                  'px-4 py-3 flex items-center gap-3 cursor-pointer',
                  activeItem === item.id ? 'bg-purple-50' : 'bg-slate-50'
                )}
                onClick={() => setActiveItem(activeItem === item.id ? null : item.id)}
              >
                {!readOnly && (
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); movePolicyItem(index, -1); }}
                      disabled={index === 0}
                      className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); movePolicyItem(index, 1); }}
                      disabled={index === policyItems.length - 1}
                      className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex-1">
                  {readOnly ? (
                    <span className="font-medium text-slate-900">{item.title}</span>
                  ) : (
                    <Input
                      value={item.title}
                      onChange={(e) => updatePolicyItem(item.id, 'title', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                      placeholder="Policy Section Title"
                    />
                  )}
                </div>

                {!readOnly && policyItems.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deletePolicyItem(item.id); }}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {activeItem === item.id ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {/* Item Content */}
              {activeItem === item.id && (
                <div className="p-4 border-t border-slate-200 bg-white">
                  <Label className="text-xs text-slate-500 mb-2 block">Policy Content</Label>
                  <Textarea
                    value={item.content}
                    onChange={(e) => updatePolicyItem(item.id, 'content', e.target.value)}
                    placeholder="Enter your policy terms and conditions here..."
                    className="min-h-[150px] font-mono text-sm"
                    readOnly={readOnly}
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Use plain text. LaTeX formatting like \textbf{'{'}bold{'}'} is supported.
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Add Policy Button */}
          {!readOnly && (
            <Button
              variant="outline"
              className="w-full gap-2 border-dashed"
              onClick={addPolicyItem}
            >
              <Plus className="w-4 h-4" />
              Add Policy Section
            </Button>
          )}
        </div>
      ) : (
        /* Preview Mode */
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="prose prose-sm max-w-none">
            {policyItems.map((item) => (
              <div key={item.id} className="mb-6 last:mb-0">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <div className="text-slate-700 whitespace-pre-wrap">{item.content || '(No content)'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Notice */}
      {!readOnly && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-slate-700">
              <strong>Approval Required:</strong> After submitting your policy changes, they will be
              reviewed by ICP for conflicts with standard terms before activation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export { POLICY_START_MARKER, POLICY_END_MARKER };
