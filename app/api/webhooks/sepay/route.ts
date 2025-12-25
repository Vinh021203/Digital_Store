// app/api/webhooks/sepay/route.ts
// SePay Webhook Handler - Receives payment confirmations

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
    verifyWebhookSignature,
    parseWebhookPayload,
    extractOrderIdFromContent
} from '@/lib/sepay';

// Create admin client for server-side operations (bypasses RLS)
function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase environment variables');
        return null;
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const signature = request.headers.get('x-sepay-signature') || '';
        const rawBody = JSON.stringify(body);

        // Log for debugging (will be removed in production by next.config.js)
        console.log('SePay Webhook received:', {
            signature: signature ? signature.substring(0, 20) + '...' : 'none',
            body: body,
        });

        // ========================================
        // SECURITY: Verify webhook signature
        // In production, signature verification is MANDATORY
        // ========================================
        const webhookSecret = process.env.SEPAY_WEBHOOK_SECRET;
        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction) {
            // Production: MUST have webhook secret configured
            if (!webhookSecret) {
                console.error('SECURITY: SEPAY_WEBHOOK_SECRET not configured in production!');
                return NextResponse.json(
                    { success: false, error: 'Webhook not properly configured' },
                    { status: 500 }
                );
            }

            // Production: MUST have valid signature
            if (!signature) {
                console.error('SECURITY: Missing webhook signature');
                return NextResponse.json(
                    { success: false, error: 'Missing signature' },
                    { status: 401 }
                );
            }

            const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
            if (!isValid) {
                console.error('SECURITY: Invalid webhook signature');
                return NextResponse.json(
                    { success: false, error: 'Invalid signature' },
                    { status: 401 }
                );
            }
        } else if (webhookSecret && signature) {
            // Development: Optional verification if both are provided
            const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
            if (!isValid) {
                console.warn('DEV: Invalid signature, but allowing in development');
            }
        }
        // ========================================

        // Parse webhook payload
        const payload = parseWebhookPayload(body);
        if (!payload) {
            console.log('Failed to parse payload:', body);
            return NextResponse.json(
                { success: false, error: 'Invalid payload' },
                { status: 400 }
            );
        }

        // Only process incoming transfers
        if (payload.transferType !== 'in') {
            return NextResponse.json({
                success: true,
                message: 'Ignored outgoing transfer'
            });
        }

        // Extract order ID from payment content
        const orderId = extractOrderIdFromContent(payload.content);
        console.log('Extracted order ID:', orderId, 'from content:', payload.content);

        if (!orderId) {
            console.log('No order ID found in content:', payload.content);
            return NextResponse.json({
                success: true,
                message: 'No order ID in content'
            });
        }

        // Update order in Supabase using admin client
        const supabase = createAdminClient();
        if (!supabase) {
            return NextResponse.json(
                { success: false, error: 'Database connection failed' },
                { status: 500 }
            );
        }

        // Get order to verify amount
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('id, total, status, coupon_id, user_id')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) {
            console.error('Order not found:', orderId);
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        // Verify payment amount matches order total
        if (payload.transferAmount < order.total) {
            console.error('Payment amount mismatch:', {
                expected: order.total,
                received: payload.transferAmount,
            });
            return NextResponse.json(
                { success: false, error: 'Payment amount mismatch' },
                { status: 400 }
            );
        }

        // Update order status to paid
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'paid',
                payment_id: payload.referenceCode || payload.id.toString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

        if (updateError) {
            console.error('Failed to update order:', updateError);
            return NextResponse.json(
                { success: false, error: 'Failed to update order' },
                { status: 500 }
            );
        }

        // Record payment in payments table
        await supabase.from('payments').insert({
            order_id: orderId,
            gateway: 'sepay',
            amount: payload.transferAmount,
            currency: 'VND',
            status: 'paid',
            provider_transaction_id: payload.referenceCode || payload.id.toString(),
            provider_payload: body,
            webhook_verified: true,
        });

        // Record coupon usage if coupon was used
        if (order.coupon_id && order.user_id) {
            try {
                await supabase.from('coupon_usages').insert({
                    coupon_id: order.coupon_id,
                    user_id: order.user_id,
                    order_id: orderId,
                });
            } catch (couponErr: unknown) {
                // Ignore unique constraint violation (already recorded)
                const errCode = (couponErr as { code?: string })?.code;
                console.log('Coupon usage recording:', errCode === '23505' ? 'already exists' : couponErr);
            }

            // Also increment used_count on coupons table
            const { data: coupon } = await supabase
                .from('coupons')
                .select('used_count')
                .eq('id', order.coupon_id)
                .single();

            if (coupon) {
                await supabase
                    .from('coupons')
                    .update({ used_count: coupon.used_count + 1 })
                    .eq('id', order.coupon_id);
            }
        }

        console.log('Order payment confirmed:', orderId);

        return NextResponse.json({
            success: true,
            message: 'Payment confirmed',
            orderId: orderId,
        });

    } catch (error: unknown) {
        console.error('Webhook error:', error);
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
        message: 'SePay webhook endpoint active'
    });
}
