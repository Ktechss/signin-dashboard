import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  ArrowLeft,
  Copy,
  Globe,
  FileText,
  ChevronDown,
  Eye,
  AlertTriangle,
  Lock,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/ui-custom/StatusBadge';

// Mock signing request detail data
const requestData = {
  requestToken: 'f3f10537-e95d-4ee4-85cd-069a7c0afc10',
  status: 'blocked',
  name: 'Kartik Naik',
  channel: 'Web',
  channelVersion: 'v3.2.0',
  verificationLevel: 'UAEKYC-VL-PF1',
  verificationDescription: "Facial biometric successful using UAEKYC's person face",
  document: 'Emirates_id',
  dob: '01/01/1970',
  createdAt: '05 Nov 2025 17:51:14',
  sandboxMode: true,
  requestType: 'ONBOARDING',
  nationality: 'IND',
  duration: '23.709 s',
  lastUpdatedAt: '05 Nov 2025 17:51:38',
  contractId: 'SA-2024-001',
  contractDbId: 1,
  errorCount: 0,
  warningCount: 3,
  
  // Steps
  steps: [
    { 
      id: 1, 
      name: 'Document Selection', 
      status: 'success', 
      totalTime: '2s',
      attempts: 1,
      icon: 'document'
    },
    { 
      id: 2, 
      name: 'Request Blocked',
      status: 'blocked',
      description: 'User signing request has been blocked due to multiple failed attempts.',
      icon: 'lock'
    },
  ],
  
  // Logs
  logs: [
    { timestamp: '15:46:40', level: 'info', message: 'Signing request started' },
    { timestamp: '15:46:42', level: 'info', message: 'Document selection completed' },
    { timestamp: '15:46:51', level: 'error', message: 'Signing request blocked - multiple failed attempts' },
  ],
  
  // Events
  events: [
    { timestamp: '15:46:40', type: 'REQUEST_STARTED', data: 'Session initialized' },
    { timestamp: '15:46:42', type: 'DOCUMENT_SELECTED', data: 'Emirates_id' },
    { timestamp: '15:46:51', type: 'REQUEST_BLOCKED', data: 'Security policy triggered' },
  ],
  
  // Linked Contract
  contract: {
    id: 1,
    reference: 'SA-2024-001',
    name: 'Sales Agreement - Acme Corp',
    status: 'in_progress',
    createdAt: '05 Nov 2025 15:30:00',
    expiresAt: '12 Nov 2025',
  },
};

