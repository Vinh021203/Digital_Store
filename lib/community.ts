// lib/community.ts
import { createClient } from './supabase/client';

// ============================================
// Types
// ============================================
export interface DbCommunityPost {
    id: number;
    author_id: string;
    title: string;
    content: string;
    image: string | null;
    tags: string[];
    likes_count: number;
    comments_count: number;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
    // Joined
    author?: { id: string; name: string; avatar: string; role: string } | null;
}

export interface DbCommunityComment {
    id: number;
    post_id: number;
    author_id: string;
    content: string;
    likes_count: number;
    parent_id: number | null;
    created_at: string;
    // Joined
    author?: { id: string; name: string; avatar: string } | null;
    replies?: DbCommunityComment[];
}

export interface CommunityPostPayload {
    author_id: string;
    title: string;
    content: string;
    image?: string | null;
    tags?: string[];
}

export interface CommunityCommentPayload {
    post_id: number;
    author_id: string;
    content: string;
    parent_id?: number | null;
}

// ============================================
// Fetch all community posts
// ============================================
export async function fetchCommunityPosts(options?: {
    tag?: string;
    limit?: number;
    searchTerm?: string;
}): Promise<DbCommunityPost[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
        .from('community_posts')
        .select(`
            *,
            author:author_id (id, name, avatar, role)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

    if (options?.tag) {
        query = query.contains('tags', [options.tag]);
    }
    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching community posts:', error);
        return [];
    }

    let posts = data || [];

    // Client-side search filter
    if (options?.searchTerm) {
        const term = options.searchTerm.toLowerCase();
        posts = posts.filter(p =>
            p.title.toLowerCase().includes(term) ||
            p.content.toLowerCase().includes(term) ||
            p.tags.some((t: string) => t.toLowerCase().includes(term))
        );
    }

    return posts;
}

// ============================================
// Get single post by ID
// ============================================
export async function getCommunityPost(postId: number): Promise<DbCommunityPost | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('community_posts')
        .select(`
            *,
            author:author_id (id, name, avatar, role)
        `)
        .eq('id', postId)
        .single();

    if (error) {
        console.error('Error fetching post:', error);
        return null;
    }
    return data;
}

// ============================================
// Create new post
// ============================================
export async function createCommunityPost(payload: CommunityPostPayload): Promise<DbCommunityPost | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('community_posts')
        .insert({
            author_id: payload.author_id,
            title: payload.title,
            content: payload.content,
            image: payload.image || null,
            tags: payload.tags || [],
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
export async function updateCommunityPost(
    postId: number,
    updates: Partial<CommunityPostPayload>
): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('community_posts')
        .update(updates)
        .eq('id', postId);

    if (error) {
        console.error('Error updating post:', error);
        return false;
    }
    return true;
}

// ============================================
// Delete post
// ============================================
export async function deleteCommunityPost(postId: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

    if (error) {
        console.error('Error deleting post:', error);
        return false;
    }
    return true;
}

// ============================================
// Like/Unlike post
// ============================================
export async function togglePostLike(postId: number, userId: string): Promise<{ liked: boolean; count: number }> {
    const supabase = createClient();
    if (!supabase) return { liked: false, count: 0 };

    // Check if already liked
    const { data: existing } = await supabase
        .from('community_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

    if (existing) {
        // Unlike
        await supabase.from('community_likes').delete().eq('id', existing.id);

        // Decrement likes_count (prevent negative)
        const { data: post } = await supabase
            .from('community_posts')
            .select('likes_count')
            .eq('id', postId)
            .single();

        const newCount = Math.max(0, (post?.likes_count || 0) - 1);
        await supabase.from('community_posts').update({ likes_count: newCount }).eq('id', postId);

        return { liked: false, count: newCount };
    } else {
        // Like
        await supabase.from('community_likes').insert({ post_id: postId, user_id: userId });

        // Increment likes_count
        const { data: post } = await supabase
            .from('community_posts')
            .select('likes_count')
            .eq('id', postId)
            .single();

        const newCount = (post?.likes_count || 0) + 1;
        await supabase.from('community_posts').update({ likes_count: newCount }).eq('id', postId);

        return { liked: true, count: newCount };
    }
}

// ============================================
// Check if user liked a post
// ============================================
export async function hasUserLikedPost(postId: number, userId: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { data } = await supabase
        .from('community_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

    return !!data;
}

// ============================================
// Fetch comments for a post
// ============================================
export async function fetchPostComments(postId: number): Promise<DbCommunityComment[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('community_comments')
        .select(`
            *,
            author:author_id (id, name, avatar)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching comments:', error);
        return [];
    }

    // Structure into parent/replies
    const comments = data || [];
    const topLevel = comments.filter(c => !c.parent_id);
    const replies = comments.filter(c => c.parent_id);

    return topLevel.map(parent => ({
        ...parent,
        replies: replies.filter(r => r.parent_id === parent.id),
    }));
}

// ============================================
// Create comment
// ============================================
export async function createCommunityComment(payload: CommunityCommentPayload): Promise<DbCommunityComment | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('community_comments')
        .insert({
            post_id: payload.post_id,
            author_id: payload.author_id,
            content: payload.content,
            parent_id: payload.parent_id || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating comment:', error);
        throw new Error(error.message);
    }

    // Note: Trigger will auto-increment comments_count on community_posts
    return data;
}

// ============================================
// Delete comment
// ============================================
export async function deleteCommunityComment(commentId: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('community_comments')
        .delete()
        .eq('id', commentId);

    if (error) {
        console.error('Error deleting comment:', error);
        return false;
    }
    return true;
}

// ============================================
// Get popular tags
// ============================================
export async function getPopularTags(limit: number = 10): Promise<{ tag: string; count: number }[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data } = await supabase
        .from('community_posts')
        .select('tags');

    if (!data) return [];

    // Count tag occurrences
    const tagCounts: Record<string, number> = {};
    data.forEach(post => {
        (post.tags || []).forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    return Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}
