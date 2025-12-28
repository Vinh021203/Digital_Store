// API Route for AI Chatbot
import { NextRequest, NextResponse } from 'next/server';
import { chatWithGemini } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        const response = await chatWithGemini(message);

        return NextResponse.json(response);
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            {
                message: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau!',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
