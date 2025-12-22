import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Info,
  Settings,
  Check,
  Trash2,
  Eye,
  Send,
  Phone,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const mockNotifications = [
  { id: 1, type: 'error', title: 'Contract Expired', description: 'Sales Agreement SA-2024-001 has expired without all signatures', contractId: 1, timestamp: '5 minutes ago', read: false, priority: 'high' },
  { id: 2, type: 'success', title: 'Signature Completed', description: 'John Smith has signed NDA-2024-089', contractId: 2, timestamp: '15 minutes ago', read: false, priority: 'normal' },
  { id: 3, type: 'warning', title: 'Verification Failed', description: 'Lisa Park failed identity verification for Partnership Agreement', contractId: 4, signingRequestId: 'SR-005', timestamp: '1 hour ago', read: false, priority: 'high' },
  { id: 4, type: 'info', title: 'Reminder Sent', description: 'Automatic reminder sent to Bob Wilson for SA-2024-001', contractId: 1, timestamp: '2 hours ago', read: true, priority: 'normal' },
  { id: 5, type: 'success', title: 'Contract Completed', description: 'All parties have signed NDA - TechStart Inc', contractId: 2, timestamp: '3 hours ago', read: true, priority: 'normal' },
  { id: 6, type: 'warning', title: 'Expiring Soon', description: 'Employment Contract EC-2024-156 expires in 2 days', contractId: 3, timestamp: '5 hours ago', read: true, priority: 'medium' },
  { id: 7, type: 'info', title: 'Document Viewed', description: 'Sarah Miller opened Employment Contract EC-2024-156', contractId: 3, timestamp: '6 hours ago', read: true, priority: 'low' },
  { id: 8, type: 'error', title: 'Signing Failed', description: 'Technical error occurred during signing for VA-2024-012', contractId: 7, timestamp: '1 day ago', read: true, priority: 'high' },
  { id: 9, type: 'success', title: 'Template Activated', description: 'New template "Consulting Agreement" is now active', timestamp: '1 day ago', read: true, priority: 'normal' },
  { id: 10, type: 'info', title: 'New User Added', description: 'Admin added Jane Smith to the team', timestamp: '2 days ago', read: true, priority: 'low' },
];

const typeConfig = {
  success: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  warning: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'critical') return n.type === 'error';
    if (activeTab === 'warnings') return n.type === 'warning';
    if (activeTab === 'success') return n.type === 'success';
    if (activeTab === 'info') return n.type === 'info';
    return true;
  });
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };
  
  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };
  
  const clearAll = () => {
    setNotifications([]);
  };
  
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
              <p className="text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
            <Button variant="outline" onClick={clearAll} disabled={notifications.length === 0}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear all
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="all" className="gap-2">
              All
              <Badge variant="secondary" className="bg-slate-100">{notifications.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="critical" className="gap-2">
              Critical
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                {notifications.filter(n => n.type === 'error').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="warnings" className="gap-2">
              Warnings
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                {notifications.filter(n => n.type === 'warning').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="success">Success</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No notifications</h3>
              <p className="text-sm text-slate-500">You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            filteredNotifications.map(notification => {
              const config = typeConfig[notification.type];
              const Icon = config.icon;
              
              return (
                <div 
                  key={notification.id}
                  className={cn(
                    'bg-white rounded-xl border p-4 transition-all hover:shadow-md cursor-pointer',
                    notification.read ? 'border-slate-200' : 'border-indigo-200 bg-indigo-50/30'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', config.bg)}>
                      <Icon className={cn('w-5 h-5', config.color)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={cn(
                              'font-medium',
                              notification.read ? 'text-slate-700' : 'text-slate-900'
                            )}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">{notification.description}</p>
                          
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-xs text-slate-400">{notification.timestamp}</span>
                            {notification.contractId && (
                              <Link 
                                to={createPageUrl(`ContractDetail?id=${notification.contractId}`)}
                                className="text-xs text-indigo-600 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Contract
                              </Link>
                            )}
                            {notification.signingRequestId && (
                              <span className="text-xs text-slate-500">
                                Request: {notification.signingRequestId}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {notification.type === 'warning' && notification.contractId && (
                            <Button size="sm" variant="outline" className="gap-1" onClick={(e) => e.stopPropagation()}>
                              <Send className="w-3.5 h-3.5" />
                              Remind
                            </Button>
                          )}
                          {notification.type === 'error' && notification.signingRequestId && (
                            <Button size="sm" variant="outline" className="gap-1" onClick={(e) => e.stopPropagation()}>
                              <Phone className="w-3.5 h-3.5" />
                              Contact
                            </Button>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="w-8 h-8">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                <Check className="w-4 h-4 mr-2" />
                                Mark as read
                              </DropdownMenuItem>
                              {notification.contractId && (
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View details
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Notification Settings Hint */}
        <div className="bg-slate-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-700">Notification Preferences</p>
              <p className="text-xs text-slate-500">Customize which notifications you receive</p>
            </div>
          </div>
          <Link to={createPageUrl('Settings')}>
            <Button variant="outline" size="sm">Configure</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}