export default function SigningRequestDetail() {
  const [expandedStep, setExpandedStep] = useState(null);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('current')}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Signing Request Detail</h1>
              <StatusBadge status={requestData.status} />
            </div>
          </div>
        </div>

        {/* Signing Request Info Card */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
            {/* Left Column */}
            <div className="space-y-5">
              <div>
                <p className="text-sm text-slate-500 mb-1">Name</p>
                <p className="font-medium text-slate-900">{requestData.name}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 uppercase text-xs tracking-wide mb-1">Channel</p>
                <span className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md text-sm">
                  <Globe className="w-4 h-4 text-slate-500" />
                  {requestData.channel} • {requestData.channelVersion}
                </span>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Document</p>
                <span className="inline-flex items-center bg-slate-800 text-white px-3 py-1 rounded-md text-sm">
                  {requestData.document}
                </span>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">DOB</p>
                <p className="font-medium text-slate-900">{requestData.dob}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Created At</p>
                <p className="font-medium text-slate-900">{requestData.createdAt}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">SandBox Mode:</p>
                {requestData.sandboxMode ? (
                  <span className="inline-flex items-center bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-sm font-medium">
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-sm font-medium">
                    No
                  </span>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              <div>
                <p className="text-sm text-slate-500 mb-1">Request Token</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm text-slate-900">{requestData.requestToken}</code>
                  <button
                    onClick={() => copyToClipboard(requestData.requestToken)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <Copy className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Request Type</p>
                <span className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">
                  {requestData.requestType}
                </span>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Nationality</p>
                <p className="font-medium text-slate-900">{requestData.nationality || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Duration</p>
                <p className="font-medium text-slate-900">{requestData.duration}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Last Updated At</p>
                <p className="font-medium text-slate-900">{requestData.lastUpdatedAt}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Request Config</p>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="w-4 h-4" />
                  View Config
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Steps, Logs, Events */}
        <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
          <Tabs defaultValue="steps" className="w-full">
            <div className="flex items-center justify-between border-b border-slate-100 px-5">
              <TabsList className="bg-transparent h-12 p-0 gap-2">
                <TabsTrigger 
                  value="steps" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border data-[state=active]:border-slate-300 rounded-md px-4 py-1.5 gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Steps
                </TabsTrigger>
                <TabsTrigger 
                  value="logs" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border data-[state=active]:border-slate-300 rounded-md px-4 py-1.5 gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Logs
                </TabsTrigger>
                <TabsTrigger 
                  value="events" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border data-[state=active]:border-slate-300 rounded-md px-4 py-1.5 gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Events
                </TabsTrigger>
                <TabsTrigger 
                  value="contract" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border data-[state=active]:border-slate-300 rounded-md px-4 py-1.5 gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Contract
                </TabsTrigger>
              </TabsList>
              
              {requestData.errorCount > 0 && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {requestData.errorCount} Errors
                </div>
              )}
            </div>

            <TabsContent value="steps" className="m-0">
              <div className="divide-y divide-slate-100">
                {requestData.steps.map((step) => (
                  <div key={step.id} className="p-5">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          {step.icon === 'lock' ? (
                            <Lock className="w-5 h-5 text-slate-500" />
                          ) : (
                            <FileText className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{step.name}</h4>
                          {step.totalTime && (
                            <p className="text-sm text-slate-500">Total time: {step.totalTime}</p>
                          )}
                          {step.description && (
                            <p className="text-sm text-slate-500">{step.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <StatusBadge 
                            status={step.status} 
                            showDot={false}
                          />
                          {step.attempts && (
                            <p className="text-xs text-slate-400 mt-1">{step.attempts} attempts</p>
                          )}
                        </div>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${
                          expandedStep === step.id ? 'rotate-180' : ''
                        }`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="logs" className="m-0 p-5">
              <div className="space-y-2 font-mono text-sm">
                {requestData.logs.map((log, index) => (
                  <div key={index} className={`flex items-start gap-3 p-2 rounded ${
                    log.level === 'error' ? 'bg-red-50 text-red-700' :
                    log.level === 'warning' ? 'bg-amber-50 text-amber-700' :
                    'bg-slate-50 text-slate-700'
                  }`}>
                    <span className="text-slate-400">{log.timestamp}</span>
                    <span className={`uppercase text-xs font-medium px-1.5 py-0.5 rounded ${
                      log.level === 'error' ? 'bg-red-100' :
                      log.level === 'warning' ? 'bg-amber-100' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {log.level}
                    </span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="events" className="m-0 p-5">
              <div className="space-y-2">
                {requestData.events.map((event, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-400 font-mono">{event.timestamp}</span>
                    <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {event.type}
                    </span>
                    <span className="text-sm text-slate-600">{event.data}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contract" className="m-0 p-5">
              {requestData.contract ? (
                <div className="bg-slate-50 rounded-lg p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Contract Reference</p>
                        <p className="font-mono text-sm font-medium text-slate-900">{requestData.contract.reference}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Contract Name</p>
                        <p className="font-medium text-slate-900">{requestData.contract.name}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Status</p>
                          <StatusBadge status={requestData.contract.status} size="sm" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Created</p>
                          <p className="text-sm text-slate-700">{requestData.contract.createdAt}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Expires</p>
                          <p className="text-sm text-amber-600">{requestData.contract.expiresAt}</p>
                        </div>
                      </div>
                    </div>
                    <Link to={createPageUrl(`ContractDetail?id=${requestData.contract.id}`)}>
                      <Button variant="outline" className="gap-2">
                        <ExternalLink className="w-4 h-4" />
                        View Contract
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p>No contract linked to this signing request</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}