// Mock data for IntelliDesk AI Dashboard
// API Placeholders:
// GET /api/tickets - List all tickets
// GET /api/tickets/:id - Get ticket details
// GET /api/tickets/:id/ai - Get AI insights for ticket
// GET /api/tickets/:id/thread - Get email thread for ticket
// POST /api/tickets/:id/reply - Send reply to ticket

export type Severity = 'P1' | 'P2' | 'P3' | 'P4';
export type Tier = 'Gold' | 'Silver' | 'Standard';
// export type Category = 'Billing' | 'Tech' | 'Shipping' | 'Account';
export type TicketStatus = 'Open' | 'Pending' | 'Resolved';
export type SLAStatus = 'Safe' | 'Warning' | 'Breached';

export interface Ticket {
  id: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  tier: string;
  text_body: string;
  ai_response: string;
  category: string;
  date: string;
  severity: string;
  reasoning: string;
  status: TicketStatus;
  sla_hours: string | number; // in minutes, negative means breached
  slaStatus: SLAStatus;
  dedupStatus?: string;
  masterTicketId?: string;
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
  confidence: number;
}

export interface AIInsight {
  category: { value: Category; confidence: number };
  severity: { value: Severity; confidence: number };
  intent: { value: string; confidence: number };
  modelVersion: string;
  processingTime: number;
}

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  category: string;
  text_data: string;
  timestamp: string;
  isIncoming: boolean;
  sla_hours?: string | number;
  ai_response?: string;
  severity?: string;
}

export interface ThreadData {
  masterTicketId: string;
  mergedTicketIds: string[];
  emails: EmailMessage[];
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  domain: string;
  domainMapping: string;
  tier: Tier;
  role?: string;
  phone?: string;
  accountId: string;
  pastTicketCount: number;
  lastResolutionTime: string;
  signatureExtracted: {
    name: string;
    role: string;
    phone: string;
  };
}

export interface SuggestedReply {
  subject: string;
  body: string;
  citedFAQs: { id: string; title: string }[];
  similarResolutions: { ticketId: string; subject: string; similarity: number }[];
}

// Sample tickets data
export const mockTickets = [
  {
    id: 'TKT-2847',
    subject: 'Panda is Good',
    customerName: 'Sarah Mitchell',
    customerEmail: 'sarah.mitchell@techcorp.com',
    tier: 'Gold',
    category: 'Billing',
    severity: 'P1',
    status: 'Open',
    slaTimeRemaining: 15,
    slaStatus: 'Warning',
    assignedAgent: 'Alex Johnson',
    createdAt: '2024-01-15T09:23:00Z',
    updatedAt: '2024-01-15T10:45:00Z',
    confidence: 94,
  },
  {
    id: 'TKT-2846',
    subject: 'API integration failing with 503 errors',
    customerName: 'James Chen',
    customerEmail: 'j.chen@innovate.io',
    tier: 'Gold',
    category: 'Tech',
    severity: 'P1',
    status: 'Open',
    slaTimeRemaining: -30,
    slaStatus: 'Breached',
    dedupStatus: 'Merged into MT-1021',
    masterTicketId: 'MT-1021',
    assignedAgent: 'Maria Garcia',
    createdAt: '2024-01-15T08:12:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    confidence: 89,
  },
  {
    id: 'TKT-2845',
    subject: 'Shipment delayed - need expedited delivery',
    customerName: 'Emily Roberts',
    customerEmail: 'e.roberts@retailmax.com',
    tier: 'Silver',
    category: 'Shipping',
    severity: 'P2',
    status: 'Pending',
    slaTimeRemaining: 45,
    slaStatus: 'Safe',
    assignedAgent: 'David Kim',
    createdAt: '2024-01-15T07:45:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
    confidence: 92,
  },
  {
    id: 'TKT-2844',
    subject: 'Password reset not working',
    customerName: 'Michael Brown',
    customerEmail: 'm.brown@startup.co',
    tier: 'Standard',
    category: 'Account',
    severity: 'P3',
    status: 'Open',
    slaTimeRemaining: 120,
    slaStatus: 'Safe',
    createdAt: '2024-01-15T06:30:00Z',
    updatedAt: '2024-01-15T08:15:00Z',
    confidence: 96,
  },
  {
    id: 'TKT-2843',
    subject: 'Billing discrepancy on January invoice',
    customerName: 'Lisa Anderson',
    customerEmail: 'l.anderson@enterprise.com',
    tier: 'Gold',
    category: 'Billing',
    severity: 'P2',
    status: 'Open',
    slaTimeRemaining: 90,
    slaStatus: 'Safe',
    assignedAgent: 'Alex Johnson',
    createdAt: '2024-01-14T16:20:00Z',
    updatedAt: '2024-01-15T07:00:00Z',
    confidence: 88,
  },
  {
    id: 'TKT-2842',
    subject: 'Feature request: Dark mode for dashboard',
    customerName: 'Robert Taylor',
    customerEmail: 'r.taylor@designco.com',
    tier: 'Silver',
    category: 'Tech',
    severity: 'P4',
    status: 'Pending',
    slaTimeRemaining: 480,
    slaStatus: 'Safe',
    createdAt: '2024-01-14T14:00:00Z',
    updatedAt: '2024-01-14T15:30:00Z',
    confidence: 91,
  },
  {
    id: 'TKT-2841',
    subject: 'Account suspended without notice',
    customerName: 'Jennifer White',
    customerEmail: 'j.white@media.net',
    tier: 'Gold',
    category: 'Account',
    severity: 'P1',
    status: 'Open',
    slaTimeRemaining: 5,
    slaStatus: 'Warning',
    assignedAgent: 'Maria Garcia',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    confidence: 85,
  },
  {
    id: 'TKT-2840',
    subject: 'Webhook notifications not triggering',
    customerName: 'Daniel Lee',
    customerEmail: 'd.lee@devops.io',
    tier: 'Silver',
    category: 'Tech',
    severity: 'P2',
    status: 'Open',
    slaTimeRemaining: 60,
    slaStatus: 'Safe',
    dedupStatus: 'Merged into MT-1019',
    masterTicketId: 'MT-1019',
    createdAt: '2024-01-14T11:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    confidence: 93,
  },
];

