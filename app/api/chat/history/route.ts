import { NextRequest, NextResponse } from 'next/server';
import { getChatHistoryBySessionKey, getChatHistoryByUserId, getChatHistoryByVisitorEmail, getChatHistoryByVisitorPhone } from '@/lib/chatHistory';
import { createAdminClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { readGuestChatSession } from '@/lib/chatSession';

export async function GET(request: NextRequest) {
  try {
    const auth = await createClient();
    const { data: { user } } = await auth.auth.getUser();
    const userMessages = user ? await getChatHistoryByUserId(user.id) : [];
    const emailMessages = userMessages.length === 0 && user?.email ? await getChatHistoryByVisitorEmail(user.email) : [];
    let phoneMessages: Awaited<ReturnType<typeof getChatHistoryByVisitorPhone>> = [];
    if (userMessages.length === 0 && emailMessages.length === 0 && user) {
      const admin = createAdminClient();
      const { data: profile } = await admin.from('profiles').select('phone').eq('id', user.id).maybeSingle();
      phoneMessages = profile?.phone ? await getChatHistoryByVisitorPhone(profile.phone) : [];
    }
    const guestSessionId = user ? null : readGuestChatSession(request);
    if (!user && !guestSessionId) return NextResponse.json({ messages: [] });

    const messages = userMessages.length > 0
      ? userMessages
      : emailMessages.length > 0
        ? emailMessages
        : phoneMessages.length > 0
          ? phoneMessages
          : guestSessionId ? await getChatHistoryBySessionKey(guestSessionId) : [];
    return NextResponse.json(
      { messages },
      { headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
    );
  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json({ messages: [] });
  }
}
