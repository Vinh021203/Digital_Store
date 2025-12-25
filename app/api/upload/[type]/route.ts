import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@/lib/supabase/server';

// Upload types that require admin role
const ADMIN_ONLY_TYPES = ['category-icon', 'blog-cover'];

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Upload configurations for each type
const UPLOAD_CONFIGS: Record<string, {
    folder: string;
    transformation?: any[];
    resourceType?: string;
    multiple?: boolean;
}> = {
    // Profile
    avatar: {
        folder: 'digitalmart/avatars',
        transformation: [{ width: 200, height: 200, crop: 'fill', quality: 'auto' }],
    },
    cover: {
        folder: 'digitalmart/covers',
        transformation: [{ width: 1400, height: 400, crop: 'fill', quality: 'auto' }],
    },

    // Products
    'product-image': {
        folder: 'digitalmart/products',
        transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }],
    },
    'product-gallery': {
        folder: 'digitalmart/products/gallery',
        transformation: [{ width: 1200, height: 800, crop: 'fill', quality: 'auto' }],
        multiple: true,
    },

    // Blog
    'blog-cover': {
        folder: 'digitalmart/blog',
        transformation: [{ width: 1200, height: 630, crop: 'fill', quality: 'auto' }],
    },

    // Sellers
    'seller-logo': {
        folder: 'digitalmart/sellers/logos',
        transformation: [{ width: 200, height: 200, crop: 'fill', quality: 'auto' }],
    },
    'seller-banner': {
        folder: 'digitalmart/sellers/banners',
        transformation: [{ width: 1400, height: 400, crop: 'fill', quality: 'auto' }],
    },

    // Community
    'community-image': {
        folder: 'digitalmart/community',
        transformation: [{ width: 1000, height: 800, crop: 'limit', quality: 'auto' }],
    },

    // Categories
    'category-icon': {
        folder: 'digitalmart/categories',
        transformation: [{ width: 128, height: 128, crop: 'fill', quality: 'auto' }],
    },

    // Tickets
    'ticket-attachments': {
        folder: 'digitalmart/tickets',
        resourceType: 'auto',
        multiple: true,
    },

    // Product Files (digital downloads - zip, rar, etc.)
    'product-file': {
        folder: 'digitalmart/product-files',
        resourceType: 'raw', // For non-image files like zip, rar, pdf
    },
};

async function uploadSingleFile(buffer: Buffer, config: typeof UPLOAD_CONFIGS[string]): Promise<string> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder: config.folder,
                    resource_type: (config.resourceType || 'image') as any,
                    transformation: config.transformation,
                },
                (error, result) => {
                    if (error || !result) reject(error);
                    else resolve(result.secure_url);
                },
            )
            .end(buffer);
    });
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ type: string }> }
) {
    try {
        const { type } = await params;
        const config = UPLOAD_CONFIGS[type];

        if (!config) {
            return NextResponse.json(
                { error: `Invalid upload type: ${type}. Valid types: ${Object.keys(UPLOAD_CONFIGS).join(', ')}` },
                { status: 400 }
            );
        }

        // ========================================
        // SECURITY: Authentication Check
        // ========================================
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please login to upload files.' },
                { status: 401 }
            );
        }

        // Check admin role for sensitive upload types
        if (ADMIN_ONLY_TYPES.includes(type)) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin') {
                return NextResponse.json(
                    { error: 'Forbidden. Admin access required.' },
                    { status: 403 }
                );
            }
        }
        // ========================================

        const formData = await req.formData();

        // Handle multiple files
        if (config.multiple) {
            const files = formData.getAll('files');

            if (!files || files.length === 0) {
                return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
            }

            const uploadPromises = files.map(async (file) => {
                if (!(file instanceof File)) {
                    throw new Error('Invalid file');
                }
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                return uploadSingleFile(buffer, config);
            });

            const urls = await Promise.all(uploadPromises);
            return NextResponse.json({ urls });
        }

        // Handle single file
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const url = await uploadSingleFile(buffer, config);

        return NextResponse.json({ url });
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

// GET endpoint to list available upload types
export async function GET() {
    return NextResponse.json({
        message: 'Available upload types',
        types: Object.entries(UPLOAD_CONFIGS).map(([type, config]) => ({
            type,
            folder: config.folder,
            multiple: config.multiple || false,
            endpoint: `/api/upload/${type}`,
        })),
    });
}
