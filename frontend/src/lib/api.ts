const API_BASE_URL = "http://localhost:8000";


export interface ApiTicket {
  ticket_id: string;
  thread_id: string;
  message_ids?: string[];
  date: string;
  tier: string;
  folder: string;
  from: string;
  reasoning: string;
  in_reply_to?: string;
  references?: string[];
  subject: string;
  to: string[];
  text_body?: string;
  body_html?: string;
  sla_hours: number;
  severity: string;
  ai_response: string;
  category: string;
}

export interface TicketsResponse {
  status: string;
  count: number;
  messages: ApiTicket[];
}

export async function fetchTickets(limit = 50): Promise<TicketsResponse> {
  const response = await fetch(`${API_BASE_URL}/messages?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch tickets: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchTicketById(ticketId: string): Promise<{ status: string; ticket: ApiTicket }> {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ticket: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchTicketMessages(ticketId: string): Promise<{ status: string; count: number; messages: any[] }> {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/messages`);
  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.statusText}`);
  }
  return response.json();
}
