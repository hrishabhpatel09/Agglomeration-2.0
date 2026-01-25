import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Category, Severity, Tier, TicketStatus } from '@/data/mockData';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { get } from 'http';

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

  function getCategoryClass(category: Category) {
    switch (category) {
      case "Technical Support":
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case "Access Request":
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case "Billing/Invoice":
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case "Feature Request":
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case "Hardware/Infrastructure":
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case "How-To/Documentation":
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case "Data Request":
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case "Complaint/Escalation":
        return 'bg- emerald-100 text-emerald-700 border-emerald-200'; 
      case "General Inquiry":
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }
  // const config: Record<Category, { className: string }> = {
  //   "Technical Support": { className: 'bg-blue-100 text-blue-700 border-blue-200' },
  //   "Access Request": { className: 'bg-purple-100 text-purple-700 border-purple-200' },
  //   "Billing/Invoice": { className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  //   "Feature Request": { className: 'bg-pink-100 text-pink-700 border-pink-200' },
  //   "Hardware/Infrastructure": { className: 'bg-pink-100 text-pink-700 border-pink-200' },
  //   "How-To/Documentation": { className: 'bg-pink-100 text-pink-700 border-pink-200' },
  //   "Data Request": { className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  //   "Complaint/Escalation": { className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  //   "General Inquiry": { className: 'bg-purple-100 text-purple-700 border-purple-200' },
  // };
  console.log(category);
  const className = getCategoryClass(category);

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
