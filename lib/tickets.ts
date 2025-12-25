// lib/tickets.ts
import { createClient } from './supabase/client';

// ============================================
// Types
// ============================================
export interface DbTicket {
    id: string;
    user_id: string;
    product_id: number | null;
    subject: string;
    status: 'open' | 'pending' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    assigned_to: string | null;
    created_at: string;
    updated_at: string;
    // Joined
    user?: { id: string; name: string; email: string; avatar: string } | null;
    product?: { id: number; name: string } | null;
    assignee?: { id: string; name: string } | null;
    messages?: DbTicketMessage[];
}

export interface DbTicketMessage {
    id: number;
    ticket_id: string;
    sender_id: string | null;
    is_staff: boolean;
    message: string;
    attachments: string[];
    created_at: string;
    // Joined
    sender?: { id: string; name: string; avatar: string } | null;
}

export interface TicketPayload {
    user_id: string;
    product_id?: number;
    subject: string;
    priority?: 'low' | 'medium' | 'high';
}

export interface TicketMessagePayload {
    ticket_id: string;
    sender_id: string;
    is_staff?: boolean;
    message: string;
    attachments?: string[];
}

// ============================================
// Fetch all tickets (Admin)
// ============================================
export async function fetchTickets(filters?: {
    status?: string;
    priority?: string;
    user_id?: string;
    limit?: number;
}): Promise<DbTicket[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
        .from('tickets')
        .select(`
      *,
      user:user_id (id, name, email, avatar),
      product:product_id (id, name),
      assignee:assigned_to (id, name)
    `)
        .order('updated_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }
    if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
    }
    if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
    }
    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching tickets:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Fetch user's tickets
// ============================================
export async function fetchUserTickets(userId: string): Promise<DbTicket[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('tickets')
        .select(`
      *,
      product:product_id (id, name)
    `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching user tickets:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Get ticket by ID with messages
// ============================================
export async function getTicketById(id: string): Promise<DbTicket | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data: ticket, error } = await supabase
        .from('tickets')
        .select(`
      *,
      user:user_id (id, name, email, avatar),
      product:product_id (id, name),
      assignee:assigned_to (id, name)
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching ticket:', error);
        return null;
    }

    // Get messages
    const { data: messages } = await supabase
        .from('ticket_messages')
        .select(`
      *,
      sender:sender_id (id, name, avatar)
    `)
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });

    return { ...ticket, messages: messages || [] };
}

// ============================================
// Create ticket
// ============================================
export async function createTicket(payload: TicketPayload): Promise<DbTicket | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('tickets')
        .insert({
            user_id: payload.user_id,
            product_id: payload.product_id || null,
            subject: payload.subject,
            priority: payload.priority || 'medium',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating ticket:', error);
        throw new Error(error.message);
    }
    return data;
}

// ============================================
// Add message to ticket
// ============================================
export async function addTicketMessage(payload: TicketMessagePayload): Promise<DbTicketMessage | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('ticket_messages')
        .insert({
            ticket_id: payload.ticket_id,
            sender_id: payload.sender_id,
            is_staff: payload.is_staff || false,
            message: payload.message,
            attachments: payload.attachments || [],
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding ticket message:', error);
        throw new Error(error.message);
    }
    return data;
}

// ============================================
// Update ticket status
// ============================================
export async function updateTicketStatus(
    id: string,
    status: DbTicket['status']
): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('tickets')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('Error updating ticket status:', error);
        throw new Error(error.message);
    }
    return true;
}

// ============================================
// Assign ticket (Admin)
// ============================================
export async function assignTicket(id: string, assigneeId: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('tickets')
        .update({
            assigned_to: assigneeId,
            status: 'pending',
        })
        .eq('id', id);

    if (error) {
        console.error('Error assigning ticket:', error);
        throw new Error(error.message);
    }
    return true;
}

// ============================================
// Get ticket stats (Admin)
// ============================================
export async function getTicketStats() {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('tickets')
        .select('id, status, priority');

    if (error) {
        console.error('Error fetching ticket stats:', error);
        return null;
    }

    const tickets = data || [];
    return {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        pending: tickets.filter(t => t.status === 'pending').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
        closed: tickets.filter(t => t.status === 'closed').length,
        highPriority: tickets.filter(t => t.priority === 'high').length,
    };
}
