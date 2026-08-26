import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@/lib/supabase/server';

type UploadRole = 'admin' | 'user';
type UploadConfig = {
    folder: string;
    transformation?: any[];
    resourceType?: 'image' | 'raw' | 'auto';
    multiple?: boolean;
    maxFiles?: number;
    maxSizeBytes: number;
    allowedMimeTypes: string[];
    allowedExtensions: string[];
    allowedRoles: UploadRole[];
};

const MB = 1024 * 1024;
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const DOCUMENT_MIME_TYPES = [
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/vnd.rar',
    'application/x-7z-compressed',
    'application/gzip',
    'application/x-gzip',
    'application/x-tar',
    'application/octet-stream',
];
const DOCUMENT_EXTENSIONS = ['pdf', 'zip', 'rar', '7z', 'tar', 'gz', 'fig', 'sketch', 'xd'];

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Upload configurations for each type
const UPLOAD_CONFIGS: Record<string, UploadConfig> = {
    // Profile
    avatar: {
        folder: 'digitalmart/avatars',
        transformation: [{ width: 200, height: 200, crop: 'fill', quality: 'auto' }],
        maxSizeBytes: 2 * MB,
        allowedMimeTypes: IMAGE_MIME_TYPES,
        allowedExtensions: IMAGE_EXTENSIONS,
        allowedRoles: ['user', 'admin'],
    },
    cover: {
        folder: 'digitalmart/covers',
        transformation: [{ width: 1400, height: 400, crop: 'fill', quality: 'auto' }],
        maxSizeBytes: 5 * MB,
        allowedMimeTypes: IMAGE_MIME_TYPES,
        allowedExtensions: IMAGE_EXTENSIONS,
        allowedRoles: ['user', 'admin'],
    },

    // Products
    'product-image': {
        folder: 'digitalmart/products',
        transformation: [{ width: 1600, height: 1200, crop: 'limit', quality: 'auto' }],
        maxSizeBytes: 8 * MB,
        allowedMimeTypes: IMAGE_MIME_TYPES,
        allowedExtensions: IMAGE_EXTENSIONS,
        allowedRoles: ['admin'],
    },
    'product-gallery': {
        folder: 'digitalmart/products/gallery',
        transformation: [{ width: 1600, height: 1200, crop: 'limit', quality: 'auto' }],
        multiple: true,
        maxFiles: 8,
        maxSizeBytes: 8 * MB,
        allowedMimeTypes: IMAGE_MIME_TYPES,
        allowedExtensions: IMAGE_EXTENSIONS,
        allowedRoles: ['admin'],
    },

    // Blog
    'blog-cover': {
        folder: 'digitalmart/blog',
        transformation: [{ width: 1600, height: 900, crop: 'pad', background: 'auto', quality: 'auto' }],
        maxSizeBytes: 8 * MB,
        allowedMimeTypes: IMAGE_MIME_TYPES,
        allowedExtensions: IMAGE_EXTENSIONS,
        allowedRoles: ['admin'],
    },

    // Community
    'community-image': {
        folder: 'digitalmart/community',
        transformation: [{ width: 1000, height: 800, crop: 'limit', quality: 'auto' }],
        maxSizeBytes: 8 * MB,
        allowedMimeTypes: IMAGE_MIME_TYPES,
        allowedExtensions: IMAGE_EXTENSIONS,
        allowedRoles: ['user', 'admin'],
    },

    // Categories
    'category-icon': {
        folder: 'digitalmart/categories',
        transformation: [{ width: 128, height: 128, crop: 'fill', quality: 'auto' }],
        maxSizeBytes: 2 * MB,
        allowedMimeTypes: IMAGE_MIME_TYPES,
        allowedExtensions: IMAGE_EXTENSIONS,
        allowedRoles: ['admin'],
    },

    // Tickets
    'ticket-attachments': {
        folder: 'digitalmart/tickets',
        resourceType: 'auto',
        multiple: true,
        maxFiles: 5,
        maxSizeBytes: 10 * MB,
        allowedMimeTypes: [...IMAGE_MIME_TYPES, 'application/pdf'],
        allowedExtensions: [...IMAGE_EXTENSIONS, 'pdf'],
        allowedRoles: ['user', 'admin'],
    },

    // Product Files (digital downloads - zip, rar, etc.)
    'product-file': {
        folder: 'digitalmart/product-files',
        resourceType: 'raw', // For non-image files like zip, rar, pdf
        maxSizeBytes: 150 * MB,
        allowedMimeTypes: DOCUMENT_MIME_TYPES,
        allowedExtensions: DOCUMENT_EXTENSIONS,
        allowedRoles: ['admin'],
    },
};

function getFileExtension(fileName: string) {
    return fileName.split('.').pop()?.toLowerCase() || '';
}

