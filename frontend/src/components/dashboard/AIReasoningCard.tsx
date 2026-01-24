import { motion } from 'framer-motion';
import { Brain, Zap, Target, Clock } from 'lucide-react';
import { AIInsight } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface AIReasoningCardProps {
  insights: AIInsight;
}

export const AIReasoningCard = ({ insights }: AIReasoningCardProps) => {
  const classifications = [
    {
      label: 'Category',
      value: insights.category.value,
      confidence: insights.category.confidence,
      icon: Target,
    },
    {
      label: 'Severity',
      value: insights.severity.value,
      confidence: insights.severity.confidence,
      icon: Zap,
    },
    {
      label: 'Intent',
      value: insights.intent.value,
      confidence: insights.intent.confidence,
      icon: Brain,
    },
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-success';
    if (confidence >= 75) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Classifications */}
      <div className="space-y-4">
        {classifications.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
              </div>
              <span className={cn(
                'text-sm font-bold',
                item.confidence >= 90 ? 'text-success' : item.confidence >= 75 ? 'text-warning' : 'text-destructive'
              )}>
                {item.confidence}%
              </span>
            </div>
            
            <div className="mb-2">
              <span className="text-lg font-semibold">{item.value}</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Confidence</span>
                <span>{item.confidence}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.confidence}%` }}
                  transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', getConfidenceColor(item.confidence))}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Model Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl bg-muted/50 border border-border"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Model Version</span>
          </div>
          <span className="text-sm font-mono text-muted-foreground">{insights.modelVersion}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Processing Time</span>
          </div>
          <span className="text-sm font-mono text-muted-foreground">{insights.processingTime}ms</span>
        </div>
      </motion.div>
    </div>
  );
};
