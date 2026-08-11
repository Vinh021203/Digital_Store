import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type ChatSender = 'user' | 'bot' | 'admin';
export type ChatStatus = 'new' | 'contacted' | 'closed';

export interface ChatSession {
  id: string;
  session_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_phone: string | null;
  visitor_avatar: string | null;
  status: ChatStatus;
  source_page: string | null;
  interested_product: string | null;
  interested_technology: string | null;
  started_at: string;
  last_message_at: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  session_id: string;
  sender: ChatSender;
  message: string;
  created_at: string;
}

function getAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function saveChatTurn(input: {
  sessionId: string;
  sender: ChatSender;
  message: string;
  sourcePage?: string | null;
  interestedProduct?: string | null;
  interestedTechnology?: string | null;
  userId?: string | null;
  visitorName?: string | null;
  visitorEmail?: string | null;
  visitorPhone?: string | null;
  visitorAvatar?: string | null;
}) {
  const supabase = getAdminClient();
  if (!supabase) return false;

  const { data: session, error: sessionError } = await supabase
    .from('chat_sessions')
    .upsert({
      session_id: input.sessionId,
      user_id: input.userId || null,
      visitor_name: input.visitorName || null,
      visitor_email: input.visitorEmail || null,
      visitor_phone: input.visitorPhone || null,
      visitor_avatar: input.visitorAvatar || null,
      source_page: input.sourcePage || null,
      interested_product: input.interestedProduct || null,
      interested_technology: input.interestedTechnology || null,
      last_message_at: new Date().toISOString(),
    }, { onConflict: 'session_id' })
    .select('id')
    .single();

  if (sessionError || !session) {
    console.warn('Unable to save chat session:', sessionError?.message);
    return false;
  }

  const { error: messageError } = await supabase.from('chat_messages').insert({
    session_id: session.id,
    sender: input.sender,
    message: input.message,
  });

  if (messageError) console.warn('Unable to save chat message:', messageError.message);
  return !messageError;
}

export async function listChatSessions(status?: ChatStatus) {
  const supabase = getAdminClient();
  if (!supabase) return [] as ChatSession[];
  let query = supabase.from('chat_sessions').select('*').order('last_message_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as ChatSession[];
}

export async function getChatSession(id: string) {
  const supabase = getAdminClient();
  if (!supabase) return null;
  const [{ data: session, error: sessionError }, { data: messages, error: messagesError }] = await Promise.all([
    supabase.from('chat_sessions').select('*').eq('id', id).maybeSingle(),
    supabase.from('chat_messages').select('*').eq('session_id', id).order('created_at', { ascending: true }),
  ]);
  if (sessionError) throw sessionError;
  if (messagesError) throw messagesError;
  return session ? { session: session as ChatSession, messages: (messages || []) as ChatMessage[] } : null;
}

export async function getChatHistoryBySessionKey(sessionKey: string) {
  const supabase = getAdminClient();
  if (!supabase) return [] as ChatMessage[];
  const { data: session, error: sessionError } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('session_id', sessionKey)
    .maybeSingle();
  if (sessionError || !session) return [];
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', session.id)
    .order('created_at', { ascending: true })
    .limit(80);
  if (error) throw error;
  return (data || []) as ChatMessage[];
}

export async function updateChatSession(id: string, values: Partial<Pick<ChatSession, 'status' | 'visitor_name' | 'visitor_email'>>) {
  const supabase = getAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from('chat_sessions').update(values).eq('id', id).select('*').single();
  if (error) throw error;
  return data as ChatSession;
}
