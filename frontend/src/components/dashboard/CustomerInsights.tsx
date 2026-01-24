import { motion } from 'framer-motion';
import { Building, User, Phone, Mail, History, Clock, Hash } from 'lucide-react';
import { CustomerProfile } from '@/data/mockData';
import { TierBadge } from './TicketBadges';
import { Badge } from '@/components/ui/badge';

interface CustomerInsightsProps {
  customer: CustomerProfile;
}

export const CustomerInsights = ({ customer }: CustomerInsightsProps) => {
  const infoItems = [
    { icon: Building, label: 'Domain Mapping', value: customer.domainMapping },
    { icon: Hash, label: 'Account ID', value: customer.accountId },
    { icon: History, label: 'Past Tickets', value: customer.pastTicketCount.toString() },
    { icon: Clock, label: 'Avg Resolution', value: customer.lastResolutionTime },
  ];

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4"
      >
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-foreground flex items-center justify-center text-2xl font-bold text-background">
            {customer.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold truncate">{customer.name}</h3>
              <TierBadge tier={customer.tier} />
            </div>
            <p className="text-sm text-muted-foreground truncate">{customer.email}</p>
            <Badge variant="outline" className="mt-2 text-xs">
              @{customer.domain}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3">
        {infoItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 rounded-xl bg-muted/50 border border-border"
          >
            <div className="flex items-center gap-2 mb-1">
              <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
            <p className="text-sm font-semibold">{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Signature Extraction */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4"
      >
        <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
          <User className="h-4 w-4" />
          Extracted Signature
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{customer.signatureExtracted.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
              <Building className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm font-medium">{customer.signatureExtracted.role}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium">{customer.signatureExtracted.phone}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
