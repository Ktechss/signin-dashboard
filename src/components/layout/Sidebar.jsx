import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard, 
  FileText, 
  Layers, 
  PenTool, 
  BarChart3, 
  Bell, 
  Settings, 
  Users, 
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: 'Dashboard' },
  { 
    name: 'Current', 
    icon: FileText, 
    children: [
      { name: 'Contracts', href: 'Contracts' },
      { name: 'Journeys', href: 'Journeys' },
    ]
  },
  { name: 'Templates', icon: Layers, href: 'Templates' },
  { name: 'Sign Contract', icon: PenTool, href: 'SignContract' },
];

export default function Sidebar({ currentPage, isAdmin = true }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState(['Current']);
  
  const toggleSection = (name) => {
    setOpenSections(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };
  
  const NavItem = ({ item, isChild = false }) => {
    if (item.adminOnly && !isAdmin) return null;
    
    const isActive = currentPage === item.href || 
      (item.children?.some(child => child.href === currentPage));
    
    if (item.children) {
      const isOpen = openSections.includes(item.name);
      return (
        <Collapsible open={isOpen} onOpenChange={() => toggleSection(item.name)}>
          <CollapsibleTrigger asChild>
            <button className={cn(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}>
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                {!collapsed && <span>{item.name}</span>}
              </div>
              {!collapsed && (
                <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-8 mt-1 space-y-1">
              {item.children.map(child => (
                <NavItem key={child.name} item={child} isChild />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }
    
    return (
      <Link
        to={createPageUrl(item.href)}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isChild && 'py-2',
          currentPage === item.href 
            ? 'bg-indigo-50 text-indigo-700' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        )}
      >
        <div className="flex items-center gap-3">
          {!isChild && <item.icon className="w-5 h-5" />}
          {(!collapsed || isChild) && <span>{item.name}</span>}
        </div>
        {item.badge && !collapsed && (
          <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };
  
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
          <PenTool className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-semibold text-slate-900">SignFlow</h1>
            <p className="text-xs text-slate-400">Document Signing</p>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map(item => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>
      
      {/* User */}
      <div className="p-3 border-t border-slate-100">
        <div className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer',
          collapsed && 'justify-center'
        )}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
            JD
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">John Doe</p>
              <p className="text-xs text-slate-400 truncate">Admin</p>
            </div>
          )}
          {!collapsed && <LogOut className="w-4 h-4 text-slate-400" />}
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      {/* Mobile Toggle */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>
      
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform lg:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>
      
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}