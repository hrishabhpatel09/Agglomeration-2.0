import { useState, useEffect } from 'react';
import { fetchTickets, ApiTicket } from '@/lib/api';
import { Ticket, Severity, Tier, Category, TicketStatus, SLAStatus } from '@/data/mockData';
import { T } from 'vitest/dist/chunks/environment.d.cL3nLXbE.js';

// Transform API ticket to frontend Ticket format
function transformTicket(apiTicket: ApiTicket, index: number): Ticket {
  // Generate some default values since API doesn't have all fields yet
  const severities: Severity[] = ['P1', 'P2', 'P3', 'P4'];
  const tiers: Tier[] = ['Gold', 'Silver', 'Standard'];
  const categories: Category[] = ['Billing', 'Tech', 'Shipping', 'Account'];
  const statuses: TicketStatus[] = ['Open', 'Pending', 'Resolved'];
  const slaStatuses: SLAStatus[] = ['Safe', 'Warning', 'Breached'];

  return {
    id: apiTicket.ticket_id,
    subject: apiTicket.subject,
    customerName: apiTicket.from.split('<')[0], // Use part of email as name
    customerEmail: apiTicket.from.split('<')[1]?.replace('>', '') || apiTicket.from,
    text_body: apiTicket.text_body || '',
    date: apiTicket.date,
    severity: apiTicket.severity,
    reasoning: apiTicket.reasoning,
    status: statuses[index % statuses.length],
    sla_hours: apiTicket.sla_hours,
    tier: apiTicket.tier || "Free",
    ai_response: apiTicket.ai_response,
    category: apiTicket.category,
    slaStatus: slaStatuses[index % slaStatuses.length],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    confidence: Math.floor(Math.random() * 30) + 70,
  };
}

function sortMessagesByDate(messages, order = 'asc') {
  return messages.sort((a:Ticket, b:Ticket) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    // Sort Ascending (Oldest to Newest)
    if (order === 'asc') {
      return dateA.getTime() - dateB.getTime();
    }
    
    // Sort Descending (Newest to Oldest)
    return dateB.getTime() - dateA.getTime();
  });
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchTickets();
        console.log(response)
        let transformedTickets = response.messages.map(transformTicket);
        transformedTickets = transformedTickets.map((msg)=>{return msg});
        transformedTickets = await sortMessagesByDate(transformedTickets, 'dsc');
        console.log('Transformed Tickets:', transformedTickets);
        setTickets(transformedTickets);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
        console.error('Error fetching tickets:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchTickets();
        let transformedTickets = response.messages.map(transformTicket);
        transformedTickets = transformedTickets.map((msg)=>{return msg});
        transformedTickets = await sortMessagesByDate(transformedTickets, 'dsc');
        console.log('Transformed Ticketsiii:', transformedTickets);
        setTickets(transformedTickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  return { tickets, loading, error, refetch };
}
