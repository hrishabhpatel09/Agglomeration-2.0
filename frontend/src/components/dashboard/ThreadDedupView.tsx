import { motion } from 'framer-motion';
import { GitMerge, Mail, ArrowRight, User } from 'lucide-react';
import { ThreadData } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ThreadDedupViewProps {
  threadData: ThreadData;
}

export const ThreadDedupView = ({ threadData }: ThreadDedupViewProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Master Ticket Info */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-foreground flex items-center justify-center">
            <GitMerge className="h-5 w-5 text-background" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Master Ticket</h4>
            <p className="text-lg font-bold font-mono">{threadData.masterTicketId}</p>
          </div>
        </div>

        {/* Merged tickets visualization */}
        <div className="flex flex-wrap gap-2">
          {threadData.mergedTicketIds.map((id, index) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-1"
            >
              <Badge variant="outline" className="font-mono text-xs">
                {id}
              </Badge>
              {index < threadData.mergedTicketIds.length - 1 && (
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              )}
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          {threadData.mergedTicketIds.length} tickets merged into this thread
        </p>
      </motion.div>

      {/* Email Timeline */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email Thread Timeline
        </h4>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {threadData.emails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No emails in this thread</p>
              </div>
            ) : (
              threadData.emails.map((email, index) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, x: email.isIncoming ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'relative pl-6 pb-4',
                    index !== threadData.emails.length - 1 && 'border-l-2 border-border ml-2'
                  )}
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'absolute -left-1.5 top-0 h-3 w-3 rounded-full border-2 border-background',
                      email.isIncoming ? 'bg-foreground' : 'bg-muted-foreground'
                    )}
                  />

                  {/* Email bubble */}
                  <div
                    className={cn(
                      'rounded-xl p-4',
                      email.isIncoming
                        ? 'bg-muted border border-border'
                        : 'bg-foreground text-background'
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'h-6 w-6 rounded-full flex items-center justify-center',
                          email.isIncoming ? 'bg-foreground' : 'bg-background'
                        )}>
                          <User className={cn(
                            'h-3 w-3',
                            email.isIncoming ? 'text-background' : 'text-foreground'
                          )} />
                        </div>
                        <span className="text-xs font-medium truncate max-w-[150px]">
                          {email.from}
                        </span>
                      </div>
                      <span className={cn(
                        'text-xs',
                        email.isIncoming ? 'text-muted-foreground' : 'text-background/70'
                      )}>
                        {formatDate(email.timestamp)}
                      </span>
                    </div>

                    {/* Subject */}
                    <p className={cn(
                      'text-sm font-medium mb-2',
                      !email.isIncoming && 'text-background'
                    )}>
                      {email.subject}
                    </p>

                    {/* Body preview */}
                    <p className={cn(
                      'text-xs line-clamp-3',
                      email.isIncoming ? 'text-muted-foreground' : 'text-background/80'
                    )}>
                      {email.body}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
