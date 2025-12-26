import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicSidebar from '@/components/layout/DynamicSidebar';
import TopBar from '@/components/layout/TopBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const pageConfig = {
  Dashboard: { titleKey: 'pages.dashboard.title', subtitleKey: 'pages.dashboard.subtitle' },
  Contracts: { titleKey: 'pages.contracts.title', subtitleKey: 'pages.contracts.subtitle' },
  ContractDetail: { titleKey: 'pages.contractDetail.title', subtitleKey: 'pages.contractDetail.subtitle' },
  SigningRequests: { titleKey: 'pages.signingRequests.title', subtitleKey: 'pages.signingRequests.subtitle' },
  SigningRequestDetail: { titleKey: 'pages.signingRequestDetail.title', subtitleKey: 'pages.signingRequestDetail.subtitle' },
  Templates: { titleKey: 'pages.templates.title', subtitleKey: 'pages.templates.subtitle' },
  TemplateDetail: { titleKey: 'pages.templateDetail.title', subtitleKey: 'pages.templateDetail.subtitle' },
  TemplateBuilder: { titleKey: 'pages.templateBuilder.title', subtitleKey: 'pages.templateBuilder.subtitle' },
  SignContract: { titleKey: 'pages.signContract.title', subtitleKey: 'pages.signContract.subtitle' },
  GovernmentSearch: { titleKey: 'pages.governmentSearch.title', subtitleKey: 'pages.governmentSearch.subtitle' },
  PlatformAnalytics: { titleKey: 'pages.platformAnalytics.title', subtitleKey: 'pages.platformAnalytics.subtitle' },
  PlatformAuditLogs: { titleKey: 'pages.platformAuditLogs.title', subtitleKey: 'pages.platformAuditLogs.subtitle' },
  BlueprintGallery: { titleKey: 'pages.blueprintGallery.title', subtitleKey: 'pages.blueprintGallery.subtitle' },
  UserManagement: { titleKey: 'pages.userManagement.title', subtitleKey: 'pages.userManagement.subtitle' },
  APIKeys: { titleKey: 'pages.apiKeys.title', subtitleKey: 'pages.apiKeys.subtitle' },
  AuditLogs: { titleKey: 'pages.auditLogs.title', subtitleKey: 'pages.auditLogs.subtitle' },
  Billing: { titleKey: 'pages.billing.title', subtitleKey: 'pages.billing.subtitle' },
  Settings: { titleKey: 'pages.settings.title', subtitleKey: 'pages.settings.subtitle' },
  Current: { titleKey: 'signing.title', subtitleKey: 'signing.subtitle' },
};

export default function Layout({
  children,
  currentPageName,
  user,
  onLogout,
  selectedClient,
  onClientSelect,
  onBackToPlatform,
}) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const configKeys = pageConfig[currentPageName] || { titleKey: currentPageName, subtitleKey: '' };
  const config = {
    title: t(configKeys.titleKey),
    subtitle: t(configKeys.subtitleKey)
  };

  // Full-width pages without sidebar layout
  const fullWidthPages = ['TemplateBuilder', 'SignContract'];
  const isFullWidth = fullWidthPages.includes(currentPageName);

  // Determine if user is admin (has access to platform view)
  // root = platform admin, super_admin/admin = also admin roles
  const isAdmin = user?.role === 'root' || user?.role === 'super_admin' || user?.role === 'admin' || user?.isRootUser === true;

  if (isFullWidth) {
    return (
      <div className="min-h-screen bg-slate-50">
        {children}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50 flex layout-container"
    >
      <DynamicSidebar
        currentPage={currentPageName}
        isAdmin={isAdmin}
        user={user}
        onLogout={onLogout}
        selectedClient={selectedClient}
        onClientSelect={onClientSelect}
        onBackToPlatform={onBackToPlatform}
      />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* <TopBar title={config.title} subtitle={config.subtitle} /> */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
