import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Search,
  BarChart3,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  PenTool,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  Signature,
  Layers,
  Users,
  Key,
  ClipboardList,
  CreditCard,
  MoreVertical,
  Plus,
  Library,
  Languages,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserInitials } from '@/utils/userStorage';

// Super Admin (ICP) Platform Navigation
const platformNavItems = [
  { id: 'search', labelKey: 'nav.governmentSearch', icon: Search, href: 'GovernmentSearch' },
  { id: 'analytics', labelKey: 'nav.analytics', icon: BarChart3, href: 'PlatformAnalytics' },
  { id: 'blueprints', labelKey: 'nav.blueprintGallery', icon: Library, href: 'BlueprintGallery' },
  {
    id: 'logs',
    labelKey: 'nav.logs',
    icon: FileText,
    children: [
      { id: 'audit', labelKey: 'nav.dashboardAuditLogs', href: 'PlatformAuditLogs' },
      { id: 'errors', labelKey: 'nav.sdkErrorEvents', href: 'SDKErrors' }
    ]
  },
  { id: 'platform-settings', labelKey: 'nav.settings', icon: Settings, href: 'PlatformSettings' },
];

// Client-level Navigation (when a client is selected)
const clientNavItems = [
  { id: 'Overview', labelKey: 'nav.overview', icon: LayoutDashboard, href: 'Dashboard' },
  { id: 'Signing', labelKey: 'nav.signing', icon: Signature, href: 'Current' },
  { id: 'Blueprints', labelKey: 'nav.blueprints', icon: Layers, href: 'Templates' },
  { id: 'UserManagement', labelKey: 'nav.userManagement', icon: Users, href: 'UserManagement' },
  { id: 'APIKeys', labelKey: 'nav.apiKeys', icon: Key, href: 'APIKeys' },
  { id: 'AuditLogs', labelKey: 'nav.auditLogs', icon: ClipboardList, href: 'AuditLogs' },
  { id: 'Billing', labelKey: 'nav.billing', icon: CreditCard, href: 'Billing' },
  { id: 'Settings', labelKey: 'nav.settings', icon: Settings, href: 'Settings' },
];


// Mock clients list - replace with actual data
const clients = [
  { id: 1, name: 'ADCB Bank', abbr: 'AD' },
  { id: 2, name: 'Emirates NBD', abbr: 'EN' },
  { id: 3, name: 'First Abu Dhabi', abbr: 'FA' },
  { id: 4, name: 'Mashreq Bank', abbr: 'MB' },
];

