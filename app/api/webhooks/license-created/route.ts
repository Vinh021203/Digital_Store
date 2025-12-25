// app/api/webhooks/license-created/route.ts
// Webhook handler called by Supabase trigger when a new license is created
// Sends license delivery email to customer

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendLicenseDeliveryEmail } from '@/lib/email';

// Webhook secret for validation (set in Supabase trigger)
const WEBHOOK_SECRET = process.env.INTERNAL_WEBHOOK_SECRET || 'digitalmart-internal-webhook';

export async function POST(request: NextRequest) {
    try {
        // Validate webhook secret (optional for internal webhooks)
        const authHeader = request.headers.get('x-webhook-secret');
        if (authHeader && authHeader !== WEBHOOK_SECRET) {
            console.error('Invalid webhook secret');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        console.log('License created webhook received:', body);

        const { license_id, license_key, user_id, product_id, type } = body;

        if (!license_id || !user_id || !product_id) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Use admin client to bypass RLS (webhook has no user session)
        const supabase = createAdminClient();

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email, name')
            .eq('id', user_id)
            .single();

        if (profileError || !profile) {
            console.error('Error fetching user profile:', profileError);
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get product info
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('name, slug')
            .eq('id', product_id)
            .single();

        if (productError || !product) {
            console.error('Error fetching product:', productError);
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Get site URL for download link
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://digitalmart.store';

        // Send license delivery email
        await sendLicenseDeliveryEmail({
            customerEmail: profile.email,
            customerName: profile.name,
            productName: product.name,
            licenseKey: license_key,
            licenseType: type || 'Regular',
            downloadUrl: `${siteUrl}/profile/downloads`,
        });

        console.log('License email sent successfully to:', profile.email);

        return NextResponse.json({
            success: true,
            message: 'License email sent',
            to: profile.email,
        });

    } catch (error: unknown) {
        console.error('License webhook error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

// Health check
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'License created webhook endpoint active',
    });
}
