import { motion, AnimatePresence } from 'framer-motion';
import { GitMerge, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Ticket } from '@/data/mockData';
import { SLAIndicator } from './SLAIndicator';
import { SeverityBadge, TierBadge, CategoryBadge, StatusBadge } from './TicketBadges';
import { Skeleton } from '@/components/ui/skeleton';

interface TicketTableProps {
  tickets: Ticket[];
  selectedTicketId: string | null;
  onSelectTicket: (ticket: Ticket) => void;
  isLoading?: boolean;
}

export const TicketTable = ({ tickets, selectedTicketId, onSelectTicket, isLoading }: TicketTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-card">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">📭</span>
        </div>
        <h3 className="text-lg font-semibold mb-1">No tickets found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {/* Table Header */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
        <div className="col-span-1">ID</div>
        <div className="col-span-3">Subject</div>
        <div className="col-span-2">Customer</div>
        <div className="col-span-1">Tier</div>
        <div className="col-span-1">Category</div>
        <div className="col-span-1">Severity</div>
        <div className="col-span-2">SLA</div>
        <div className="col-span-1">Status</div>
      </div>

      {/* Ticket rows */}
      <AnimatePresence mode="popLayout">
        {tickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ delay: index * 0.02 }}
            onClick={() => onSelectTicket(ticket)}
            className={cn(
              'grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 p-4 cursor-pointer transition-all duration-200',
              'hover:bg-muted/50',
              selectedTicketId === ticket.id && 'bg-muted/70 border-l-2 border-foreground'
            )}
          >
            {/* ID */}
            <div className="lg:col-span-1">
              <span className="font-mono text-sm font-medium">{ticket.id}</span>
            </div>

            {/* Subject */}
            <div className="lg:col-span-3">
              <p className="text-sm font-medium line-clamp-1">{ticket.subject}</p>
              {ticket.dedupStatus && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <GitMerge className="h-3 w-3" />
                  <span>{ticket.dedupStatus}</span>
                </div>
              )}
            </div>

            {/* Customer */}
            <div className="lg:col-span-2 flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{ticket.customerName}</p>
                <p className="text-xs text-muted-foreground truncate">{ticket.customerEmail}</p>
              </div>
            </div>

            {/* Tier */}
            <div className="lg:col-span-1 flex items-center">
              <TierBadge tier={ticket.tier} />
            </div>

            {/* Category */}
            <div className="lg:col-span-1 flex items-center">
              <CategoryBadge category={ticket.category} />
            </div>

            {/* Severity */}
            <div className="lg:col-span-1 flex items-center">
              <SeverityBadge severity={ticket.severity} />
            </div>

            {/* SLA */}
            <div className="lg:col-span-2 flex items-center">
              <SLAIndicator 
                timeRemaining={ticket.slaTimeRemaining} 
                status={ticket.slaStatus}
                variant="compact"
              />
            </div>

            {/* Status */}
            <div className="lg:col-span-1 flex items-center">
              <StatusBadge status={ticket.status} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
