import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('[Test API] Supabase URL:', supabaseUrl ? 'SET' : 'MISSING');
    console.log('[Test API] Supabase Key:', supabaseKey ? 'SET' : 'MISSING');

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

        console.log('[Test API] Query result:', { data: data?.length, error: error?.message });

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
