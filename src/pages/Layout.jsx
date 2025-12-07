
import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

const pageConfig = {
  Dashboard: { title: 'Dashboard', subtitle: 'Overview of your signing activity' },
  Contracts: { title: 'Contracts', subtitle: 'Manage and monitor contracts' },
  ContractDetail: { title: 'Contract Details', subtitle: 'View contract information' },
  Journeys: { title: 'Journeys', subtitle: 'Track individual signing journeys' },
  JourneyDetail: { title: 'Journey Details', subtitle: 'View verification journey' },
  Templates: { title: 'Blueprints', subtitle: 'Manage document blueprints' },
  TemplateDetail: { title: 'Blueprint Details', subtitle: 'View blueprint information' },
  TemplateBuilder: { title: 'Blueprint Builder', subtitle: 'Create a new blueprint' },
  SignContract: { title: 'Sign Contract', subtitle: 'Create a new signing request' },
};

export default function Layout({ children, currentPageName }) {
  const config = pageConfig[currentPageName] || { title: currentPageName, subtitle: '' };
  
  // Full-width pages without sidebar layout
  const fullWidthPages = ['TemplateBuilder', 'SignContract'];
  const isFullWidth = fullWidthPages.includes(currentPageName);
  
  if (isFullWidth) {
    return (
      <div className="min-h-screen bg-slate-50">
        {children}
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentPage={currentPageName} isAdmin={true} />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* <TopBar title={config.title} subtitle={config.subtitle} /> */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
