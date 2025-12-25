// lib/blog-comments.ts
import { createClient } from './supabase/client';

// ============================================
// Types
// ============================================
export interface DbBlogComment {
    id: number;
    post_id: number;
    user_id: string | null;
    guest_name: string | null;
    guest_email: string | null;
    content: string;
    parent_id: number | null;
    likes_count: number;
    is_approved: boolean;
    created_at: string;
    // Joined
    user?: { id: string; name: string; avatar: string } | null;
    replies?: DbBlogComment[];
}

export interface CommentPayload {
    post_id: number;
    user_id?: string | null;
    guest_name?: string | null;
    guest_email?: string | null;
    content: string;
    parent_id?: number | null;
}

// ============================================
// Fetch comments for a post
// ============================================
export async function fetchComments(postId: number): Promise<DbBlogComment[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('blog_comments')
        .select(`
            *,
            user:user_id (id, name, avatar)
        `)
        .eq('post_id', postId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching comments:', error);
        return [];
    }

    // Organize into parent/replies structure
    const comments = data || [];
    const parentComments = comments.filter(c => !c.parent_id);
    const childComments = comments.filter(c => c.parent_id);

    // Attach replies to parents
    parentComments.forEach(parent => {
        parent.replies = childComments.filter(c => c.parent_id === parent.id);
    });

    return parentComments;
}

// ============================================
// Create comment
// ============================================
export async function createComment(payload: CommentPayload): Promise<DbBlogComment | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('blog_comments')
        .insert({
            post_id: payload.post_id,
            user_id: payload.user_id || null,
            guest_name: payload.guest_name || null,
            guest_email: payload.guest_email || null,
            content: payload.content,
            parent_id: payload.parent_id || null,
            is_approved: true, // Auto approve for now
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating comment:', error);
        throw new Error(error.message);
    }
    return data;
}

// ============================================
// Like a comment
// ============================================
export async function likeComment(commentId: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { data: comment } = await supabase
        .from('blog_comments')
        .select('likes_count')
        .eq('id', commentId)
        .single();

    if (!comment) return false;

    const { error } = await supabase
        .from('blog_comments')
        .update({ likes_count: comment.likes_count + 1 })
        .eq('id', commentId);

    if (error) {
        console.error('Error liking comment:', error);
        return false;
    }
    return true;
}

// ============================================
// Delete comment (user's own or admin)
// ============================================
export async function deleteComment(commentId: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', commentId);

    if (error) {
        console.error('Error deleting comment:', error);
        return false;
    }
    return true;
}

// ============================================
// Get comment count for a post
// ============================================
export async function getCommentCount(postId: number): Promise<number> {
    const supabase = createClient();
    if (!supabase) return 0;

    const { count, error } = await supabase
        .from('blog_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('is_approved', true);

    if (error) {
        console.error('Error counting comments:', error);
        return 0;
    }
    return count || 0;
}

// ============================================
// Admin: Fetch ALL comments (for admin panel)
// ============================================
export async function fetchAllComments(filters?: {
    postId?: number;
    isApproved?: boolean;
    limit?: number;
}): Promise<DbBlogComment[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
        .from('blog_comments')
        .select(`
            *,
            user:user_id (id, name, avatar),
            post:post_id (id, title, slug)
        `)
        .order('created_at', { ascending: false });

    if (filters?.postId) {
        query = query.eq('post_id', filters.postId);
    }
    if (filters?.isApproved !== undefined) {
        query = query.eq('is_approved', filters.isApproved);
    }
    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching all comments:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Admin: Toggle comment approval
// ============================================
export async function toggleCommentApproval(commentId: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    // Get current status
    const { data: comment } = await supabase
        .from('blog_comments')
        .select('is_approved')
        .eq('id', commentId)
        .single();

    if (!comment) return false;

    const { error } = await supabase
        .from('blog_comments')
        .update({ is_approved: !comment.is_approved })
        .eq('id', commentId);

    if (error) {
        console.error('Error toggling approval:', error);
        return false;
    }
    return true;
}
