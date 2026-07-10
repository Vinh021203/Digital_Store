// lib/blog.ts
import { createClient } from './supabase/client';

// ============================================
// Constants
// ============================================
export const BLOG_CATEGORIES = [
    { name: 'Góc Review Sách', count: 18, icon: 'book' },
    { name: 'Kỹ Năng Mềm', count: 12, icon: 'target' },
    { name: 'Học Lập Trình', count: 15, icon: 'code' },
    { name: 'Chuyện Nghề', count: 14, icon: 'briefcase' },
    { name: 'Tài Chính Cá Nhân', count: 10, icon: 'wallet' },
    { name: 'Phong Cách Sống', count: 13, icon: 'sparkles' },
];

export const collectBlogTaxonomy = (posts: Pick<DbBlogPost, 'category' | 'tags'>[], includeDefaults = true) => ({
    categories: Array.from(new Set([
        ...(includeDefaults ? BLOG_CATEGORIES.map(category => category.name) : []),
        ...posts.map(post => post.category?.trim()).filter((value): value is string => Boolean(value)),
    ])).sort((a, b) => a.localeCompare(b, 'vi')),
    tags: Array.from(new Set([
        ...(includeDefaults ? BLOG_TAGS : []),
        ...posts.flatMap(post => post.tags || []).map(tag => tag.trim()).filter(Boolean),
    ])).sort((a, b) => a.localeCompare(b, 'vi')),
});

export const BLOG_TAGS = [
    'Học Tập',
    'Kỹ Năng',
    'Review Sách',
    'Công Nghệ',
    'Khởi Nghiệp',
    'Lối Sống',
    'Tài Chính',
    'Sức Khỏe',
    'Tâm Lý',
    'AI',
    'ReactJS',
    'Python',
    'NextJS',
    'TypeScript',
    'UI/UX',
    'Career',
    'Freelance',
    'Remote',
];

// ============================================
// Types
// ============================================
export interface DbBlogPost {
    id: number;
    title: string;
    slug: string;
    content: string | null;
    excerpt: string | null;
    cover_image: string | null;
    author_id: string | null;
    category: string | null;
    tags: string[];
    views_count: number;
    is_published: boolean;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    // Joined
    author?: { id: string; name: string; avatar: string } | null;
}

export interface BlogPostPayload {
    title: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    cover_image?: string;
    author_id: string;
    category?: string;
    tags?: string[];
    is_published?: boolean;
}

// ============================================
// Helper: Generate slug
// ============================================
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// ============================================
// Fetch published posts (public)
// ============================================
export async function fetchPublishedPosts(options?: {
    category?: string;
    limit?: number;
}): Promise<DbBlogPost[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
        .from('blog_posts')
        .select(`
      *,
      author:author_id (id, name, avatar)
    `)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

    if (options?.category) {
        query = query.eq('category', options.category);
    }
    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Fetch all posts (Admin)
// ============================================
export async function fetchAllPosts(filters?: {
    is_published?: boolean;
    category?: string;
    limit?: number;
}): Promise<DbBlogPost[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
        .from('blog_posts')
        .select(`
      *,
      author:author_id (id, name, avatar)
    `)
        .order('created_at', { ascending: false });

    if (filters?.is_published !== undefined) {
        query = query.eq('is_published', filters.is_published);
    }
    if (filters?.category) {
        query = query.eq('category', filters.category);
    }
    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching all posts:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Get post by slug
// ============================================
export async function getPostBySlug(slug: string): Promise<DbBlogPost | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('blog_posts')
        .select(`
      *,
      author:author_id (id, name, avatar)
    `)
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error fetching post:', error);
        return null;
    }

    // Increment view count
    if (data) {
        await supabase
            .from('blog_posts')
            .update({ views_count: data.views_count + 1 })
            .eq('id', data.id);
    }

    return data;
}

// ============================================
// Get post by ID
// ============================================
export async function getPostById(id: number): Promise<DbBlogPost | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching post by id:', error);
        return null;
    }
    return data;
}

// ============================================
// Create post
// ============================================
export async function createPost(payload: BlogPostPayload): Promise<DbBlogPost | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const slug = payload.slug || generateSlug(payload.title);

    const { data, error } = await supabase
        .from('blog_posts')
        .insert({
            title: payload.title,
            slug,
            content: payload.content || null,
            excerpt: payload.excerpt || null,
            cover_image: payload.cover_image || null,
            author_id: payload.author_id,
            category: payload.category || null,
            tags: payload.tags || [],
            is_published: payload.is_published || false,
            published_at: payload.is_published ? new Date().toISOString() : null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating post:', error);
        throw new Error(error.message);
    }
    return data;
}

// ============================================
// Update post
// ============================================
export async function updatePost(
    id: number,
    payload: Partial<BlogPostPayload>
): Promise<DbBlogPost | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const updates: any = { ...payload };

    // If publishing for first time
    if (payload.is_published) {
        const { data: existing } = await supabase
            .from('blog_posts')
            .select('published_at')
            .eq('id', id)
            .single();

        if (existing && !existing.published_at) {
            updates.published_at = new Date().toISOString();
        }
    }

    const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating post:', error);
        throw new Error(error.message);
    }
    return data;
}

// ============================================
// Delete post
// ============================================
export async function deletePost(id: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting post:', error);
        throw new Error(error.message);
    }
    return true;
}

// ============================================
// Publish/Unpublish post
// ============================================
export async function togglePublish(id: number, publish: boolean): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const updates: any = { is_published: publish };
    if (publish) {
        updates.published_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Error toggling publish:', error);
        return false;
    }
    return true;
}
