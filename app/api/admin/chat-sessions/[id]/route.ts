import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { getChatSession, updateChatSession, type ChatStatus } from '@/lib/chatHistory';

async function isAdmin() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return false;
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
  return ['super_admin', 'admin', 'support'].includes(profile?.role || '');
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const { id } = await params;
    const data = await getChatSession(id);
    return data ? NextResponse.json({ data }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('Chat session detail error:', error);
    return NextResponse.json({ error: 'Unable to load chat session' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const body = await request.json();
    const values: { status?: ChatStatus; visitor_name?: string; visitor_email?: string } = {};
    if (typeof body.status === 'string') {
      if (!['new', 'contacted', 'closed'].includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      values.status = body.status;
    }
    if (typeof body.visitor_name === 'string') values.visitor_name = body.visitor_name.trim().slice(0, 120);
    if (typeof body.visitor_email === 'string') values.visitor_email = body.visitor_email.trim().slice(0, 160);
    const { id } = await params;
    return NextResponse.json({ data: await updateChatSession(id, values) });
  } catch (error) {
    console.error('Chat session update error:', error);
    return NextResponse.json({ error: 'Unable to update chat session' }, { status: 500 });
  }
}
