import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import Editor from '@monaco-editor/react';
import katex from 'katex';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import {
  Copy,
  Check,
  FileText,
  Maximize2,
  Minimize2,
  RotateCcw,
  Plus,
  Variable,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Available placeholders that admin can insert
const AVAILABLE_PLACEHOLDERS = {
  establishment: {
    label: 'Establishment Fields',
    fields: [
      { id: 'company_name', label: 'Company Name', placeholder: '{{company_name}}' },
      { id: 'license_number', label: 'License Number', placeholder: '{{license_number}}' },
      { id: 'trade_name', label: 'Trade Name', placeholder: '{{trade_name}}' },
      { id: 'company_address', label: 'Company Address', placeholder: '{{company_address}}' },
      { id: 'owner_name', label: 'Owner Name', placeholder: '{{owner_name}}' },
      { id: 'owner_emirates_id', label: 'Owner Emirates ID', placeholder: '{{owner_emirates_id}}' },
      { id: 'representative_name', label: 'Representative Name', placeholder: '{{representative_name}}' },
      { id: 'representative_email', label: 'Representative Email', placeholder: '{{representative_email}}' },
    ]
  },
  signer: {
    label: 'External Signer Fields',
    fields: [
      { id: 'signer_name', label: 'Signer Name', placeholder: '{{signer_name}}' },
      { id: 'signer_email', label: 'Signer Email', placeholder: '{{signer_email}}' },
      { id: 'signer_phone', label: 'Signer Phone', placeholder: '{{signer_phone}}' },
      { id: 'signer_emirates_id', label: 'Signer Emirates ID', placeholder: '{{signer_emirates_id}}' },
      { id: 'signer_address', label: 'Signer Address', placeholder: '{{signer_address}}' },
    ]
  },
  contract: {
    label: 'Contract Fields',
    fields: [
      { id: 'contract_date', label: 'Contract Date', placeholder: '{{contract_date}}' },
      { id: 'contract_number', label: 'Contract Number', placeholder: '{{contract_number}}' },
      { id: 'effective_date', label: 'Effective Date', placeholder: '{{effective_date}}' },
      { id: 'expiry_date', label: 'Expiry Date', placeholder: '{{expiry_date}}' },
      { id: 'contract_value', label: 'Contract Value', placeholder: '{{contract_value}}' },
    ]
  },
  custom: {
    label: 'Custom Fields',
    fields: [
      { id: 'custom_text_1', label: 'Custom Text 1', placeholder: '{{custom_text_1}}' },
      { id: 'custom_text_2', label: 'Custom Text 2', placeholder: '{{custom_text_2}}' },
      { id: 'custom_number_1', label: 'Custom Number 1', placeholder: '{{custom_number_1}}' },
      { id: 'custom_date_1', label: 'Custom Date 1', placeholder: '{{custom_date_1}}' },
    ]
  }
};

// Policy section marker
const POLICY_SECTION_MARKER = `
% ========== CLIENT POLICY SECTION START ==========
% Clients can add their own policies below this line

\\section*{Additional Terms and Policies}

% Add your organization's specific policies here

% ========== CLIENT POLICY SECTION END ==========
`;

// Default LaTeX template for Sales Agreement with placeholders
const DEFAULT_LATEX_TEMPLATE = `% Sales Agreement Template
% Use {{placeholder}} syntax for dynamic fields

\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}

\\begin{document}

\\begin{center}
\\textbf{\\Large SALES AGREEMENT}
\\end{center}

\\vspace{0.3cm}

\\begin{center}
Contract No: {{contract_number}} \\hfill Date: {{contract_date}}
\\end{center}

\\vspace{0.5cm}

This Sales Agreement ("Agreement") is entered into as of {{effective_date}} by and between:

\\vspace{0.3cm}

\\textbf{SELLER (Party A):}

Company Name: {{company_name}}

Trade License No: {{license_number}}

Address: {{company_address}}

Represented by: {{representative_name}}

Email: {{representative_email}}

\\vspace{0.3cm}

\\textbf{BUYER (Party B):}

Full Name: {{signer_name}}

Emirates ID: {{signer_emirates_id}}

Email: {{signer_email}}

Phone: {{signer_phone}}

Address: {{signer_address}}

\\vspace{0.5cm}

\\section*{1. SUBJECT OF AGREEMENT}

The Seller agrees to sell and the Buyer agrees to purchase the goods/services as described in Schedule A attached hereto, subject to the terms and conditions set forth in this Agreement.

\\section*{2. PURCHASE PRICE}

The total purchase price for the goods/services shall be {{contract_value}} (the "Purchase Price"), payable in accordance with the payment terms specified in Section 3.

\\section*{3. PAYMENT TERMS}

3.1 The Buyer shall pay the Purchase Price as follows:
\\begin{itemize}
\\item 50\\% upon signing of this Agreement
\\item 50\\% upon delivery/completion
\\end{itemize}

3.2 All payments shall be made in AED to the Seller's designated bank account.

\\section*{4. DELIVERY}

4.1 The Seller shall deliver the goods/services on or before {{expiry_date}}.

4.2 Delivery shall be made to the Buyer's address specified above unless otherwise agreed in writing.

\\section*{5. WARRANTIES}

5.1 The Seller warrants that the goods/services shall be free from defects and conform to the specifications.

5.2 This warranty shall be valid for a period of 12 months from the date of delivery.

\\section*{6. LIMITATION OF LIABILITY}

Neither party shall be liable for any indirect, incidental, or consequential damages arising out of this Agreement.

\\section*{7. GOVERNING LAW}

This Agreement shall be governed by and construed in accordance with the laws of the United Arab Emirates.

${POLICY_SECTION_MARKER}

\\section*{8. ENTIRE AGREEMENT}

This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements relating to this subject matter.

\\vspace{1cm}

\\textbf{IN WITNESS WHEREOF}, the parties have executed this Agreement as of the date first written above.

\\vspace{1cm}

\\begin{tabular}{p{7cm}p{7cm}}
\\textbf{SELLER:} & \\textbf{BUYER:} \\\\
\\vspace{1.5cm} & \\vspace{1.5cm} \\\\
\\underline{\\hspace{6cm}} & \\underline{\\hspace{6cm}} \\\\
Name: {{representative_name}} & Name: {{signer_name}} \\\\
Title: Authorized Representative & \\\\
Date: & Date: \\\\
\\end{tabular}

\\end{document}
`;

// Simple LaTeX to HTML converter for preview
const convertLatexToHtml = (latex) => {
  if (!latex) return '';

  let html = latex;

  // Remove document class and usepackage commands
  html = html.replace(/\\documentclass(\[.*?\])?\{.*?\}/g, '');
  html = html.replace(/\\usepackage(\[.*?\])?\{.*?\}/g, '');
  html = html.replace(/\\geometry\{.*?\}/g, '');

  // Handle document environment
  html = html.replace(/\\begin\{document\}/g, '');
  html = html.replace(/\\end\{document\}/g, '');

  // Handle comments (but keep policy section markers visible)
  html = html.replace(/% ={10,}.*?={10,}/g, (match) => `<div style="color: #6366f1; font-size: 0.75rem; margin: 1rem 0; padding: 0.5rem; background: #eef2ff; border-radius: 4px;">${match.replace(/%/g, '').trim()}</div>`);
  html = html.replace(/^%(?!.*={5,}).*$/gm, '');

  // Handle placeholders - highlight them and add data attribute for position tracking
  html = html.replace(/\{\{([^}]+)\}\}/g, '<span class="latex-placeholder" data-placeholder-id="$1" style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.85em;">{{$1}}</span>');

  // Handle text formatting
  html = html.replace(/\\textbf\{([^}]*)\}/g, '<strong>$1</strong>');
  html = html.replace(/\\textit\{([^}]*)\}/g, '<em>$1</em>');
  html = html.replace(/\\underline\{([^}]*)\}/g, '<span style="text-decoration: underline;">$1</span>');
  html = html.replace(/\\emph\{([^}]*)\}/g, '<em>$1</em>');

  // Handle sizes
  html = html.replace(/\\Large\s*/g, '<span style="font-size: 1.25em;">');
  html = html.replace(/\\large\s*/g, '<span style="font-size: 1.1em;">');
  html = html.replace(/\\LARGE\s*/g, '<span style="font-size: 1.5em;">');
  html = html.replace(/\\huge\s*/g, '<span style="font-size: 2em;">');

  // Handle sections
  html = html.replace(/\\section\*?\{([^}]*)\}/g, '<h2 style="font-size: 1.25rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">$1</h2>');
  html = html.replace(/\\subsection\*?\{([^}]*)\}/g, '<h3 style="font-size: 1.1rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem;">$1</h3>');

  // Handle center environment
  html = html.replace(/\\begin\{center\}/g, '<div style="text-align: center;">');
  html = html.replace(/\\end\{center\}/g, '</div>');

  // Handle itemize environment
  html = html.replace(/\\begin\{itemize\}/g, '<ul style="list-style-type: disc; margin-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem;">');
  html = html.replace(/\\end\{itemize\}/g, '</ul>');
  html = html.replace(/\\begin\{enumerate\}/g, '<ol style="list-style-type: decimal; margin-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem;">');
  html = html.replace(/\\end\{enumerate\}/g, '</ol>');
  html = html.replace(/\\item\s*/g, '<li>');

  // Handle tabular environment (simplified)
  html = html.replace(/\\begin\{tabular\}\{[^}]*\}/g, '<table style="width: 100%; border-collapse: collapse; margin-top: 1rem; margin-bottom: 1rem;">');
  html = html.replace(/\\end\{tabular\}/g, '</table>');
  html = html.replace(/\\\\/g, '</td></tr><tr><td>');
  html = html.replace(/&/g, '</td><td>');

  // Handle spacing
  html = html.replace(/\\vspace\{[^}]*\}/g, '<div style="margin-top: 1rem; margin-bottom: 1rem;"></div>');
  html = html.replace(/\\hspace\{[^}]*\}/g, '<span style="display: inline-block; width: 100px;"></span>');
  html = html.replace(/\\hfill/g, '<span style="flex: 1;"></span>');
  html = html.replace(/\\\\(\[.*?\])?/g, '<br/>');
  html = html.replace(/\\newline/g, '<br/>');
  html = html.replace(/\\par/g, '<br/><br/>');

  // Handle special characters
  html = html.replace(/\\&/g, '&amp;');
  html = html.replace(/\\%/g, '%');
  html = html.replace(/\\\$/g, '$');
  html = html.replace(/\\_/g, '_');
  html = html.replace(/\\#/g, '#');

  // Clean up multiple newlines
  html = html.replace(/\n\n+/g, '<br/><br/>');
  html = html.replace(/\n/g, ' ');

  // Render any math expressions with KaTeX
  html = html.replace(/\$([^$]+)\$/g, (match, math) => {
    try {
      return katex.renderToString(math, { throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  html = html.replace(/\\\[([^\]]+)\\\]/g, (match, math) => {
    try {
      return `<div style="margin-top: 1rem; margin-bottom: 1rem; text-align: center;">${katex.renderToString(math, { throwOnError: false, displayMode: true })}</div>`;
    } catch (e) {
      return match;
    }
  });

  return html;
};

// Extract placeholders from LaTeX content
const extractPlaceholders = (latex) => {
  const matches = latex.match(/\{\{([^}]+)\}\}/g) || [];
  return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
};

/**
 * LaTeX Editor Component with placeholder support
 */
const LatexEditor = forwardRef(({
  value = '',
  onChange,
  onPdfGenerated,
  readOnly = false,
  showPolicySection = false,
  fullScreen = false,
  className,
}, ref) => {
  const [latexContent, setLatexContent] = useState(value || DEFAULT_LATEX_TEMPLATE);
  const viewMode = 'split'; // Always split view
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef(null);
  const editorRef = useRef(null);

  // Expose generatePdf method to parent via ref
  useImperativeHandle(ref, () => ({
    generatePdf: () => generatePdf(),
    getContent: () => latexContent,
    getPlaceholders: () => extractPlaceholders(latexContent),
  }));

  useEffect(() => {
    onChange?.(latexContent);
  }, [latexContent, onChange]);

  useEffect(() => {
    if (value && value !== latexContent) {
      setLatexContent(value);
    }
  }, [value]);

  const handleEditorChange = useCallback((newValue) => {
    if (!readOnly) {
      setLatexContent(newValue || '');
    }
  }, [readOnly]);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  const insertPlaceholder = (placeholder) => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range: selection, text: placeholder, forceMoveMarkers: true };
      editorRef.current.executeEdits("insert-placeholder", [op]);
      editorRef.current.focus();
    }
  };

  const insertPolicySection = () => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      const lastLine = model.getLineCount();
      const lastColumn = model.getLineMaxColumn(lastLine);
      const range = { startLineNumber: lastLine, startColumn: lastColumn, endLineNumber: lastLine, endColumn: lastColumn };
      const op = { identifier: { major: 1, minor: 1 }, range, text: '\n' + POLICY_SECTION_MARKER, forceMoveMarkers: true };
      editorRef.current.executeEdits("insert-policy", [op]);
      editorRef.current.focus();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(latexContent);
      setCopied(true);
      toast.success('LaTeX copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleReset = () => {
    setLatexContent(DEFAULT_LATEX_TEMPLATE);
    toast.success('Reset to default template');
  };

  // Generate PDF from the LaTeX preview
  const generatePdf = async () => {
    setIsGenerating(true);

    try {
      // A4 dimensions at 72 DPI
      const PDF_WIDTH = 595;
      const PDF_HEIGHT = 842;
      const PADDING = 48;
      const CONTENT_HEIGHT = PDF_HEIGHT - (PADDING * 2); // Usable content height per page

      // Convert placeholders to styled spans for PDF (keep data attributes for position tracking)
      let pdfHtml = convertLatexToHtml(latexContent);
      // Replace placeholder text with blank underlined spaces (field overlays will be placed on top)
      pdfHtml = pdfHtml.replace(
        /<span class="latex-placeholder" data-placeholder-id="([^"]+)" style="background: #fef3c7[^"]*">\{\{([^}]+)\}\}<\/span>/g,
        (match, id, placeholderName) => {
          // Calculate approximate width based on placeholder name length
          const minWidth = Math.max(80, placeholderName.length * 8);
          return `<span class="latex-placeholder" data-placeholder-id="${id}" style="display: inline-block; min-width: ${minWidth}px; border-bottom: 1px solid #ccc; height: 16px;">&nbsp;</span>`;
        }
      );

      // First, render the full content to measure its height
      const measureContainer = document.createElement('div');
      measureContainer.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        width: ${PDF_WIDTH}px;
        background: white;
      `;

      const measureContent = document.createElement('div');
      measureContent.style.cssText = `
        width: ${PDF_WIDTH}px;
        padding: ${PADDING}px;
        box-sizing: border-box;
        font-family: 'Times New Roman', Times, serif;
        font-size: 12px;
        line-height: 1.6;
        color: #000;
        background: white;
      `;
      measureContent.innerHTML = pdfHtml;
      measureContainer.appendChild(measureContent);
      document.body.appendChild(measureContainer);

      await document.fonts.ready;

      // Measure total content height
      const totalHeight = measureContent.scrollHeight;
      const numPages = Math.max(1, Math.ceil(totalHeight / PDF_HEIGHT));

      // Extract placeholder positions from the full content
      const placeholderPositions = {};
      const placeholderElements = measureContainer.querySelectorAll('.latex-placeholder');
      const measureRect = measureContent.getBoundingClientRect();

      placeholderElements.forEach((el) => {
        const placeholderId = el.getAttribute('data-placeholder-id');
        if (placeholderId) {
          const rect = el.getBoundingClientRect();
          const relativeY = rect.top - measureRect.top;
          const pageNum = Math.floor(relativeY / PDF_HEIGHT) + 1;
          const yOnPage = relativeY % PDF_HEIGHT;

          placeholderPositions[placeholderId] = {
            x: rect.left - measureRect.left,
            y: yOnPage,
            width: rect.width,
            height: rect.height,
            page: pageNum,
          };
        }
      });

      document.body.removeChild(measureContainer);

      // Now generate PDF with multiple pages
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [PDF_WIDTH, PDF_HEIGHT],
      });

      let thumbnailData = null;

      // Generate each page
      for (let pageNum = 0; pageNum < numPages; pageNum++) {
        // Create container for this page
        const pageContainer = document.createElement('div');
        pageContainer.style.cssText = `
          position: absolute;
          left: -9999px;
          top: 0;
          width: ${PDF_WIDTH}px;
          height: ${PDF_HEIGHT}px;
          background: white;
          overflow: hidden;
        `;

        const pageContent = document.createElement('div');
        pageContent.style.cssText = `
          width: ${PDF_WIDTH}px;
          padding: ${PADDING}px;
          box-sizing: border-box;
          font-family: 'Times New Roman', Times, serif;
          font-size: 12px;
          line-height: 1.6;
          color: #000;
          background: white;
          position: relative;
          top: -${pageNum * PDF_HEIGHT}px;
        `;
        pageContent.innerHTML = pdfHtml;
        pageContainer.appendChild(pageContent);
        document.body.appendChild(pageContainer);

        await document.fonts.ready;

        const canvas = await html2canvas(pageContainer, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: PDF_WIDTH,
          height: PDF_HEIGHT,
          windowWidth: PDF_WIDTH,
          windowHeight: PDF_HEIGHT,
        });

        document.body.removeChild(pageContainer);

        // Add page to PDF
        if (pageNum > 0) {
          pdf.addPage([PDF_WIDTH, PDF_HEIGHT]);
        }

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, PDF_WIDTH, PDF_HEIGHT);

        // Generate thumbnail from first page
        if (pageNum === 0) {
          const thumbnailCanvas = document.createElement('canvas');
          thumbnailCanvas.width = 200;
          thumbnailCanvas.height = 283;
          const ctx = thumbnailCanvas.getContext('2d');
          ctx.drawImage(canvas, 0, 0, 200, 283);
          thumbnailData = thumbnailCanvas.toDataURL('image/png');
        }
      }

      const pdfBase64 = pdf.output('datauristring');

      const pdfData = {
        data: pdfBase64,
        type: 'application/pdf',
        thumbnail: thumbnailData,
        numPages: numPages,
        placeholderPositions, // Include positions with page numbers for field overlay placement
      };

      onPdfGenerated?.(pdfData);

      return pdfData;
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const previewHtml = convertLatexToHtml(latexContent);
  const placeholders = extractPlaceholders(latexContent);

  return (
    <div className={cn(
      'flex flex-col bg-white overflow-hidden',
      !fullScreen && 'rounded-xl border border-slate-200',
      fullScreen && 'h-full',
      isFullscreen && 'fixed inset-4 z-50 shadow-2xl rounded-xl border border-slate-200',
      className
    )}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">LaTeX Editor</span>
          {placeholders.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {placeholders.length} placeholders
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!readOnly && (
            <>
              <div className="w-px h-5 bg-slate-200 mx-1" />

              {/* Insert Placeholder Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 gap-1.5">
                    <Variable className="w-3.5 h-3.5" />
                    <span className="text-xs">Insert Field</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-auto">
                  {Object.entries(AVAILABLE_PLACEHOLDERS).map(([key, category]) => (
                    <React.Fragment key={key}>
                      <DropdownMenuLabel className="text-xs text-slate-500">{category.label}</DropdownMenuLabel>
                      {category.fields.map((field) => (
                        <DropdownMenuItem
                          key={field.id}
                          onClick={() => insertPlaceholder(field.placeholder)}
                          className="text-xs"
                        >
                          <span className="flex-1">{field.label}</span>
                          <code className="text-[10px] bg-slate-100 px-1 rounded">{field.placeholder}</code>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </React.Fragment>
                  ))}
                  <DropdownMenuItem onClick={insertPolicySection} className="text-xs text-indigo-600">
                    <Plus className="w-3 h-3 mr-2" />
                    Add Policy Section Marker
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Generate PDF Button */}
              <Button
                variant="default"
                size="sm"
                className="h-7 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                onClick={generatePdf}
                disabled={isGenerating}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="text-xs">{isGenerating ? 'Generating...' : 'Generate PDF'}</span>
              </Button>
            </>
          )}

          <div className="w-px h-5 bg-slate-200 mx-1" />

          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleCopy}>
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          {!readOnly && (
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleReset}>
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
          {!fullScreen && (
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Editor Content - Always Split View */}
      <div className={cn(
        'flex flex-1 overflow-hidden',
        fullScreen ? 'h-full' : (isFullscreen ? 'h-[calc(100%-48px)]' : 'h-[600px]')
      )}>
        {/* Code Editor */}
        <div className="flex-1 overflow-hidden border-r border-slate-200">
          <Editor
            height="100%"
            defaultLanguage="latex"
            value={latexContent}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme="vs-light"
            options={{
              minimap: { enabled: fullScreen },
              fontSize: 13,
              lineNumbers: 'on',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              padding: { top: 16 },
              readOnly: readOnly,
            }}
          />
        </div>

        {/* Preview - Always visible */}
        <div className="flex-1 overflow-auto bg-slate-100 max-w-[50%]">
          <div className="p-6 flex justify-center">
            <div
              ref={previewRef}
              className="bg-white shadow-lg border border-slate-200 font-serif text-sm leading-relaxed"
              style={{ width: '100%', maxWidth: '595px', minHeight: '842px', padding: '48px' }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>

      {/* Placeholder Legend */}
      {placeholders.length > 0 && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-amber-700 font-medium">Placeholders:</span>
            {placeholders.slice(0, 8).map((p) => (
              <code key={p} className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                {`{{${p}}}`}
              </code>
            ))}
            {placeholders.length > 8 && (
              <span className="text-xs text-amber-600">+{placeholders.length - 8} more</span>
            )}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            <span className="text-sm text-slate-600">Generating PDF...</span>
          </div>
        </div>
      )}
    </div>
  );
});

LatexEditor.displayName = 'LatexEditor';

export default LatexEditor;
export { convertLatexToHtml, DEFAULT_LATEX_TEMPLATE, AVAILABLE_PLACEHOLDERS, extractPlaceholders, POLICY_SECTION_MARKER };
