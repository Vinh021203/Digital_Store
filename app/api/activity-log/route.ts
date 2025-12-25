// app/api/activity-log/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Get client IP from headers
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';

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

        // Insert activity log with IP
        const { data, error } = await supabase
            .from('activity_logs')
            .insert({
                user_id: body.user_id || user?.id || null,
                action: body.action,
                entity: body.entity || null,
                entity_id: body.entity_id || null,
                entity_name: body.entity_name || null,
                details: body.details || null,
                ip_address: ip,
                severity: body.severity || 'info',
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
