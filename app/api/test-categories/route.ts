import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({
            error: 'Missing env vars',
            url: !!supabaseUrl,
            key: !!supabaseKey
        }, { status: 500 });
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .limit(5);

        if (error) {
            return NextResponse.json({
                success: false,
                error: error.message,
                code: error.code,
                hint: error.hint
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            count: data?.length || 0,
            categories: data
        });
    } catch (err: any) {
        return NextResponse.json({
            success: false,
            error: err.message
        }, { status: 500 });
    }
}
