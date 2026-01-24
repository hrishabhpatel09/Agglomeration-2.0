import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Users, Ticket, Brain, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockTickets } from '@/data/mockData';

export const InsightsView = () => {
  // Calculate stats from mock data
  const totalTickets = mockTickets.length;
  const resolvedTickets = mockTickets.filter((t) => t.status === 'Resolved').length;
  const avgConfidence = Math.round(mockTickets.reduce((acc, t) => acc + t.confidence, 0) / totalTickets);
  
  const categoryDistribution = mockTickets.reduce((acc, ticket) => {
    acc[ticket.category] = (acc[ticket.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const severityDistribution = mockTickets.reduce((acc, ticket) => {
    acc[ticket.severity] = (acc[ticket.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tierDistribution = mockTickets.reduce((acc, ticket) => {
    acc[ticket.tier] = (acc[ticket.tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    { label: 'Total Tickets', value: totalTickets.toString(), icon: Ticket, color: 'text-primary' },
    { label: 'Resolved', value: resolvedTickets.toString(), icon: CheckCircle, color: 'text-success' },
    { label: 'AI Confidence', value: `${avgConfidence}%`, icon: Brain, color: 'text-chart-1' },
    { label: 'Avg Response', value: '2.4h', icon: Clock, color: 'text-warning' },
  ];

  const categoryColors: Record<string, string> = {
    Billing: 'bg-chart-1',
    Technical: 'bg-chart-2',
    Shipping: 'bg-chart-3',
    Account: 'bg-chart-4',
  };

  const severityColors: Record<string, string> = {
    P1: 'bg-severity-p1',
    P2: 'bg-severity-p2',
    P3: 'bg-severity-p3',
    P4: 'bg-severity-p4',
  };

  const tierColors: Record<string, string> = {
    Gold: 'bg-tier-gold',
    Silver: 'bg-tier-silver',
    Standard: 'bg-muted-foreground',
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground">Insights</h1>
        <p className="text-muted-foreground mt-1">Analytics and performance metrics for your support operations</p>
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
                    <TrendingUp className="h-3 w-3 text-success" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Category Distribution */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="h-4 w-4 text-muted-foreground" />
              By Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryDistribution).map(([category, count]) => (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{category}</span>
                    <span className="text-muted-foreground">{count} ({Math.round((count / totalTickets) * 100)}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / totalTickets) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className={`h-full ${categoryColors[category] || 'bg-primary'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              By Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['P1', 'P2', 'P3', 'P4'].map((severity) => {
                const count = severityDistribution[severity] || 0;
                return (
                  <div key={severity} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{severity}</span>
                      <span className="text-muted-foreground">{count} ({Math.round((count / totalTickets) * 100)}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / totalTickets) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className={`h-full ${severityColors[severity]}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tier Distribution */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              By Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Gold', 'Silver', 'Standard'].map((tier) => {
                const count = tierDistribution[tier] || 0;
                return (
                  <div key={tier} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{tier}</span>
                      <span className="text-muted-foreground">{count} ({Math.round((count / totalTickets) * 100)}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / totalTickets) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className={`h-full ${tierColors[tier]}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Performance */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4 text-muted-foreground" />
            AI Classification Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category Accuracy</span>
                <span className="font-medium text-foreground">94.2%</span>
              </div>
              <Progress value={94.2} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Severity Accuracy</span>
                <span className="font-medium text-foreground">91.8%</span>
              </div>
              <Progress value={91.8} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Auto-Resolution Rate</span>
                <span className="font-medium text-foreground">67.5%</span>
              </div>
              <Progress value={67.5} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
