import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  CreditCard,
  Download,
  CheckCircle2,
  FileText,
  Users,
  Zap,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock billing data
const currentPlan = {
  name: 'Professional',
  price: 99,
  billingCycle: 'monthly',
  nextBillingDate: '2025-01-19',
  status: 'active',
  usersIncluded: 10,
  contractsIncluded: 500,
  apiCallsIncluded: 50000,
};

const usage = {
  contractsSigned: 245,
  apiCalls: 12456,
  usersActive: 6,
};

const billingHistory = [
  { id: 1, date: '2024-12-19', description: 'Professional Plan - Monthly', amount: 99.00, status: 'paid' },
  { id: 2, date: '2024-11-19', description: 'Professional Plan - Monthly', amount: 99.00, status: 'paid' },
  { id: 3, date: '2024-10-19', description: 'Professional Plan - Monthly', amount: 99.00, status: 'paid' },
  { id: 4, date: '2024-09-19', description: 'Professional Plan - Monthly', amount: 99.00, status: 'paid' },
  { id: 5, date: '2024-08-19', description: 'Professional Plan - Monthly', amount: 99.00, status: 'paid' },
];

const planFeatures = [
  'Up to 10 team members',
  '500 contracts per month',
  '50,000 API calls per month',
  'Advanced analytics',
  'Priority support',
  'Custom branding',
];

export default function Billing() {
  const { t } = useTranslation();
  const { isRTL, language } = useLanguage();
  const contractsPercentage = (usage.contractsSigned / currentPlan.contractsIncluded) * 100;
  const apiCallsPercentage = (usage.apiCalls / currentPlan.apiCallsIncluded) * 100;
  const usersPercentage = (usage.usersActive / currentPlan.usersIncluded) * 100;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDownloadInvoice = (invoiceId) => {
    // TODO: Implement invoice download
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <h1 className="text-2xl font-bold text-slate-900">{t('billing.title')}</h1>
            <p className="text-slate-500 mt-1">{t('billing.subtitle')}</p>
          </div>
          <Button variant="outline" className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CreditCard className="w-4 h-4" />
            {t('billing.updatePaymentMethod')}
          </Button>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{currentPlan.name} Plan</h2>
                  <p className="text-slate-500">
                    ${currentPlan.price}/{currentPlan.billingCycle === 'monthly' ? 'month' : 'year'}
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Next Billing Date</p>
                  <p className="font-semibold text-slate-900">{formatDate(currentPlan.nextBillingDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Users Included</p>
                  <p className="font-semibold text-slate-900">{currentPlan.usersIncluded} users</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Contracts/Month</p>
                  <p className="font-semibold text-slate-900">{currentPlan.contractsIncluded} contracts</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Need more capacity?</p>
              <Button variant="link" className="text-indigo-600 p-0 h-auto">
                Upgrade Plan
              </Button>
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Usage This Period</h2>
            <Badge variant="outline" className="text-slate-500">
              Resets on {formatDate(currentPlan.nextBillingDate)}
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Contracts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Contracts Signed</p>
                <p className="text-sm font-medium text-slate-900">
                  {usage.contractsSigned} / {currentPlan.contractsIncluded}
                </p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    contractsPercentage > 80 ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(contractsPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {(currentPlan.contractsIncluded - usage.contractsSigned)} remaining
              </p>
            </div>

            {/* API Calls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">API Calls</p>
                <p className="text-sm font-medium text-slate-900">
                  {usage.apiCalls.toLocaleString()} / {currentPlan.apiCallsIncluded.toLocaleString()}
                </p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    apiCallsPercentage > 80 ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(apiCallsPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {(currentPlan.apiCallsIncluded - usage.apiCalls).toLocaleString()} remaining
              </p>
            </div>

            {/* Users */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Active Users</p>
                <p className="text-sm font-medium text-slate-900">
                  {usage.usersActive} / {currentPlan.usersIncluded}
                </p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-indigo-600 transition-all"
                  style={{ width: `${Math.min(usersPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {(currentPlan.usersIncluded - usage.usersActive)} slots available
              </p>
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Plan Features</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {planFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-sm text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Billing History</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map(invoice => (
                <TableRow key={invoice.id} className="hover:bg-slate-50">
                  <TableCell className="text-slate-600">
                    {formatDate(invoice.date)}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {invoice.description}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    ${invoice.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        invoice.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }
                    >
                      {invoice.status === 'paid' ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Payment Method Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Method</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-slate-100 rounded flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900">•••• •••• •••• 4242</p>
                <p className="text-sm text-slate-500">Expires 12/2026</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </div>

        {/* Support Info */}
        <div className="bg-slate-100 rounded-xl p-6 text-center">
          <p className="text-slate-600">
            Have questions about billing?{' '}
            <Button variant="link" className="text-indigo-600 p-0 h-auto">
              Contact Support
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
