import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockTickets } from '@/data/mockData';
import { SLAIndicator } from './SLAIndicator';
import { SeverityBadge, TierBadge } from './TicketBadges';

export const SLAMonitorView = () => {
  const breachedTickets = mockTickets.filter((t) => t.slaStatus === 'Breached');
  const warningTickets = mockTickets.filter((t) => t.slaStatus === 'Warning');
  const safeTickets = mockTickets.filter((t) => t.slaStatus === 'Safe');
  
  const complianceRate = Math.round(((safeTickets.length + warningTickets.length) / mockTickets.length) * 100);

  const stats = [
    {
      label: 'SLA Compliance Rate',
      value: `${complianceRate}%`,
      icon: TrendingUp,
      trend: '+2.3%',
      trendUp: true,
      color: 'text-success',
    },
    {
      label: 'Breached Tickets',
      value: breachedTickets.length.toString(),
      icon: AlertTriangle,
      trend: '-1',
      trendUp: true,
      color: 'text-destructive',
    },
    {
      label: 'At Risk',
      value: warningTickets.length.toString(),
      icon: Clock,
      trend: '+2',
      trendUp: false,
      color: 'text-warning',
    },
    {
      label: 'On Track',
      value: safeTickets.length.toString(),
      icon: CheckCircle,
      trend: '+5',
      trendUp: true,
      color: 'text-success',
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground">SLA Monitor</h1>
        <p className="text-muted-foreground mt-1">Track service level agreement compliance in real-time</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                    <span className={`text-xs font-medium ${stat.trendUp ? 'text-success' : 'text-destructive'}`}>
                      {stat.trendUp ? <TrendingUp className="h-3 w-3 inline mr-1" /> : <TrendingDown className="h-3 w-3 inline mr-1" />}
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Compliance Progress */}
      <Card className="bg-card/50 backdrop-blur-sm border-border mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overall SLA Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Period</span>
              <span className="font-medium text-foreground">{complianceRate}%</span>
            </div>
            <Progress value={complianceRate} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Target: 95%</span>
              <span>{complianceRate >= 95 ? 'On Target' : 'Below Target'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breached & At Risk Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
        {/* Breached Tickets */}
        <Card className="bg-card/50 backdrop-blur-sm border-border flex flex-col overflow-hidden">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Breached Tickets ({breachedTickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-3">
              {breachedTickets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No breached tickets 🎉</p>
              ) : (
                breachedTickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
                      <SeverityBadge severity={ticket.severity} />
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-1">{ticket.subject}</p>
                    <div className="flex items-center justify-between mt-2">
                      <TierBadge tier={ticket.tier} />
                      <SLAIndicator timeRemaining={ticket.slaTimeRemaining} status={ticket.slaStatus} />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* At Risk Tickets */}
        <Card className="bg-card/50 backdrop-blur-sm border-border flex flex-col overflow-hidden">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              At Risk Tickets ({warningTickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-3">
              {warningTickets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No at-risk tickets</p>
              ) : (
                warningTickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-lg bg-warning/5 border border-warning/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
                      <SeverityBadge severity={ticket.severity} />
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-1">{ticket.subject}</p>
                    <div className="flex items-center justify-between mt-2">
                      <TierBadge tier={ticket.tier} />
                      <SLAIndicator timeRemaining={ticket.slaTimeRemaining} status={ticket.slaStatus} />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
