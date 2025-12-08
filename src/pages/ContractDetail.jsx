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
  Key,
  Users,
  Activity,
  Download,
  Mail,
  Shield,
  AlertCircle
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

// Mock linked signing requests (separate from parties)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Contracts')}>
            <Button variant="ghost" size="sm" className="gap-2 mb-6 -ml-2 hover:bg-slate-100">
              <ArrowLeft className="w-4 h-4" />
              Back to Contracts
            </Button>
          </Link>

          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">{contract.template}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-600">
                        {contract.reference}
                      </code>
                      <Copy className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={contract.status} />
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <Eye className="w-4 h-4" />
                  View Document
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Created</p>
                  <p className="text-sm font-semibold text-slate-900">{contract.createdAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Expires</p>
                  <p className="text-sm font-semibold text-amber-600">{contract.expiresAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Signed</p>
                  <p className="text-sm font-semibold text-emerald-600">{contract.signedCount} of {contract.totalParties}</p>
                </div>
              </div>

              <div className="relative p-4 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500">Template</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">{contract.template}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 flex-shrink-0"
                    onClick={() => {/* View template logic */}}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Parties, Activity Log, Linked Signing Requests */}
        <Tabs defaultValue="parties" className="w-full">
          <TabsList className="bg-slate-100 rounded-xl p-1 gap-1">
            <TabsTrigger
              value="parties"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900 rounded-lg px-4 py-2.5 text-slate-600 text-sm font-medium gap-2"
            >
              <Users className="w-4 h-4" />
              Parties ({parties.length})
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900 rounded-lg px-4 py-2.5 text-slate-600 text-sm font-medium gap-2"
            >
              <Activity className="w-4 h-4" />
              Activity Log
            </TabsTrigger>
            <TabsTrigger
              value="journeys"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900 rounded-lg px-4 py-2.5 text-slate-600 text-sm font-medium gap-2"
            >
              <Key className="w-4 h-4" />
              Signing Requests ({linkedJourneys.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parties" className="m-0 mt-6">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-200">
                {parties.map(party => (
                  <div key={party.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                          party.status === 'signed' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white' :
                          party.status === 'failed' ? 'bg-gradient-to-br from-red-400 to-red-600 text-white' :
                          'bg-gradient-to-br from-slate-300 to-slate-400 text-white'
                        }`}>
                          {party.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Signatory</p>
                              </div>
                              <p className="text-sm font-semibold text-slate-900 mb-1">{party.name}</p>
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <p className="text-xs text-slate-500">{party.email}</p>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-3.5 h-3.5 text-slate-400" />
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Role</p>
                              </div>
                              <p className="text-sm font-semibold text-slate-900">{party.role}</p>
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Signed At</p>
                              </div>
                              {party.signedAt ? (
                                <p className="text-sm font-semibold text-slate-900">{party.signedAt}</p>
                              ) : (
                                <p className="text-sm text-slate-400">Not signed yet</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4 flex-shrink-0 items-end">
                        <StatusBadge status={party.status} />
                        {party.status === 'pending' && (
                          <button className="p-1 hover:bg-slate-100 rounded transition-colors cursor-pointer">
                            <Bell className="w-4 h-4 text-slate-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="m-0 mt-6">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-6">
                <Timeline items={activityLog} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="journeys" className="m-0 mt-6">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  {linkedJourneys.map((journey) => (
                    <div
                      key={journey.token}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                          <Key className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <code className="text-sm bg-white px-3 py-1.5 rounded-lg font-mono text-slate-700 border border-slate-200">
                            {journey.token}
                          </code>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Calendar className="w-3 h-3" />
                              <span>{journey.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Shield className="w-3 h-3" />
                              <span>{journey.device}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={journey.status} />
                        <Link to={createPageUrl(`JourneyDetail?token=${journey.token}`)}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <ExternalLink className="w-4 h-4" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}