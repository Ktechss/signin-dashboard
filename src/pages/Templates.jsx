import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getTemplates } from '@/utils/templateStorage';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Upload, 
  LayoutGrid, 
  List,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplateCard from '@/components/templates/TemplateCard';
import EmptyState from '@/components/ui-custom/EmptyState';

// No more mock data - only user-created templates

export default function Templates() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userTemplates, setUserTemplates] = useState([]);

  // Load templates from localStorage
  useEffect(() => {
    const savedTemplates = getTemplates();
    setUserTemplates(savedTemplates);
  }, []);

  const filteredTemplates = userTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Templates</h1>
            <p className="text-slate-500 mt-1">Create and manage your document templates.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Link to={createPageUrl('TemplateBuilder')}>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4" />
                Create Template
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Tabs & Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Tabs defaultValue="all" className="flex-1">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="all" onClick={() => setStatusFilter('all')}>All</TabsTrigger>
              <TabsTrigger value="active" onClick={() => setStatusFilter('active')}>Active</TabsTrigger>
              <TabsTrigger value="draft" onClick={() => setStatusFilter('draft')}>Drafts</TabsTrigger>
              <TabsTrigger value="archived" onClick={() => setStatusFilter('archived')}>Archived</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search templates..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="it">IT</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 w-8 p-0 ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <EmptyState 
            title="No templates found"
            description="Create your first template to start generating contracts."
            actionLabel="Create Template"
            onAction={() => {}}
          />
        ) : (
          <motion.div 
            className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AnimatePresence>
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={createPageUrl(`TemplateDetail?id=${template.id}`)}>
                    <TemplateCard template={template} />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}