import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Category, Severity, Tier, TicketStatus } from '@/data/mockData';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface SeverityBadgeProps {
  severity: Severity;
}

export const SeverityBadge = ({ severity }: SeverityBadgeProps) => {
  const config = {
    P1: { 
      className: 'bg-destructive text-destructive-foreground border-destructive', 
      icon: AlertCircle,
      label: 'P1' 
    },
    P2: { 
      className: 'bg-orange-500 text-white border-orange-500', 
      icon: AlertTriangle,
      label: 'P2' 
    },
    P3: { 
      className: 'bg-yellow-400 text-yellow-900 border-yellow-400', 
      icon: Info,
      label: 'P3' 
    },
    P4: { 
      className: 'bg-success text-success-foreground border-success', 
      icon: CheckCircle2,
      label: 'P4' 
    },
  };

  const { className, icon: Icon, label } = config[severity];

  return (
    <Badge 
      variant="outline" 
      className={cn('gap-1 font-semibold text-[10px] px-1.5 py-0.5', className)}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

interface TierBadgeProps {
  tier: Tier;
}

export const TierBadge = ({ tier }: TierBadgeProps) => {
  const config = {
    Gold: { className: 'badge-tier-gold', icon: '★' },
    Silver: { className: 'badge-tier-silver', icon: '✦' },
    Free: { className: 'badge-tier-standard', icon: '○' },
  };

  const { className, icon } = config[tier];

  return (
    <Badge 
      variant="secondary" 
      className={cn('gap-1 font-medium text-[10px] px-1.5 py-0.5', className)}
    >
      <span>{icon}</span>
      {tier}
    </Badge>
  );
};

interface CategoryBadgeProps {
  category: Category;
}

export const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const config: Record<Category, { className: string }> = {
    Billing: { className: 'bg-blue-100 text-blue-700 border-blue-200' },
    Tech: { className: 'bg-purple-100 text-purple-700 border-purple-200' },
    Shipping: { className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    Account: { className: 'bg-pink-100 text-pink-700 border-pink-200' },
  };

  const { className } = config[category];

  return (
    <Badge 
      variant="outline" 
      className={cn('font-medium text-[10px] px-1.5 py-0.5', className)}
    >
      {category}
    </Badge>
  );
};

interface StatusBadgeProps {
  status: TicketStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config: Record<TicketStatus, { className: string; dot: string }> = {
    Open: { className: 'text-blue-600', dot: 'bg-blue-500' },
    Pending: { className: 'text-amber-600', dot: 'bg-amber-500' },
    Resolved: { className: 'text-emerald-600', dot: 'bg-emerald-500' },
  };

  const { className, dot } = config[status];

  return (
    <div className={cn('inline-flex items-center gap-1.5 text-xs font-medium', className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse', dot)} />
      {status}
    </div>
  );
};
