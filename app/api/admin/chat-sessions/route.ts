import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { listChatSessions, type ChatStatus } from '@/lib/chatHistory';

async function isAdmin() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return false;
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
  return ['super_admin', 'admin', 'support'].includes(profile?.role || '');
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const status = request.nextUrl.searchParams.get('status') as ChatStatus | null;
  try {
    return NextResponse.json({ data: await listChatSessions(status || undefined) });
  } catch (error) {
    console.error('Chat sessions list error:', error);
    return NextResponse.json({ error: 'Unable to load chat sessions' }, { status: 500 });
  }
}
