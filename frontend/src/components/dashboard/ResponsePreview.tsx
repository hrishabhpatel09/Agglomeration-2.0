import { motion } from 'framer-motion';
import { Mail, Send, Copy, Edit3, AlertTriangle, ThumbsUp, ThumbsDown, FileText, ExternalLink } from 'lucide-react';
import { SuggestedReply, EmailMessage } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface ResponsePreviewProps {
  incomingEmail: EmailMessage | undefined;
  suggestedReply: EmailMessage | undefined;
}

export const ResponsePreview = ({ incomingEmail, suggestedReply }: ResponsePreviewProps) => {
  console.log('Incoming Email:', incomingEmail);
  const handleCopy = () => {
    navigator.clipboard.writeText(suggestedReply.text_body);
    toast.success('Reply copied to clipboard');
  };

  const handleFeedback = (positive: boolean) => {
    toast.success(positive ? 'Thanks for your feedback!' : 'Feedback noted. We\'ll improve the response.');
  };

  return (
    <div className="space-y-6">
      {/* Split view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Incoming Email */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Incoming Email</span>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="p-4">
              {incomingEmail ? (
                <>
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground">From</p>
                    <p className="text-sm font-medium">{incomingEmail.from}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground">Subject</p>
                    <p className="text-sm font-medium">{incomingEmail.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Body</p>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {incomingEmail.text_body || 'No email content available.'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No incoming email</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </motion.div>

        {/* AI Generated Reply */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-foreground text-background">
            <Send className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Generated Reply</span>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="p-4">
              <div className="mb-4">
                <p className="text-xs text-muted-foreground">Subject</p>
                <p className="text-sm font-medium">{suggestedReply.subject}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Body</p>
                <p className="text-sm whitespace-pre-wrap">{suggestedReply.ai_response}</p>
              </div>
            </div>
          </ScrollArea>
        </motion.div>
      </div>

      {/* Cited FAQs */}
      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCopy} variant="outline" size="sm" className="gap-2">
            <Copy className="h-4 w-4" />
            Copy Reply
          </Button>
          <Button size="sm" className="gap-2">
            <Send className="h-4 w-4" />
            Send
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Escalate
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Was this helpful?</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFeedback(true)}
            className="h-8 w-8 hover:bg-success/10 hover:text-success"
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFeedback(false)}
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
