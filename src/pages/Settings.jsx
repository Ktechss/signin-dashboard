import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Key,
  Mail,
  Phone,
  Building,
  Save,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState('system');
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'company', label: 'Company', icon: Building },
  ];
  
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your account and preferences.</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    activeTab === tab.id 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
                  <p className="text-sm text-slate-500">Update your personal details and contact information.</p>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold">
                    JD
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Photo</Button>
                    <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john.doe@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" defaultValue="+1 234 567 8900" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" placeholder="Tell us about yourself..." rows={3} />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Notification Preferences</h2>
                  <p className="text-sm text-slate-500">Choose what notifications you receive and how.</p>
                </div>
                
                <Separator />
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-slate-900 mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { id: 'email_signatures', label: 'Signature Completed', description: 'When someone signs a document' },
                        { id: 'email_expiring', label: 'Contracts Expiring', description: 'Reminder before contracts expire' },
                        { id: 'email_failed', label: 'Verification Failed', description: 'When identity verification fails' },
                        { id: 'email_reminders', label: 'Pending Reminders', description: 'Daily digest of pending signatures' },
                      ].map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-700">{item.label}</p>
                            <p className="text-sm text-slate-500">{item.description}</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium text-slate-900 mb-4">Push Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { id: 'push_signatures', label: 'Real-time Signatures', description: 'Instant notification when signed' },
                        { id: 'push_urgent', label: 'Urgent Alerts', description: 'Critical issues requiring attention' },
                      ].map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-700">{item.label}</p>
                            <p className="text-sm text-slate-500">{item.description}</p>
                          </div>
                          <Switch defaultChecked={item.id === 'push_urgent'} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Password</h2>
                    <p className="text-sm text-slate-500">Update your password regularly to keep your account secure.</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                  
                  <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Key className="w-4 h-4" />
                    Update Password
                  </Button>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Two-Factor Authentication</h2>
                    <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-700">Enable 2FA</p>
                      <p className="text-sm text-slate-500">Require a verification code when signing in</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Active Sessions</h2>
                    <p className="text-sm text-slate-500">Manage your active sessions across devices.</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    {[
                      { device: 'Chrome on Windows', location: 'New York, US', current: true, lastActive: 'Now' },
                      { device: 'Safari on iPhone', location: 'New York, US', current: false, lastActive: '2 hours ago' },
                    ].map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-slate-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-700">{session.device}</p>
                              {session.current && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">Current</span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">{session.location} • {session.lastActive}</p>
                          </div>
                        </div>
                        {!session.current && (
                          <Button variant="ghost" size="sm" className="text-red-600">Revoke</Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'appearance' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Appearance</h2>
                  <p className="text-sm text-slate-500">Customize how the app looks and feels.</p>
                </div>
                
                <Separator />
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-slate-900 mb-4">Theme</h3>
                    <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'system', label: 'System', icon: Monitor },
                      ].map(item => (
                        <div key={item.value}>
                          <RadioGroupItem
                            value={item.value}
                            id={item.value}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={item.value}
                            className={cn(
                              'flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-colors',
                              theme === item.value 
                                ? 'border-indigo-500 bg-indigo-50' 
                                : 'border-slate-200 hover:bg-slate-50'
                            )}
                          >
                            <item.icon className={cn(
                              'w-6 h-6 mb-2',
                              theme === item.value ? 'text-indigo-600' : 'text-slate-400'
                            )} />
                            <span className={theme === item.value ? 'text-indigo-700 font-medium' : 'text-slate-600'}>
                              {item.label}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium text-slate-900 mb-4">Language & Region</h3>
                    <div className="grid grid-cols-2 gap-4 max-w-md">
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select defaultValue="en">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Timezone</Label>
                        <Select defaultValue="est">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="est">Eastern Time (ET)</SelectItem>
                            <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                            <SelectItem value="utc">UTC</SelectItem>
                            <SelectItem value="gmt">GMT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'company' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Company Information</h2>
                  <p className="text-sm text-slate-500">Manage your organization's details.</p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" defaultValue="Acme Corporation" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select defaultValue="technology">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" defaultValue="https://acme.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select defaultValue="50-200">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="50-200">50-200 employees</SelectItem>
                        <SelectItem value="200+">200+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" defaultValue="123 Business Ave, Suite 100&#10;New York, NY 10001" rows={2} />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}