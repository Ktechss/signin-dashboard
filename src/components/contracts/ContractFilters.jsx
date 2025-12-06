import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  X, 
  LayoutGrid, 
  List,
  SlidersHorizontal 
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function ContractFilters({ 
  filters, 
  onFiltersChange, 
  viewMode, 
  onViewModeChange,
  activeFiltersCount = 0,
  className 
}) {
  const [dateRange, setDateRange] = React.useState({ from: null, to: null });
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Top Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by name, reference, party..."
            className="pl-10"
            value={filters?.search || ''}
            onChange={(e) => onFiltersChange?.({ ...filters, search: e.target.value })}
          />
        </div>
        
        {/* Quick Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <Select 
            value={filters?.status || 'all'}
            onValueChange={(value) => onFiltersChange?.({ ...filters, status: value })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="signed">Signed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={filters?.template || 'all'}
            onValueChange={(value) => onFiltersChange?.({ ...filters, template: value })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              <SelectItem value="nda">NDA</SelectItem>
              <SelectItem value="sales">Sales Agreement</SelectItem>
              <SelectItem value="employment">Employment Contract</SelectItem>
              <SelectItem value="partnership">Partnership Agreement</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                More Filters
                {activeFiltersCount > 0 && (
                  <Badge className="bg-indigo-600 text-white text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Advanced Filters</h4>
                
                <div className="space-y-2">
                  <label className="text-sm text-slate-500">Priority</label>
                  <Select 
                    value={filters?.priority || 'all'}
                    onValueChange={(value) => onFiltersChange?.({ ...filters, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-slate-500">Assigned To</label>
                  <Select 
                    value={filters?.assignedTo || 'all'}
                    onValueChange={(value) => onFiltersChange?.({ ...filters, assignedTo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Anyone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Anyone</SelectItem>
                      <SelectItem value="me">Assigned to me</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-slate-500">Tags</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tags" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="legal">Legal Review</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={() => onFiltersChange?.({})}>
                    Clear All
                  </Button>
                  <Button size="sm">Apply Filters</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn('h-8 w-8 p-0', viewMode === 'grid' && 'bg-white shadow-sm')}
            onClick={() => onViewModeChange?.('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn('h-8 w-8 p-0', viewMode === 'list' && 'bg-white shadow-sm')}
            onClick={() => onViewModeChange?.('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Sort */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-700">24</span> contracts
        </p>
        <Select defaultValue="newest">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name_asc">Name A–Z</SelectItem>
            <SelectItem value="name_desc">Name Z–A</SelectItem>
            <SelectItem value="progress">Progress %</SelectItem>
            <SelectItem value="expiring">Expiring Soon</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}