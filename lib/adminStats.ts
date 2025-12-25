// lib/adminStats.ts
// Functions to fetch real admin dashboard statistics from database

import { createClient } from './supabase/client';

export interface AdminStats {
    // Orders
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    processingOrders: number;
    cancelledOrders: number;

    // Revenue
    totalRevenue: number;
    avgOrderValue: number;
    todayRevenue: number;
    monthRevenue: number;

    // Growth
    revenueGrowth: number;
    orderGrowth: number;

    // Customers
    totalCustomers: number;
    newCustomersThisWeek: number;

    // Products
    totalProducts: number;
    activeProducts: number;

    // Reviews
    avgRating: number;
    totalReviews: number;
}

export interface RecentOrder {
    id: string;
    customer_name: string;
    customer_email: string;
    total: number;
    status: string;
    created_at: string;
    items_count: number;
}

export interface TopProduct {
    id: number;
    name: string;
    image: string;
    format: string;
    price: number;
    sales_count: number;
    revenue: number;
}

export interface RevenueByFormat {
    format: string;
    revenue: number;
    count: number;
    percentage: number;
}

/**
 * Fetch comprehensive admin dashboard statistics
 */
export async function getAdminStats(): Promise<AdminStats> {
    const supabase = createClient();
    if (!supabase) return getDefaultStats();

    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // Parallel fetch all stats
        const [
            ordersResult,
            completedOrdersResult,
            pendingOrdersResult,
            processingOrdersResult,
            cancelledOrdersResult,
            revenueResult,
            todayRevenueResult,
            monthRevenueResult,
            lastMonthRevenueResult,
            customersResult,
            newCustomersResult,
            productsResult,
            activeProductsResult,
            reviewsResult,
        ] = await Promise.all([
            // Total orders
            supabase.from('orders').select('id', { count: 'exact', head: true }),
            // Completed orders
            supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
            // Pending orders
            supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            // Processing orders
            supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'processing'),
            // Cancelled orders
            supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'cancelled'),
            // Total revenue (completed orders)
            supabase.from('orders').select('total').eq('status', 'completed'),
            // Today's revenue
            supabase.from('orders').select('total').eq('status', 'completed').gte('created_at', startOfToday),
            // This month's revenue
            supabase.from('orders').select('total').eq('status', 'completed').gte('created_at', startOfMonth),
            // Last month's revenue
            supabase.from('orders').select('total').eq('status', 'completed').gte('created_at', startOfLastMonth).lt('created_at', startOfMonth),
            // Total customers
            supabase.from('profiles').select('id', { count: 'exact', head: true }),
            // New customers this week
            supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
            // Total products
            supabase.from('products').select('id', { count: 'exact', head: true }),
            // Active products
            supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
            // Reviews stats
            supabase.from('reviews').select('rating'),
        ]);

        // Calculate totals
        const totalRevenue = revenueResult.data?.reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0;
        const todayRevenue = todayRevenueResult.data?.reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0;
        const monthRevenue = monthRevenueResult.data?.reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0;
        const lastMonthRevenue = lastMonthRevenueResult.data?.reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0;

        const completedOrders = completedOrdersResult.count || 0;
        const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

        // Growth calculation
        const revenueGrowth = lastMonthRevenue > 0
            ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : 0;

        // Average rating
        const reviews = reviewsResult.data || [];
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
            : 0;

        return {
            totalOrders: ordersResult.count || 0,
            completedOrders,
            pendingOrders: pendingOrdersResult.count || 0,
            processingOrders: processingOrdersResult.count || 0,
            cancelledOrders: cancelledOrdersResult.count || 0,
            totalRevenue,
            avgOrderValue,
            todayRevenue,
            monthRevenue,
            revenueGrowth,
            orderGrowth: 0, // Can be calculated similarly if needed
            totalCustomers: customersResult.count || 0,
            newCustomersThisWeek: newCustomersResult.count || 0,
            totalProducts: productsResult.count || 0,
            activeProducts: activeProductsResult.count || 0,
            avgRating: Number(avgRating.toFixed(1)),
            totalReviews: reviews.length,
        };
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return getDefaultStats();
    }
}

/**
 * Fetch recent orders for dashboard
 */