function roleCanUpload(role: string | null | undefined, allowedRoles: UploadRole[]) {
    if (role === 'admin') return true;
    return allowedRoles.includes((role || 'user') as UploadRole);
}

function validateFile(file: File, config: UploadConfig) {
    if (file.size <= 0) {
        return 'File is empty.';
    }

    if (file.size > config.maxSizeBytes) {
        return `File is too large. Maximum size is ${Math.floor(config.maxSizeBytes / MB)}MB.`;
    }

    const extension = getFileExtension(file.name);
    const mimeType = file.type || 'application/octet-stream';

    if (!config.allowedExtensions.includes(extension)) {
        return `Invalid file extension. Allowed: ${config.allowedExtensions.join(', ')}.`;
    }

    if (!config.allowedMimeTypes.includes(mimeType)) {
        return `Invalid file type. Allowed: ${config.allowedExtensions.join(', ')}.`;
    }

    return null;
}

function startsWith(buffer: Buffer, bytes: number[]) {
    return bytes.every((byte, index) => buffer[index] === byte);
}

function validateFileSignature(buffer: Buffer, extension: string) {
    if (buffer.length < 12) return false;

    const signatures: Record<string, () => boolean> = {
        jpg: () => startsWith(buffer, [0xff, 0xd8, 0xff]),
        jpeg: () => startsWith(buffer, [0xff, 0xd8, 0xff]),
        png: () => startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        gif: () => buffer.subarray(0, 6).toString('ascii') === 'GIF87a' || buffer.subarray(0, 6).toString('ascii') === 'GIF89a',
        webp: () => buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP',
        pdf: () => buffer.subarray(0, 5).toString('ascii') === '%PDF-',
        zip: () => startsWith(buffer, [0x50, 0x4b, 0x03, 0x04]) || startsWith(buffer, [0x50, 0x4b, 0x05, 0x06]) || startsWith(buffer, [0x50, 0x4b, 0x07, 0x08]),
        fig: () => startsWith(buffer, [0x50, 0x4b]),
        sketch: () => startsWith(buffer, [0x50, 0x4b]),
        xd: () => startsWith(buffer, [0x50, 0x4b]),
        rar: () => startsWith(buffer, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07]),
        '7z': () => startsWith(buffer, [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c]),
        gz: () => startsWith(buffer, [0x1f, 0x8b]),
        tar: () => buffer.length > 262 && buffer.subarray(257, 262).toString('ascii') === 'ustar',
    };

    return signatures[extension]?.() ?? false;
}

function assertValidFileSignature(buffer: Buffer, fileName: string) {
    const extension = getFileExtension(fileName);
    if (!validateFileSignature(buffer, extension)) {
        throw new Error('Invalid file content. The file signature does not match its extension.');
    }
}

async function uploadSingleFile(buffer: Buffer, config: UploadConfig): Promise<string> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder: config.folder,
                    resource_type: config.resourceType || 'image',
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

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError) {
            return NextResponse.json(
                { error: 'Unable to verify upload permission.' },
                { status: 403 }
            );
        }

        if (!roleCanUpload(profile?.role, config.allowedRoles)) {
            return NextResponse.json(
                { error: 'Forbidden. You do not have permission to upload this file type.' },
                { status: 403 }
            );
        }

        // ========================================

        const formData = await req.formData();

        // Handle multiple files
        if (config.multiple) {
            const files = formData.getAll('files');

            if (!files || files.length === 0) {
                return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
            }

            if (files.length > (config.maxFiles || 1)) {
                return NextResponse.json(
                    { error: `Too many files. Maximum is ${config.maxFiles || 1}.` },
                    { status: 400 }
                );
            }

            const uploadPromises = files.map(async (file) => {
                if (!(file instanceof File)) {
                    throw new Error('Invalid file');
                }

                const validationError = validateFile(file, config);
                if (validationError) {
                    throw new Error(validationError);
                }

                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                assertValidFileSignature(buffer, file.name);
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

        const validationError = validateFile(file, config);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        assertValidFileSignature(buffer, file.name);
        const url = await uploadSingleFile(buffer, config);

        return NextResponse.json({ url });
    } catch (err) {
        if (err instanceof Error && (
            err.message.startsWith('Invalid file') ||
            err.message.startsWith('File is') ||
            err.message.startsWith('Too many files')
        )) {
            return NextResponse.json({ error: err.message }, { status: 400 });
        }

        console.error('Cloudinary upload error:', err);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

// GET endpoint to list available upload types
export async function GET() {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
        message: 'Available upload types',
        types: Object.entries(UPLOAD_CONFIGS).map(([type, config]) => ({
            type,
            folder: config.folder,
            multiple: config.multiple || false,
            maxSizeMb: Math.floor(config.maxSizeBytes / MB),
            allowedExtensions: config.allowedExtensions,
            endpoint: `/api/upload/${type}`,
        })),
    });
}
