// lib/imageUpload.ts
import { createClient } from './supabase/client';

/**
 * Upload image to Supabase Storage
 * @param file - File to upload
 * @param bucket - Storage bucket name (default: 'products')
 * @returns Public URL of uploaded image
 */
export async function uploadImage(
    file: File,
    bucket: string = 'products'
): Promise<string | null> {
    const supabase = createClient();
    if (!supabase) return null;

    try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }

        // Get public URL
        const { data: publicUrl } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return publicUrl.publicUrl;
    } catch (error) {
        console.error('Error in uploadImage:', error);
        return null;
    }
}

/**
 * Delete image from Supabase Storage
 * @param path - Path or URL of the image
 * @param bucket - Storage bucket name
 */
export async function deleteImage(
    path: string,
    bucket: string = 'products'
): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    try {
        // Extract filename from URL if full URL is provided
        let filePath = path;
        if (path.includes('/')) {
            filePath = path.split('/').pop() || path;
        }

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            console.error('Error deleting image:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in deleteImage:', error);
        return false;
    }
}

/**
 * Upload multiple images
 * @param files - Array of files to upload
 * @param bucket - Storage bucket name
 * @returns Array of public URLs
 */
export async function uploadMultipleImages(
    files: File[],
    bucket: string = 'products'
): Promise<string[]> {
    const urls: string[] = [];

    for (const file of files) {
        const url = await uploadImage(file, bucket);
        if (url) {
            urls.push(url);
        }
    }

    return urls;
}
