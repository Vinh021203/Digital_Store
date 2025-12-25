// lib/notifications.ts
import { createClient } from './supabase/client';

// ============================================
// Types
// ============================================
export interface DbNotification {
    id: number;
    user_id: string;
    type: 'order' | 'review' | 'ticket' | 'affiliate' | 'system' | 'promotion';
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

export interface NotificationPayload {
    user_id: string;
    type?: DbNotification['type'];
    title: string;
    message: string;
    link?: string;
}

// ============================================
// Fetch user's notifications
// ============================================
export async function fetchUserNotifications(
    userId: string,
    options?: { limit?: number; unreadOnly?: boolean }
): Promise<DbNotification[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (options?.unreadOnly) {
        query = query.eq('is_read', false);
    }
    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Get unread count
// ============================================
export async function getUnreadNotificationCount(userId: string): Promise<number> {
    const supabase = createClient();
    if (!supabase) return 0;

    const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }
    return count || 0;
}

// ============================================
// Create notification
// ============================================
export async function createNotification(payload: NotificationPayload): Promise<DbNotification | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('notifications')
        .insert({
            user_id: payload.user_id,
            type: payload.type || 'system',
            title: payload.title,
            message: payload.message,
            link: payload.link || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating notification:', error);
        throw new Error(error.message);
    }
    return data;
}

// ============================================
// Create bulk notifications
// ============================================
export async function createBulkNotifications(
    userIds: string[],
    payload: Omit<NotificationPayload, 'user_id'>
): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const notifications = userIds.map(user_id => ({
        user_id,
        type: payload.type || 'system',
        title: payload.title,
        message: payload.message,
        link: payload.link || null,
    }));

    const { error } = await supabase
        .from('notifications')
        .insert(notifications);

    if (error) {
        console.error('Error creating bulk notifications:', error);
        return false;
    }
    return true;
}

// ============================================
// Mark notification as read
// ============================================
export async function markNotificationRead(id: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

    if (error) {
        console.error('Error marking notification read:', error);
        return false;
    }
    return true;
}

// ============================================
// Mark all notifications as read
// ============================================
export async function markAllNotificationsRead(userId: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) {
        console.error('Error marking all notifications read:', error);
        return false;
    }
    return true;
}

// ============================================
// Delete notification
// ============================================
export async function deleteNotification(id: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting notification:', error);
        return false;
    }
    return true;
}

// ============================================
// Delete all read notifications
// ============================================
export async function deleteReadNotifications(userId: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('is_read', true);

    if (error) {
        console.error('Error deleting read notifications:', error);
        return false;
    }
    return true;
}