// Sample AI insights
export const mockAIInsights: Record<string, AIInsight> = {
  'TKT-2847': {
    category: { value: 'Billing', confidence: 94 },
    severity: { value: 'P1', confidence: 88 },
    intent: { value: 'Refund Request', confidence: 91 },
    modelVersion: 'IntelliDesk-v3.2.1',
    processingTime: 245,
  },
  'TKT-2846': {
    category: { value: 'Tech', confidence: 97 },
    severity: { value: 'P1', confidence: 92 },
    intent: { value: 'Bug Report', confidence: 89 },
    modelVersion: 'IntelliDesk-v3.2.1',
    processingTime: 312,
  },
};

// Sample thread data
export const mockThreadData: Record<string, ThreadData> = {
  'TKT-2847': {
    masterTicketId: 'MT-1022',
    mergedTicketIds: ['TKT-2847', 'TKT-2839', 'TKT-2831'],
    emails: [
      {
        id: 'email-1',
        from: 'sarah.mitchell@techcorp.com',
        to: 'support@intellidesk.ai',
        subject: 'Unable to process refund for order #89234',
        body: 'Hi Support Team,\n\nI have been trying to process a refund for order #89234 for the past 3 days but keep getting an error message. The order was placed on January 10th and I need the refund processed urgently as it was a duplicate charge.\n\nPlease help resolve this as soon as possible.\n\nBest regards,\nSarah Mitchell\nFinance Director, TechCorp',
        timestamp: '2024-01-15T09:23:00Z',
        isIncoming: true,
      },
      {
        id: 'email-2',
        from: 'support@intellidesk.ai',
        to: 'sarah.mitchell@techcorp.com',
        subject: 'Re: Unable to process refund for order #89234',
        body: 'Dear Sarah,\n\nThank you for reaching out. We have received your refund request and are investigating the issue with order #89234.\n\nOur billing team is looking into the duplicate charge and will process the refund within 24 hours.\n\nBest regards,\nIntelliDesk Support',
        timestamp: '2024-01-15T09:45:00Z',
        isIncoming: false,
      },
      {
        id: 'email-3',
        from: 'sarah.mitchell@techcorp.com',
        to: 'support@intellidesk.ai',
        subject: 'Re: Unable to process refund for order #89234',
        body: 'Hi,\n\nIt has been over 24 hours now and I still haven\'t received the refund. This is now causing issues with our monthly reconciliation.\n\nPlease expedite this matter.\n\nSarah',
        timestamp: '2024-01-15T10:30:00Z',
        isIncoming: true,
      },
    ],
  },
  'TKT-2846': {
    masterTicketId: 'MT-1021',
    mergedTicketIds: ['TKT-2846', 'TKT-2838', 'TKT-2835', 'TKT-2830'],
    emails: [
      {
        id: 'email-1',
        from: 'j.chen@innovate.io',
        to: 'support@intellidesk.ai',
        subject: 'API integration failing with 503 errors',
        body: 'Our API integration has been failing intermittently with 503 Service Unavailable errors since this morning. This is affecting our production systems.\n\nEndpoint: /api/v2/webhooks\nError rate: ~30%\n\nPlease investigate urgently.\n\nJames Chen\nCTO, Innovate.io',
        timestamp: '2024-01-15T08:12:00Z',
        isIncoming: true,
      },
    ],
  },
};

