import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SLAStatus } from '@/data/mockData';

interface SLAIndicatorProps {
  timeRemaining: number; // in minutes
  status: SLAStatus;
  variant?: 'default' | 'compact' | 'full';
}

export const SLAIndicator = ({ timeRemaining, status, variant = 'default' }: SLAIndicatorProps) => {
  console.log(timeRemaining)
  const formatTime = (minutes: number): string => {
    if (minutes < 0) return 'BREACHED';
    if (minutes < 60) return `${minutes}m left`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m left`;
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'Breached':
        return {
          container: 'sla-breached border',
          icon: AlertTriangle,
          progressColor: 'bg-destructive',
          text: 'text-destructive',
        };
      case 'Warning':
        return {
          container: 'sla-warning border',
          icon: Clock,
          progressColor: 'bg-warning',
          text: 'text-warning',
        };
      default:
        return {
          container: 'sla-safe border',
          icon: CheckCircle,
          progressColor: 'bg-success',
          text: 'text-success',
        };
    }
  };

  const styles = getStatusStyles();
  const Icon = styles.icon;
  
  // Calculate progress (0-100)
  const maxTime = 120; // 2 hours baseline
  const progress = Math.max(0, Math.min(100, (timeRemaining / maxTime) * 100));

  if (variant === 'compact') {
    return (
      <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium', styles.container)}>
        <Icon className="h-3 w-3" />
        <span>{`${timeRemaining} h`}</span>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn('p-3 rounded-xl', styles.container)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className={cn('h-4 w-4', styles.text)} />
            <span className="text-sm font-medium">SLA Status</span>
          </div>
          <span className={cn('text-sm font-semibold', styles.text)}>
            {`${timeRemaining} h`}
          </span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', styles.progressColor)}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium', styles.container)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{`${timeRemaining} h`}</span>
      <div className="h-1.5 w-12 bg-muted/50 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', styles.progressColor)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
