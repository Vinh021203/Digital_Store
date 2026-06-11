// API Route for AI Chatbot
import { NextRequest, NextResponse } from 'next/server';
import { chatWithGemini } from '@/lib/gemini';
import { checkRateLimit, getClientIp, getRetryAfterSeconds } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        const clientIp = getClientIp(request);
        const rateLimit = checkRateLimit(`chat:${clientIp}`, {
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

        const safeHistory = Array.isArray(body.history) ? body.history.slice(-12) : [];
        const response = await chatWithGemini(message, safeHistory);

        return NextResponse.json(response);
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
