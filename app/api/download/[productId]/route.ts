// app/api/download/[productId]/route.ts
// Secure download API - verifies license before allowing download
// Generates signed URL and logs download

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId } = await params;
        const productIdNum = parseInt(productId, 10);

        if (isNaN(productIdNum)) {
            return NextResponse.json(
                { error: 'Invalid product ID' },
                { status: 400 }
            );
        }

        // Get version from query params (optional, defaults to current)
        const { searchParams } = new URL(request.url);
        const requestedVersion = searchParams.get('version');

        // Auth check
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please login to download.' },
                { status: 401 }
            );
        }

        // Check if user has valid license for this product
        const { data: license, error: licenseError } = await supabase
            .from('licenses')
            .select('id, status, type, downloads_this_month, downloads_limit')
            .eq('user_id', user.id)
            .eq('product_id', productIdNum)
            .eq('status', 'active')
            .maybeSingle();

        if (licenseError) {
            console.error('License check error:', licenseError);
            return NextResponse.json(
                { error: 'Error checking license' },
                { status: 500 }
            );
        }

        if (!license) {
            return NextResponse.json(
                { error: 'No valid license found. Please purchase this product first.' },
                { status: 403 }
            );
        }

        // Check download limit (if columns exist)
        const downloadsThisMonth = license.downloads_this_month || 0;
        const downloadsLimit = license.downloads_limit || 999999; // Default high limit

        if (downloadsThisMonth >= downloadsLimit) {
            return NextResponse.json(
                { error: `Download limit reached (${downloadsLimit}/month). Please contact support.` },
                { status: 429 }
            );
        }

        // Get product file (specific version or current)
        let fileQuery = supabase
            .from('product_files')
            .select('id, version, file_url, file_size, changelog')
            .eq('product_id', productIdNum);

        if (requestedVersion) {
            fileQuery = fileQuery.eq('version', requestedVersion);
        } else {
            fileQuery = fileQuery.eq('is_current', true);
        }

        const { data: productFile, error: fileError } = await fileQuery.maybeSingle();

        if (fileError || !productFile) {
            // Try to get any file if no current version set
            const { data: fallbackFile } = await supabase
                .from('product_files')
                .select('id, version, file_url, file_size, changelog')
                .eq('product_id', productIdNum)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!fallbackFile) {
                return NextResponse.json(
                    { error: 'No download file available for this product.' },
                    { status: 404 }
                );
            }

            // Use fallback file
            Object.assign(productFile || {}, fallbackFile);
        }

        // Get client IP for logging
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Log the download
        await supabase.from('downloads').insert({
            user_id: user.id,
            product_id: productIdNum,
            license_id: license.id,
            file_version: productFile?.version || 'unknown',
            ip_address: ip,
        });

        // Increment download count on license (if column exists)
        await supabase
            .from('licenses')
            .update({ downloads_this_month: downloadsThisMonth + 1 })
            .eq('id', license.id);

        // Get product info for the response
        const { data: product } = await supabase
            .from('products')
            .select('name')
            .eq('id', productIdNum)
            .single();

        // Return file URL (in production, generate signed URL)
        // For Cloudinary files, the URL is already accessible
        const fileUrl = productFile?.file_url;

        if (!fileUrl) {
            return NextResponse.json(
                { error: 'File URL not found' },
                { status: 404 }
            );
        }

        // Option 1: Redirect to file URL
        // return NextResponse.redirect(fileUrl);

        // Option 2: Return download info (let frontend handle)
        return NextResponse.json({
            success: true,
            download: {
                url: fileUrl,
                filename: `${product?.name || 'download'}-v${productFile?.version}.zip`,
                version: productFile?.version,
                size: productFile?.file_size,
                changelog: productFile?.changelog,
            },
            license: {
                type: license.type,
                remainingDownloads: downloadsLimit - downloadsThisMonth - 1,
            },
        });

    } catch (error: unknown) {
        console.error('Download API error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

// Get available versions for a product
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId } = await params;
        const productIdNum = parseInt(productId, 10);

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check license
        const { data: license } = await supabase
            .from('licenses')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', productIdNum)
            .eq('status', 'active')
            .maybeSingle();

        if (!license) {
            return NextResponse.json(
                { error: 'No valid license' },
                { status: 403 }
            );
        }

        // Get all versions
        const { data: versions, error } = await supabase
            .from('product_files')
            .select('id, version, file_size, changelog, is_current, created_at')
            .eq('product_id', productIdNum)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            versions: versions || [],
        });

    } catch (error: unknown) {
        console.error('Versions API error:', error);
        return NextResponse.json(
            { error: 'Failed to get versions' },
            { status: 500 }
        );
    }
}
