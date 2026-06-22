import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const adminClient = createAdminClient();
        const { data: profile, error: profileError } = await adminClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        revalidatePath('/', 'page');
        revalidatePath('/products', 'page');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Storefront revalidation error:', error);
        return NextResponse.json({ error: 'Unable to refresh storefront cache' }, { status: 500 });
    }
}
