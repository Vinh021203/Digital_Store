// API Route for AI Chatbot
import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/ai';
import { checkDistributedRateLimit, getClientIp, getRetryAfterSeconds } from '@/lib/rateLimit';
import { saveChatTurn } from '@/lib/chatHistory';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import {
    attachGuestChatSessionCookie,
    createGuestChatSession,
    readGuestChatSession,
} from '@/lib/chatSession';

export async function POST(request: NextRequest) {
    try {
        const clientIp = getClientIp(request);
        const rateLimit = await checkDistributedRateLimit(`chat:${clientIp}`, {
            windowMs: 10 * 60 * 1000,
            max: 20,
        });

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Ban thao tac hoi nhanh. Vui long thu lai sau it phut.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(getRetryAfterSeconds(rateLimit.resetAt)),
                    },
                }
            );
        }

        const body = await request.json();
        const message = typeof body.message === 'string' ? body.message.trim() : '';
        let sessionId = '';
        let newGuestSessionCookie = '';
        const sourcePage = typeof body.sourcePage === 'string' ? body.sourcePage.trim().slice(0, 500) : null;
        const interestedProduct = typeof body.product === 'string' ? body.product.trim().slice(0, 160) : null;
        const interestedTechnology = typeof body.technology === 'string' ? body.technology.trim().slice(0, 80) : null;
        let userId = typeof body.userId === 'string' ? body.userId.trim().slice(0, 80) : null;
        let visitorName = typeof body.visitorName === 'string' ? body.visitorName.trim().slice(0, 120) : null;
        let visitorEmail = typeof body.visitorEmail === 'string' ? body.visitorEmail.trim().slice(0, 160) : null;
        let visitorPhone = typeof body.visitorPhone === 'string' ? body.visitorPhone.trim().slice(0, 30) : null;
        let visitorAvatar = typeof body.visitorAvatar === 'string' ? body.visitorAvatar.trim().slice(0, 500) : null;

        const authClient = await createClient();
        const { data: { user: authenticatedUser } } = await authClient.auth.getUser();
        if (authenticatedUser) {
            sessionId = authenticatedUser.id;
            userId = authenticatedUser.id;
            visitorEmail = authenticatedUser.email || visitorEmail;
            const adminClient = createAdminClient();
            const { data: profile } = await adminClient
                .from('profiles')
                .select('name, phone, avatar, email')
                .eq('id', authenticatedUser.id)
                .maybeSingle();
            visitorName = profile?.name || authenticatedUser.user_metadata?.name || visitorName;
            visitorPhone = profile?.phone || visitorPhone;
            visitorAvatar = profile?.avatar || visitorAvatar;
            visitorEmail = profile?.email || visitorEmail;
        } else if (!visitorName || !visitorPhone || visitorPhone.replace(/\D/g, '').length < 9) {
            return NextResponse.json({ error: 'Vui lòng nhập tên và số điện thoại trước khi chat.' }, { status: 400 });
        } else {
            sessionId = readGuestChatSession(request) || '';
            if (!sessionId) {
                const guestSession = createGuestChatSession();
                if (!guestSession) {
                    console.error('A server-side chat session secret is required.');
                    return NextResponse.json({ error: 'Chat session is unavailable.' }, { status: 503 });
                }
                sessionId = guestSession.sessionId;
                newGuestSessionCookie = guestSession.cookieValue;
            }
        }

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        if (message.length > 1000) {
            return NextResponse.json(
                { error: 'Message is too long' },
                { status: 400 }
            );
        }

        const safeHistory = Array.isArray(body.history) ? body.history.slice(-6) : [];
        if (sessionId) {
            await saveChatTurn({ sessionId, sender: 'user', message, sourcePage, interestedProduct, interestedTechnology, userId, visitorName, visitorEmail, visitorPhone, visitorAvatar });
        }
        const response = await chatWithAI(message, safeHistory);

        if (sessionId && response.message) {
            await saveChatTurn({ sessionId, sender: 'bot', message: response.message, sourcePage, interestedProduct, interestedTechnology, userId, visitorName, visitorEmail, visitorPhone, visitorAvatar });
        }

        const result = NextResponse.json({ ...response, sessionId: sessionId || null });
        if (newGuestSessionCookie) attachGuestChatSessionCookie(result, newGuestSessionCookie);
        return result;
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            {
                message: 'Xin loi, co loi xay ra. Vui long thu lai sau!',
                error: 'Chat service unavailable',
            },
            { status: 500 }
        );
    }
}
