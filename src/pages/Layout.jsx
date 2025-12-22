import React from 'react';
import DynamicSidebar from '@/components/layout/DynamicSidebar';
import TopBar from '@/components/layout/TopBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const pageConfig = {
  Dashboard: { title: 'Dashboard', subtitle: 'Overview of your signing activity' },
  Contracts: { title: 'Contracts', subtitle: 'Manage and monitor contracts' },
  ContractDetail: { title: 'Contract Details', subtitle: 'View contract information' },
  SigningRequests: { title: 'Signing Requests', subtitle: 'Track individual signing requests' },
  SigningRequestDetail: { title: 'Signing Request Details', subtitle: 'View signing request details' },
  Templates: { title: 'Blueprints', subtitle: 'Manage document blueprints' },
  TemplateDetail: { title: 'Blueprint Details', subtitle: 'View blueprint information' },
  TemplateBuilder: { title: 'Blueprint Builder', subtitle: 'Create a new blueprint' },
  SignContract: { title: 'Sign Contract', subtitle: 'Create a new signing request' },
  GovernmentSearch: { title: 'Government Search', subtitle: 'Search government records' },
  PlatformAnalytics: { title: 'Analytics', subtitle: 'Platform analytics overview' },
  PlatformAuditLogs: { title: 'Audit Logs', subtitle: 'Platform audit logs' },
  BlueprintGallery: { title: 'Blueprint Gallery', subtitle: 'Browse blueprint templates' },
  UserManagement: { title: 'User Management', subtitle: 'Manage team members' },
  APIKeys: { title: 'API Keys', subtitle: 'Manage API keys' },
  AuditLogs: { title: 'Audit Logs', subtitle: 'View audit logs' },
  Billing: { title: 'Billing', subtitle: 'Manage billing' },
  Settings: { title: 'Settings', subtitle: 'Configure settings' },
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
  const { isRTL } = useLanguage();
  const config = pageConfig[currentPageName] || { title: currentPageName, subtitle: '' };

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
    <div className={cn("min-h-screen bg-slate-50 flex", isRTL && "flex-row-reverse")}>
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
