// lib/orders.ts
import { createClient } from './supabase/client';
import { createActivityLog } from './activityLogs';

// ============================================
// Types
// ============================================
export interface DbOrder {
    id: number;
    user_id: string | null;
    status: 'pending' | 'paid' | 'completed' | 'refunded' | 'cancelled';
    total: number;
    discount: number;
    coupon_id: number | null;
    coupon_code: string | null;
    payment_method: string;
    payment_id: string | null;
    billing_name: string | null;
    billing_email: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    // Joined
    user?: { id: string; name: string; email: string } | null;
    items?: DbOrderItem[];
}

export interface DbOrderItem {
    id: number;
    order_id: number;
    product_id: number | null;
    product_name: string;
    product_image: string | null;
    license_type: 'Regular' | 'Extended' | 'Unlimited';
    price: number;
    created_at: string;
    // Joined
    product?: { id: number; name: string; slug: string } | null;
}

export interface OrderPayload {
    user_id: string;
    status?: 'pending' | 'paid' | 'completed' | 'refunded' | 'cancelled';
    total: number;
    discount?: number;
    coupon_id?: number | null;
    coupon_code?: string | null;
    payment_method?: string;
    payment_id?: string | null;
    billing_name?: string;
    billing_email?: string;
    notes?: string;
    affiliate_code?: string | null;
}

export interface OrderItemPayload {
    order_id: number;
    product_id: number;
    product_name: string;
    product_image?: string;
    license_type?: 'Regular' | 'Extended' | 'Unlimited';
    price: number;
}

// ============================================
// Fetch all orders (Admin)
// ============================================
export async function fetchOrders(filters?: {
    status?: string;
    user_id?: string;
    limit?: number;
}): Promise<DbOrder[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
        .from('orders')
        .select(`
      *,
      user:user_id (id, name, email)
    `)
        .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }
    if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
    }
    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Fetch user's orders
// ============================================
export async function fetchUserOrders(userId: string): Promise<DbOrder[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user orders:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Fetch user's downloaded products (from completed orders)
// ============================================
export interface UserDownload {
    id: number;
    product_id: number;
    product_name: string;
    product_image: string | null;
    license_type: 'Regular' | 'Extended' | 'Unlimited';
    price: number;
    purchased_at: string;
    order_id: number | null;
    product_slug?: string;
}

export async function fetchUserDownloads(userId: string): Promise<UserDownload[]> {
    const supabase = createClient();
    if (!supabase) return [];

    // Get all completed/paid orders for user
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at')
        .eq('user_id', userId)
        .in('status', ['completed', 'paid'])
        .order('created_at', { ascending: false });

    if (ordersError) {
        console.error('Error fetching user orders:', ordersError);
    }

    const orderIds = (orders || []).map(o => o.id);
    const orderCreatedAtById = new Map((orders || []).map(o => [o.id, o.created_at]));
    const downloadsByProduct = new Map<number, UserDownload>();

    // Get all order items for these orders with product info
    if (orderIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select(`
                id,
                order_id,
                product_id,
                product_name,
                product_image,
                license_type,
                price,
                created_at,
                product:product_id (slug)
            `)
            .in('order_id', orderIds);

        if (itemsError) {
            console.error('Error fetching order items:', itemsError);
        } else {
            (items || []).forEach((item: any) => {
                if (!item.product_id) return;
                downloadsByProduct.set(item.product_id, {
                    id: item.id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    product_image: item.product_image,
                    license_type: item.license_type,
                    price: item.price,
                    purchased_at: orderCreatedAtById.get(item.order_id) || item.created_at,
                    order_id: item.order_id,
                    product_slug: item.product?.slug,
                });
            });
        }
    }

    // Also include products that have an active license, even when the order row is missing.
    const { data: licenses, error: licensesError } = await supabase
        .from('licenses')
        .select(`
            id,
            product_id,
            type,
            created_at,
            product:product_id (id, name, slug, image, price)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (licensesError) {
        console.error('Error fetching user licenses for downloads:', licensesError);
    } else {
        (licenses || []).forEach((license: any) => {
            const product = Array.isArray(license.product) ? license.product[0] : license.product;
            if (!license.product_id || downloadsByProduct.has(license.product_id)) return;

            downloadsByProduct.set(license.product_id, {
                id: -license.id,
                product_id: license.product_id,
                product_name: product?.name || 'Sản phẩm đã mua',
                product_image: product?.image || null,
                license_type: license.type || 'Regular',
                price: Number(product?.price || 0),
                purchased_at: license.created_at,
                order_id: null,
                product_slug: product?.slug,
            });
        });
    }

    return Array.from(downloadsByProduct.values())
        .sort((a, b) => new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime());
}

// ============================================
// Get order by ID with items
// ============================================
export async function getOrderById(id: number): Promise<DbOrder | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data: order, error } = await supabase
        .from('orders')
        .select(`
      *,
      user:user_id (id, name, email)
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching order:', error);
        return null;
    }

    // Get order items
    const { data: items } = await supabase
        .from('order_items')
        .select(`
      *,
      product:product_id (id, name, slug)
    `)
        .eq('order_id', id);

    return { ...order, items: items || [] };
}

// ============================================
// Create order
// ============================================
export async function createOrder(payload: OrderPayload): Promise<DbOrder | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('orders')
        .insert({
            user_id: payload.user_id,
            status: payload.status || 'pending',
            total: payload.total,
            discount: payload.discount || 0,
            coupon_id: payload.coupon_id || null,
            coupon_code: payload.coupon_code || null,
            payment_method: payload.payment_method || 'momo',
            billing_name: payload.billing_name || null,
            billing_email: payload.billing_email || null,
            notes: payload.notes || null,
            affiliate_code: payload.affiliate_code || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating order:', error);
        throw new Error(error.message);
    }

    // Log user order creation
    await createActivityLog({
        user_id: payload.user_id,
        action: 'Create',
        entity: 'order',
        entity_id: data.id.toString(),
        entity_name: `Đơn hàng #${data.id}`,
        details: `Tạo đơn hàng ${data.total.toLocaleString('vi-VN')}đ - ${payload.payment_method || 'momo'}`,
        severity: 'success',
    });

    return data;
}

// ============================================
// Add order item
// ============================================
export async function addOrderItem(payload: OrderItemPayload): Promise<DbOrderItem | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('order_items')
        .insert({
            order_id: payload.order_id,
            product_id: payload.product_id,
            product_name: payload.product_name,
            product_image: payload.product_image || null,
            license_type: payload.license_type || 'Regular',
            price: payload.price,
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding order item:', error);
        throw new Error(error.message);
    }
    return data;
}

// ============================================
// Update order status
// ============================================
export async function updateOrderStatus(
    id: number,
    status: DbOrder['status'],
    paymentId?: string
): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const updates: any = { status };
    if (paymentId) updates.payment_id = paymentId;

    const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Error updating order status:', error);
        throw new Error(error.message);
    }
    return true;
}

// ============================================
// Get order stats (Admin)
// ============================================
export async function getOrderStats() {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('orders')
        .select('id, status, total, created_at');

    if (error) {
        console.error('Error fetching order stats:', error);
        return null;
    }

    const orders = data || [];
    const paid = orders.filter(o => o.status === 'paid' || o.status === 'completed');

    return {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        paid: paid.length,
        completed: orders.filter(o => o.status === 'completed').length,
        refunded: orders.filter(o => o.status === 'refunded').length,
        totalRevenue: paid.reduce((sum, o) => sum + Number(o.total), 0),
    };
}


