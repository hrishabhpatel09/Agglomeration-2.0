import { motion } from 'framer-motion';
import { Layers, Link2, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockTickets } from '@/data/mockData';
import { SeverityBadge, TierBadge } from './TicketBadges';
import { SLAIndicator } from './SLAIndicator';

interface MasterTicket {
  id: string;
  subject: string;
  mergedTickets: string[];
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  tier: 'Gold' | 'Silver' | 'Standard';
  status: string;
  slaTimeRemaining: number;
  slaStatus: 'Safe' | 'Warning' | 'Breached';
}

// Generate master tickets from mock data
const masterTickets: MasterTicket[] = [
  {
    id: 'MT-1021',
    subject: 'Payment Processing Issues - Multiple Reports',
    mergedTickets: ['TKT-1234', 'TKT-1238'],
    severity: 'P1',
    tier: 'Gold',
    status: 'Open',
    slaTimeRemaining: 25,
    slaStatus: 'Warning',
  },
  {
    id: 'MT-1022',
    subject: 'Shipping Delays - West Coast Region',
    mergedTickets: ['TKT-1236', 'TKT-1241'],
    severity: 'P2',
    tier: 'Silver',
    status: 'Open',
    slaTimeRemaining: 120,
    slaStatus: 'Safe',
  },
  {
    id: 'MT-1023',
    subject: 'Login Authentication Failures',
    mergedTickets: ['TKT-1235', 'TKT-1239', 'TKT-1242'],
    severity: 'P1',
    tier: 'Gold',
    status: 'Open',
    slaTimeRemaining: -30,
    slaStatus: 'Breached',
  },
];

export const MasterTicketsView = () => {
  return (
    <div className="flex-1 flex flex-col overflow-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground">Master Tickets</h1>
        <p className="text-muted-foreground mt-1">Consolidated view of merged and deduplicated tickets</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{masterTickets.length}</p>
                <p className="text-xs text-muted-foreground">Master Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <Link2 className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {masterTickets.reduce((acc, mt) => acc + mt.mergedTickets.length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Merged Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Layers className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round((masterTickets.reduce((acc, mt) => acc + mt.mergedTickets.length, 0) / mockTickets.length) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Dedup Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Master Tickets List */}
      <div className="space-y-4">
        {masterTickets.map((mt, index) => (
          <motion.div
            key={mt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm font-semibold text-primary">{mt.id}</span>
                      <SeverityBadge severity={mt.severity} />
                      <TierBadge tier={mt.tier} />
                    </div>
                    <h3 className="text-foreground font-medium mb-3">{mt.subject}</h3>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Merged tickets:</span>
                      {mt.mergedTickets.map((ticketId) => (
                        <Badge key={ticketId} variant="outline" className="text-xs font-mono">
                          {ticketId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <SLAIndicator timeRemaining={mt.slaTimeRemaining} status={mt.slaStatus} />
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {masterTickets.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Master Tickets</h3>
            <p className="text-muted-foreground">Merged tickets will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
};
