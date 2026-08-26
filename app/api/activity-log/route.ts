// app/api/activity-log/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/server';
import { checkDistributedRateLimit, getClientIp, getRetryAfterSeconds } from '@/lib/rateLimit';

const ALLOWED_SEVERITIES = new Set(['info', 'warning', 'error', 'success']);

function cleanString(value: unknown, maxLength: number) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();

    return trimmed ? trimmed.slice(0, maxLength) : null;
}

export async function POST(request: NextRequest) {
    try {
        const clientIp = getClientIp(request);
        const rateLimit = await checkDistributedRateLimit(`activity-log:${clientIp}`, {
            windowMs: 10 * 60 * 1000,
            max: 40,
        });
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many activity log requests.' },
                { status: 429, headers: { 'Retry-After': String(getRetryAfterSeconds(rateLimit.resetAt)) } },
            );
        }

        const body = await request.json();
        const action = cleanString(body.action, 80);

        if (!action) {
            return NextResponse.json({ error: 'Action is required' }, { status: 400 });
        }

        const severity = cleanString(body.severity, 20) || 'info';

        // Get client IP from headers
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

        // Create Supabase client
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    },
                },
            }
        );

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        const isAnonymousLoginFailure = !user
            && action === 'Login'
            && cleanString(body.entity, 80) === 'user'
            && severity === 'error';

        if (!user && !isAnonymousLoginFailure) {
            return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
        }

        const writer = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase;
        const { data, error } = await writer
            .from('activity_logs')
            .insert({
                user_id: user?.id || null,
                action,
                entity: cleanString(body.entity, 80),
                entity_id: cleanString(body.entity_id, 120),
                entity_name: cleanString(body.entity_name, 180),
                details: cleanString(body.details, 1000),
                ip_address: ip,
                severity: ALLOWED_SEVERITIES.has(severity) ? severity : 'info',
            })
            .select()
            .single();

        if (error) {
            console.error('[ActivityLog API] Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('[ActivityLog API] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
