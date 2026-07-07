// lib/activityLogs.ts
import { createClient } from './supabase/client';

// ============================================
// Log activity with IP (via API route)
// ============================================
export async function createActivityLogWithIP(payload: CreateLogPayload): Promise<boolean> {
    try {
        const response = await fetch('/api/activity-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error('[ActivityLogs] API error:', await response.text());
            return false;
        }

        return true;
    } catch (error) {
        console.error('[ActivityLogs] Error calling API:', error);
        return false;
    }
}

// ============================================
// Types
// ============================================
export type ActionType = 'Create' | 'Update' | 'Delete' | 'Login' | 'Logout' | 'Warning' | 'Export' | 'Import' | 'Config';
export type EntityType = 'product' | 'order' | 'user' | 'post' | 'ticket' | 'system' | 'coupon' | 'category' | 'review';
export type SeverityType = 'info' | 'warning' | 'error' | 'success';

export interface DbActivityLog {
    id: number;
    user_id: string | null;
    action: string;
    entity: string | null;
    entity_id: string | null;
    entity_name: string | null;
    details: string | null;
    ip_address: string | null;
    severity: SeverityType;
    created_at: string;
    // Joined
    user?: {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        role: string;
    } | null;
}

export interface CreateLogPayload {
    user_id?: string | null;
    action: ActionType;
    entity?: EntityType;
    entity_id?: string;
    entity_name?: string;
    details?: string;
    ip_address?: string;
    severity?: SeverityType;
}

// ============================================
// Fetch activity logs with filters
// ============================================
export async function fetchActivityLogs(options?: {
    limit?: number;
    offset?: number;
    action?: string;
    severity?: SeverityType;
    userId?: string;
    entity?: string;
    startDate?: string;
    endDate?: string;
}): Promise<{ data: DbActivityLog[]; count: number }> {
    const supabase = createClient();
    if (!supabase) return { data: [], count: 0 };

    let query = supabase
        .from('activity_logs')
        .select(`
            *,
            user:user_id (id, name, email, avatar, role)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

    // Apply filters
    if (options?.action) {
        query = query.eq('action', options.action);
    }
    if (options?.severity) {
        query = query.eq('severity', options.severity);
    }
    if (options?.userId) {
        query = query.eq('user_id', options.userId);
    }
    if (options?.entity) {
        query = query.eq('entity', options.entity);
    }
    if (options?.startDate) {
        query = query.gte('created_at', options.startDate);
    }
    if (options?.endDate) {
        query = query.lte('created_at', options.endDate);
    }

    // Pagination
    if (options?.limit) {
        query = query.limit(options.limit);
    }
    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('[ActivityLogs] Error fetching:', error);
        return { data: [], count: 0 };
    }

    return { data: data || [], count: count || 0 };
}

// ============================================
// Create a log entry
// ============================================
export async function createActivityLog(payload: CreateLogPayload): Promise<DbActivityLog | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('activity_logs')
        .insert({
            user_id: payload.user_id || null,
            action: payload.action,
            entity: payload.entity || null,
            entity_id: payload.entity_id || null,
            entity_name: payload.entity_name || null,
            details: payload.details || null,
            ip_address: payload.ip_address || null,
            severity: payload.severity || 'info',
        })
        .select()
        .single();

    if (error) {
        console.error('[ActivityLogs] Error creating:', error);
        return null;
    }

    return data;
}

// ============================================
// Log helpers for common actions
// ============================================

// Product actions
export async function logProductCreate(userId: string, productId: number, productName: string) {
    return createActivityLog({
        user_id: userId,
        action: 'Create',
        entity: 'product',
        entity_id: productId.toString(),
        entity_name: productName,
        details: `Tạo mẫu demo mới: ${productName}`,
        severity: 'success',
    });
}

export async function logProductUpdate(userId: string, productId: number, productName: string, changes?: string) {
    return createActivityLog({
        user_id: userId,
        action: 'Update',
        entity: 'product',
        entity_id: productId.toString(),
        entity_name: productName,
        details: changes || `Cập nhật mẫu demo: ${productName}`,
        severity: 'info',
    });
}

export async function logProductDelete(userId: string, productId: number, productName: string) {
    return createActivityLog({
        user_id: userId,
        action: 'Delete',
        entity: 'product',
        entity_id: productId.toString(),
        entity_name: productName,
        details: `Xóa mẫu demo: ${productName}`,
        severity: 'warning',
    });
}

// Order actions
export async function logOrderStatusChange(userId: string, orderId: number, oldStatus: string, newStatus: string) {
    return createActivityLog({
        user_id: userId,
        action: 'Update',
        entity: 'order',
        entity_id: orderId.toString(),
        entity_name: `Yêu cầu #${orderId}`,
        details: `Thay đổi trạng thái: ${oldStatus} → ${newStatus}`,
        severity: 'info',
    });
}

