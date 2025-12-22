import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard,
  FileSignature,
  Signature,
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
  X,
  Key,
  ClipboardList,
  CreditCard,
  Cog,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getUserInitials } from '@/utils/userStorage';

// Navigation with permission requirements
const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: 'Dashboard', permission: 'dashboard' },
  { name: 'Signing', icon: Signature, href: 'Current', permission: 'signings' },
  { name: 'Blueprints', icon: Layers, href: 'Templates', permission: 'bluePrints' },
  { name: 'User Management', icon: Users, href: 'UserManagement', permission: 'userManagement', adminOnly: true },
  { name: 'API Keys', icon: Key, href: 'APIKeys', permission: 'apiKeys' },
  { name: 'Audit Logs', icon: ClipboardList, href: 'AuditLogs', permission: 'auditLogs' },
  { name: 'Billing', icon: CreditCard, href: 'Billing', permission: 'billing' },
  { name: 'Settings', icon: Cog, href: 'Settings', permission: 'settings' },
];

export default function Sidebar({ currentPage, isAdmin = true, user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState([]);

  const toggleSection = (name) => {
    setOpenSections(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  // Check if user has permission for a nav item
  const hasPermission = (item) => {
    // Admin has access to everything
    if (isAdmin) return true;

    // Check if it's admin-only
    if (item.adminOnly) return false;

    // Check user permissions
    if (!user?.permissions) return false;
    return user.permissions[item.permission] === true;
  };

  // Filter navigation based on permissions
  const filteredNavigation = navigation.filter(item => hasPermission(item));

  const NavItem = ({ item, isChild = false }) => {
    const isActive = currentPage === item.href ||
      (item.children?.some(child => child.href === currentPage));

    if (item.children) {
      const isOpen = openSections.includes(item.name);
      return (
        <Collapsible open={isOpen} onOpenChange={() => toggleSection(item.name)}>
          <CollapsibleTrigger asChild>
            <button className={cn(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
            ? 'bg-slate-100 text-slate-900'
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

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  // Get user display info
  const userName = user?.name || 'User';
  const userRole = isAdmin ? 'Admin' : 'Staff';
  const userInitials = getUserInitials(userName);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
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
        {filteredNavigation.map(item => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-100">
        <div className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg',
          collapsed && 'justify-center'
        )}>
          <div className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm",
            isAdmin
              ? "bg-gradient-to-br from-indigo-500 to-purple-500"
              : "bg-gradient-to-br from-emerald-500 to-teal-500"
          )}>
            {userInitials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
              <div className="flex items-center gap-1">
                {isAdmin && <Shield className="w-3 h-3 text-indigo-500" />}
                <p className="text-xs text-slate-400 truncate">{userRole}</p>
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={handleLogout}
            className="w-full mt-2 p-2 rounded-lg hover:bg-slate-100 transition-colors flex justify-center"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
          </button>
        )}
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
