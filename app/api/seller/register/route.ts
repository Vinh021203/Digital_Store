import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

async function createUniqueSlug(supabase: ReturnType<typeof createAdminClient>, name: string) {
    const baseSlug = generateSlug(name) || `seller-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
        const { data, error } = await supabase
            .from('sellers')
            .select('id')
            .eq('store_slug', slug)
            .maybeSingle();

        if (error) {
            throw new Error(error.message);
        }

        if (!data) return slug;

        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const adminClient = createAdminClient();

        const { data: authData, error: authError } = await supabase.auth.getUser();
        const user = authData.user;

        if (authError || !user) {
            return NextResponse.json({ error: 'Vui lòng đăng nhập để đăng ký người bán.' }, { status: 401 });
        }

        const body = await request.json();
        const storeName = String(body.store_name || '').trim();
        const description = String(body.description || '').trim();
        const bankName = String(body.bank_name || '').trim();
        const bankAccount = String(body.bank_account || '').trim();

        if (storeName.length < 3 || storeName.length > 80) {
            return NextResponse.json({ error: 'Tên cửa hàng cần từ 3 đến 80 ký tự.' }, { status: 400 });
        }

        if (description.length > 500) {
            return NextResponse.json({ error: 'Mô tả cửa hàng tối đa 500 ký tự.' }, { status: 400 });
        }

        if (bankName.length > 100 || bankAccount.length > 100) {
            return NextResponse.json({ error: 'Thông tin ngân hàng tối đa 100 ký tự.' }, { status: 400 });
        }

        const { data: existingSeller, error: sellerLookupError } = await adminClient
            .from('sellers')
            .select('id, store_slug, status')
            .eq('user_id', user.id)
            .maybeSingle();

        if (sellerLookupError) {
            return NextResponse.json({ error: sellerLookupError.message }, { status: 500 });
        }

        if (existingSeller) {
            return NextResponse.json({
                error: 'Tài khoản này đã đăng ký người bán rồi.',
                seller: existingSeller,
            }, { status: 409 });
        }

        const slug = await createUniqueSlug(adminClient, storeName);

        const { data: seller, error: insertError } = await adminClient
            .from('sellers')
            .insert({
                user_id: user.id,
                store_name: storeName,
                store_slug: slug,
                description: description || null,
                bank_name: bankName || null,
                bank_account: bankAccount || null,
                status: 'pending',
            })
            .select()
            .single();

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        const { data: profile } = await adminClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            const { error: roleError } = await adminClient
                .from('profiles')
                .update({ role: 'seller' })
                .eq('id', user.id);

            if (roleError) {
                return NextResponse.json({ error: roleError.message }, { status: 500 });
            }
        }

        return NextResponse.json({ seller });
    } catch (error) {
        console.error('Seller register error:', error);
        return NextResponse.json({ error: 'Không thể đăng ký người bán lúc này.' }, { status: 500 });
    }
}