export default function DynamicSidebar({
  currentPage,
  isAdmin = true,
  user,
  onLogout,
  selectedClient,
  onClientSelect,
  onBackToPlatform,
}) {
  const { t } = useTranslation();
  const { language, toggleLanguage, isRTL } = useLanguage();
  const [expandedItems, setExpandedItems] = useState(['logs']);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleExpand = (id) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Super Admin sees platform view, Staff sees client view directly
  const isSuperAdmin = isAdmin;

  // Check if we're in client mode (a client is selected OR user is staff)
  const isClientMode = !!selectedClient || !isSuperAdmin;

  // Theme styles
  const theme = {
    dark: {
      bg: 'bg-[#1a1f2e]',
      text: 'text-white',
      border: 'border-gray-700/50',
      sectionText: 'text-gray-500',
      navActive: 'bg-white/10 text-white',
      navInactive: 'text-gray-400 hover:text-white hover:bg-white/5',
      childActive: 'text-white',
      childInactive: 'text-gray-500 hover:text-gray-300',
      clientBg: 'bg-white/5 border-white/10',
      clientLabel: 'text-gray-400',
      avatarBg: 'bg-gray-700 text-gray-300',
      email: 'text-gray-500',
    },
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-200',
      sectionText: 'text-gray-400',
      navActive: 'bg-slate-100 text-slate-900',
      navInactive: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
      childActive: 'text-slate-900 bg-slate-100',
      childInactive: 'text-gray-500 hover:text-gray-700',
      clientBg: 'bg-gray-50 border-gray-200',
      clientLabel: 'text-gray-500',
      avatarBg: 'bg-gray-200 text-gray-600',
      email: 'text-gray-500',
    }
  };

  const themeStyles = isDarkMode ? theme.dark : theme.light;

  // Get user display info
  const userName = user?.name || 'User';
  const userEmail = user?.email || 'user@signflow.com';
  const userInitials = getUserInitials(userName);

  return (
    <div
      className={cn(
        "w-64 h-screen flex flex-col transition-colors duration-300 sticky top-0 flex-shrink-0",
        themeStyles.bg,
        themeStyles.text
      )}
      style={{
        borderRight: isRTL ? 'none' : '1px solid rgba(107, 114, 128, 0.5)',
        borderLeft: isRTL ? '1px solid rgba(107, 114, 128, 0.5)' : 'none'
      }}
    >
      {/* Logo */}
      <div className={cn("p-4 flex items-center gap-3 border-b", themeStyles.border)}>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", isDarkMode ? "bg-white" : "bg-[#1a1f2e]")}>
          <PenTool className={cn("w-4 h-4", isDarkMode ? "text-[#1a1f2e]" : "text-white")} />
        </div>
        <span className="font-semibold text-sm flex-1">Face Sign</span>
        {/* Language Toggle Button */}
        <button
          onClick={toggleLanguage}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-xs font-bold",
            isDarkMode
              ? "bg-white/10 hover:bg-white/20 text-blue-400"
              : "bg-gray-100 hover:bg-gray-200 text-blue-600"
          )}
          title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
        >
          {language === 'en' ? 'ع' : 'EN'}
        </button>
      </div>

      {/* Back to Platform Button (Only for Super Admin who selected a client) */}
      {isSuperAdmin && selectedClient && (
        <button
          onClick={onBackToPlatform}
          className={cn(
            "mx-4 mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
            themeStyles.navInactive
          )}
        >
          <ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />
          <span>{t('sidebar.backToPlatform')}</span>
        </button>
      )}

      {/* Current Client Context (Only for Super Admin who selected a client) */}
      {isSuperAdmin && selectedClient && (
        <div className={cn("mx-4 mt-3 mb-2 p-3 rounded-lg border", themeStyles.clientBg)}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
              {selectedClient.abbr}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-xs", themeStyles.clientLabel)}>{t('sidebar.client')}</p>
              <p className="text-sm font-medium truncate">{selectedClient.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="px-4 pt-4 pb-2">
        <span className={cn("text-xs uppercase tracking-wider", themeStyles.sectionText)}>
          {isClientMode ? (isSuperAdmin ? t('sidebar.clientMenu') : t('sidebar.navigation')) : t('sidebar.platform')}
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-2 overscroll-contain">
        {isClientMode ? (
          // Client Navigation
          clientNavItems.map((item) => (
            <Link
              key={item.id}
              to={createPageUrl(item.href)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5",
                currentPage === item.href ? themeStyles.navActive : themeStyles.navInactive
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className={cn("flex-1", isRTL ? "text-right" : "text-left")}>{t(item.labelKey)}</span>
            </Link>
          ))
        ) : (
          // Platform Navigation (Super Admin/ICP)
          <>
            {platformNavItems.map((item) => (
              <div key={item.id}>
                {item.children ? (
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5",
                      themeStyles.navInactive
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className={cn("flex-1", isRTL ? "text-right" : "text-left")}>{t(item.labelKey)}</span>
                    {expandedItems.includes(item.id)
                      ? <ChevronDown className="w-4 h-4" />
                      : <ChevronRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
                    }
                  </button>
                ) : (
                  <Link
                    to={createPageUrl(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5",
                      currentPage === item.href ? themeStyles.navActive : themeStyles.navInactive
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className={cn("flex-1", isRTL ? "text-right" : "text-left")}>{t(item.labelKey)}</span>
                  </Link>
                )}

                {item.children && expandedItems.includes(item.id) && (
                  <div className={cn("mt-1 space-y-1 mb-2", isRTL ? "mr-7" : "ml-7")}>
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        to={createPageUrl(child.href)}
                        className={cn(
                          "w-full block px-3 py-2 rounded-lg text-sm transition-colors",
                          isRTL ? "text-right" : "text-left",
                          currentPage === child.href ? themeStyles.childActive : themeStyles.childInactive
                        )}
                      >
                        {t(child.labelKey)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Clients Section */}
            <div className="mt-6 mb-2">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className={cn("text-xs uppercase tracking-wider", themeStyles.sectionText)}>{t('sidebar.clients')}</span>
                <button className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                  isDarkMode ? "border-gray-600 hover:border-gray-400" : "border-gray-300 hover:border-gray-400"
                )}>
                  <Plus className={cn("w-3 h-3", isDarkMode ? "text-gray-400" : "text-gray-500")} />
                </button>
              </div>

              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => onClientSelect?.(client)}
                  className={cn(
                    "w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-all group mb-0.5",
                    themeStyles.navInactive
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-600 group-hover:text-white transition-all",
                    themeStyles.avatarBg
                  )}>
                    {client.abbr}
                  </div>
                  <span className={cn("flex-1 truncate", isRTL ? "text-right" : "text-left")}>{client.name}</span>
                  <MoreVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* User Profile with Theme Toggle */}
      <div className={cn("p-3 border-t", themeStyles.border)}>
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              isDarkMode
                ? "bg-white/10 hover:bg-white/20 text-yellow-400"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            )}
            title={isDarkMode ? t('sidebar.switchToLight') : t('sidebar.switchToDark')}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* User Profile */}
          <div className={cn(
            "flex-1 flex items-center gap-3 px-2 py-2 rounded-lg transition-colors cursor-pointer",
            isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-100"
          )}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-xs font-medium text-white">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className={cn("text-xs truncate", themeStyles.email)}>{userEmail}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              isDarkMode
                ? "hover:bg-white/10 text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            )}
            title={t('sidebar.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
