import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, GitMerge, User, MessageSquare } from 'lucide-react';
import { 
  Ticket, 
  AIInsight, 
  ThreadData, 
  CustomerProfile, 
  SuggestedReply,
  mockAIInsights,
  mockThreadData,
  mockCustomerProfiles,
  mockSuggestedReplies,
  getDefaultAIInsights,
  getDefaultThreadData,
  getDefaultCustomerProfile,
  getDefaultSuggestedReply,
  EmailMessage,
} from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SLAIndicator } from './SLAIndicator';
import { SeverityBadge, TierBadge, CategoryBadge, StatusBadge } from './TicketBadges';
import { AIReasoningCard } from './AIReasoningCard';
import { ThreadDedupView } from './ThreadDedupView';
import { CustomerInsights } from './CustomerInsights';
import { ResponsePreview } from './ResponsePreview';

interface TicketDetailPanelProps {
  ticket: EmailMessage | null;
  onClose: () => void;
}

export const TicketDetailPanel = ({ ticket, onClose }: TicketDetailPanelProps) => {
  if (!ticket) return null;

  // Get data for the ticket (use mock data or defaults)
  const aiInsights: AIInsight = mockAIInsights[ticket.id] || getDefaultAIInsights(ticket.id);
  const threadData: ThreadData = mockThreadData[ticket.id] || getDefaultThreadData(ticket.id);
  const customerProfile: CustomerProfile = mockCustomerProfiles[ticket.id] || getDefaultCustomerProfile(ticket);
  const suggestedReply: SuggestedReply = mockSuggestedReplies[ticket.id] || getDefaultSuggestedReply(ticket);
  const incomingEmail = ticket.text_data || "No email content available.";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-full max-w-xl border-l border-border bg-background shadow-2xl z-30 lg:relative lg:top-0 lg:h-full"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-border">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm font-bold">{ticket.id}</span>
                <SeverityBadge severity={ticket.severity} />
                <StatusBadge status={ticket.status} />
              </div>
              <h2 className="text-lg font-semibold line-clamp-2 mb-3">{ticket.subject}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <TierBadge tier={ticket.tier} />
                <CategoryBadge category={ticket.category} />
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* SLA Status */}
          <div className="px-4 py-3 border-b border-border">
            <SLAIndicator
              timeRemaining={ticket.sla_hours}
              status={ticket.slaStatus}
              variant="full"
            />
          </div>

          {/* Tabs Content */}
          <Tabs defaultValue="ai" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto">
              <TabsTrigger
                value="ai"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-4 py-3 text-sm"
              >
                <Brain className="h-4 w-4 mr-2" />
                AI Reasoning
              </TabsTrigger>
              <TabsTrigger
                value="thread"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-4 py-3 text-sm"
              >
                <GitMerge className="h-4 w-4 mr-2" />
                Thread
              </TabsTrigger>
              <TabsTrigger
                value="customer"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-4 py-3 text-sm"
              >
                <User className="h-4 w-4 mr-2" />
                Customer
              </TabsTrigger>
              <TabsTrigger
                value="response"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-4 py-3 text-sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Response
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <div className="p-4">
                <TabsContent value="ai" className="mt-0">
                  <AIReasoningCard insights={aiInsights} />
                </TabsContent>

                <TabsContent value="thread" className="mt-0">
                  <ThreadDedupView threadData={threadData} />
                </TabsContent>

                <TabsContent value="customer" className="mt-0">
                  <CustomerInsights customer={customerProfile} />
                </TabsContent>

                <TabsContent value="response" className="mt-0">
                  <ResponsePreview
                    incomingEmail={ticket}
                    suggestedReply={ticket}
                  />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