// Auth actions - Use API route to capture IP
export async function logUserLogin(userId: string, userName: string) {
    return createActivityLogWithIP({
        user_id: userId,
        action: 'Login',
        entity: 'user',
        entity_name: userName,
        details: 'Đăng nhập thành công',
        severity: 'success',
    });
}

export async function logUserLogout(userId: string, userName: string) {
    return createActivityLogWithIP({
        user_id: userId,
        action: 'Logout',
        entity: 'user',
        entity_name: userName,
        details: 'Đăng xuất',
        severity: 'info',
    });
}

export async function logLoginFailed(email: string) {
    return createActivityLogWithIP({
        action: 'Login',
        entity: 'user',
        entity_name: email,
        details: 'Đăng nhập thất bại - Sai thông tin',
        severity: 'error',
    });
}

// Coupon actions
export async function logCouponCreate(userId: string, couponCode: string) {
    return createActivityLog({
        user_id: userId,
        action: 'Create',
        entity: 'coupon',
        entity_name: couponCode,
        details: `Tạo mã ưu đãi tham khảo: ${couponCode}`,
        severity: 'success',
    });
}

// System actions
export async function logSystemWarning(message: string) {
    return createActivityLog({
        action: 'Warning',
        entity: 'system',
        entity_name: 'Hệ thống',
        details: message,
        severity: 'warning',
    });
}

export async function logSystemError(message: string) {
    return createActivityLog({
        action: 'Warning',
        entity: 'system',
        entity_name: 'Lỗi hệ thống',
        details: message,
        severity: 'error',
    });
}

// Config actions
export async function logConfigChange(userId: string, configName: string, details?: string) {
    return createActivityLog({
        user_id: userId,
        action: 'Config',
        entity: 'system',
        entity_name: configName,
        details: details || `Thay đổi cấu hình: ${configName}`,
        severity: 'info',
    });
}

// Export actions
export async function logExport(userId: string, reportName: string, details?: string) {
    return createActivityLog({
        user_id: userId,
        action: 'Export',
        entity: 'system',
        entity_name: reportName,
        details: details || `Xuất báo cáo: ${reportName}`,
        severity: 'info',
    });
}

// ============================================
// Get statistics
// ============================================
export async function getActivityStats(): Promise<{
    total: number;
    today: number;
    success: number;
    failed: number;
}> {
    const supabase = createClient();
    if (!supabase) return { total: 0, today: 0, success: 0, failed: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get total count
    const { count: total } = await supabase
        .from('activity_logs')
        .select('id', { count: 'exact', head: true });

    // Get today count
    const { count: todayCount } = await supabase
        .from('activity_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

    // Get success count
    const { count: successCount } = await supabase
        .from('activity_logs')
        .select('id', { count: 'exact', head: true })
        .eq('severity', 'success');

    // Get error count
    const { count: errorCount } = await supabase
        .from('activity_logs')
        .select('id', { count: 'exact', head: true })
        .in('severity', ['error', 'warning']);

    return {
        total: total || 0,
        today: todayCount || 0,
        success: successCount || 0,
        failed: errorCount || 0,
    };
}

// ============================================
// Delete old logs (cleanup)
// ============================================
export async function deleteOldLogs(daysToKeep: number = 90): Promise<number> {
    const supabase = createClient();
    if (!supabase) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { data, error } = await supabase
        .from('activity_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select();

    if (error) {
        console.error('[ActivityLogs] Error deleting old logs:', error);
        return 0;
    }

    return data?.length || 0;
}
