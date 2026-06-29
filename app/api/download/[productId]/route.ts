// app/api/download/[productId]/route.ts
// Secure download API - verifies license before allowing download

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp, getRetryAfterSeconds } from '@/lib/rateLimit';

function parseProductId(productId: string) {
    const productIdNum = Number.parseInt(productId, 10);
    return Number.isInteger(productIdNum) && productIdNum > 0 ? productIdNum : null;
}

function isValidVersion(version: string | null) {
    return !version || /^[a-zA-Z0-9._-]{1,40}$/.test(version);
}

function isExpired(expiresAt?: string | null) {
    return Boolean(expiresAt && new Date(expiresAt).getTime() < Date.now());
}

function isAllowedDownloadUrl(fileUrl: string) {
    try {
        const url = new URL(fileUrl);
        return url.protocol === 'https:' && url.hostname === 'res.cloudinary.com';
    } catch {
        return false;
    }
}

function getStorageBucket() {
    return process.env.SUPABASE_STORAGE_BUCKET || 'product-files';
}

function getStoragePath(fileUrl: string) {
    const bucket = getStorageBucket();
    let path = fileUrl.trim();

    if (!path || /^https?:\/\//i.test(path)) return null;

    if (path.startsWith(`supabase://${bucket}/`)) {
        path = path.slice(`supabase://${bucket}/`.length);
    }

    if (path.startsWith(`${bucket}/`)) {
        path = path.slice(bucket.length + 1);
    }

    path = path.replace(/^\/+/, '');

    if (!path || path.includes('..') || path.includes('\\')) return null;

    return path;
}

function getFileNameFromPath(path: string, fallback: string) {
    const fileName = path.split('/').pop()?.trim();
    return fileName || fallback;
}

async function resolveDownloadUrl(
    adminClient: ReturnType<typeof createAdminClient>,
    fileUrl: string,
    fallbackFilename: string,
) {
    if (isAllowedDownloadUrl(fileUrl)) {
        return {
            url: fileUrl,
            filename: fallbackFilename,
            expiresIn: null as number | null,
        };
    }

    const storagePath = getStoragePath(fileUrl);
    if (!storagePath) return null;

    const bucket = getStorageBucket();
    const filename = getFileNameFromPath(storagePath, fallbackFilename);
    const expiresIn = 30 * 60;
    const { data, error } = await adminClient.storage
        .from(bucket)
        .createSignedUrl(storagePath, expiresIn, {
            download: filename,
        });

    if (error || !data?.signedUrl) {
        console.error('Signed download URL error:', error);
        return null;
    }

    return {
        url: data.signedUrl,
        filename,
        expiresIn,
    };
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId } = await params;
        const productIdNum = parseProductId(productId);

        if (!productIdNum) {
            return NextResponse.json(
                { error: 'Invalid product ID' },
                { status: 400 }
            );
        }

        // Get version from query params (optional, defaults to current)
        const { searchParams } = new URL(request.url);
        const requestedVersion = searchParams.get('version');

        if (!isValidVersion(requestedVersion)) {
            return NextResponse.json(
                { error: 'Invalid version' },
                { status: 400 }
            );
        }

        // Auth check - use user's client
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please login to download.' },
                { status: 401 }
            );
        }

        const rateLimit = checkRateLimit(`download:${user.id}:${productIdNum}`, {
            windowMs: 60 * 60 * 1000,
            max: 20,
        });

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many download attempts. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(getRetryAfterSeconds(rateLimit.resetAt)),
                    },
                }
            );
        }

        // Use admin client for database operations (bypasses RLS)
        const adminClient = createAdminClient();

        // Check if user has valid license for this product
        // Use order + limit to get latest license if user has multiple
        const { data: licenses, error: licenseError } = await adminClient
            .from('licenses')
            .select('id, status, type, downloads_this_month, downloads_limit, expires_at')
            .eq('user_id', user.id)
            .eq('product_id', productIdNum)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1);

        const license = licenses?.[0] || null;

        if (licenseError) {
            console.error('License check error:', licenseError);
            return NextResponse.json(
                { error: 'Unable to verify license.' },
                { status: 500 }
            );
        }

        if (!license || isExpired(license.expires_at)) {
            return NextResponse.json(
                { error: 'No valid license found. Please purchase this product first.' },
                { status: 403 }
            );
        }

        // Check download limit
        const downloadsThisMonth = license.downloads_this_month || 0;
        const downloadsLimit = license.downloads_limit || 999999;

        if (downloadsThisMonth >= downloadsLimit) {
            return NextResponse.json(
                { error: `Download limit reached (${downloadsLimit}/month). Please contact support.` },
                { status: 429 }
            );
        }

        // Get product file (specific version or current)
        let fileQuery = adminClient
            .from('product_files')
            .select('id, version, file_url, file_size, changelog')
            .eq('product_id', productIdNum);

        if (requestedVersion) {
            fileQuery = fileQuery.eq('version', requestedVersion);
        } else {
            fileQuery = fileQuery.eq('is_current', true);
        }

        const { data: productFile, error: fileError } = await fileQuery.maybeSingle();

        // Fallback to latest file if no current version
        let finalFile = productFile;
        if (fileError || !productFile) {
            const { data: fallbackFile } = await adminClient
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
            finalFile = fallbackFile;
        }

        // Get product info for the response
        const { data: product } = await adminClient
            .from('products')
            .select('name')
            .eq('id', productIdNum)
            .single();

        // Return file URL
        const fileUrl = finalFile?.file_url;
        const fallbackFilename = `${product?.name || 'download'}-v${finalFile?.version}.zip`;

        if (!fileUrl) {
            return NextResponse.json(
                { error: 'Download file is not available.' },
                { status: 404 }
            );
        }

        const download = await resolveDownloadUrl(adminClient, fileUrl, fallbackFilename);

        if (!download) {
            return NextResponse.json(
                { error: 'Download file is not available.' },
                { status: 404 }
            );
        }

        // Get client IP for logging
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Log the download after the private/signed URL is generated successfully.
        const { error: logError } = await adminClient.from('downloads').insert({
            user_id: user.id,
            product_id: productIdNum,
            license_id: license.id,
            file_version: finalFile?.version || 'unknown',
            ip_address: ip,
        });

        if (logError) {
            console.error('Download log error:', logError);
        }

        // Increment download count on license
        const { error: updateError } = await adminClient
            .from('licenses')
            .update({ downloads_this_month: downloadsThisMonth + 1 })
            .eq('id', license.id);

        if (updateError) {
            console.error('Download count update error:', updateError);
        }

        return NextResponse.json({
            success: true,
            download: {
                url: download.url,
                filename: download.filename,
                version: finalFile?.version,
                size: finalFile?.file_size,
                changelog: finalFile?.changelog,
                expiresIn: download.expiresIn,
            },
            license: {
                type: license.type,
                remainingDownloads: downloadsLimit - downloadsThisMonth - 1,
            },
        });

    } catch (error: unknown) {
        console.error('Download API error:', error);
        return NextResponse.json(
            { success: false, error: 'Download failed' },
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
        const productIdNum = parseProductId(productId);

        if (!productIdNum) {
            return NextResponse.json(
                { error: 'Invalid product ID' },
                { status: 400 }
            );
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const rateLimit = checkRateLimit(`download-versions:${user.id}:${productIdNum}`, {
            windowMs: 60 * 60 * 1000,
            max: 60,
        });

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(getRetryAfterSeconds(rateLimit.resetAt)),
                    },
                }
            );
        }

        const adminClient = createAdminClient();

        // Check license
        const { data: license } = await adminClient
            .from('licenses')
            .select('id, expires_at')
            .eq('user_id', user.id)
            .eq('product_id', productIdNum)
            .eq('status', 'active')
            .maybeSingle();

        if (!license || isExpired(license.expires_at)) {
            return NextResponse.json(
                { error: 'No valid license' },
                { status: 403 }
            );
        }

        // Get all versions
        const { data: versions, error } = await adminClient
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
