import { motion } from 'framer-motion';
import { Mail, Send, Copy, Edit3, AlertTriangle, ThumbsUp, ThumbsDown, FileText, ExternalLink } from 'lucide-react';
import { SuggestedReply, EmailMessage } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface ResponsePreviewProps {
  incomingEmail: EmailMessage | undefined;
  suggestedReply: SuggestedReply;
}

export const ResponsePreview = ({ incomingEmail, suggestedReply }: ResponsePreviewProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(suggestedReply.body);
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
                      {incomingEmail.body}
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
                <p className="text-sm whitespace-pre-wrap">{suggestedReply.body}</p>
              </div>
            </div>
          </ScrollArea>
        </motion.div>
      </div>

      {/* Cited FAQs */}
      {suggestedReply.citedFAQs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Cited FAQ References
          </h4>
          <div className="flex flex-wrap gap-2">
            {suggestedReply.citedFAQs.map((faq) => (
              <Badge
                key={faq.id}
                variant="secondary"
                className="cursor-pointer hover:bg-foreground hover:text-background transition-colors"
              >
                <span className="font-mono text-xs mr-1">{faq.id}</span>
                {faq.title}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      {/* Similar Resolutions */}
      {suggestedReply.similarResolutions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4"
        >
          <h4 className="text-sm font-medium mb-3">Similar Past Resolutions</h4>
          <div className="space-y-2">
            {suggestedReply.similarResolutions.map((resolution) => (
              <div
                key={resolution.ticketId}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">
                    {resolution.ticketId}
                  </span>
                  <span className="text-sm truncate max-w-[200px]">
                    {resolution.subject}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {resolution.similarity}% match
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}

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
