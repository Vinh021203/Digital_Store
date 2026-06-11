import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

const ALLOWED_STATUSES = new Set(['active', 'pending', 'suspended']);

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const sellerId = Number.parseInt(id, 10);

        if (!Number.isInteger(sellerId) || sellerId <= 0) {
            return NextResponse.json({ error: 'Invalid seller ID' }, { status: 400 });
        }

        const body = await request.json();
        const status = typeof body.status === 'string' ? body.status : '';

        if (!ALLOWED_STATUSES.has(status)) {
            return NextResponse.json({ error: 'Invalid seller status' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const adminClient = createAdminClient();
        const { data: adminProfile, error: adminProfileError } = await adminClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (adminProfileError || adminProfile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: seller, error: sellerError } = await adminClient
            .from('sellers')
            .select('id, user_id')
            .eq('id', sellerId)
            .single();

        if (sellerError || !seller) {
            return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
        }

        const { error: updateSellerError } = await adminClient
            .from('sellers')
            .update({ status })
            .eq('id', sellerId);

        if (updateSellerError) {
            console.error('Seller status update error:', updateSellerError);
            return NextResponse.json({ error: 'Unable to update seller status' }, { status: 500 });
        }

        const nextRole = status === 'active' ? 'seller' : 'user';
        const { error: updateRoleError } = await adminClient
            .from('profiles')
            .update({ role: nextRole })
            .eq('id', seller.user_id)
            .neq('role', 'admin');

        if (updateRoleError) {
            console.error('Seller role update error:', updateRoleError);
            return NextResponse.json({ error: 'Unable to update seller role' }, { status: 500 });
        }

        return NextResponse.json({ success: true, status });
    } catch (error) {
        console.error('Admin seller status API error:', error);
        return NextResponse.json({ error: 'Unable to update seller status' }, { status: 500 });
    }
}