export async function getRecentOrders(limit: number = 6): Promise<RecentOrder[]> {
    const supabase = createClient();
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id,
                total,
                status,
                created_at,
                profiles:user_id (name, email)
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching recent orders:', error);
            return [];
        }

        return (data || []).map((order: any) => ({
            id: order.id,
            customer_name: order.profiles?.name || 'Khách hàng',
            customer_email: order.profiles?.email || '',
            total: Number(order.total) || 0,
            status: order.status || 'pending',
            created_at: order.created_at,
            items_count: 1, // Would need to join order_items to get actual count
        }));
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        return [];
    }
}

/**
 * Fetch top selling products
 */
export async function getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    const supabase = createClient();
    if (!supabase) return [];

    try {
        // Get products with their sales count from licenses or order_items
        const { data, error } = await supabase
            .from('products')
            .select(`
                id,
                name,
                image,
                format,
                price,
                licenses:licenses(count)
            `)
            .eq('status', 'active')
            .limit(20);

        if (error) {
            console.error('Error fetching top products:', error);
            return [];
        }

        // Calculate sales and sort
        const productsWithSales = (data || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            image: p.image || '',
            format: p.format || 'Digital',
            price: Number(p.price) || 0,
            sales_count: p.licenses?.[0]?.count || 0,
            revenue: (Number(p.price) || 0) * (p.licenses?.[0]?.count || 0),
        }));

        return productsWithSales
            .sort((a, b) => b.sales_count - a.sales_count)
            .slice(0, limit);
    } catch (error) {
        console.error('Error fetching top products:', error);
        return [];
    }
}

/**
 * Fetch revenue breakdown by product format
 * Uses products + licenses instead of complex order_items join
 */
export async function getRevenueByFormat(): Promise<RevenueByFormat[]> {
    const supabase = createClient();
    if (!supabase) return [];

    try {
        // Get products with their format and license count
        const { data: products, error } = await supabase
            .from('products')
            .select(`
                id,
                format,
                price,
                licenses:licenses(count)
            `)
            .eq('status', 'active');

        if (error) {
            // Silently return empty if table doesn't exist
            return [];
        }

        // Aggregate by format
        const formatRevenue: Record<string, { revenue: number; count: number }> = {};
        let totalRevenue = 0;

        (products || []).forEach((product: any) => {
            const format = product.format || 'Khác';
            const salesCount = product.licenses?.[0]?.count || 0;
            const productRevenue = (Number(product.price) || 0) * salesCount;

            if (!formatRevenue[format]) {
                formatRevenue[format] = { revenue: 0, count: 0 };
            }
            formatRevenue[format].revenue += productRevenue;
            formatRevenue[format].count += salesCount;
            totalRevenue += productRevenue;
        });

        return Object.entries(formatRevenue)
            .filter(([_, data]) => data.count > 0) // Only show formats with sales
            .map(([format, data]) => ({
                format,
                revenue: data.revenue,
                count: data.count,
                percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
            }))
            .sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
        console.error('Error in getRevenueByFormat:', error);
        return [];
    }
}

/**
 * Fetch monthly revenue data for charts
 */
export async function getMonthlyRevenue(year?: number): Promise<{ month: string; revenue: number; orders: number }[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const currentYear = year || new Date().getFullYear();
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const result: { month: string; revenue: number; orders: number }[] = [];

    try {
        for (let i = 0; i < 12; i++) {
            const startOfMonth = new Date(currentYear, i, 1).toISOString();
            const endOfMonth = new Date(currentYear, i + 1, 0, 23, 59, 59).toISOString();

            const { data } = await supabase
                .from('orders')
                .select('total')
                .eq('status', 'completed')
                .gte('created_at', startOfMonth)
                .lte('created_at', endOfMonth);

            const monthRevenue = data?.reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0;

            result.push({
                month: months[i],
                revenue: monthRevenue,
                orders: data?.length || 0,
            });
        }

        return result;
    } catch (error) {
        console.error('Error fetching monthly revenue:', error);
        return months.map(month => ({ month, revenue: 0, orders: 0 }));
    }
}

function getDefaultStats(): AdminStats {
    return {
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        todayRevenue: 0,
        monthRevenue: 0,
        revenueGrowth: 0,
        orderGrowth: 0,
        totalCustomers: 0,
        newCustomersThisWeek: 0,
        totalProducts: 0,
        activeProducts: 0,
        avgRating: 0,
        totalReviews: 0,
    };
}