// Sample customer profiles
export const mockCustomerProfiles: Record<string, CustomerProfile> = {
  'TKT-2847': {
    id: 'cust-1234',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@techcorp.com',
    domain: 'techcorp.com',
    domainMapping: 'Enterprise',
    tier: 'Gold',
    role: 'Finance Director',
    phone: '+1 (555) 123-4567',
    accountId: 'ACC-78234',
    pastTicketCount: 12,
    lastResolutionTime: '2.4 hours avg',
    signatureExtracted: {
      name: 'Sarah Mitchell',
      role: 'Finance Director',
      phone: '+1 (555) 123-4567',
    },
  },
  'TKT-2846': {
    id: 'cust-1235',
    name: 'James Chen',
    email: 'j.chen@innovate.io',
    domain: 'innovate.io',
    domainMapping: 'Startup',
    tier: 'Gold',
    role: 'CTO',
    phone: '+1 (555) 987-6543',
    accountId: 'ACC-78235',
    pastTicketCount: 8,
    lastResolutionTime: '1.8 hours avg',
    signatureExtracted: {
      name: 'James Chen',
      role: 'CTO',
      phone: '+1 (555) 987-6543',
    },
  },
};

// Sample suggested replies
export const mockSuggestedReplies: Record<string, SuggestedReply> = {
  'TKT-2847': {
    subject: 'Re: Unable to process refund for order #89234 - Resolution',
    body: `Dear Sarah,

Thank you for your patience regarding the refund for order #89234.

I have personally reviewed your case and can confirm that:

1. The duplicate charge of $2,450.00 has been identified
2. The refund has been processed and will appear in your account within 3-5 business days
3. A credit memo has been generated for your records (REF: CM-89234)

To prevent future duplicate charges, we have flagged your account for enhanced payment verification.

Please let me know if you have any other questions.

Best regards,
IntelliDesk Support Team`,
    citedFAQs: [
      { id: 'FAQ-12', title: 'Refund Policy' },
      { id: 'FAQ-23', title: 'Duplicate Charge Resolution' },
      { id: 'FAQ-45', title: 'Payment Processing Times' },
    ],
    similarResolutions: [
      { ticketId: 'TKT-2701', subject: 'Duplicate charge on subscription renewal', similarity: 94 },
      { ticketId: 'TKT-2589', subject: 'Refund not processed after 5 days', similarity: 87 },
      { ticketId: 'TKT-2456', subject: 'Wrong amount charged on invoice', similarity: 82 },
    ],
  },
  'TKT-2846': {
    subject: 'Re: API integration failing with 503 errors - Status Update',
    body: `Hi James,

We have identified the root cause of the 503 errors affecting your API integration.

Issue: Our load balancer was experiencing capacity constraints during peak hours.

Resolution:
- We have scaled up our infrastructure
- Added additional failover endpoints
- Implemented request queuing for high-traffic periods

Current status: All systems operational. Error rate: < 0.1%

We recommend implementing exponential backoff in your client code for improved resilience.

Let us know if you experience any further issues.

Best regards,
IntelliDesk Technical Support`,
    citedFAQs: [
      { id: 'FAQ-67', title: 'API Best Practices' },
      { id: 'FAQ-89', title: 'Error Handling Guidelines' },
    ],
    similarResolutions: [
      { ticketId: 'TKT-2634', subject: 'Intermittent API timeouts', similarity: 91 },
      { ticketId: 'TKT-2512', subject: '503 errors during data sync', similarity: 88 },
    ],
  },
};

// Helper function to get default values
export const getDefaultAIInsights = (ticketId: string): AIInsight => ({
  category: { value: 'Tech', confidence: 85 },
  severity: { value: 'P3', confidence: 80 },
  intent: { value: 'General Inquiry', confidence: 75 },
  modelVersion: 'IntelliDesk-v3.2.1',
  processingTime: 200,
});

export const getDefaultThreadData = (ticketId: string): ThreadData => ({
  masterTicketId: ticketId,
  mergedTicketIds: [ticketId],
  emails: [],
});

export const getDefaultCustomerProfile = (ticket: Ticket): CustomerProfile => ({
  id: `cust-${Math.random().toString(36).substr(2, 9)}`,
  name: ticket.customerName,
  email: ticket.customerEmail,
  domain: ticket.customerEmail.split('@')[1],
  domainMapping: 'Standard',
  tier: ticket.tier,
  accountId: `ACC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
  pastTicketCount: Math.floor(Math.random() * 20),
  lastResolutionTime: `${(Math.random() * 4 + 1).toFixed(1)} hours avg`,
  signatureExtracted: {
    name: ticket.customerName,
    role: 'Customer',
    phone: 'Not provided',
  },
});

export const getDefaultSuggestedReply = (ticket: Ticket): SuggestedReply => ({
  subject: `Re: ${ticket.subject}`,
  body: 'Thank you for contacting IntelliDesk Support. We are reviewing your request and will respond shortly.',
  citedFAQs: [],
  similarResolutions: [],
});
