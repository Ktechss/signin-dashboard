import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getTemplates } from '@/utils/templateStorage';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplateCard from '@/components/templates/TemplateCard';
import EmptyState from '@/components/ui-custom/EmptyState';

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userTemplates, setUserTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load templates from API
  useEffect(() => {
    const loadBlueprints = async () => {
      setLoading(true);
      try {
        // Load templates from API
        const templates = await getTemplates();
        setUserTemplates(templates);
      } catch (error) {
        console.error('Error loading blueprints:', error);
        setUserTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    loadBlueprints();
  }, []);

  const filteredTemplates = userTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Blueprints</h1>
            <p className="text-slate-500 mt-1">Create and manage your document blueprints.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={createPageUrl('TemplateBuilder')}>
              <Button className="gap-2 bg-slate-900 hover:bg-slate-800">
                <Plus className="w-4 h-4" />
                Create Blueprint
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
          
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search blueprints..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <EmptyState
            title="No blueprints found"
            description="Create your first blueprint to start generating contracts."
            actionLabel="Create Blueprint"
            onAction={() => {}}
          />
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
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