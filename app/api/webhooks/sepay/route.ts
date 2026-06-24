// app/api/webhooks/sepay/route.ts
// SePay Webhook Handler - Receives payment confirmations

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
    verifyWebhookSignature,
    parseWebhookPayload,
    extractOrderIdFromPayload
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
        const rawBody = await request.text();
        const body = JSON.parse(rawBody);
        const signature = request.headers.get('x-sepay-signature') || '';

        // ========================================
        // SECURITY: Verify webhook signature (optional)
        // Only verify if both secret and signature are present
        // ========================================
        const webhookSecret = process.env.SEPAY_WEBHOOK_SECRET;

        if (webhookSecret && signature) {
            const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
            if (!isValid) {
                console.error('SECURITY: Invalid webhook signature');
                return NextResponse.json(
                    { success: false, error: 'Invalid signature' },
                    { status: 401 }
                );
            }
        }

        // Parse webhook payload
        const payload = parseWebhookPayload(body);
        if (!payload) {
            console.error('SePay webhook invalid payload:', body);
            return NextResponse.json(
                { success: false, error: 'Invalid payload' },
                { status: 400 }
            );
        }

        console.info('SePay webhook received:', {
            id: payload.id,
            transferType: payload.transferType,
            transferAmount: payload.transferAmount,
            content: payload.content,
            description: payload.description,
            code: payload.code,
            referenceCode: payload.referenceCode,
        });

        // Only process incoming transfers
        if (payload.transferType !== 'in') {
            return NextResponse.json({
                success: true,
                message: 'Ignored outgoing transfer'
            });
        }

        // Extract order ID from payment content
        const orderId = extractOrderIdFromPayload(payload);

        if (!orderId) {
            console.warn('SePay webhook ignored: no DM order code found', {
                content: payload.content,
                description: payload.description,
                code: payload.code,
                referenceCode: payload.referenceCode,
            });
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
            console.error('SePay webhook order not found:', { orderId, fetchError });
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        // Verify payment amount matches order total
        if (payload.transferAmount < order.total) {
            console.error('SePay payment amount mismatch:', {
                orderId,
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
            console.error('SePay failed to update order:', { orderId, updateError });
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
                const errCode = (couponErr as { code?: string })?.code;
                if (errCode !== '23505') {
                    console.error('Coupon usage recording error:', couponErr);
                }
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
