import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  FileText, 
  Bell, 
  Clock,
  Calendar,
  Copy,
  ExternalLink,
  CheckCircle2,
  Eye,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import Timeline from '@/components/ui-custom/Timeline';

// Mock contract data
const contract = {
  id: 1,
  name: 'Sales Agreement - Acme Corp',
  reference: 'SA-2024-001',
  status: 'in_progress',
  template: 'Sales Agreement Template v2.1',
  documentName: 'sales_agreement_acme.pdf',
  createdBy: 'John Doe',
  createdAt: 'January 15, 2024',
  expiresAt: 'January 22, 2024',
  signedCount: 2,
  totalParties: 3,
};

// Mock linked journeys (separate from parties)
const linkedJourneys = [
  { token: 'TKN-8F2A-X9K1', status: 'authorised', date: 'Jan 16, 2024', device: 'Chrome on Windows' },
  { token: 'TKN-3B7C-M4P2', status: 'authorised', date: 'Jan 17, 2024', device: 'Safari on Mac' },
  { token: 'TKN-1A2B-C3D4', status: 'rejected', date: 'Jan 15, 2024', device: 'Firefox on Linux' },
  { token: 'TKN-5D9E-Q6R3', status: 'pending', date: 'Jan 18, 2024', device: 'Chrome on Android' },
];

const parties = [
  { 
    id: 1, 
    name: 'John Smith', 
    email: 'john@acme.com', 
    role: 'Buyer', 
    status: 'signed', 
    signedAt: 'Jan 16, 2024 at 2:30 PM'
  },
  { 
    id: 2, 
    name: 'Jane Doe', 
    email: 'jane@company.com', 
    role: 'Seller', 
    status: 'signed', 
    signedAt: 'Jan 17, 2024 at 10:15 AM'
  },
  { 
    id: 3, 
    name: 'Bob Wilson', 
    email: 'bob@legal.com', 
    role: 'Witness', 
    status: 'pending', 
    signedAt: null
  },
];

const activityLog = [
  { id: 1, title: 'Contract Created', description: 'Contract was created by John Doe', timestamp: 'Jan 15, 2024 9:00 AM', type: 'info', icon: 'document', metadata: ['Template: Sales Agreement v2.1'] },
  { id: 2, title: 'Invitation Sent', description: 'Email invitation sent to John Smith', timestamp: 'Jan 15, 2024 9:05 AM', type: 'info', icon: 'email' },
  { id: 3, title: 'Document Viewed', description: 'John Smith opened the document', timestamp: 'Jan 16, 2024 2:15 PM', type: 'info', icon: 'view', metadata: ['IP: 192.168.1.1', 'Chrome on Windows'] },
  { id: 4, title: 'Identity Verified', description: 'John Smith passed identity verification', timestamp: 'Jan 16, 2024 2:25 PM', type: 'success', icon: 'verify' },
  { id: 5, title: 'Document Signed', description: 'John Smith signed the document', timestamp: 'Jan 16, 2024 2:30 PM', type: 'success', icon: 'sign', metadata: ['IP: 192.168.1.1', 'Chrome on Windows'] },
  { id: 6, title: 'Document Signed', description: 'Jane Doe signed the document', timestamp: 'Jan 17, 2024 10:15 AM', type: 'success', icon: 'sign' },
  { id: 7, title: 'Reminder Sent', description: 'Reminder email sent to Bob Wilson', timestamp: 'Jan 18, 2024 9:00 AM', type: 'warning', icon: 'email' },
];

export default function ContractDetail() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link to={createPageUrl('Contracts')}>
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <p className="text-sm text-slate-500 font-mono">{contract.reference}</p>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="text-2xl font-bold text-slate-900">{contract.name}</h1>
              <StatusBadge status={contract.status} />
            </div>
          </div>
        </div>
        
        {/* Contract Info & Document Details Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Contract Details - Left */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Contract Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Contract Number
                </span>
                <span className="font-medium text-slate-700 flex items-center gap-1">
                  {contract.reference}
                  <Copy className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Created On
                </span>
                <span className="font-medium text-slate-700">{contract.createdAt}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Signing Expires
                </span>
                <span className="font-medium text-amber-600">{contract.expiresAt}</span>
              </div>
            </div>
          </div>

          {/* Document & Signing Status - Right */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Document & Status</h3>
              <div className="flex items-center gap-2">
                <div className="text-center px-3 py-1.5 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-bold">{contract.signedCount}</span>
                    <span className="text-xs">Signed</span>
                  </div>
                </div>
                <div className="text-center px-3 py-1.5 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-1 text-amber-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold">{contract.totalParties - contract.signedCount}</span>
                    <span className="text-xs">Pending</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Template Used</span>
                <span className="font-medium text-slate-700 text-right max-w-[60%]">{contract.template}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Uploaded Document</span>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-700">{contract.documentName}</span>
                </div>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" className="gap-2 w-full">
                  <Eye className="w-4 h-4" />
                  View Document
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs: Parties, Activity Log, Linked Journeys */}
        <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
          <Tabs defaultValue="parties" className="w-full">
            <div className="border-b border-slate-100 px-5">
              <TabsList className="bg-transparent h-12 p-0 gap-6">
                <TabsTrigger 
                  value="parties" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 pb-3 pt-3"
                >
                  Parties ({parties.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="activity" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 pb-3 pt-3"
                >
                  Activity Log
                </TabsTrigger>
                <TabsTrigger 
                  value="journeys" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 pb-3 pt-3"
                >
                  Linked Journeys ({linkedJourneys.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="parties" className="m-0">
              <div className="divide-y divide-slate-100">
                {parties.map(party => (
                  <div key={party.id} className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                          party.status === 'signed' ? 'bg-emerald-100 text-emerald-700' :
                          party.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {party.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{party.name}</h3>
                          <p className="text-sm text-slate-500">{party.email}</p>
                          <p className="text-xs text-slate-400 mt-1">Role: {party.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={party.status} size="sm" />
                        {party.signedAt && (
                          <p className="text-xs text-slate-400 mt-2">{party.signedAt}</p>
                        )}
                      </div>
                    </div>

                    {party.status === 'pending' && (
                      <div className="mt-3 flex items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Bell className="w-3.5 h-3.5" />
                          Remind
                        </Button>
                        <Button size="sm" variant="ghost" className="gap-1">
                          <Copy className="w-3.5 h-3.5" />
                          Copy Link
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="m-0 p-5">
              <Timeline items={activityLog} />
            </TabsContent>

            <TabsContent value="journeys" className="m-0">
              <div className="divide-y divide-slate-100">
                {linkedJourneys.map((journey) => (
                  <div 
                    key={journey.token}
                    className="flex items-center justify-between p-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                        <Key className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono text-slate-700">
                          {journey.token}
                        </code>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span>{journey.date}</span>
                          <span>•</span>
                          <span>{journey.device}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={journey.status} size="sm" />
                      <Link to={createPageUrl(`JourneyDetail?token=${journey.token}`)}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <ExternalLink className="w-4 h-4" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}