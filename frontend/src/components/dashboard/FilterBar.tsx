import { Filter, ArrowUpDown, Calendar, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Category, Severity, Tier, TicketStatus } from '@/data/mockData';

export interface FilterState {
  category: Category | 'all';
  severity: Severity | 'all';
  tier: Tier | 'all';
  status: TicketStatus | 'all';
  slaStatus: 'all' | 'Safe' | 'Warning' | 'Breached';
  sortBy: 'sla' | 'confidence' | 'severity' | 'newest' | 'oldest';
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export const FilterBar = ({ filters, onFilterChange, activeFiltersCount, onClearFilters }: FilterBarProps) => {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-3 p-4 border-b border-border bg-card/50"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="px-2 py-0.5 text-xs">
            {activeFiltersCount}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.category}
          onValueChange={(value) => updateFilter('category', value as Category | 'all')}
        >
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Billing">Billing</SelectItem>
            <SelectItem value="Tech">Tech</SelectItem>
            <SelectItem value="Shipping">Shipping</SelectItem>
            <SelectItem value="Account">Account</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.severity}
          onValueChange={(value) => updateFilter('severity', value as Severity | 'all')}
        >
          <SelectTrigger className="h-8 w-[100px] text-xs">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="P1">P1 - Critical</SelectItem>
            <SelectItem value="P2">P2 - High</SelectItem>
            <SelectItem value="P3">P3 - Medium</SelectItem>
            <SelectItem value="P4">P4 - Low</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.tier}
          onValueChange={(value) => updateFilter('tier', value as Tier | 'all')}
        >
          <SelectTrigger className="h-8 w-[100px] text-xs">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
            <SelectItem value="Silver">Silver</SelectItem>
            <SelectItem value="Standard">Standard</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => updateFilter('status', value as TicketStatus | 'all')}
        >
          <SelectTrigger className="h-8 w-[110px] text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.slaStatus}
          onValueChange={(value) => updateFilter('slaStatus', value as FilterState['slaStatus'])}
        >
          <SelectTrigger className="h-8 w-[110px] text-xs">
            <SelectValue placeholder="SLA Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All SLA</SelectItem>
            <SelectItem value="Safe">Safe</SelectItem>
            <SelectItem value="Warning">Warning</SelectItem>
            <SelectItem value="Breached">Breached</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <Select
          value={filters.sortBy}
          onValueChange={(value) => updateFilter('sortBy', value as FilterState['sortBy'])}
        >
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sla">SLA Time</SelectItem>
            <SelectItem value="confidence">Confidence</SelectItem>
            <SelectItem value="severity">Severity</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
          <Calendar className="h-3 w-3" />
          Date Range
        </Button>
      </div>

      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-8 text-xs text-muted-foreground hover:text-foreground ml-auto"
        >
          <X className="h-3 w-3 mr-1" />
          Clear all
        </Button>
      )}
    </motion.div>
  );
};
