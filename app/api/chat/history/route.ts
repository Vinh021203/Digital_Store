import { NextRequest, NextResponse } from 'next/server';
import { getChatHistoryBySessionKey } from '@/lib/chatHistory';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId')?.trim() || '';
  if (sessionId.length < 16 || sessionId.length > 120) {
    return NextResponse.json({ messages: [] });
  }
  try {
    const messages = await getChatHistoryBySessionKey(sessionId);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json({ messages: [] });
  }
}
