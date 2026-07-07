// lib/adminRoles.ts
// Functions to manage admin staff and roles

import { createClient } from './supabase/client';

export type StaffRole = 'super_admin' | 'admin' | 'editor' | 'support';
export type StaffStatus = 'active' | 'inactive';

export interface StaffMember {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: StaffRole;
    status: StaffStatus;
    last_active: string | null;
    created_at: string;
}

export interface RoleInfo {
    name: StaffRole;
    label: string;
    description: string;
    count: number;
    color: string;
}

/**
 * Fetch all staff members (users with admin roles)
 */
export async function getStaffMembers(): Promise<StaffMember[]> {
    const supabase = createClient();
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .in('role', ['super_admin', 'admin', 'editor', 'support'])
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching staff:', error);
            return [];
        }

        return (data || []).map((user: any) => ({
            id: user.id,
            name: user.name || 'Chưa đặt tên',
            email: user.email || '',
            avatar: user.avatar || '',
            role: user.role || 'support',
            status: user.status === 'active' ? 'active' : 'inactive',
            last_active: user.last_login || user.updated_at,
            created_at: user.created_at,
        }));
    } catch (error) {
        console.error('Error in getStaffMembers:', error);
        return [];
    }
}

/**
 * Get staff role statistics
 */
export async function getRoleStats(): Promise<RoleInfo[]> {
    const staff = await getStaffMembers();

    const roleConfigs: { name: StaffRole; label: string; description: string; color: string }[] = [
        {
            name: 'super_admin',
            label: 'Super Admin',
            description: 'Toàn quyền truy cập hệ thống, quản lý tất cả dữ liệu.',
            color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
        },
        {
            name: 'admin',
            label: 'Admin',
            description: 'Quản lý yêu cầu, mẫu demo và khách hàng.',
            color: 'bg-purple-100 text-purple-700 border-purple-200'
        },
        {
            name: 'editor',
            label: 'Editor',
            description: 'Quản lý mẫu demo, bài viết, nội dung hiển thị.',
            color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        },
        {
            name: 'support',
            label: 'Support',
            description: 'Xem yêu cầu, chăm sóc khách hàng, hỗ trợ chat.',
            color: 'bg-amber-100 text-amber-700 border-amber-200'
        },
    ];

    return roleConfigs.map(config => ({
        ...config,
        count: staff.filter(s => s.role === config.name).length,
    }));
}

/**
 * Update staff member role
 */
export async function updateStaffRole(userId: string, role: StaffRole): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', userId);

        if (error) {
            console.error('Error updating role:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error in updateStaffRole:', error);
        return false;
    }
}

/**
 * Update staff member status
 */
export async function updateStaffStatus(userId: string, status: StaffStatus): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ status })
            .eq('id', userId);

        if (error) {
            console.error('Error updating status:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error in updateStaffStatus:', error);
        return false;
    }
}

/**
 * Add new staff member (set user role to staff)
 */
export async function addStaffMember(email: string, role: StaffRole): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    try {
        // Find user by email
        const { data: user, error: findError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (findError || !user) {
            console.error('User not found:', email);
            return false;
        }

        // Update role
        const { error } = await supabase
            .from('profiles')
            .update({ role, status: 'active' })
            .eq('id', user.id);

        if (error) {
            console.error('Error adding staff:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error in addStaffMember:', error);
        return false;
    }
}

/**
 * Remove staff role (set back to user)
 */
export async function removeStaffMember(userId: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ role: 'user' })
            .eq('id', userId);

        if (error) {
            console.error('Error removing staff:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error in removeStaffMember:', error);
        return false;
    }
}
