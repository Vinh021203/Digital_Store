// lib/notifications.ts
import { createClient } from './supabase/client';

// ============================================
// Types
// ============================================
export interface DbNotification {
    id: number;
    user_id: string;
    type: 'order' | 'review' | 'ticket' | 'affiliate' | 'system' | 'promotion' | 'welcome';
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

// System Announcement type (for global notifications)
export interface SystemAnnouncement {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'promotion' | 'update';
    link?: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at: string;
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

// ============================================
// CREATE WELCOME NOTIFICATION for new users
// ============================================
export async function createWelcomeNotification(userId: string, userName?: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    // Check if welcome notification already sent
    const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'welcome')
        .limit(1);

    if (existing && existing.length > 0) {
        return true; // Already sent
    }

    const welcomeNotifications = [
        {
            user_id: userId,
            type: 'welcome',
            title: '🎉 Chào mừng bạn đến với Shop Web rẻ!',
            message: `Xin chào${userName ? ` ${userName}` : ''}! Cảm ơn bạn đã đăng ký. Khám phá hàng ngàn giao diện website chất lượng cao ngay bây giờ!`,
            link: '/products',
        },
        {
            user_id: userId,
            type: 'promotion',
            title: '🎁 Ưu đãi đặc biệt dành cho bạn!',
            message: 'Nhận ngay mã giảm giá 10% cho đơn hàng đầu tiên. Sử dụng mã: WELCOME10',
            link: '/products',
        },
        {
            user_id: userId,
            type: 'system',
            title: '📚 Hướng dẫn sử dụng',
            message: 'Tìm hiểu cách tải sản phẩm, quản lý license và nhận hỗ trợ kỹ thuật tại trang trợ giúp.',
            link: '/help',
        },
    ];

    const { error } = await supabase
        .from('notifications')
        .insert(welcomeNotifications);

    if (error) {
        console.error('Error creating welcome notifications:', error);
        return false;
    }
    return true;
}

// ============================================
// FETCH ACTIVE SYSTEM ANNOUNCEMENTS
// (Global notifications for all users)
// ============================================
export async function fetchActiveAnnouncements(): Promise<SystemAnnouncement[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('system_announcements')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching announcements:', error);
        return [];
    }
    return data || [];
}

// ============================================
// CREATE SYSTEM ANNOUNCEMENT
// (Admin only - for all users)
// ============================================
export async function createSystemAnnouncement(announcement: {
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'promotion' | 'update';
    link?: string;
    start_date: string;
    end_date: string;
}): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('system_announcements')
        .insert({
            title: announcement.title,
            message: announcement.message,
            type: announcement.type || 'info',
            link: announcement.link,
            start_date: announcement.start_date,
            end_date: announcement.end_date,
            is_active: true,
        });

    if (error) {
        console.error('Error creating announcement:', error);
        return false;
    }
    return true;
}

// ============================================
// REALTIME SUBSCRIPTION for notifications
// ============================================
export function subscribeToNotifications(
    userId: string,
    onNewNotification: (notification: DbNotification) => void
) {
    const supabase = createClient();
    if (!supabase) return null;

    const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                onNewNotification(payload.new as DbNotification);
            }
        )
        .subscribe();

    return channel;
}

// ============================================
// UNSUBSCRIBE from realtime
// ============================================
export function unsubscribeFromNotifications(channel: any) {
    const supabase = createClient();
    if (supabase && channel) {
        supabase.removeChannel(channel);
    }
}

// ============================================
// PUSH NOTIFICATION TO ALL USERS
// (Admin function - creates notification for everyone)
// ============================================
export async function pushNotificationToAllUsers(
    payload: Omit<NotificationPayload, 'user_id'>
): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    // Get all user IDs
    const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id');

    if (userError || !users) {
        console.error('Error fetching users:', userError);
        return false;
    }

    const userIds = users.map(u => u.id);
    return createBulkNotifications(userIds, payload);
}
